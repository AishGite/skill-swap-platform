import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService, SwapRequest } from '../services/api';

interface NotificationsPageProps {
  currentUser: {
    id: number;
    email: string;
    name?: string;
    profilePhoto?: string;
  };
  onLogout: () => void;
}

const NotificationsPage: React.FC<NotificationsPageProps> = ({ currentUser, onLogout }) => {
  const navigate = useNavigate();
  const [receivedRequests, setReceivedRequests] = useState<SwapRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<SwapRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [receivedPage, setReceivedPage] = useState(1);
  const [sentPage, setSentPage] = useState(1);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const requestsPerPage = 2;

  useEffect(() => {
    loadData();
    loadNotifications();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [received, sent] = await Promise.all([
        apiService.getSwapRequests('received'),
        apiService.getSwapRequests('sent')
      ]);
      setReceivedRequests(received);
      setSentRequests(sent);
    } catch (error) {
      console.error('Failed to load swap requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadNotifications = async () => {
    try {
      const notifs = await apiService.getNotifications(10);
      setNotifications(notifs);
      setUnreadCount(notifs.filter((n: any) => !n.is_read).length);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  const handleAcceptRequest = async (requestId: number) => {
    try {
      await apiService.respondToSwapRequest(requestId, 'accepted');
      await loadData(); // Reload data to update status
    } catch (error) {
      console.error('Failed to accept request:', error);
    }
  };

  const handleRejectRequest = async (requestId: number) => {
    try {
      await apiService.respondToSwapRequest(requestId, 'rejected');
      await loadData(); // Reload data to update status
    } catch (error) {
      console.error('Failed to reject request:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'accepted':
        return 'Accepted';
      case 'rejected':
        return 'Rejected';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Pagination helpers
  const getPaginatedRequests = (requests: SwapRequest[], page: number) => {
    const startIndex = (page - 1) * requestsPerPage;
    return requests.slice(startIndex, startIndex + requestsPerPage);
  };

  const totalReceivedPages = Math.ceil(receivedRequests.length / requestsPerPage);
  const totalSentPages = Math.ceil(sentRequests.length / requestsPerPage);

  const paginatedReceived = getPaginatedRequests(receivedRequests, receivedPage);
  const paginatedSent = getPaginatedRequests(sentRequests, sentPage);

  // Click outside handlers
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.user-menu') && !target.closest('.notifications-menu')) {
        setShowUserMenu(false);
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50">
      {/* Header */}
      <header className="bg-white shadow-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Navigation */}
            <div className="flex items-center space-x-8">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-2xl font-bold text-primary-600 hover:text-primary-700 transition-colors"
              >
                SkillSwap
              </button>
              <nav className="hidden md:flex space-x-8">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="text-gray-600 hover:text-primary-600 transition-colors"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => navigate('/profile')}
                  className="text-gray-600 hover:text-primary-600 transition-colors"
                >
                  Profile
                </button>
                <button
                  onClick={() => navigate('/notifications')}
                  className="text-primary-600 font-medium"
                >
                  Notifications
                </button>
              </nav>
            </div>

            {/* Notifications and User Menu */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <div className="relative notifications-menu">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 max-h-96 overflow-y-auto">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                    </div>
                    {notifications.length === 0 ? (
                      <div className="px-4 py-3 text-sm text-gray-500">No notifications</div>
                    ) : (
                      notifications.map((notification) => (
                        <div key={notification.id} className="px-4 py-3 hover:bg-gray-50">
                          <p className="text-sm text-gray-900">{notification.message}</p>
                          <p className="text-xs text-gray-500 mt-1">{formatDate(notification.created_at)}</p>
                        </div>
                      ))
                    )}
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
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Notifications & Swap Requests</h1>
          <p className="text-gray-600">Manage your incoming and outgoing swap requests</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Received Requests */}
          <div className="card">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Received Requests</h2>
              <p className="text-sm text-gray-600">Requests from other users to swap skills with you</p>
            </div>
            
            <div className="p-6">
              {paginatedReceived.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 0016.586 13H18z" />
                  </svg>
                  <p className="text-gray-500">No received requests</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {paginatedReceived.map((request) => (
                    <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start space-x-4">
                        <img
                          src={request.requesterPhoto}
                          alt={request.requesterName}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-gray-900">{request.requesterName}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                              {getStatusText(request.status)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{request.message}</p>
                          <p className="text-xs text-gray-500 mb-3">{formatDate(request.createdAt)}</p>
                          
                          {request.status === 'pending' && (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleAcceptRequest(request.id)}
                                className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() => handleRejectRequest(request.id)}
                                className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination for Received */}
              {totalReceivedPages > 1 && (
                <div className="flex justify-center mt-6">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setReceivedPage(Math.max(1, receivedPage - 1))}
                      disabled={receivedPage === 1}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Previous
                    </button>
                    <span className="px-3 py-1 text-sm text-gray-600">
                      Page {receivedPage} of {totalReceivedPages}
                    </span>
                    <button
                      onClick={() => setReceivedPage(Math.min(totalReceivedPages, receivedPage + 1))}
                      disabled={receivedPage === totalReceivedPages}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sent Requests */}
          <div className="card">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Sent Requests</h2>
              <p className="text-sm text-gray-600">Requests you've sent to other users</p>
            </div>
            
            <div className="p-6">
              {paginatedSent.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  <p className="text-gray-500">No sent requests</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {paginatedSent.map((request) => (
                    <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start space-x-4">
                        <img
                          src={request.recipientPhoto}
                          alt={request.recipientName}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-gray-900">{request.recipientName}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                              {getStatusText(request.status)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{request.message}</p>
                          <p className="text-xs text-gray-500">{formatDate(request.createdAt)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination for Sent */}
              {totalSentPages > 1 && (
                <div className="flex justify-center mt-6">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setSentPage(Math.max(1, sentPage - 1))}
                      disabled={sentPage === 1}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Previous
                    </button>
                    <span className="px-3 py-1 text-sm text-gray-600">
                      Page {sentPage} of {totalSentPages}
                    </span>
                    <button
                      onClick={() => setSentPage(Math.min(totalSentPages, sentPage + 1))}
                      disabled={sentPage === totalSentPages}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NotificationsPage; 