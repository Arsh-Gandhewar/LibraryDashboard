const BASE_URL = import.meta.env.VITE_API_URL || '';

export const api = {
  fetchJSON: async (url, options = {}) => {
    const res = await fetch(`${BASE_URL}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(error.message || 'API Error');
    }
    return res.json();
  },

  getStudents: () => api.fetchJSON('/api/students'),
  getStudent: (id) => api.fetchJSON(`/api/students/${id}`),
  createStudent: (data) => api.fetchJSON('/api/students', { method: 'POST', body: JSON.stringify(data) }),
  updateStudent: (id, data) => api.fetchJSON(`/api/students/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteStudent: (id) => api.fetchJSON(`/api/students/${id}`, { method: 'DELETE' }),
  renewStudent: (id, data) => api.fetchJSON(`/api/students/${id}/renew`, { method: 'POST', body: JSON.stringify(data) }),
  
  getSeats: () => api.fetchJSON('/api/seats'),
  getDashboard: () => api.fetchJSON('/api/dashboard'),
  getRevenue: () => api.fetchJSON('/api/revenue'),
  getDueToday: () => api.fetchJSON('/api/due'),
};
