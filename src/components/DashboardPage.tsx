import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface User {
  id: number;
  name: string;
  profilePhoto: string;
  skillsOffered: string[];
  skillsWanted: string[];
  rating: number;
  location: string;
  availability: string;
}

interface DashboardPageProps {
  currentUser: {
    email: string;
    name?: string;
    profilePhoto?: string;
  };
  onLogout: () => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ currentUser, onLogout }) => {
  const [availability, setAvailability] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const usersPerPage = 6;
  const navigate = useNavigate();

  // Mock data with Indian users
  const mockUsers: User[] = [
    {
      id: 1,
      name: "Priya Sharma",
      profilePhoto: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
      skillsOffered: ["Photoshop", "Illustrator", "UI/UX Design"],
      skillsWanted: ["JavaScript", "React", "Node.js"],
      rating: 4.8,
      location: "Mumbai, Maharashtra",
      availability: "Weekends"
    },
    {
      id: 2,
      name: "Arjun Patel",
      profilePhoto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      skillsOffered: ["JavaScript", "React", "Node.js"],
      skillsWanted: ["Python", "Data Analysis", "Machine Learning"],
      rating: 4.6,
      location: "Bangalore, Karnataka",
      availability: "Evenings"
    },
    {
      id: 3,
      name: "Anjali Reddy",
      profilePhoto: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      skillsOffered: ["Excel", "PowerPoint", "Project Management"],
      skillsWanted: ["Graphic Design", "Canva", "Social Media Marketing"],
      rating: 4.9,
      location: "Hyderabad, Telangana",
      availability: "Weekdays"
    },
    {
      id: 4,
      name: "Rahul Singh",
      profilePhoto: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      skillsOffered: ["Python", "Data Analysis", "Machine Learning"],
      skillsWanted: ["Web Development", "HTML/CSS", "JavaScript"],
      rating: 4.7,
      location: "Delhi, NCR",
      availability: "Flexible"
    },
    {
      id: 5,
      name: "Kavya Iyer",
      profilePhoto: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      skillsOffered: ["Graphic Design", "Canva", "Social Media Marketing"],
      skillsWanted: ["Excel", "Data Visualization", "Business Analytics"],
      rating: 4.5,
      location: "Chennai, Tamil Nadu",
      availability: "Weekends"
    },
    {
      id: 6,
      name: "Vikram Malhotra",
      profilePhoto: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
      skillsOffered: ["Web Development", "HTML/CSS", "JavaScript"],
      skillsWanted: ["Mobile App Development", "React Native", "Flutter"],
      rating: 4.4,
      location: "Pune, Maharashtra",
      availability: "Evenings"
    },
    {
      id: 7,
      name: "Meera Kapoor",
      profilePhoto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
      skillsOffered: ["Content Writing", "SEO", "Digital Marketing"],
      skillsWanted: ["Video Editing", "Adobe Premiere", "Animation"],
      rating: 4.3,
      location: "Kolkata, West Bengal",
      availability: "Weekdays"
    },
    {
      id: 8,
      name: "Aditya Verma",
      profilePhoto: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face",
      skillsOffered: ["Mobile App Development", "React Native", "Flutter"],
      skillsWanted: ["Backend Development", "Java", "Spring Boot"],
      rating: 4.6,
      location: "Ahmedabad, Gujarat",
      availability: "Flexible"
    },
    {
      id: 9,
      name: "Zara Khan",
      profilePhoto: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&h=150&fit=crop&crop=face",
      skillsOffered: ["Video Editing", "Adobe Premiere", "Animation"],
      skillsWanted: ["Content Writing", "Creative Writing", "Blogging"],
      rating: 4.2,
      location: "Jaipur, Rajasthan",
      availability: "Weekends"
    },
    {
      id: 10,
      name: "Rohan Desai",
      profilePhoto: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face",
      skillsOffered: ["Backend Development", "Java", "Spring Boot"],
      skillsWanted: ["DevOps", "Docker", "Kubernetes"],
      rating: 4.8,
      location: "Indore, Madhya Pradesh",
      availability: "Evenings"
    },
    {
      id: 11,
      name: "Ishita Gupta",
      profilePhoto: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&h=150&fit=crop&crop=face",
      skillsOffered: ["DevOps", "Docker", "Kubernetes"],
      skillsWanted: ["Cloud Computing", "AWS", "Azure"],
      rating: 4.7,
      location: "Lucknow, Uttar Pradesh",
      availability: "Weekdays"
    },
    {
      id: 12,
      name: "Karan Mehta",
      profilePhoto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      skillsOffered: ["Cloud Computing", "AWS", "Azure"],
      skillsWanted: ["Cybersecurity", "Ethical Hacking", "Network Security"],
      rating: 4.5,
      location: "Chandigarh, Punjab",
      availability: "Flexible"
    }
  ];

  const filteredUsers = mockUsers.filter(user => {
    const matchesSearch = searchTerm === '' || 
      user.skillsOffered.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase())) ||
      user.skillsWanted.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase())) ||
      user.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAvailability = availability === 'all' || user.availability.toLowerCase() === availability.toLowerCase();
    
    return matchesSearch && matchesAvailability;
  });

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const handleRequestSwap = (userId: number) => {
    alert(`Swap request sent to ${mockUsers.find(u => u.id === userId)?.name}!`);
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'text-secondary-400' : 'text-gray-300'
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        <span className="ml-1 text-sm font-medium text-gray-600">{rating}</span>
      </div>
    );
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability.toLowerCase()) {
      case 'weekends':
        return 'bg-green-100 text-green-800';
      case 'evenings':
        return 'bg-purple-100 text-purple-800';
      case 'weekdays':
        return 'bg-blue-100 text-blue-800';
      case 'flexible':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      {/* Header */}
      <header className="bg-white shadow-soft border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                Skill Swap Platform
              </h1>
              <button
                onClick={() => navigate('/')}
                className="text-gray-600 hover:text-primary-600 transition-colors font-medium"
              >
                Home
              </button>
            </div>
            
            {/* User Account Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-3 text-gray-700 hover:text-gray-900 transition-colors"
              >
                <img
                  src={currentUser.profilePhoto || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"}
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover border-2 border-primary-200"
                />
                <span className="font-medium">{currentUser.name || currentUser.email}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <button
                    onClick={() => navigate('/profile')}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    My Profile
                  </button>
                  <button
                    onClick={() => navigate('/my-account')}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    My Account
                  </button>
                  <hr className="my-1" />
                  <button
                    onClick={onLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Message */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back, {currentUser.name || currentUser.email.split('@')[0]}! 👋
          </h2>
          <p className="text-gray-600">Discover amazing skills and connect with talented people</p>
        </div>

        {/* Filters and Search */}
        <div className="mb-8 space-y-6">
          {/* Availability Filter */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Availability</h2>
            <div className="flex flex-wrap gap-3">
              {['all', 'weekends', 'evenings', 'weekdays', 'flexible'].map((option) => (
                <button
                  key={option}
                  onClick={() => setAvailability(option)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    availability === option
                      ? 'bg-primary-600 text-white shadow-soft'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Search */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Search Skills</h2>
            <div className="relative">
              <input
                type="text"
                placeholder="Search for skills like 'Photoshop', 'Excel', 'JavaScript'..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pr-12"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* User Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {currentUsers.map((user) => (
            <div key={user.id} className="profile-card">
              <div className="flex items-start space-x-4">
                {/* Profile Photo */}
                <div className="flex-shrink-0">
                  <img
                    src={user.profilePhoto}
                    alt={user.name}
                    className="w-16 h-16 rounded-full object-cover border-4 border-primary-100"
                  />
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">{user.name}</h3>
                    <div className="flex items-center space-x-2">
                      {renderStars(user.rating)}
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-500 mb-2">{user.location}</p>

                  {/* Availability */}
                  <div className="mb-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getAvailabilityColor(user.availability)}`}>
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                      {user.availability}
                    </span>
                  </div>

                  {/* Skills Offered */}
                  <div className="mb-3">
                    <h4 className="text-sm font-medium text-primary-700 mb-1">Skills Offered:</h4>
                    <div className="flex flex-wrap gap-1">
                      {user.skillsOffered.map((skill, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Skills Wanted */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-secondary-700 mb-1">Skills Wanted:</h4>
                    <div className="flex flex-wrap gap-1">
                      {user.skillsWanted.map((skill, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-secondary-100 text-secondary-800"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Request Button */}
                  <button
                    onClick={() => handleRequestSwap(user.id)}
                    className="w-full btn-secondary"
                  >
                    Request Swap
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 mb-8">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              &lt;
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
                  currentPage === page
                    ? 'bg-primary-600 text-white shadow-soft'
                    : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
            
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              &gt;
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default DashboardPage; 