const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Database connection
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'skill_swap_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

let pool;

// Initialize database connection
async function initializeDatabase() {
  try {
    pool = mysql.createPool(dbConfig);
    
    // Test connection
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully!');
    connection.release();
    
    // Create tables if they don't exist
    await createTables();
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
}

// Create database tables
async function createTables() {
  try {
    // Users table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        date_of_birth DATE,
        profile_photo VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Skills table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS skills (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        skill_name VARCHAR(255) NOT NULL,
        skill_type ENUM('offered', 'wanted') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // User profiles table (for additional user info)
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS user_profiles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        location VARCHAR(255),
        availability ENUM('weekends', 'evenings', 'weekdays', 'flexible'),
        rating DECIMAL(3,2) DEFAULT 0.00,
        total_swaps INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Swap requests table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS swap_requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        requester_id INT NOT NULL,
        recipient_id INT NOT NULL,
        status ENUM('pending', 'accepted', 'rejected', 'cancelled') DEFAULT 'pending',
        message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Notifications table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        type ENUM('swap_request', 'swap_accepted', 'swap_rejected', 'new_message') NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        related_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    console.log('✅ Database tables created successfully!');
    
    // Insert sample data
    await insertSampleData();
    
  } catch (error) {
    console.error('❌ Error creating tables:', error.message);
  }
}

// Insert sample data
async function insertSampleData() {
  try {
    // Check if sample data already exists
    const [users] = await pool.execute('SELECT COUNT(*) as count FROM users');
    if (users[0].count > 0) {
      console.log('✅ Sample data already exists, skipping...');
      return;
    }

    const sampleUsers = [
      {
        email: 'priya.sharma@example.com',
        password: await bcrypt.hash('password123', 10),
        name: 'Priya Sharma',
        date_of_birth: '1995-03-15',
        profile_photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
        location: 'Mumbai, Maharashtra',
        availability: 'weekends',
        skills_offered: ['Photoshop', 'Illustrator', 'UI/UX Design'],
        skills_wanted: ['JavaScript', 'React', 'Node.js']
      },
      {
        email: 'arjun.patel@example.com',
        password: await bcrypt.hash('password123', 10),
        name: 'Arjun Patel',
        date_of_birth: '1992-07-22',
        profile_photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        location: 'Bangalore, Karnataka',
        availability: 'evenings',
        skills_offered: ['JavaScript', 'React', 'Node.js'],
        skills_wanted: ['Python', 'Data Analysis', 'Machine Learning']
      },
      {
        email: 'anjali.reddy@example.com',
        password: await bcrypt.hash('password123', 10),
        name: 'Anjali Reddy',
        date_of_birth: '1990-11-08',
        profile_photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
        location: 'Hyderabad, Telangana',
        availability: 'weekdays',
        skills_offered: ['Excel', 'PowerPoint', 'Project Management'],
        skills_wanted: ['Graphic Design', 'Canva', 'Social Media Marketing']
      },
      {
        email: 'rahul.singh@example.com',
        password: await bcrypt.hash('password123', 10),
        name: 'Rahul Singh',
        date_of_birth: '1988-05-12',
        profile_photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        location: 'Delhi, NCR',
        availability: 'flexible',
        skills_offered: ['Python', 'Data Analysis', 'Machine Learning'],
        skills_wanted: ['Web Development', 'HTML/CSS', 'JavaScript']
      },
      {
        email: 'kavya.iyer@example.com',
        password: await bcrypt.hash('password123', 10),
        name: 'Kavya Iyer',
        date_of_birth: '1993-09-30',
        profile_photo: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
        location: 'Chennai, Tamil Nadu',
        availability: 'weekends',
        skills_offered: ['Graphic Design', 'Canva', 'Social Media Marketing'],
        skills_wanted: ['Excel', 'Data Visualization', 'Business Analytics']
      },
      {
        email: 'vikram.malhotra@example.com',
        password: await bcrypt.hash('password123', 10),
        name: 'Vikram Malhotra',
        date_of_birth: '1991-12-03',
        profile_photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
        location: 'Pune, Maharashtra',
        availability: 'evenings',
        skills_offered: ['Web Development', 'HTML/CSS', 'JavaScript'],
        skills_wanted: ['Mobile App Development', 'React Native', 'Flutter']
      }
    ];

    for (const user of sampleUsers) {
      // Insert user
      const [userResult] = await pool.execute(
        'INSERT INTO users (email, password, name, date_of_birth, profile_photo) VALUES (?, ?, ?, ?, ?)',
        [user.email, user.password, user.name, user.date_of_birth, user.profile_photo]
      );

      const userId = userResult.insertId;

      // Insert user profile
      await pool.execute(
        'INSERT INTO user_profiles (user_id) VALUES (?)',
        [userId]
      );

      // Insert skills offered
      for (const skill of user.skills_offered) {
        await pool.execute(
          'INSERT INTO skills (user_id, skill_name, skill_type) VALUES (?, ?, ?)',
          [userId, skill, 'offered']
        );
      }

      // Insert skills wanted
      for (const skill of user.skills_wanted) {
        await pool.execute(
          'INSERT INTO skills (user_id, skill_name, skill_type) VALUES (?, ?, ?)',
          [userId, skill, 'wanted']
        );
      }
    }

    console.log('✅ Sample data inserted successfully!');
  } catch (error) {
    console.error('❌ Error inserting sample data:', error.message);
  }
}

// JWT middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Routes

// Register new user
app.post('/api/auth/register', upload.single('profilePhoto'), async (req, res) => {
  try {
    const { email, password, dateOfBirth } = req.body;
    
    // Check if user already exists
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save profile photo
    let profilePhotoPath = null;
    if (req.file) {
      profilePhotoPath = `/uploads/${req.file.filename}`;
    }

    // Insert user
    const [result] = await pool.execute(
      'INSERT INTO users (email, password, date_of_birth, profile_photo) VALUES (?, ?, ?, ?)',
      [email, hashedPassword, dateOfBirth, profilePhotoPath]
    );

    const userId = result.insertId;

    // Create user profile
    await pool.execute(
      'INSERT INTO user_profiles (user_id) VALUES (?)',
      [userId]
    );

    // Generate JWT token
    const token = jwt.sign(
      { userId, email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: userId,
        email,
        profilePhoto: profilePhotoPath
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login user
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const [users] = await pool.execute(
      'SELECT id, email, password, name, profile_photo FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        profilePhoto: user.profile_photo
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get all users (for browsing)
app.get('/api/users', async (req, res) => {
  try {
    const { search, availability } = req.query;
    
    let query = `
      SELECT 
        u.id, u.name, u.email, u.profile_photo,
        up.location, up.availability, up.rating,
        GROUP_CONCAT(DISTINCT CASE WHEN s.skill_type = 'offered' THEN s.skill_name END) as skills_offered,
        GROUP_CONCAT(DISTINCT CASE WHEN s.skill_type = 'wanted' THEN s.skill_name END) as skills_wanted
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up.user_id
      LEFT JOIN skills s ON u.id = s.user_id
    `;

    const conditions = [];
    const params = [];

    if (search) {
      conditions.push(`(u.name LIKE ? OR s.skill_name LIKE ?)`);
      params.push(`%${search}%`, `%${search}%`);
    }

    if (availability && availability !== 'all') {
      conditions.push(`up.availability = ?`);
      params.push(availability);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    query += ` GROUP BY u.id, u.name, u.email, u.profile_photo, up.location, up.availability, up.rating ORDER BY up.rating DESC`;

    const [users] = await pool.execute(query, params);

    // Process results
    const processedUsers = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      profilePhoto: user.profile_photo,
      location: user.location,
      availability: user.availability,
      rating: parseFloat(user.rating) || 0,
      skillsOffered: user.skills_offered ? user.skills_offered.split(',') : [],
      skillsWanted: user.skills_wanted ? user.skills_wanted.split(',') : []
    }));

    res.json(processedUsers);

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get current user profile
app.get('/api/users/me', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const [users] = await pool.execute(`
      SELECT 
        u.id, u.name, u.email, u.profile_photo, u.date_of_birth,
        up.location, up.availability, up.rating, up.total_swaps,
        GROUP_CONCAT(DISTINCT CASE WHEN s.skill_type = 'offered' THEN s.skill_name END) as skills_offered,
        GROUP_CONCAT(DISTINCT CASE WHEN s.skill_type = 'wanted' THEN s.skill_name END) as skills_wanted
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up.user_id
      LEFT JOIN skills s ON u.id = s.user_id
      WHERE u.id = ?
      GROUP BY u.id, u.name, u.email, u.profile_photo, u.date_of_birth, up.location, up.availability, up.rating, up.total_swaps
    `, [userId]);

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = users[0];
    const processedUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      profilePhoto: user.profile_photo,
      dateOfBirth: user.date_of_birth,
      location: user.location,
      availability: user.availability,
      rating: parseFloat(user.rating) || 0,
      totalSwaps: user.total_swaps || 0,
      skillsOffered: user.skills_offered ? user.skills_offered.split(',') : [],
      skillsWanted: user.skills_wanted ? user.skills_wanted.split(',') : []
    };

    res.json(processedUser);

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Get user profile
app.get('/api/users/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.id;

    const [users] = await pool.execute(`
      SELECT 
        u.id, u.name, u.email, u.profile_photo, u.date_of_birth,
        up.location, up.availability, up.rating, up.total_swaps,
        GROUP_CONCAT(DISTINCT CASE WHEN s.skill_type = 'offered' THEN s.skill_name END) as skills_offered,
        GROUP_CONCAT(DISTINCT CASE WHEN s.skill_type = 'wanted' THEN s.skill_name END) as skills_wanted
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up.user_id
      LEFT JOIN skills s ON u.id = s.user_id
      WHERE u.id = ?
      GROUP BY u.id, u.name, u.email, u.profile_photo, u.date_of_birth, up.location, up.availability, up.rating, up.total_swaps
    `, [userId]);

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = users[0];
    const processedUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      profilePhoto: user.profile_photo,
      dateOfBirth: user.date_of_birth,
      location: user.location,
      availability: user.availability,
      rating: parseFloat(user.rating) || 0,
      totalSwaps: user.total_swaps || 0,
      skillsOffered: user.skills_offered ? user.skills_offered.split(',') : [],
      skillsWanted: user.skills_wanted ? user.skills_wanted.split(',') : []
    };

    res.json(processedUser);

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Update user profile
app.put('/api/users/:id', authenticateToken, upload.single('profilePhoto'), async (req, res) => {
  try {
    const userId = req.params.id;
    const { name, location, availability, skillsOffered, skillsWanted } = req.body;

    // Check if user exists and is authorized
    if (req.user.userId != userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Update user basic info
    if (name) {
      await pool.execute('UPDATE users SET name = ? WHERE id = ?', [name, userId]);
    }

    // Update profile photo
    if (req.file) {
      const profilePhotoPath = `/uploads/${req.file.filename}`;
      await pool.execute('UPDATE users SET profile_photo = ? WHERE id = ?', [profilePhotoPath, userId]);
    }

    // Update user profile
    await pool.execute(
      'UPDATE user_profiles SET location = ?, availability = ? WHERE user_id = ?',
      [location, availability, userId]
    );

    // Update skills
    if (skillsOffered) {
      await pool.execute('DELETE FROM skills WHERE user_id = ? AND skill_type = ?', [userId, 'offered']);
      for (const skill of skillsOffered) {
        await pool.execute(
          'INSERT INTO skills (user_id, skill_name, skill_type) VALUES (?, ?, ?)',
          [userId, skill, 'offered']
        );
      }
    }

    if (skillsWanted) {
      await pool.execute('DELETE FROM skills WHERE user_id = ? AND skill_type = ?', [userId, 'wanted']);
      for (const skill of skillsWanted) {
        await pool.execute(
          'INSERT INTO skills (user_id, skill_name, skill_type) VALUES (?, ?, ?)',
          [userId, skill, 'wanted']
        );
      }
    }

    res.json({ message: 'Profile updated successfully' });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Request swap
app.post('/api/swaps/request', authenticateToken, async (req, res) => {
  try {
    const { recipientId, message } = req.body;
    const requesterId = req.user.userId;

    // Check if recipient exists
    const [recipients] = await pool.execute('SELECT id, name FROM users WHERE id = ?', [recipientId]);
    if (recipients.length === 0) {
      return res.status(404).json({ error: 'Recipient not found' });
    }

    // Check if request already exists
    const [existingRequests] = await pool.execute(
      'SELECT id FROM swap_requests WHERE requester_id = ? AND recipient_id = ? AND status = "pending"',
      [requesterId, recipientId]
    );

    if (existingRequests.length > 0) {
      return res.status(400).json({ error: 'Swap request already sent' });
    }

    // Create swap request
    const [result] = await pool.execute(
      'INSERT INTO swap_requests (requester_id, recipient_id, message) VALUES (?, ?, ?)',
      [requesterId, recipientId, message]
    );

    // Create notification for recipient
    const [requester] = await pool.execute('SELECT name FROM users WHERE id = ?', [requesterId]);
    const requesterName = requester[0]?.name || 'Someone';
    
    await pool.execute(
      'INSERT INTO notifications (user_id, type, title, message, related_id) VALUES (?, ?, ?, ?, ?)',
      [recipientId, 'swap_request', 'New Swap Request', `${requesterName} wants to swap skills with you`, result.insertId]
    );

    res.status(201).json({ message: 'Swap request sent successfully' });

  } catch (error) {
    console.error('Request swap error:', error);
    res.status(500).json({ error: 'Failed to send swap request' });
  }
});

// Get user's swap requests
app.get('/api/swaps', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { type = 'all' } = req.query;

    let query = `
      SELECT 
        sr.id, sr.status, sr.message, sr.created_at,
        u1.name as requester_name, u1.profile_photo as requester_photo,
        u2.name as recipient_name, u2.profile_photo as recipient_photo
      FROM swap_requests sr
      JOIN users u1 ON sr.requester_id = u1.id
      JOIN users u2 ON sr.recipient_id = u2.id
      WHERE (sr.requester_id = ? OR sr.recipient_id = ?)
    `;

    const params = [userId, userId];

    if (type === 'sent') {
      query += ' AND sr.requester_id = ?';
      params.push(userId);
    } else if (type === 'received') {
      query += ' AND sr.recipient_id = ?';
      params.push(userId);
    }

    query += ' ORDER BY sr.created_at DESC';

    const [requests] = await pool.execute(query, params);

    // Transform the data to match the frontend interface
    const transformedRequests = requests.map(request => ({
      id: request.id,
      status: request.status,
      message: request.message,
      createdAt: request.created_at,
      requesterName: request.requester_name,
      requesterPhoto: request.requester_photo,
      recipientName: request.recipient_name,
      recipientPhoto: request.recipient_photo
    }));

    res.json(transformedRequests);

  } catch (error) {
    console.error('Get swaps error:', error);
    res.status(500).json({ error: 'Failed to fetch swap requests' });
  }
});

// Respond to swap request
app.put('/api/swaps/:id/respond', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.userId;

    // Check if user is the recipient
    const [requests] = await pool.execute(
      'SELECT requester_id, recipient_id FROM swap_requests WHERE id = ?',
      [id]
    );

    if (requests.length === 0) {
      return res.status(404).json({ error: 'Swap request not found' });
    }

    if (requests[0].recipient_id != userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Update status
    await pool.execute(
      'UPDATE swap_requests SET status = ? WHERE id = ?',
      [status, id]
    );

    // Create notification for requester
    const notificationType = status === 'accepted' ? 'swap_accepted' : 'swap_rejected';
    const notificationTitle = status === 'accepted' ? 'Swap Request Accepted' : 'Swap Request Rejected';
    const notificationMessage = status === 'accepted' 
      ? 'Your swap request has been accepted!'
      : 'Your swap request has been rejected.';

    await pool.execute(
      'INSERT INTO notifications (user_id, type, title, message, related_id) VALUES (?, ?, ?, ?, ?)',
      [requests[0].requester_id, notificationType, notificationTitle, notificationMessage, id]
    );

    // If accepted, increment total swaps for both users
    if (status === 'accepted') {
      await pool.execute(
        'UPDATE user_profiles SET total_swaps = total_swaps + 1 WHERE user_id IN (?, ?)',
        [requests[0].requester_id, requests[0].recipient_id]
      );
    }

    res.json({ message: 'Swap request updated successfully' });

  } catch (error) {
    console.error('Respond to swap error:', error);
    res.status(500).json({ error: 'Failed to update swap request' });
  }
});

// Get user notifications
app.get('/api/notifications', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    let limit = 50;
    if (req.query.limit) {
      const parsed = parseInt(req.query.limit, 10);
      if (!isNaN(parsed) && parsed > 0) limit = parsed;
    }

    const [notifications] = await pool.execute(`
      SELECT id, type, title, message, is_read, created_at, related_id
      FROM notifications 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT ${Number(limit) || 50}
    `, [userId]);

    // Transform the data to match the frontend interface
    const transformedNotifications = notifications.map(notification => ({
      id: notification.id,
      type: notification.type,
      message: notification.message,
      time: new Date(notification.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      read: notification.is_read === 1
    }));

    res.json(transformedNotifications);

  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Mark notification as read
app.put('/api/notifications/:id/read', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    await pool.execute(
      'UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    res.json({ message: 'Notification marked as read' });

  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// Mark all notifications as read
app.put('/api/notifications/read-all', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    await pool.execute(
      'UPDATE notifications SET is_read = TRUE WHERE user_id = ?',
      [userId]
    );

    res.json({ message: 'All notifications marked as read' });

  } catch (error) {
    console.error('Mark all notifications read error:', error);
    res.status(500).json({ error: 'Failed to mark notifications as read' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Skill Swap API is running!' });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
async function startServer() {
  await initializeDatabase();
  
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 API Health: http://localhost:${PORT}/api/health`);
  });
}

startServer(); 