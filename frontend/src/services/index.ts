import api from './api';
import type {
    ApiResponse,
    AuthResponse,
    LoginCredentials,
    RegisterData,
    User,
    Group,
    Expense,
    Settlement,
    BalanceSummary,
    SettlementSuggestion,
    CreateGroupData,
    CreateExpenseData,
    CreateSettlementData,
    PaginatedResponse,
} from '../types';

// ============ Auth ============
export const authService = {
    register: async (data: RegisterData): Promise<AuthResponse> => {
        const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', data);
        return response.data.data!;
    },

    login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
        const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
        return response.data.data!;
    },

    getMe: async (): Promise<User> => {
        const response = await api.get<ApiResponse<User>>('/auth/me');
        return response.data.data!;
    },
};

// ============ Users ============
export const userService = {
    getAll: async (): Promise<User[]> => {
        const response = await api.get<ApiResponse<User[]> & { data: User[] }>('/users');
        return response.data.data;
    },

    getById: async (id: string): Promise<User> => {
        const response = await api.get<ApiResponse<User>>(`/users/${id}`);
        return response.data.data!;
    },

    getBalances: async (id: string, groupId?: string): Promise<BalanceSummary & { user: User }> => {
        const params = groupId ? { groupId } : {};
        const response = await api.get<ApiResponse<BalanceSummary & { user: User }>>(`/users/${id}/balances`, { params });
        return response.data.data!;
    },
};

// ============ Groups ============
export const groupService = {
    create: async (data: CreateGroupData): Promise<Group> => {
        const response = await api.post<ApiResponse<Group>>('/groups', data);
        return response.data.data!;
    },

    getAll: async (): Promise<Group[]> => {
        const response = await api.get<ApiResponse<Group[]> & { data: Group[] }>('/groups');
        return response.data.data;
    },

    getById: async (id: string): Promise<Group> => {
        const response = await api.get<ApiResponse<Group>>(`/groups/${id}`);
        return response.data.data!;
    },

    addMember: async (groupId: string, userId: string): Promise<Group> => {
        const response = await api.post<ApiResponse<Group>>(`/groups/${groupId}/members`, { userId });
        return response.data.data!;
    },

    removeMember: async (groupId: string, userId: string): Promise<Group> => {
        const response = await api.delete<ApiResponse<Group>>(`/groups/${groupId}/members/${userId}`);
        return response.data.data!;
    },

    getBalances: async (groupId: string): Promise<{ settlementSuggestions: SettlementSuggestion[] }> => {
        const response = await api.get<ApiResponse<{ settlementSuggestions: SettlementSuggestion[] }>>(`/groups/${groupId}/balances`);
        return response.data.data!;
    },
};

// ============ Expenses ============
export const expenseService = {
    create: async (data: CreateExpenseData): Promise<Expense> => {
        const response = await api.post<ApiResponse<Expense>>('/expenses', data);
        return response.data.data!;
    },

    getAll: async (groupId?: string, page = 1, limit = 20): Promise<PaginatedResponse<Expense>> => {
        const params = { groupId, page, limit };
        const response = await api.get<PaginatedResponse<Expense>>('/expenses', { params });
        return response.data;
    },

    getById: async (id: string): Promise<Expense> => {
        const response = await api.get<ApiResponse<Expense>>(`/expenses/${id}`);
        return response.data.data!;
    },

    update: async (id: string, data: Partial<CreateExpenseData>): Promise<Expense> => {
        const response = await api.put<ApiResponse<Expense>>(`/expenses/${id}`, data);
        return response.data.data!;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/expenses/${id}`);
    },
};

// ============ Settlements ============
export const settlementService = {
    create: async (data: CreateSettlementData): Promise<Settlement> => {
        const response = await api.post<ApiResponse<Settlement>>('/settlements', data);
        return response.data.data!;
    },

    getAll: async (groupId?: string, page = 1, limit = 20): Promise<PaginatedResponse<Settlement>> => {
        const params = { groupId, page, limit };
        const response = await api.get<PaginatedResponse<Settlement>>('/settlements', { params });
        return response.data;
    },

    getSuggestions: async (groupId: string): Promise<{ optimizedSettlements: SettlementSuggestion[] }> => {
        const response = await api.get<ApiResponse<{ optimizedSettlements: SettlementSuggestion[] }>>('/settlements/suggestions', {
            params: { groupId },
        });
        return response.data.data!;
    },
};
