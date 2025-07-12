-- Skill Swap Platform Database Setup
-- Run these commands in your MySQL database

-- Create database
CREATE DATABASE IF NOT EXISTS skill_swap_db;
USE skill_swap_db;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  date_of_birth DATE,
  profile_photo VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- User profiles table
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
);

-- Skills table
CREATE TABLE IF NOT EXISTS skills (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  skill_name VARCHAR(255) NOT NULL,
  skill_type ENUM('offered', 'wanted') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Swap requests table
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
);

-- Insert sample users (passwords are hashed versions of 'password123')
INSERT INTO users (email, password, name, date_of_birth, profile_photo) VALUES
('priya.sharma@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Priya Sharma', '1995-03-15', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face'),
('arjun.patel@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Arjun Patel', '1992-07-22', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'),
('anjali.reddy@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Anjali Reddy', '1990-11-08', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'),
('rahul.singh@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Rahul Singh', '1988-05-12', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'),
('kavya.iyer@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Kavya Iyer', '1993-09-30', 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'),
('vikram.malhotra@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Vikram Malhotra', '1991-12-03', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face'),
('meera.kapoor@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Meera Kapoor', '1994-06-18', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face'),
('aditya.verma@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Aditya Verma', '1989-02-25', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face'),
('zara.khan@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Zara Khan', '1996-08-14', 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&h=150&fit=crop&crop=face'),
('rohan.desai@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Rohan Desai', '1993-04-07', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face'),
('ishita.gupta@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Ishita Gupta', '1991-10-30', 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&h=150&fit=crop&crop=face'),
('karan.mehta@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Karan Mehta', '1987-12-05', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face');

-- Insert user profiles
INSERT INTO user_profiles (user_id, location, availability, rating, total_swaps) VALUES
(1, 'Mumbai, Maharashtra', 'weekends', 4.8, 12),
(2, 'Bangalore, Karnataka', 'evenings', 4.6, 8),
(3, 'Hyderabad, Telangana', 'weekdays', 4.9, 15),
(4, 'Delhi, NCR', 'flexible', 4.7, 10),
(5, 'Chennai, Tamil Nadu', 'weekends', 4.5, 6),
(6, 'Pune, Maharashtra', 'evenings', 4.4, 9),
(7, 'Kolkata, West Bengal', 'weekdays', 4.3, 7),
(8, 'Ahmedabad, Gujarat', 'flexible', 4.6, 11),
(9, 'Jaipur, Rajasthan', 'weekends', 4.2, 5),
(10, 'Indore, Madhya Pradesh', 'evenings', 4.8, 13),
(11, 'Lucknow, Uttar Pradesh', 'weekdays', 4.7, 8),
(12, 'Chandigarh, Punjab', 'flexible', 4.5, 9);

-- Insert skills offered
INSERT INTO skills (user_id, skill_name, skill_type) VALUES
-- Priya Sharma
(1, 'Photoshop', 'offered'),
(1, 'Illustrator', 'offered'),
(1, 'UI/UX Design', 'offered'),

-- Arjun Patel
(2, 'JavaScript', 'offered'),
(2, 'React', 'offered'),
(2, 'Node.js', 'offered'),

-- Anjali Reddy
(3, 'Excel', 'offered'),
(3, 'PowerPoint', 'offered'),
(3, 'Project Management', 'offered'),

-- Rahul Singh
(4, 'Python', 'offered'),
(4, 'Data Analysis', 'offered'),
(4, 'Machine Learning', 'offered'),

-- Kavya Iyer
(5, 'Graphic Design', 'offered'),
(5, 'Canva', 'offered'),
(5, 'Social Media Marketing', 'offered'),

-- Vikram Malhotra
(6, 'Web Development', 'offered'),
(6, 'HTML/CSS', 'offered'),
(6, 'JavaScript', 'offered'),

-- Meera Kapoor
(7, 'Content Writing', 'offered'),
(7, 'SEO', 'offered'),
(7, 'Digital Marketing', 'offered'),

-- Aditya Verma
(8, 'Mobile App Development', 'offered'),
(8, 'React Native', 'offered'),
(8, 'Flutter', 'offered'),

-- Zara Khan
(9, 'Video Editing', 'offered'),
(9, 'Adobe Premiere', 'offered'),
(9, 'Animation', 'offered'),

-- Rohan Desai
(10, 'Backend Development', 'offered'),
(10, 'Java', 'offered'),
(10, 'Spring Boot', 'offered'),

-- Ishita Gupta
(11, 'DevOps', 'offered'),
(11, 'Docker', 'offered'),
(11, 'Kubernetes', 'offered'),

-- Karan Mehta
(12, 'Cloud Computing', 'offered'),
(12, 'AWS', 'offered'),
(12, 'Azure', 'offered');

-- Insert skills wanted
INSERT INTO skills (user_id, skill_name, skill_type) VALUES
-- Priya Sharma
(1, 'JavaScript', 'wanted'),
(1, 'React', 'wanted'),
(1, 'Node.js', 'wanted'),

-- Arjun Patel
(2, 'Python', 'wanted'),
(2, 'Data Analysis', 'wanted'),
(2, 'Machine Learning', 'wanted'),

-- Anjali Reddy
(3, 'Graphic Design', 'wanted'),
(3, 'Canva', 'wanted'),
(3, 'Social Media Marketing', 'wanted'),

-- Rahul Singh
(4, 'Web Development', 'wanted'),
(4, 'HTML/CSS', 'wanted'),
(4, 'JavaScript', 'wanted'),

-- Kavya Iyer
(5, 'Excel', 'wanted'),
(5, 'Data Visualization', 'wanted'),
(5, 'Business Analytics', 'wanted'),

-- Vikram Malhotra
(6, 'Mobile App Development', 'wanted'),
(6, 'React Native', 'wanted'),
(6, 'Flutter', 'wanted'),

-- Meera Kapoor
(7, 'Video Editing', 'wanted'),
(7, 'Adobe Premiere', 'wanted'),
(7, 'Animation', 'wanted'),

-- Aditya Verma
(8, 'Backend Development', 'wanted'),
(8, 'Java', 'wanted'),
(8, 'Spring Boot', 'wanted'),

-- Zara Khan
(9, 'Content Writing', 'wanted'),
(9, 'Creative Writing', 'wanted'),
(9, 'Blogging', 'wanted'),

-- Rohan Desai
(10, 'DevOps', 'wanted'),
(10, 'Docker', 'wanted'),
(10, 'Kubernetes', 'wanted'),

-- Ishita Gupta
(11, 'Cloud Computing', 'wanted'),
(11, 'AWS', 'wanted'),
(11, 'Azure', 'wanted'),

-- Karan Mehta
(12, 'Cybersecurity', 'wanted'),
(12, 'Ethical Hacking', 'wanted'),
(12, 'Network Security', 'wanted');

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_skills_user_type ON skills(user_id, skill_type);
CREATE INDEX idx_swap_requests_status ON swap_requests(status);
CREATE INDEX idx_swap_requests_users ON swap_requests(requester_id, recipient_id);

-- Show all tables
SHOW TABLES;

-- Show sample data
SELECT 'Users:' as info;
SELECT id, name, email, location, availability, rating FROM users u JOIN user_profiles up ON u.id = up.user_id LIMIT 5;

SELECT 'Skills Offered:' as info;
SELECT u.name, s.skill_name FROM users u JOIN skills s ON u.id = s.user_id WHERE s.skill_type = 'offered' LIMIT 10;

SELECT 'Skills Wanted:' as info;
SELECT u.name, s.skill_name FROM users u JOIN skills s ON u.id = s.user_id WHERE s.skill_type = 'wanted' LIMIT 10; 