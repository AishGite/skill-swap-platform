# Selected Problem Statement : SKILL SWAP PLATFORM 🚀

##  Team Members

- **Aishwarya Gite** – [aishgite@gmail.com](mailto:aishgite@gmail.com)
- **Abhishek Saraff** – [abhisheksaraff18@gmail.com](mailto:abhisheksaraff18@gmail.com)


A beautiful and interactive platform where users can list their skills and request others in return. Built with React, Node.js, and MySQL.

## ✨ Features

### 🔐 Authentication System
- **User Registration**: Email, password, DOB, profile photo upload
- **User Login**: Secure authentication with JWT tokens
- **Forgot Password**: Email-based password reset functionality
- **Profile Management**: Update personal information and skills

### 👥 User Profiles
- **Profile Photos**: Local storage with image upload
- **Skills Offered**: What users can teach others
- **Skills Wanted**: What users want to learn
- **Availability**: Weekends, evenings, weekdays, or flexible
- **Location**: City and state information
- **Ratings**: 5-star rating system

### 🔍 Search & Filter
- **Skill Search**: Find users by specific skills
- **Availability Filter**: Filter by user availability
- **Location-based**: Browse users by location
- **Pagination**: Navigate through user listings

### 🤝 Swap System
- **Request Swaps**: Send swap requests to other users
- **Accept/Reject**: Manage incoming swap requests
- **Track History**: View all swap activities
- **Rating System**: Rate users after completed swaps

### 🎨 Beautiful UI
- **Responsive Design**: Works on all devices
- **Blue/White/Yellow Theme**: Consistent color scheme
- **Smooth Animations**: Interactive hover effects
- **Modern Interface**: Clean and user-friendly design

## 🛠️ Tech Stack

### Frontend
- **React.js** - Frontend library
- **TypeScript** - Type safety
- **React Router** - Navigation
- **Tailwind CSS** - Styling
- **Axios** - API requests

### Backend
- **Node.js** - Server runtime
- **Express.js** - Web framework
- **MySQL** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Multer** - File uploads

## 📦 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

### 1. Clone the Repository
```bash
git clone <repository-url>
cd skill-swap-platform
```

### 2. Database Setup

#### Create MySQL Database
```sql
-- Run these commands in MySQL
CREATE DATABASE skill_swap_db;
USE skill_swap_db;
```

#### Import Database Schema
```bash
# Option 1: Using MySQL command line
mysql -u root -p skill_swap_db < backend/database.sql

# Option 2: Copy and paste the contents of backend/database.sql
```

### 3. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp env.example .env

# Edit .env file with your database credentials
# DB_HOST=localhost
# DB_USER=root
# DB_PASSWORD=your_password
# DB_NAME=skill_swap_db
# JWT_SECRET=your-secret-key

# Start development server
npm run dev
```

The backend will run on `http://localhost:5000`

### 4. Frontend Setup

```bash
# Open a new terminal
cd ..  # Go back to project root

# Install dependencies
npm install

# Start development server
npm start
```

The frontend will run on `http://localhost:3000`

## 🗄️ Database Schema

### Tables

1. **users** - User accounts and basic info
2. **user_profiles** - Extended user information
3. **skills** - Skills offered and wanted by users
4. **swap_requests** - Swap request management

### Sample Data
The database comes pre-loaded with 12 Indian users with diverse skills:
- Priya Sharma (Design)
- Arjun Patel (Web Development)
- Anjali Reddy (Business)
- Rahul Singh (Data Science)
- And 8 more users...

## 🚀 Usage

### For Users
1. **Browse Skills**: Visit the home page to see all users
2. **Search & Filter**: Use search bar and availability filters
3. **Create Account**: Sign up with email and profile photo
4. **Add Skills**: List what you can offer and what you want
5. **Request Swaps**: Connect with other users for skill exchange
6. **Manage Requests**: Accept or reject incoming swap requests

### For Developers
1. **API Endpoints**: All routes are documented in `server.js`
2. **Authentication**: JWT-based auth with protected routes
3. **File Uploads**: Profile photos stored locally
4. **Database**: MySQL with proper relationships and indexes

## 📁 Project Structure

```
skill-swap-platform/
├── src/
│   ├── components/
│   │   ├── HomePage.tsx          # Landing page
│   │   ├── LoginPage.tsx         # Login form
│   │   ├── SignupPage.tsx        # Registration form
│   │   ├── ForgotPasswordPage.tsx # Password reset
│   │   └── DashboardPage.tsx     # Authenticated home
│   ├── App.tsx                   # Main app with routing
│   └── index.css                 # Global styles
├── backend/
│   ├── server.js                 # Express server
│   ├── database.sql              # Database schema
│   ├── package.json              # Backend dependencies
│   └── env.example               # Environment template
├── uploads/                      # Profile photos storage
└── README.md                     # This file
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Users
- `GET /api/users` - Get all users (with filters)
- `GET /api/users/:id` - Get specific user profile
- `PUT /api/users/:id` - Update user profile

### Swaps
- `POST /api/swaps/request` - Request a swap
- `GET /api/swaps` - Get user's swap requests
- `PUT /api/swaps/:id/respond` - Respond to swap request

## 🎨 Customization

### Colors
The platform uses a blue, white, and yellow theme. To customize:

1. Edit `tailwind.config.js` for color changes
2. Modify `src/index.css` for custom styles
3. Update component classes for specific styling

### Database
- Add new user fields in `users` table
- Extend `user_profiles` for additional info
- Modify `skills` table for different skill types

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check MySQL is running
   - Verify credentials in `.env`
   - Ensure database exists

2. **Port Already in Use**
   - Change port in `.env` file
   - Kill existing processes

3. **File Upload Issues**
   - Check `uploads/` directory exists
   - Verify file size limits
   - Ensure proper permissions

### Development Tips
- Use `npm run dev` for backend auto-reload
- Check browser console for frontend errors
- Monitor server logs for API issues

---

**Happy Skill Swapping! 🎉**
