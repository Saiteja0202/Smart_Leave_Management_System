export const isLoggedIn = () => {
    const token = sessionStorage.getItem('token');
    return !!token;
  };
  
  export const logout = () => {
    sessionStorage.clear();
  };
  