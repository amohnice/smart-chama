import jwtDecode from 'jwt-decode';

export const getToken = () => {
  return localStorage.getItem('token');
};

export const setToken = (token) => {
  localStorage.setItem('token', token);
};

export const removeToken = () => {
  localStorage.removeItem('token');
};

export const getUser = () => {
  const token = getToken();
  if (!token) return null;

  try {
    const decoded = jwtDecode(token);
    return decoded;
  } catch (error) {
    removeToken();
    return null;
  }
};

export const isAuthenticated = () => {
  const token = getToken();
  if (!token) return false;

  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp > currentTime;
  } catch (error) {
    removeToken();
    return false;
  }
};

export const hasRole = (role) => {
  const user = getUser();
  return user?.role === role;
};

export const hasPermission = (permission) => {
  const user = getUser();
  return user?.permissions?.includes(permission);
}; 