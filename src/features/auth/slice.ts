import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User, AuthState } from '@/types';

function syncAuthCookies(token: string | null, user: User | null) {
  if (typeof document === 'undefined') return;
  if (token && user) {
    const maxAge = 60 * 60 * 24 * 7; // 7 days
    document.cookie = `auth_token=${encodeURIComponent(token)}; path=/; max-age=${maxAge}; SameSite=Lax`;
    document.cookie = `user_role=${encodeURIComponent(user.role || 'student')}; path=/; max-age=${maxAge}; SameSite=Lax`;
    const status = (user as any)?.approval_status || (user as any)?.approvalStatus || '';
    document.cookie = `user_status=${encodeURIComponent(status)}; path=/; max-age=${maxAge}; SameSite=Lax`;
  } else {
    document.cookie = 'auth_token=; path=/; max-age=0; SameSite=Lax';
    document.cookie = 'user_role=; path=/; max-age=0; SameSite=Lax';
    document.cookie = 'user_status=; path=/; max-age=0; SameSite=Lax';
  }
}

const getInitialState = (): AuthState => {
  if (typeof window === 'undefined') {
    return {
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
    };
  }

  let token = localStorage.getItem('token');
  let refreshToken = localStorage.getItem('refreshToken');
  let user: User | null = null;

  // Clear legacy mock session tokens if present
  if (token && (token.includes('session') || token.includes('local') || token.includes('registered'))) {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    token = null;
    refreshToken = null;
    syncAuthCookies(null, null);
  } else {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        user = JSON.parse(storedUser);
      }
    } catch (e) {
      user = null;
    }
  }

  if (token && user) {
    syncAuthCookies(token, user);
  } else {
    syncAuthCookies(null, null);
  }

  return {
    user,
    token,
    refreshToken,
    isAuthenticated: Boolean(token && user),
    isLoading: false,
  };
};

const initialState: AuthState = getInitialState();

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
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', action.payload.token);
        if (action.payload.refreshToken) {
          localStorage.setItem('refreshToken', action.payload.refreshToken);
        }
        if (action.payload.user) {
          localStorage.setItem('user', JSON.stringify(action.payload.user));
        }
        syncAuthCookies(action.payload.token, action.payload.user);
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        syncAuthCookies(null, null);
      }
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(state.user));
          syncAuthCookies(state.token, state.user);
        }
      }
    },
  },
});

export const { setCredentials, logout, updateUser } = authSlice.actions;
export default authSlice.reducer;

