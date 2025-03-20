import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1',
  // headers: {
  //   'Content-Type': 'application/json',
  // },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// // Response interceptor to handle errors
// api.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;
    
//     // Only handle 401 errors that aren't from the auth endpoints
//     if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/auth/')) {
//       originalRequest._retry = true;
//       try {
//         // Attempt to refresh the token
//         const { data } = await api.post('/auth/refresh');
//         localStorage.setItem('token', data.token);
//         originalRequest.headers.Authorization = `Bearer ${data.token}`;
//         return api(originalRequest);
//       } catch (refreshError) {
//         // Only logout if refresh fails
//         localStorage.removeItem('token');
//         localStorage.removeItem('userId');
//         localStorage.removeItem('role');
//         window.location.href = '/login';
//         return Promise.reject(refreshError);
//       }
//     }
//     return Promise.reject(error);
//   }
// );

// Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  fullName: string;
  email: string;
  password: string;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: 'RESEARCHER' | 'ADMIN';
  verified: boolean;
}

export interface CallForProposal {
  id: string;
  title: string;
  description: string;
  deadline: string;
  createdAt: string;
  updatedAt: string;
  status: 'DRAFT' | 'PUBLISHED' | 'CLOSED';
  requirements: string[];
  budget: {
    min: number;
    max: number;
    currency: string;
  };
}

export interface Proposal {
  id: string;
  researcherId: string;
  callId: string;
  title: string;
  abstract: string;
  documentUrl: string;
  status: 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'ACCEPTED' | 'REJECTED' | 'REVISIONS_REQUESTED';
  rejectionReason: string | null;
  createdAt: string;
  researcher: {
    id: string;
    fullName: string;
  };
  call: {
    id: string;
    title: string;
  };
  revisions: ProposalRevision[];
}

export interface ProposalRevision {
  id: string;
  proposalId: string;
  changes: string;
  documentUrl: [];
  createdAt: string;
}

export interface AdminStats {
  proposalsCount: number
  usersCount: number
  callsCount: number
  proposalStatusStats: Record<Proposal['status'], number>;
}

// Auth API
export const authApi = {
  login: async (credentials: LoginCredentials) => {
    const { data } = await api.post<{ token: string; user: User }>('/auth/login', credentials);
    api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    localStorage.setItem('token', data.token);
    localStorage.setItem('userId', data.user.id);
    localStorage.setItem('role', data.user.role);
    return data;
  },

  register: async (registerData: RegisterData) => {
    const { data } = await api.post<{ message: string }>('/auth/register', registerData);
    return data;
  },

  logout: async () => {
    await api.post('/auth/logout');
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('role');
  },

  forgotPassword: async (email: string) => {
    const { data } = await api.post<{ message: string }>('/auth/forgot-password', { email });
    return data;
  },

  resetPassword: async (token: string, password: string) => {
    const { data } = await api.post<{ message: string }>('/auth/reset-password', {
      token,
      password,
    });
    return data;
  },
};

export const userApi = {
  getCurrentUser: async () => {
    const { data } = await api.get<User>('/users/me');
    return data;
  },

  updateProfile: async (profileData: Partial<User>) => {
    const { data } = await api.put<User>('/users/me', profileData);
    return data;
  },

  getNotifications: async () => {
    const { data } = await api.get('/users/me/notifications');
    return data;
  },

  markNotificationAsRead: async (notificationId: string) => {
    const { data } = await api.put(`/users/me/notifications/${notificationId}`);
    return data;
  },
};

// Proposals API
export const proposalsApi = {
  // Researcher endpoints
  createProposal: async (formData: FormData) => {
    const { data } = await api.post<Proposal>('/proposals', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Accept': 'application/json',
      },
      transformRequest: (data) => data, // Prevent axios from transforming the data
    });
    return data;
  },

  getProposals: async () => {
    const { data } = await api.get<Proposal[]>('/proposals');
    return data;
  },

  getProposal: async (id: string) => {
    const { data } = await api.get<Proposal>(`/proposals/${id}`);
    return data;
  },

  updateProposal: async (id: string, proposal: Partial<Proposal>) => {
    const { data } = await api.put<Proposal>(`/proposals/${id}`, proposal);
    return data;
  },

  deleteProposal: async (id: string) => {
    await api.delete(`/proposals/${id}`);
  },

  // Proposal revisions
  createRevision: async (proposalId: string, revision: Partial<ProposalRevision>) => {
    const { data } = await api.post<ProposalRevision>(`/proposals/${proposalId}/revisions`, revision);
    return data;
  },

  getRevisions: async (proposalId: string) => {
    const { data } = await api.get<ProposalRevision[]>(`/proposals/${proposalId}/revisions`);
    return data;
  },
};

// Calls for Proposals API (Admin only)
export const callsApi = {
  createCall: async (call: Partial<CallForProposal>) => {
    const { data } = await api.post<CallForProposal>('/calls', call);
    return data;
  },

  getCalls: async () => {
    const { data } = await api.get<CallForProposal[]>('/calls');
    return data;
  },

  getCall: async (id: string) => {
    const { data } = await api.get<CallForProposal>(`/calls/${id}`);
    return data;
  },

  updateCall: async (id: string, call: Partial<CallForProposal>) => {
    const { data } = await api.put<CallForProposal>(`/calls/${id}`, call);
    return data;
  },

  deleteCall: async (id: string) => {
    await api.delete(`/calls/${id}`);
  },
};

// Admin API
export const adminApi = {
  getStats: async () => {
    const { data } = await api.get<AdminStats>('/admin/stats');
    return data;
  },

  getAllProposals: async (filters?: Record<string, any>) => {
    const { data } = await api.get<Proposal[]>('/admin/proposals', { params: filters });
    return data;
  },

  getAllUsers: async () => {
    const { data } = await api.get<User[]>('/admin/users');
    return data;
  },

  updateUserRole: async (userId: string, role: User['role']) => {
    const { data } = await api.put<User>(`/admin/users/${userId}/role`, { role });
    return data;
  },
};

export default api;
