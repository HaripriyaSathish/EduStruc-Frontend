const API_BASE = import.meta.env.VITE_API_URL;

export interface User {
  id: number;
  email: string;
  full_name: string;
  institution_name: string;
  role: 'admin' | 'teacher' | 'parent';
  phone: string;
  created_at: string;
}

// ── Storage abstraction ───────────────────────────────────
// If "Keep me signed in" was checked at login, the session lives in
// localStorage (survives closing the browser/tab). If unchecked, the
// session lives in sessionStorage (cleared the moment the tab/browser closes).
// A small flag in localStorage remembers which storage is currently active
// so every other helper (getSession, apiFetch, etc.) reads/writes the right place.
const REMEMBER_KEY = 'edustruc_remember';

const getActiveStorage = (): Storage => {
  return localStorage.getItem(REMEMBER_KEY) === 'true' ? localStorage : sessionStorage;
};

const setSessionData = (
  access: string,
  refresh: string,
  user: User,
  remember: boolean
): void => {
  // Always clear both storages first to avoid stale duplicates
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('edustruc_user');
  sessionStorage.removeItem('access_token');
  sessionStorage.removeItem('refresh_token');
  sessionStorage.removeItem('edustruc_user');

  localStorage.setItem(REMEMBER_KEY, remember ? 'true' : 'false');

  const store = remember ? localStorage : sessionStorage;
  store.setItem('access_token', access);
  store.setItem('refresh_token', refresh);
  store.setItem('edustruc_user', JSON.stringify(user));
};

// ── Register ──────────────────────────────────────────────
export const registerUser = async (data: {
  full_name: string;
  institution_name?: string;
  email: string;
  password: string;
  role: 'admin' | 'teacher' | 'parent';
  phone?: string;
}): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await fetch(`${API_BASE}/api/auth/register/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (response.ok) return { success: true, message: result.message };
    const msg = result.email?.[0] || result.password?.[0] || result.detail || 'Registration failed';
    return { success: false, message: msg };
  } catch {
    return { success: false, message: 'Cannot connect to server. Make sure backend is running.' };
  }
};

// ── Login ─────────────────────────────────────────────────
// Pass `remember = true` to keep the session in localStorage (persists across
// browser restarts). Defaults to false, which keeps the session in
// sessionStorage (cleared when the tab/browser closes).
export const loginUser = async (
  email: string,
  password: string,
  role?: 'admin' | 'teacher' | 'parent',
  remember: boolean = false
): Promise<{ success: boolean; message: string; user?: User }> => {
  try {
    const response = await fetch(`${API_BASE}/api/auth/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, role }),
    });
    const result = await response.json();
    if (response.ok) {
      setSessionData(result.tokens.access, result.tokens.refresh, result.user, remember);
      return { success: true, message: result.message, user: result.user };
    }
    return { success: false, message: result.error || 'Invalid email or password' };
  } catch {
    return { success: false, message: 'Cannot connect to server. Make sure backend is running.' };
  }
};

// ── Auto refresh token ────────────────────────────────────
export const refreshAccessToken = async (): Promise<boolean> => {
  const store = getActiveStorage();
  const refresh = store.getItem('refresh_token');
  if (!refresh) return false;
  try {
    const res = await fetch(`${API_BASE}/api/auth/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
    });
    if (res.ok) {
      const data = await res.json();
      store.setItem('access_token', data.access);
      return true;
    }
    return false;
  } catch {
    return false;
  }
};

// ── Smart fetch — auto refreshes token if expired ─────────
export const apiFetch = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  const store = getActiveStorage();
  const token = store.getItem('access_token');
  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`,
  };

  let res = await fetch(url, { ...options, headers });

  // If 401, try refresh token once
  if (res.status === 401) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      const newToken = getActiveStorage().getItem('access_token');
      const newHeaders = {
        ...options.headers,
        'Authorization': `Bearer ${newToken}`,
      };
      res = await fetch(url, { ...options, headers: newHeaders });
    } else {
      // Refresh also failed — clear session
      logoutUser();
      window.location.href = '/login';
    }
  }
  return res;
};

// ── Session helpers ───────────────────────────────────────
export const getSession = (): User | null => {
  const data = getActiveStorage().getItem('edustruc_user');
  return data ? JSON.parse(data) : null;
};

export const isLoggedIn = (): boolean => {
  return !!getActiveStorage().getItem('access_token');
};

export const isAdmin   = (): boolean => getSession()?.role === 'admin';
export const isTeacher = (): boolean => getSession()?.role === 'teacher';
export const isParent  = (): boolean => getSession()?.role === 'parent';

export const logoutUser = (): void => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('edustruc_user');
  localStorage.removeItem(REMEMBER_KEY);
  sessionStorage.removeItem('access_token');
  sessionStorage.removeItem('refresh_token');
  sessionStorage.removeItem('edustruc_user');
};

export const getAuthHeader = (): { Authorization: string } => {
  const token = getActiveStorage().getItem('access_token');
  return { Authorization: `Bearer ${token}` };
};