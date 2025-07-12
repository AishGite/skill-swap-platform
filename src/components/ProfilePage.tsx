import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface ProfileData {
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
  const [profileData, setProfileData] = useState<ProfileData>({
    name: currentUser.name || 'Your Name',
    email: currentUser.email,
    location: 'Mumbai, Maharashtra',
    skillsOffered: ['JavaScript', 'React', 'Node.js'],
    skillsWanted: ['Python', 'Data Analysis', 'Machine Learning'],
    availability: 'Weekends',
    profilePhoto: currentUser.profilePhoto || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    rating: 4.8,
    totalSwaps: 12,
    bio: 'Passionate developer looking to share knowledge and learn new skills. Always excited to collaborate and grow together!',
    dateOfBirth: '1995-03-15'
  });

  const [newSkill, setNewSkill] = useState('');
  const [skillType, setSkillType] = useState<'offered' | 'wanted'>('offered');

  const availabilityOptions = [
    { value: 'Weekends', label: 'Weekends' },
    { value: 'Evenings', label: 'Evenings' },
    { value: 'Weekdays', label: 'Weekdays' },
    { value: 'Flexible', label: 'Flexible' }
  ];

  const handleSave = () => {
    // In a real app, this would save to the backend
    setIsEditing(false);
    // You would typically make an API call here
  };

  const handleAddSkill = () => {
    if (newSkill.trim()) {
      if (skillType === 'offered') {
        setProfileData(prev => ({
          ...prev,
          skillsOffered: [...prev.skillsOffered, newSkill.trim()]
        }));
      } else {
        setProfileData(prev => ({
          ...prev,
          skillsWanted: [...prev.skillsWanted, newSkill.trim()]
        }));
      }
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skill: string, type: 'offered' | 'wanted') => {
    if (type === 'offered') {
      setProfileData(prev => ({
        ...prev,
        skillsOffered: prev.skillsOffered.filter(s => s !== skill)
      }));
    } else {
      setProfileData(prev => ({
        ...prev,
        skillsWanted: prev.skillsWanted.filter(s => s !== skill)
      }));
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
                onClick={() => navigate('/dashboard')}
                className="text-gray-600 hover:text-primary-600 transition-colors font-medium"
              >
                Dashboard
              </button>
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
                    onClick={onLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
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
                          onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
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
                          className="bg-white text-primary-600 px-6 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                        >
                          Save
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
                          onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
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
                          onChange={(e) => setProfileData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
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
                          onChange={(e) => setProfileData(prev => ({ ...prev, availability: e.target.value }))}
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
                      onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
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