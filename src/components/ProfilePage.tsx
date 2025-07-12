import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService, User } from '../services/api';

interface ProfileData {
  id: number;
  name: string;
  email: string;
  location: string;
  skillsOffered: string[];
  skillsWanted: string[];
  availability: string;
  profilePhoto: string;
  rating: number;
  totalSwaps: number;
  bio: string;
  dateOfBirth: string;
}

interface ProfilePageProps {
  currentUser: {
    id: number;
    email: string;
    name?: string;
    profilePhoto?: string;
  };
  onLogout: () => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ currentUser, onLogout }) => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [skillType, setSkillType] = useState<'offered' | 'wanted'>('offered');

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.notification-dropdown') && !target.closest('.user-menu')) {
        setShowNotifications(false);
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Load profile data
  useEffect(() => {
    loadProfileData();
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const notifications = await apiService.getNotifications();
      setNotifications(notifications.map(notification => ({
        id: notification.id,
        type: notification.type,
        message: notification.message,
        time: new Date(notification.created_at).toLocaleDateString(),
        read: notification.is_read
      })));
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  const loadProfileData = async () => {
    try {
      setLoading(true);
      const userData = await apiService.getCurrentUserProfile();
      setProfileData({
        id: userData.id,
        name: userData.name || currentUser.name || 'Your Name',
        email: userData.email,
        location: userData.location || 'Location not specified',
        skillsOffered: userData.skillsOffered || [],
        skillsWanted: userData.skillsWanted || [],
        availability: userData.availability || 'Flexible',
        profilePhoto: userData.profilePhoto || currentUser.profilePhoto || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        rating: userData.rating || 0,
        totalSwaps: userData.totalSwaps || 0,
        bio: userData.bio || 'Tell us about yourself...',
        dateOfBirth: userData.dateOfBirth || '1990-01-01'
      });
    } catch (error) {
      console.error('Failed to load profile data:', error);
      // Set default data if API fails
      setProfileData({
        id: currentUser.id,
        name: currentUser.name || 'Your Name',
        email: currentUser.email,
        location: 'Location not specified',
        skillsOffered: [],
        skillsWanted: [],
        availability: 'Flexible',
        profilePhoto: currentUser.profilePhoto || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        rating: 0,
        totalSwaps: 0,
        bio: 'Tell us about yourself...',
        dateOfBirth: '1990-01-01'
      });
    } finally {
      setLoading(false);
    }
  };

  const availabilityOptions = [
    { value: 'Weekends', label: 'Weekends' },
    { value: 'Evenings', label: 'Evenings' },
    { value: 'Weekdays', label: 'Weekdays' },
    { value: 'Flexible', label: 'Flexible' }
  ];

  const handleSave = async () => {
    if (!profileData) return;

    try {
      setSaving(true);
      await apiService.updateUserProfile(currentUser.id, {
        name: profileData.name,
        location: profileData.location,
        availability: profileData.availability,
        skillsOffered: profileData.skillsOffered,
        skillsWanted: profileData.skillsWanted
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddSkill = () => {
    if (!profileData || !newSkill.trim()) return;

    if (skillType === 'offered') {
      setProfileData(prev => prev ? ({
        ...prev,
        skillsOffered: [...prev.skillsOffered, newSkill.trim()]
      }) : null);
    } else {
      setProfileData(prev => prev ? ({
        ...prev,
        skillsWanted: [...prev.skillsWanted, newSkill.trim()]
      }) : null);
    }
    setNewSkill('');
  };

  const handleRemoveSkill = (skill: string, type: 'offered' | 'wanted') => {
    if (!profileData) return;

    if (type === 'offered') {
      setProfileData(prev => prev ? ({
        ...prev,
        skillsOffered: prev.skillsOffered.filter(s => s !== skill)
      }) : null);
    } else {
      setProfileData(prev => prev ? ({
        ...prev,
        skillsWanted: prev.skillsWanted.filter(s => s !== skill)
      }) : null);
    }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Failed to load profile data</p>
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
            <div className="flex items-center space-x-8">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                Skill Swap Platform
              </h1>
              <nav className="hidden md:flex space-x-8">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="text-gray-600 hover:text-primary-600 transition-colors"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => navigate('/profile')}
                  className="text-primary-600 font-medium"
                >
                  Profile
                </button>
                <button
                  onClick={() => navigate('/notifications')}
                  className="text-gray-600 hover:text-primary-600 transition-colors"
                >
                  Notifications
                </button>
              </nav>
            </div>
            
            {/* Notifications and User Account */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <div className="relative notification-dropdown">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 text-gray-600 hover:text-primary-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM10.5 3.75a6 6 0 0 1 6 6v3.75l2.25 2.25V12a8.25 8.25 0 0 0-16.5 0v3.75l2.25-2.25V9.75a6 6 0 0 1 6-6z" />
                  </svg>
                  {/* Notification Badge */}
                  {notifications.filter(n => !n.read).length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {notifications.filter(n => !n.read).length}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer ${
                              !notification.read ? 'bg-blue-50' : ''
                            }`}
                            onClick={() => {
                              setNotifications(prev => 
                                prev.map(n => 
                                  n.id === notification.id ? { ...n, read: true } : n
                                )
                              );
                              // Mark as read in backend
                              apiService.markNotificationAsRead(notification.id).catch(console.error);
                            }}
                          >
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0">
                                {notification.type === 'swap_request' && (
                                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                                    <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                    </svg>
                                  </div>
                                )}
                                {notification.type === 'swap_accepted' && (
                                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                  </div>
                                )}
                                {notification.type === 'new_message' && (
                                  <div className="w-8 h-8 bg-accent-100 rounded-full flex items-center justify-center">
                                    <svg className="w-4 h-4 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm ${!notification.read ? 'font-medium text-gray-900' : 'text-gray-700'}`}>
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                              </div>
                              {!notification.read && (
                                <div className="flex-shrink-0">
                                  <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-8 text-center text-gray-500">
                          <svg className="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM10.5 3.75a6 6 0 0 1 6 6v3.75l2.25 2.25V12a8.25 8.25 0 0 0-16.5 0v3.75l2.25-2.25V9.75a6 6 0 0 1 6-6z" />
                          </svg>
                          <p className="text-sm">No notifications yet</p>
                        </div>
                      )}
                    </div>
                    {notifications.length > 0 && (
                      <div className="px-4 py-2 border-t border-gray-100">
                        <button
                          onClick={() => {
                            setNotifications([]);
                            apiService.markAllNotificationsAsRead().catch(console.error);
                          }}
                          className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                        >
                          Mark all as read
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* User Account Dropdown */}
              <div className="relative user-menu">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-3 text-gray-700 hover:text-gray-900 transition-colors"
                >
                  <img
                    src={profileData.profilePhoto}
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover border-2 border-primary-200"
                  />
                  <span className="font-medium">{profileData.name}</span>
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
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
          {/* Profile Header */}
          <div className="relative bg-gradient-to-r from-primary-600 to-accent-600 p-8">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <img
                  src={profileData.profilePhoto}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                />
                {isEditing && (
                  <button className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-shadow">
                    <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-2">
                      {isEditing ? (
                        <input
                          type="text"
                          value={profileData.name}
                          onChange={(e) => setProfileData(prev => prev ? { ...prev, name: e.target.value } : null)}
                          className="bg-white/20 text-white placeholder-white/70 rounded px-3 py-1 w-full"
                          placeholder="Your Name"
                        />
                      ) : (
                        profileData.name
                      )}
                    </h1>
                    <p className="text-white/90 mb-2">{profileData.email}</p>
                    <div className="flex items-center space-x-4">
                      {renderStars(profileData.rating)}
                      <span className="text-white/80 text-sm">
                        {profileData.totalSwaps} swaps completed
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    {isEditing ? (
                      <>
                        <button
                          onClick={handleSave}
                          disabled={saving}
                          className="bg-white text-primary-600 px-6 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                          {saving ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          onClick={() => setIsEditing(false)}
                          className="bg-white/20 text-white px-6 py-2 rounded-lg font-medium hover:bg-white/30 transition-colors"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="bg-white text-primary-600 px-6 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                      >
                        Edit Profile
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={profileData.location}
                          onChange={(e) => setProfileData(prev => prev ? { ...prev, location: e.target.value } : null)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="Enter your location"
                        />
                      ) : (
                        <p className="text-gray-900">{profileData.location}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                      {isEditing ? (
                        <input
                          type="date"
                          value={profileData.dateOfBirth}
                          onChange={(e) => setProfileData(prev => prev ? { ...prev, dateOfBirth: e.target.value } : null)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      ) : (
                        <p className="text-gray-900">{new Date(profileData.dateOfBirth).toLocaleDateString()}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
                      {isEditing ? (
                        <select
                          value={profileData.availability}
                          onChange={(e) => setProfileData(prev => prev ? { ...prev, availability: e.target.value } : null)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                          {availabilityOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getAvailabilityColor(profileData.availability)}`}>
                          {profileData.availability}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">About Me</h3>
                  {isEditing ? (
                    <textarea
                      value={profileData.bio}
                      onChange={(e) => setProfileData(prev => prev ? { ...prev, bio: e.target.value } : null)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Tell us about yourself..."
                    />
                  ) : (
                    <p className="text-gray-700 leading-relaxed">{profileData.bio}</p>
                  )}
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Skills Offered */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Skills I Offer</h3>
                    {isEditing && (
                      <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                        + Add Skill
                      </button>
                    )}
                  </div>
                  
                  {isEditing && (
                    <div className="mb-4 p-4 bg-white rounded-lg border border-gray-200">
                      <div className="flex space-x-2 mb-3">
                        <input
                          type="text"
                          value={newSkill}
                          onChange={(e) => setNewSkill(e.target.value)}
                          placeholder="Enter skill name"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                        <button
                          onClick={handleAddSkill}
                          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                        >
                          Add
                        </button>
                      </div>
                      <div className="flex space-x-2">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            checked={skillType === 'offered'}
                            onChange={() => setSkillType('offered')}
                            className="mr-2"
                          />
                          <span className="text-sm">Offered</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            checked={skillType === 'wanted'}
                            onChange={() => setSkillType('wanted')}
                            className="mr-2"
                          />
                          <span className="text-sm">Wanted</span>
                        </label>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {profileData.skillsOffered.map((skill, index) => (
                      <div key={index} className="flex items-center bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm font-medium">
                        <span>{skill}</span>
                        {isEditing && (
                          <button
                            onClick={() => handleRemoveSkill(skill, 'offered')}
                            className="ml-2 text-primary-600 hover:text-primary-800"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Skills Wanted */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Skills I Want to Learn</h3>
                    {isEditing && (
                      <button className="text-secondary-600 hover:text-secondary-700 text-sm font-medium">
                        + Add Skill
                      </button>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {profileData.skillsWanted.map((skill, index) => (
                      <div key={index} className="flex items-center bg-secondary-100 text-secondary-800 px-3 py-1 rounded-full text-sm font-medium">
                        <span>{skill}</span>
                        {isEditing && (
                          <button
                            onClick={() => handleRemoveSkill(skill, 'wanted')}
                            className="ml-2 text-secondary-600 hover:text-secondary-800"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Stats */}
                <div className="bg-gradient-to-r from-primary-50 to-accent-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">My Stats</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary-600">{profileData.rating}</div>
                      <div className="text-sm text-gray-600">Average Rating</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-accent-600">{profileData.totalSwaps}</div>
                      <div className="text-sm text-gray-600">Total Swaps</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 