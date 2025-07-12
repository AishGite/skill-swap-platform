import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService, User } from '../services/api';

interface UserProfilePageProps {
  currentUser: {
    id: number;
    email: string;
    name?: string;
    profilePhoto?: string;
  };
  onLogout: () => void;
}

const UserProfilePage: React.FC<UserProfilePageProps> = ({ currentUser, onLogout }) => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [swapMessage, setSwapMessage] = useState('');
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [selectedSkillOffered, setSelectedSkillOffered] = useState('');
  const [selectedSkillWanted, setSelectedSkillWanted] = useState('');
  const [currentUserProfile, setCurrentUserProfile] = useState<User | null>(null);

  useEffect(() => {
    // Load current user's profile to get their skills
    const loadCurrentUserProfile = async () => {
      try {
        console.log('Loading current user profile...');
        const profile = await apiService.getCurrentUserProfile();
        console.log('Current user profile loaded:', profile);
        setCurrentUserProfile(profile);
      } catch (error) {
        console.error('Failed to load current user profile:', error);
        // Don't set fallback data - let it be null if API fails
        console.log('Current user profile loading failed, keeping null');
      }
    };

    // Load the user profile we're viewing
    const loadUserProfile = async () => {
      if (!userId) return;
      
      setIsLoading(true);
      try {
        console.log('Loading user profile for ID:', userId);
        const userData = await apiService.getUserProfile(parseInt(userId));
        console.log('User profile loaded:', userData);
        setUser(userData);
      } catch (error) {
        console.error('Failed to load user profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCurrentUserProfile();
    loadUserProfile();
  }, [userId, currentUser.id, currentUser.email, currentUser.name, currentUser.profilePhoto]);

  const handleRequestSwap = async () => {
    if (!selectedSkillOffered) {
      alert('Please select a skill to offer');
      return;
    }
    if (!selectedSkillWanted) {
      alert('Please select a skill you want to learn');
      return;
    }
    if (!swapMessage.trim()) {
      alert('Please enter a message for your swap request');
      return;
    }

    if (!user) return;

    setIsRequesting(true);
    try {
      await apiService.requestSwap(user.id, swapMessage);
      alert(`Swap request sent to ${user.name}!`);
      setShowSwapModal(false);
      setSwapMessage('');
      setSelectedSkillOffered('');
      setSelectedSkillWanted('');
    } catch (error) {
      console.error('Failed to send swap request:', error);
      alert('Failed to send swap request. Please try again.');
    } finally {
      setIsRequesting(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-5 h-5 ${
              star <= rating ? 'text-secondary-400' : 'text-gray-300'
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        <span className="ml-2 text-lg font-semibold text-gray-700">{rating}</span>
      </div>
    );
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability.toLowerCase()) {
      case 'weekends':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'evenings':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'weekdays':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'flexible':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Click outside handlers
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.user-menu')) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">User Not Found</h2>
          <p className="text-gray-600 mb-4">User ID: {userId}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="btn-primary"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      {/* Header */}
      <header className="bg-white shadow-soft border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left side - Back button */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center text-gray-600 hover:text-primary-600 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Dashboard
              </button>
            </div>

            {/* Right side - User menu */}
            <div className="relative user-menu">
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
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    My Profile
                  </button>
                  <button
                    onClick={() => navigate('/notifications')}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Notifications
                  </button>
                  <hr className="my-1" />
                  <button
                    onClick={onLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - Profile Photo */}
          <div className="space-y-6">
            <div className="card p-8 text-center">
              <div className="relative inline-block">
                <img
                  src={user.profilePhoto || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face"}
                  alt={user.name || 'User'}
                  className="w-64 h-64 rounded-full object-cover border-4 border-white shadow-soft mx-auto"
                />
                <div className="absolute -bottom-2 -right-2 bg-green-500 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-800 mt-6 mb-2">{user.name || 'Anonymous'}</h1>
              <p className="text-gray-600 mb-4">{user.email}</p>
              
              <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {user.location || 'Location not specified'}
                </span>
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {user.totalSwaps || 0} swaps
                </span>
              </div>
            </div>
          </div>

          {/* Right Side - User Details */}
          <div className="space-y-6">
            {/* Basic Info Card */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Basic Information
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium text-gray-800">{user.name || 'Anonymous'}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Location:</span>
                  <span className="font-medium text-gray-800">{user.location || 'Not specified'}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Availability:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getAvailabilityColor(user.availability || 'flexible')}`}>
                    {user.availability || 'Flexible'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Rating:</span>
                  {renderStars(user.rating || 0)}
                </div>
              </div>
            </div>

            {/* Skills Offered Card */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Skills Offered
              </h2>
              
              <div className="flex flex-wrap gap-2">
                {user.skillsOffered && user.skillsOffered.length > 0 ? (
                  user.skillsOffered.map((skill, index) => (
                    <span
                      key={index}
                      className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium border border-green-200"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No skills offered yet</p>
                )}
              </div>
            </div>

            {/* Skills Wanted Card */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Skills Wanted
              </h2>
              
              <div className="flex flex-wrap gap-2">
                {user.skillsWanted && user.skillsWanted.length > 0 ? (
                  user.skillsWanted.map((skill, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium border border-blue-200"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No skills wanted yet</p>
                )}
              </div>
            </div>

            {/* Request Swap Button */}
            <div className="card p-6">
              <button
                onClick={() => setShowSwapModal(true)}
                className="w-full btn-primary text-lg py-4 flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Request Skill Swap
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Swap Request Modal */}
      {showSwapModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">
              Request Skill Swap with {user.name || 'User'}
            </h3>
            
            {/* Show warning if no skills available */}
            {(!currentUserProfile?.skillsOffered?.length || !user?.skillsWanted?.length) && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  {!currentUserProfile?.skillsOffered?.length && !user?.skillsWanted?.length 
                    ? "No skills available for swap. Please add skills to your profile first."
                    : !currentUserProfile?.skillsOffered?.length 
                    ? "You haven't added any skills you can offer. Please update your profile."
                    : "This user hasn't added any skills they want to learn."
                  }
                </p>
              </div>
            )}
            
            <div className="space-y-4">
              
              {/* Skill to Offer */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Choose a skill to offer *
                </label>
                <select
                  value={selectedSkillOffered}
                  onChange={(e) => setSelectedSkillOffered(e.target.value)}
                  className="input-field"
                  required
                >
                  <option value="">Select a skill you can teach</option>
                  {(currentUserProfile?.skillsOffered || []).map((skill) => (
                    <option key={skill} value={skill}>
                      {skill}
                    </option>
                  ))}
                </select>
              </div>

              {/* Skill to Learn */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Choose a skill to learn *
                </label>
                <select
                  value={selectedSkillWanted}
                  onChange={(e) => setSelectedSkillWanted(e.target.value)}
                  className="input-field"
                  required
                >
                  <option value="">Select a skill you want to learn</option>
                  {(user?.skillsWanted || []).map((skill) => (
                    <option key={skill} value={skill}>
                      {skill}
                    </option>
                  ))}
                </select>
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message (optional)
                </label>
                <textarea
                  value={swapMessage}
                  onChange={(e) => setSwapMessage(e.target.value)}
                  placeholder="Tell them why you'd like to swap skills, your availability, or any specific details..."
                  className="input-field h-24 resize-none"
                  rows={4}
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowSwapModal(false);
                  setSelectedSkillOffered('');
                  setSelectedSkillWanted('');
                  setSwapMessage('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRequestSwap}
                disabled={isRequesting}
                className="flex-1 btn-primary disabled:opacity-50"
              >
                {isRequesting ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </div>
                ) : (
                  'Send Swap Request'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfilePage; 