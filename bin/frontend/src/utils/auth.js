export const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem('marketplace_user'));
  } catch {
    return null;
  }
};

export const setStoredUser = (user) => {
  localStorage.setItem('marketplace_user', JSON.stringify(user));
};

export const clearStoredUser = () => {
  localStorage.removeItem('marketplace_user');
};
