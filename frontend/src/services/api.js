import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (email, password, role) =>
    api.post('/auth/register', { email, password, role }),
};

export const patientService = {
  getAll: () => api.get('/patients'),
  getOne: (id) => api.get(`/patients/${id}`),
  create: (data) => api.post('/patients', { patient: data }),
  update: (id, data) => api.put(`/patients/${id}`, { patient: data }),
  delete: (id) => api.delete(`/patients/${id}`),
};

export const claimService = {
  getAll: () => api.get('/claims'),
  getOne: (id) => api.get(`/claims/${id}`),
  create: (data) => api.post('/claims', { claim: data }),
  update: (id, data) => api.put(`/claims/${id}`, { claim: data }),
  delete: (id) => api.delete(`/claims/${id}`),
};

export const claimImportService = {
  getAll: () => api.get('/claim_imports'),
  create: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/claim_imports', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getOne: (id) => api.get(`/claim_imports/${id}`),
};

export const exportService = {
  exportClaims: () => api.post('/exports', {}, { responseType: 'blob' }),
};

export default api;
