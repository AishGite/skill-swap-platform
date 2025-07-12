import React, { useState, useEffect } from 'react';
import { apiService, User } from '../services/api';
import { useNavigate } from 'react-router-dom';

interface HomePageProps {
  isAuthenticated: boolean;
  onLoginClick: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ isAuthenticated, onLoginClick }) => {
  const [availability, setAvailability] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const usersPerPage = 6;
  const navigate = useNavigate();

  // Load users from API
  useEffect(() => {
    loadUsers();
  }, [searchTerm, availability]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const fetchedUsers = await apiService.getUsers(searchTerm, availability);
      setUsers(fetchedUsers);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = searchTerm === '' || 
      user.skillsOffered.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase())) ||
      user.skillsWanted.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesAvailability = availability === 'all' || 
      (user.availability && user.availability.toLowerCase() === availability.toLowerCase());
    
    return matchesSearch && matchesAvailability;
  });

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const handleRequestSwap = (userId: number) => {
    if (!isAuthenticated) {
      alert('Please login to request a swap!');
      onLoginClick();
      return;
    }
    const user = users.find(u => u.id === userId);
    // Redirect to user profile page instead of showing alert
    navigate(`/user/${userId}`);
  };

  const handleUserCardClick = (userId: number) => {
    console.log('User card clicked for ID:', userId);
    if (isAuthenticated) {
      console.log('Navigating to:', `/user/${userId}`);
      navigate(`/user/${userId}`);
    } else {
      alert('Please login to view user profiles!');
      onLoginClick();
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
            </div>
            
            <div className="flex items-center space-x-4">
              {!isAuthenticated ? (
                <>
                  <button
                    onClick={onLoginClick}
                    className="text-gray-600 hover:text-primary-600 transition-colors font-medium"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => window.location.href = '/signup'}
                    className="btn-primary"
                  >
                    Sign Up
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => window.location.href = '/dashboard'}
                    className="btn-primary"
                  >
                    Go to Dashboard
                  </button>
                  <button 
                    onClick={() => navigate('/test')}
                    className="btn-secondary"
                  >
                    Test Route
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Discover Amazing Skills
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Connect with talented people, share your expertise, and learn new skills through skill swapping.
          </p>
          
          {/* Search and Filter */}
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Availability Filter */}
            <div className="flex flex-wrap justify-center gap-3">
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

            {/* Search */}
            <div className="relative max-w-md mx-auto">
              <input
                type="text"
                placeholder="Search for skills like 'Photoshop', 'Excel', 'JavaScript'..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Users Grid */}
      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading users...</p>
            </div>
          )}

          {/* Users Grid */}
          {!loading && (
            <>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {currentUsers.map((user) => (
            <div 
              key={user.id} 
              className="profile-card cursor-pointer hover:shadow-glow transition-all duration-300"
              onClick={() => handleUserCardClick(user.id)}
            >
                    <div className="flex items-start space-x-4">
                      {/* Profile Photo */}
                      <div className="flex-shrink-0">
                        <img
                          src={user.profilePhoto || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"}
                          alt={user.name || 'User'}
                          className="w-16 h-16 rounded-full object-cover border-4 border-primary-100"
                        />
                      </div>

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 truncate">{user.name || 'Anonymous'}</h3>
                          <div className="flex items-center space-x-2">
                            {renderStars(user.rating || 0)}
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-500 mb-2">{user.location || 'Location not specified'}</p>

                        {/* Availability */}
                        {user.availability && (
                          <div className="mb-3">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getAvailabilityColor(user.availability)}`}>
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                              </svg>
                              {user.availability}
                            </span>
                          </div>
                        )}

                        {/* Skills Offered */}
                        {user.skillsOffered && user.skillsOffered.length > 0 && (
                          <div className="mb-3">
                            <h4 className="text-sm font-medium text-primary-700 mb-1">Skills Offered:</h4>
                            <div className="flex flex-wrap gap-1">
                              {user.skillsOffered.slice(0, 3).map((skill, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                                >
                                  {skill}
                                </span>
                              ))}
                              {user.skillsOffered.length > 3 && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                  +{user.skillsOffered.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Skills Wanted */}
                        {user.skillsWanted && user.skillsWanted.length > 0 && (
                          <div className="mb-4">
                            <h4 className="text-sm font-medium text-secondary-700 mb-1">Skills Wanted:</h4>
                            <div className="flex flex-wrap gap-1">
                              {user.skillsWanted.slice(0, 3).map((skill, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-secondary-100 text-secondary-800"
                                >
                                  {skill}
                                </span>
                              ))}
                              {user.skillsWanted.length > 3 && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                  +{user.skillsWanted.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Request Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRequestSwap(user.id);
                          }}
                          className="w-full btn-secondary"
                        >
                          Request Swap
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* No Users Found */}
              {currentUsers.length === 0 && (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                  <p className="text-gray-500">Try adjusting your search or filters</p>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-8">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Previous
                    </button>
                    <span className="px-4 py-2 text-sm text-gray-600">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary-600 to-accent-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Start Swapping Skills?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join our community and discover amazing opportunities to learn and grow.
          </p>
          <button
            onClick={() => window.location.href = '/signup'}
            className="bg-white text-primary-600 px-8 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Get Started
          </button>
        </div>
      </section>
    </div>
  );
};

export default HomePage; 