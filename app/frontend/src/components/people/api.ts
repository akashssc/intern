import { API_URL } from '../../config';

export interface User {
  id: number;
  username: string;
  title?: string;
  avatar?: string;
  location?: string;
  bio?: string;
  connections?: number;
  mutualConnections?: number;
  experience?: string;
  skills?: string;
}

export interface ConnectionRequest {
  id: number;
  from_user_id: number;
  to_user_id: number;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
}

export const usersApi = {
  // Get all users except the current user
  async getAllUsers(): Promise<{ users: User[]; error?: string }> {
    try {
      const response = await fetch(`${API_URL}/api/users`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        return { users: data.users || [] };
      } else {
        return { users: [], error: data.message || 'Failed to fetch users' };
      }
    } catch (error: any) {
      console.error('Error fetching users:', error);
      return { users: [], error: 'Failed to fetch users' };
    }
  },

  // Get user by ID
  async getUserById(userId: number): Promise<{ user: User | null; error?: string }> {
    try {
      const response = await fetch(`${API_URL}/api/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        return { user: data.user };
      } else {
        return { user: null, error: data.message || 'Failed to fetch user' };
      }
    } catch (error: any) {
      console.error('Error fetching user:', error);
      return { user: null, error: 'Failed to fetch user' };
    }
  },

  // Send connection request
  async sendConnectionRequest(toUserId: number): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await fetch(`${API_URL}/api/connections/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ to_user_id: toUserId }),
      });
      const data = await response.json();
      if (response.ok) {
        return { success: true, message: 'Connection request sent successfully' };
      } else {
        return { success: false, message: data.message || 'Failed to send connection request' };
      }
    } catch (error: any) {
      console.error('Error sending connection request:', error);
      return { success: false, message: 'Failed to send connection request' };
    }
  },

  // Accept connection request
  async acceptConnectionRequest(requestId: number): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await fetch(`${API_URL}/api/connections/${requestId}/accept`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        return { success: true, message: 'Connection accepted successfully' };
      } else {
        return { success: false, message: data.message || 'Failed to accept connection' };
      }
    } catch (error: any) {
      console.error('Error accepting connection:', error);
      return { success: false, message: 'Failed to accept connection' };
    }
  },

  // Reject connection request
  async rejectConnectionRequest(requestId: number): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await fetch(`${API_URL}/api/connections/${requestId}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        return { success: true, message: 'Connection rejected' };
      } else {
        return { success: false, message: data.message || 'Failed to reject connection' };
      }
    } catch (error: any) {
      console.error('Error rejecting connection:', error);
      return { success: false, message: 'Failed to reject connection' };
    }
  },

  // Get connection requests for current user
  async getConnectionRequests(): Promise<{ requests: ConnectionRequest[]; error?: string }> {
    try {
      const response = await fetch(`${API_URL}/api/connections/requests`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        return { requests: data.requests || [] };
      } else {
        return { requests: [], error: data.message || 'Failed to fetch connection requests' };
      }
    } catch (error: any) {
      console.error('Error fetching connection requests:', error);
      return { requests: [], error: 'Failed to fetch connection requests' };
    }
  },

  // Get user's connections
  async getUserConnections(userId: number): Promise<{ connections: User[]; error?: string }> {
    try {
      const response = await fetch(`${API_URL}/api/users/${userId}/connections`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        return { connections: data.connections || [] };
      } else {
        return { connections: [], error: data.message || 'Failed to fetch connections' };
      }
    } catch (error: any) {
      console.error('Error fetching user connections:', error);
      return { connections: [], error: 'Failed to fetch connections' };
    }
  },

  // Check connection status with a user
  async getConnectionStatus(userId: number): Promise<{ status: 'none' | 'pending' | 'connected' | 'sent'; error?: string }> {
    try {
      const response = await fetch(`${API_URL}/api/connections/status/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        return { status: data.status };
      } else {
        return { status: 'none', error: data.message || 'Failed to check connection status' };
      }
    } catch (error: any) {
      console.error('Error checking connection status:', error);
      return { status: 'none', error: 'Failed to check connection status' };
    }
  }
}; 