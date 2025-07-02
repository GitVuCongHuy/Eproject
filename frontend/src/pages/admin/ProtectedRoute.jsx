// src/admin/ProtectedRoute.jsx (hoặc nơi bạn muốn đặt)
import React from 'react';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }) {
  // Kiểm tra xem trong localStorage có giá trị 'isAdminLoggedIn' là 'true' hay không
  const isLoggedIn = localStorage.getItem('isAdminLoggedIn') === 'true';

  if (!isLoggedIn) {
    // Nếu chưa đăng nhập, chuyển hướng về trang login
    // 'replace' sẽ thay thế trang hiện tại trong lịch sử trình duyệt,
    // để người dùng không thể nhấn nút "Back" quay lại trang admin.
    return <Navigate to="/admin_new/admin_login" replace />;
  }

  // Nếu đã đăng nhập, hiển thị component con (trang mà người dùng muốn truy cập)
  return children;
}

export default ProtectedRoute;