const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication
  async signup(userData) {
    return this.request('/user/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async signin(identifier, password) {
    return this.request('/user/signin', {
      method: 'POST',
      body: JSON.stringify({ identifier, password }),
    });
  }

  // Land Management
  async addLand(landData) {
    return this.request('/land/add', {
      method: 'POST',
      body: JSON.stringify(landData),
    });
  }

  async getLand(userId) {
    return this.request(`/land/${userId}`, {
      method: 'GET',
    });
  }

  // Satellite Data
  async getSatelliteData(polygonId) {
    return this.request('/satellite/get', {
      method: 'POST',
      body: JSON.stringify({ polygonId }),
    });
  }

  // Agentic System
  async analyzeAndOrder(userId) {
    return this.request('/agentic/analyze-and-order', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  }

  async getRecommendations(userId) {
    return this.request(`/agentic/recommendations/${userId}`, {
      method: 'GET',
    });
  }

  async executeOrdering(userId, recommendations) {
    return this.request('/agentic/execute-ordering', {
      method: 'POST',
      body: JSON.stringify({ userId, recommendations }),
    });
  }

  async getOrderHistory(userId) {
    return this.request(`/agentic/order-history/${userId}`, {
      method: 'GET',
    });
  }

  // Orders
  async createOrder(orderData) {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async getOrder(orderId) {
    return this.request(`/orders/${orderId}`, {
      method: 'GET',
    });
  }

  async getUserOrders(userId) {
    return this.request(`/orders/user/${userId}`, {
      method: 'GET',
    });
  }

  async updateOrderStatus(orderId, status) {
    return this.request(`/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async addItemToOrder(orderId, itemData) {
    return this.request(`/orders/${orderId}/items`, {
      method: 'POST',
      body: JSON.stringify(itemData),
    });
  }

  async deleteOrder(orderId) {
    return this.request(`/orders/${orderId}`, {
      method: 'DELETE',
    });
  }
}

export default new ApiService();


