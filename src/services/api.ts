const API_BASE_URL = 'http://localhost:5000/api';
const BACKEND_BASE_URL = 'http://localhost:5000';

// Types
export interface User {
  id: number;
  email: string;
  name?: string;
  profilePhoto?: string;
  location?: string;
  availability?: string;
  rating?: number;
  totalSwaps?: number;
  skillsOffered: string[];
  skillsWanted: string[];
  dateOfBirth?: string;
  bio?: string;
}

export interface SwapRequest {
  id: number;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  message: string;
  createdAt: string;
  requesterName: string;
  requesterPhoto: string;
  recipientName: string;
  recipientPhoto: string;
}

export interface Notification {
  id: number;
  type: 'swap_request' | 'swap_accepted' | 'new_message';
  message: string;
  time: string;
  read: boolean;
}

// API Service Class
class ApiService {
  private token: string | null = null;

  // Utility function to construct full URL for profile photos
  private getFullPhotoUrl(photoPath: string | null | undefined): string {
    if (!photoPath) {
      return "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face";
    }
    
    // If it's already a full URL (starts with http), return as is
    if (photoPath.startsWith('http')) {
      return photoPath;
    }
    
    // If it's a relative path, construct the full URL
    if (photoPath.startsWith('/')) {
      return `${BACKEND_BASE_URL}${photoPath}`;
    }
    
    // If it's just a filename, construct the full URL
    return `${BACKEND_BASE_URL}/uploads/${photoPath}`;
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('token');
    }
    return this.token;
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.getToken()) {
      headers.Authorization = `Bearer ${this.getToken()}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const response = await this.request<{ message: string; token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    this.setToken(response.token);
    return {
      ...response,
      user: {
        ...response.user,
        profilePhoto: this.getFullPhotoUrl(response.user.profilePhoto)
      }
    };
  }

  async register(userData: {
    email: string;
    password: string;
    dateOfBirth: string;
    profilePhoto?: File;
  }): Promise<{ token: string; user: User }> {
    const formData = new FormData();
    formData.append('email', userData.email);
    formData.append('password', userData.password);
    formData.append('dateOfBirth', userData.dateOfBirth);
    
    if (userData.profilePhoto) {
      formData.append('profilePhoto', userData.profilePhoto);
    }

    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    this.setToken(data.token);
    return {
      ...data,
      user: {
        ...data.user,
        profilePhoto: this.getFullPhotoUrl(data.user.profilePhoto)
      }
    };
  }

  // Users
  async getUsers(search?: string, availability?: string): Promise<User[]> {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (availability && availability !== 'all') params.append('availability', availability);
    
    const queryString = params.toString();
    const endpoint = queryString ? `/users?${queryString}` : '/users';
    
    const users = await this.request<User[]>(endpoint);
    return users.map(user => ({
      ...user,
      profilePhoto: this.getFullPhotoUrl(user.profilePhoto)
    }));
  }

  async getUserProfile(userId: number): Promise<User> {
    const user = await this.request<User>(`/users/${userId}`);
    return {
      ...user,
      profilePhoto: this.getFullPhotoUrl(user.profilePhoto)
    };
  }

  async getCurrentUserProfile(): Promise<User> {
    const user = await this.request<User>('/users/me');
    return {
      ...user,
      profilePhoto: this.getFullPhotoUrl(user.profilePhoto)
    };
  }

  async updateUserProfile(
    userId: number,
    profileData: {
      name?: string;
      location?: string;
      availability?: string;
      skillsOffered?: string[];
      skillsWanted?: string[];
      profilePhoto?: File;
    }
  ): Promise<{ message: string }> {
    const formData = new FormData();
    
    if (profileData.name) formData.append('name', profileData.name);
    if (profileData.location) formData.append('location', profileData.location);
    if (profileData.availability) formData.append('availability', profileData.availability);
    if (profileData.skillsOffered) formData.append('skillsOffered', JSON.stringify(profileData.skillsOffered));
    if (profileData.skillsWanted) formData.append('skillsWanted', JSON.stringify(profileData.skillsWanted));
    if (profileData.profilePhoto) formData.append('profilePhoto', profileData.profilePhoto);

    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${this.getToken()}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Swap Requests
  async requestSwap(recipientId: number, message: string): Promise<{ message: string }> {
    return this.request<{ message: string }>('/swaps/request', {
      method: 'POST',
      body: JSON.stringify({ recipientId, message }),
    });
  }

  async getSwapRequests(type: 'all' | 'sent' | 'received' = 'all'): Promise<SwapRequest[]> {
    const requests = await this.request<SwapRequest[]>(`/swaps?type=${type}`);
    return requests.map(request => ({
      ...request,
      requesterPhoto: this.getFullPhotoUrl(request.requesterPhoto),
      recipientPhoto: this.getFullPhotoUrl(request.recipientPhoto)
    }));
  }

  async respondToSwapRequest(requestId: number, status: 'accepted' | 'rejected'): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/swaps/${requestId}/respond`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  // Notifications
  async getNotifications(limit: number = 50): Promise<any[]> {
    return this.request<any[]>(`/notifications?limit=${limit}`);
  }

  async markNotificationAsRead(notificationId: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/notifications/${notificationId}/read`, {
      method: 'PUT',
    });
  }

  async markAllNotificationsAsRead(): Promise<{ message: string }> {
    return this.request<{ message: string }>('/notifications/read-all', {
      method: 'PUT',
    });
  }

  // Health check
  async healthCheck(): Promise<{ status: string; message: string }> {
    return this.request<{ status: string; message: string }>('/health');
  }
}

export const apiService = new ApiService();
export default apiService; 