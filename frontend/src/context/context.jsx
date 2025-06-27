import { createContext, useContext } from "react";

const API_BASE_URL = 'http://localhost:5028/backend';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      return { 'Content-Type': 'application/json' };
    }
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

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
      return { success: false, message: "Không thể kết nối đến máy chủ." };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login'; 
  };

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
      return { success: false, message: "Lỗi khi lấy thông tin người dùng." };
    }
  };

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
      return { success: false, message: "Lỗi khi xóa thẻ." };
    }
  };

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
      return { success: false, message: "Lỗi khi xuất sao kê." };
    }
  };

  const getCustomerAccount = async (cardNumber) => {
    try {
      const response = await fetch(`${API_BASE_URL}/transaction_Controler/Get_Customer_Account`, {
        method: 'GET',
        headers: getAuthHeaders(),
        body: JSON.stringify({ cardNumber }),
      });
      const data = await response.json();

      if (data.status === 200) {
        return { success: true, data: data.data };
      }
      return { success: false, message: data.message, errorType: data.error };
    } catch (error) {
      return { success: false, message: "Lỗi khi kiểm tra tài khoản người nhận." };
    }
  };

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
    getCustomerAccount
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
