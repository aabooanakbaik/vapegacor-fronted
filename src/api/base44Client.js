const API_URL = 'https://vapegacor-backend.vercel.app/api';

const getHeaders = () => {
  const token = localStorage.getItem('vg_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

const handleResponse = async (res) => {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Terjadi kesalahan');
  return data;
};

export const base44 = {
  auth: {
    login: async (email, password) => {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await handleResponse(res);
      localStorage.setItem('vg_token', data.token);
      return data.user;
    },
    register: async (email, password, full_name) => {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, full_name })
      });
      const data = await handleResponse(res);
      localStorage.setItem('vg_token', data.token);
      return data.user;
    },
    me: async () => {
      const token = localStorage.getItem('vg_token');
      if (!token) return null;
      try {
        const res = await fetch(`${API_URL}/auth/me`, { headers: getHeaders() });
        const data = await handleResponse(res);
        return data.user;
      } catch {
        localStorage.removeItem('vg_token');
        return null;
      }
    },
    logout: () => {
      localStorage.removeItem('vg_token');
    }
  },
  entities: {
    Product: {
      filter: async (params = {}, sort = '-created_date', limit = null) => {
        const query = new URLSearchParams(params);
        if (limit) query.append('limit', limit);
        const res = await fetch(`${API_URL}/products?${query.toString()}`);
        return handleResponse(res);
      },
      get: async (id) => {
        const res = await fetch(`${API_URL}/products/${id}`);
        return handleResponse(res);
      },
      create: async (data) => {
        const res = await fetch(`${API_URL}/products`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify(data),
        });
        return handleResponse(res);
      },
      update: async (id, data) => {
        const res = await fetch(`${API_URL}/products/${id}`, {
          method: 'PUT',
          headers: getHeaders(),
          body: JSON.stringify(data),
        });
        return handleResponse(res);
      },
      delete: async (id) => {
        const res = await fetch(`${API_URL}/products/${id}`, {
          method: 'DELETE',
          headers: getHeaders(),
        });
        return handleResponse(res);
      }
    },
    ProductVariant: {
      filter: async (params = {}) => {
        const query = new URLSearchParams(params);
        const res = await fetch(`${API_URL}/variants?${query.toString()}`);
        return handleResponse(res);
      },
      create: async (data) => {
        const res = await fetch(`${API_URL}/variants`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify(data),
        });
        return handleResponse(res);
      },
      update: async (id, data) => {
        const res = await fetch(`${API_URL}/variants/${id}`, {
          method: 'PUT',
          headers: getHeaders(),
          body: JSON.stringify(data),
        });
        return handleResponse(res);
      },
      delete: async (id) => {
        const res = await fetch(`${API_URL}/variants/${id}`, {
          method: 'DELETE',
          headers: getHeaders(),
        });
        return handleResponse(res);
      }
    },
    CartItem: {
      filter: async () => {
        const res = await fetch(`${API_URL}/cart`, { headers: getHeaders() });
        return handleResponse(res);
      },
      create: async (data) => {
        const res = await fetch(`${API_URL}/cart`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify(data)
        });
        return handleResponse(res);
      },
      update: async (id, data) => {
        const res = await fetch(`${API_URL}/cart/${id}`, {
          method: 'PUT',
          headers: getHeaders(),
          body: JSON.stringify(data)
        });
        return handleResponse(res);
      },
      delete: async (id) => {
        const res = await fetch(`${API_URL}/cart/${id}`, {
          method: 'DELETE',
          headers: getHeaders()
        });
        return handleResponse(res);
      }
    },
    Order: {
      filter: async () => {
        const res = await fetch(`${API_URL}/orders`, { headers: getHeaders() });
        return handleResponse(res);
      },
      list: async (sort = '-created_date', limit = null) => {
        const res = await fetch(`${API_URL}/admin/orders`, { headers: getHeaders() });
        return handleResponse(res);
      },
      create: async (data) => {
        const res = await fetch(`${API_URL}/orders`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify(data)
        });
        return handleResponse(res);
      },
      update: async (id, data) => {
        const res = await fetch(`${API_URL}/orders/${id}`, {
          method: 'PUT',
          headers: getHeaders(),
          body: JSON.stringify(data)
        });
        return handleResponse(res);
      }
    }
  },
  integrations: {
    Core: {
      UploadFile: async ({ file }) => {
        const formData = new FormData();
        formData.append('image', file);
        const res = await fetch(`${API_URL}/upload`, {
          method: 'POST',
          body: formData,
        });
        return handleResponse(res);
      }
    }
  }
};
