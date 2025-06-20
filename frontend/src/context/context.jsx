import { createContext, useContext } from "react";

const AuthContext = createContext(null); // Khởi tạo với null để rõ ràng hơn

export const AuthProvider = ({ children }) => {

  // Hàm đăng nhập chính
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
        // Đăng nhập thành công và không phải thiết bị mới
        localStorage.setItem('token', data.data.token);
        return { success: true, message: data.message };
      } else {
        // Xử lý các trường hợp lỗi từ API
        return { success: false, message: data.message, errorType: data.error };
      }
    } catch (error) {
      console.error("Login API error:", error);
      return { success: false, message: "Không thể kết nối đến máy chủ. Vui lòng thử lại sau." };
    }
  };

  // Hàm xác minh đăng nhập (khi có thiết bị mới)
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
        // Xác minh thành công
        localStorage.setItem('token', data.data.token);
        return { success: true, message: data.message };
      } else {
        // Xử lý các trường hợp lỗi từ API
        return { success: false, message: data.message, errorType: data.error };
      }
    } catch (error) {
      console.error("Verify Login API error:", error);
      return { success: false, message: "Không thể kết nối đến máy chủ. Vui lòng thử lại sau." };
    }
  };

  // Hàm logout (nếu cần)
  const logout = () => {
    localStorage.removeItem('token');
    // Có thể thêm logic gọi API logout backend nếu có
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
