import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User, AuthState } from '@/types';
import { tokenManager } from '@/lib/tokenManager';

const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token: string; refreshToken?: string }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      if (action.payload.refreshToken) {
        state.refreshToken = action.payload.refreshToken;
      }
      state.isAuthenticated = true;

      const status = (action.payload.user as any)?.approval_status || (action.payload.user as any)?.approvalStatus || '';
      tokenManager.setAccessToken(action.payload.token, action.payload.user.role, status);
      if (action.payload.refreshToken) {
        tokenManager.setRefreshToken(action.payload.refreshToken);
      }

      if (typeof window !== 'undefined' && action.payload.user) {
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      tokenManager.clearTokens();
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        const status = (state.user as any)?.approval_status || (state.user as any)?.approvalStatus || '';
        tokenManager.setAccessToken(state.token, state.user.role, status);
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(state.user));
        }
      }
    },
  },
});

export const { setCredentials, logout, updateUser } = authSlice.actions;
export default authSlice.reducer;
