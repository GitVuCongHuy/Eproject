import { createContext, useContext } from "react";

const AuthContext = createContext(null); 

export const AuthProvider = ({ children }) => {

  const login = async (username, password, deviceId) => {
    try {
      const response = await fetch('http://localhost:5028/backend/customer/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, deviceId }),
      });

      const data = await response.json();

      if (data.status === 200) {
        localStorage.setItem('token', data.data.token);
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message, errorType: data.error };
      }
    } catch (error) {
      console.error("Login API error:", error);
      return { success: false, message: "Không thể kết nối đến máy chủ. Vui lòng thử lại sau." };
    }
  };

  const verifyLogin = async (username, code, deviceId) => {
    try {
      const response = await fetch('http://localhost:5028/backend/customer/login_verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, code, deviceId }),
      });

      const data = await response.json();

      if (data.status === 200) {
        localStorage.setItem('token', data.data.token);
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message, errorType: data.error };
      }
    } catch (error) {
      console.error("Verify Login API error:", error);
      return { success: false, message: "Không thể kết nối đến máy chủ. Vui lòng thử lại sau." };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ login, verifyLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
