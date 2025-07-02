// src/contexts/AdminContext.js
import React, { createContext, useState, useContext } from 'react';

// Tạo context
const AdminContext = createContext();

// Provider
export default function AdminProvider ({ children }) {
  const [adminInfo, setAdminInfo] = useState(() => {
    // Nếu đã lưu trong localStorage thì lấy ra
    const savedAdmin = localStorage.getItem('adminInfo');
    return savedAdmin ? JSON.parse(savedAdmin) : null;
  });

  const login = (adminData) => {
    setAdminInfo(adminData);
    localStorage.setItem('adminInfo', JSON.stringify(adminData));
  };

  const logout = () => {
    setAdminInfo(null);
    localStorage.removeItem('adminInfo');
  };

  return (
    <AdminContext.Provider value={{ adminInfo, login, logout }}>
      {children}
    </AdminContext.Provider>
  );
};

// Custom hook để dùng dễ hơn
export const useAdmin = () => {
  return useContext(AdminContext);
};
