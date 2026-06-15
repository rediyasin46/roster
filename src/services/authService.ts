// API Service for Authentication
// Handles all authentication requests to the backend

class AuthService {
  constructor(
    apiUrl = import.meta.env.DEV
      ? ''
      : (import.meta.env.VITE_API_URL || '')
  ) {
    this.apiUrl = apiUrl;
    this.accessToken = localStorage.getItem('accessToken') || null;
    this.refreshToken = localStorage.getItem('refreshToken') || null;
  }

  // ============================================
  // PRIVATE METHODS
  // ============================================

  private async request(endpoint, options = {}) {
    const url = `${this.apiUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.accessToken && !options.skipAuth) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      // Handle token expiration
      if (response.status === 401 && this.refreshToken && !options.skipAuth) {
        const refreshed = await this.refreshAccessToken();
        if (refreshed) {
          // Retry the request with new token
          return this.request(endpoint, { ...options, skipAuth: false });
        }
      }

      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  private setTokens(accessToken, refreshToken) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;

    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  private clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;

    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }

  // ============================================
  // PUBLIC METHODS
  // ============================================

  async register(data) {
    const response = await this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
      skipAuth: true,
    });

    if (response.accessToken && response.refreshToken) {
      this.setTokens(response.accessToken, response.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.user));
    }

    return response;
  }

  async login(username, password) {
    const response = await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
      skipAuth: true,
    });

    if (response.accessToken && response.refreshToken) {
      this.setTokens(response.accessToken, response.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.user));
    }

    return response;
  }

  async logout() {
    try {
      await this.request('/api/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });
    } catch (error) {
      console.warn('Logout API error:', error);
    } finally {
      this.clearTokens();
    }
  }

  async refreshAccessToken() {
    try {
      const response = await this.request('/api/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken: this.refreshToken }),
        skipAuth: true,
      });

      if (response.accessToken && response.refreshToken) {
        this.setTokens(response.accessToken, response.refreshToken);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.clearTokens();
      return false;
    }
  }

  async getProfile() {
    return this.request('/api/profile/profile', {
      method: 'GET',
    });
  }

  async updateProfile(profileData) {
    return this.request('/api/profile/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async changePassword(currentPassword, newPassword) {
    return this.request('/api/profile/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  isAuthenticated() {
    return !!this.accessToken;
  }

  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  getAccessToken() {
    return this.accessToken;
  }

  getRefreshToken() {
    return this.refreshToken;
  }

  clearCache() {
    this.clearTokens();
  }
}

export const authService = new AuthService();
