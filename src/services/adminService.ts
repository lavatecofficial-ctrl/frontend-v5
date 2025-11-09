interface User {
  id: string;
  fullName: string;
  email: string;
  role: 'user' | 'admin' | 'superadmin';
  planStartDate?: string | null;
  planEndDate?: string | null;
  isEmailVerified: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface UsersResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  message: string;
}

interface UserStats {
  totalUsers: number;
  usersByRole: {
    admin: number;
    superadmin: number;
    user: number;
  };
  usersByPlan?: {
    [key: string]: number;
  };
  usersByStatus: {
    active: number;
    expired: number;
    free: number;
  };
  verification: {
    verified: number;
    unverified: number;
  };
  recentUsers: number;
  message: string;
}

interface UpdateUserPlanRequest {
  userId: string;
  planStartDate?: string;
  planEndDate?: string;
}

interface UpdateUserRoleRequest {
  email: string;
  role: 'user' | 'admin' | 'superadmin';
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://grupoaviatorcolombia.app';

class AdminService {
  private getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }

  async getUsers(page: number = 1, limit: number = 10, search?: string): Promise<UsersResponse> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (search) {
        params.append('search', search);
      }

      const response = await fetch(`${API_BASE_URL}/api/admin/users?${params}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al obtener usuarios');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en getUsers:', error);
      throw error;
    }
  }

  async getUserStats(): Promise<UserStats> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/stats`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al obtener estadísticas');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en getUserStats:', error);
      throw error;
    }
  }

  async updateUserRole(request: UpdateUserRoleRequest): Promise<{ user: User; message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/users/role`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al actualizar rol');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en updateUserRole:', error);
      throw error;
    }
  }

  async updateUserPlan(request: UpdateUserPlanRequest): Promise<{ user: User; message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/users/plan`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al actualizar plan');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en updateUserPlan:', error);
      throw error;
    }
  }

  async deleteUser(userId: string): Promise<{ message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al eliminar usuario');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en deleteUser:', error);
      throw error;
    }
  }

  async startServices(): Promise<{ message: string; timestamp: string; results: any }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/services/start-all`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al iniciar servicios');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en startServices:', error);
      throw error;
    }
  }
}

export const adminService = new AdminService();
export type { User, UsersResponse, UserStats, UpdateUserPlanRequest, UpdateUserRoleRequest };
