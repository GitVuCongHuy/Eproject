import { createContext, useContext } from "react";

// Hằng số cho địa chỉ cơ sở của API, dễ dàng thay đổi khi cần
const API_BASE_URL = 'http://localhost:5028/backend';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {

  // --- HÀM HELPER ĐỂ LẤY HEADERS XÁC THỰC ---
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error("Không tìm thấy token trong localStorage.");
      return { 'Content-Type': 'application/json' };
    }
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  // --- CÁC HÀM XÁC THỰC (Đã có) ---

  const login = async (username, password, deviceId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/customer/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, deviceId }),
      });
      const data = await response.json();
      if (data.status === 200) {
        localStorage.setItem('token', data.data.token);
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message, errorType: data.error };
    } catch (error) {
      console.error("Login API error:", error);
      return { success: false, message: "Không thể kết nối đến máy chủ." };
    }
  };

  const verifyLogin = async (username, code, deviceId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/customer/login_verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, code, deviceId }),
      });
      const data = await response.json();
      if (data.status === 200) {
        localStorage.setItem('token', data.data.token);
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message, errorType: data.error };
    } catch (error) {
      console.error("Verify Login API error:", error);
      return { success: false, message: "Không thể kết nối đến máy chủ." };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login'; 
  };

  // --- API LẤY THÔNG TIN NGƯỜI DÙNG ---

  const getUserInfo = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/UserInfo/me`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      if (data.status === 200) {
        return { success: true, data: data.data };
      }
      return { success: false, message: data.message, errorType: data.error };
    } catch (error) {
      console.error("Get User Info API error:", error);
      return { success: false, message: "Lỗi khi lấy thông tin người dùng." };
    }
  };

  // --- CÁC API QUẢN LÝ TÀI KHOẢN/THẺ ---

  const getCards = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/accounts_manager/cards`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      if (data.status === 200) {
        return { success: true, data: data.data };
      }
      return { success: false, message: data.message, errorType: data.error };
    } catch (error) {
      console.error("Get Cards API error:", error);
      return { success: false, message: "Lỗi khi lấy danh sách thẻ." };
    }
  };

  const getBalance = async (accountId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/accounts_manager/balance?accountId=${accountId}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      if (data.status === 200) {
        return { success: true, data: data.data };
      }
      return { success: false, message: data.message, errorType: data.error };
    } catch (error) {
      console.error("Get Balance API error:", error);
      return { success: false, message: "Lỗi khi lấy số dư." };
    }
  };
  
  const createCard = async (bankId, initialBalance) => {
    try {
      const response = await fetch(`${API_BASE_URL}/accounts_manager/create-card`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ BankId: bankId, InitialBalance: initialBalance }),
      });
      const data = await response.json();
      if (data.status === 200) {
        return { success: true, data: data.data, message: data.message };
      }
      return { success: false, message: data.message, errorType: data.error };
    } catch (error) {
      console.error("Create Card API error:", error);
      return { success: false, message: "Lỗi khi tạo thẻ mới." };
    }
  };

  const lockCard = async (accountId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/accounts_manager/lock-card/${accountId}`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      if (data.status === 200) {
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message, errorType: data.error };
    } catch (error) {
      console.error("Lock Card API error:", error);
      return { success: false, message: "Lỗi khi khóa thẻ." };
    }
  };

  const deleteCard = async (accountId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/accounts_manager/delete-card/${accountId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      if (data.status === 200) {
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message, errorType: data.error };
    } catch (error) {
      console.error("Delete Card API error:", error);
      return { success: false, message: "Lỗi khi xóa thẻ." };
    }
  };

  // --- CÁC API VỀ GIAO DỊCH ---

  const getTransactions = async (accountId, month, year) => {
    try {
      const response = await fetch(`${API_BASE_URL}/accounts_manager/transactions?accountId=${accountId}&month=${month}&year=${year}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      if (data.status === 200) {
        return { success: true, data: data.data };
      }
      return { success: false, message: data.message, errorType: data.error };
    } catch (error) {
      console.error("Get Transactions API error:", error);
      return { success: false, message: "Lỗi khi lấy lịch sử giao dịch." };
    }
  };

  const exportTransactions = async (month, year) => {
    try {
      const response = await fetch(`${API_BASE_URL}/accounts_manager/transactions/export/send-mail?month=${month}&year=${year}`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      if (data.status === 200) {
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message, errorType: data.error };
    } catch (error) {
      console.error("Export Transactions API error:", error);
      return { success: false, message: "Lỗi khi xuất sao kê." };
    }
  };

  // <<<<< START: HÀM MỚI ĐƯỢC THÊM VÀO >>>>>
  const getCustomerAccount = async (cardNumber) => {
    // Lưu ý: Theo đặc tả, đây là request GET nhưng gửi dữ liệu trong body.
    // Điều này không phổ biến nhưng vẫn thực hiện được với fetch.
    try {
      const response = await fetch(`${API_BASE_URL}/transaction_Controler/Get_Customer_Account`, {
        method: 'GET',
        headers: getAuthHeaders(),
        body: JSON.stringify({ cardNumber }), // Gửi số thẻ trong body
      });
      const data = await response.json();

      if (data.status === 200) {
        // Thành công, trả về dữ liệu chứa tên khách hàng
        return { success: true, data: data.data };
      }
      // Thất bại (ví dụ: status 404), trả về thông báo lỗi từ API
      return { success: false, message: data.message, errorType: data.error };
    } catch (error) {
      console.error("Get Customer Account API error:", error);
      return { success: false, message: "Lỗi khi kiểm tra tài khoản người nhận." };
    }
  };
  // <<<<< END: HÀM MỚI ĐƯỢC THÊM VÀO >>>>>

  // --- Cung cấp tất cả các hàm cho các component con ---
  const value = {
    login,
    verifyLogin,
    logout,
    getUserInfo,
    getCards,
    getBalance,
    createCard,
    lockCard,
    deleteCard,
    getTransactions,
    exportTransactions,
    getCustomerAccount, // <<<<< THÊM HÀM MỚI VÀO CONTEXT VALUE
  };

  return (
    <AuthContext.Provider value={value}>
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