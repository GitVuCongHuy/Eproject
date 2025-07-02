import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/Context";
import Home from "./home/home"; // Đã sửa ở lần trước, giữ nguyên
import Login from "./login/Login"; // Sửa từ "./pages/login/login"
import AccountAndCards from "./account/AccountAndCards"; // Sửa từ "./pages/account/AccountAndCards"
import DefaultLayout from "./layouts/default_layout/default_layout";
import Internal from "./service/Internal"; // Sửa từ "./pages/service/Internal"
import External from "./service/External"; // Sửa từ "./pages/service/External"
import Bill from "./login/Bills"; // Sửa từ "./pages/login/Bills" - Cần kiểm tra lại tên file Bills.jsx trong thư mục login
import CheckRequest from "./service/Chequebook"; // Sửa từ "./pages/service/Chequebook"
import Guide from "./features/Guide"; // Sửa từ "./pages/features/Guide"
import Admin from "./admin/Admin_account"; // Sửa từ "./pages/account/Admin" - Dựa vào cấu trúc thư mục, Admin.jsx nằm trong admin/Admin_account.jsx
import CancelCheckPayment from "./service/ChequebookDelete"; // Sửa từ "./pages/service/ChequebookDelete"
import Statement from "./service/Statement"; // Sửa từ "./pages/service/Statement"
import ChangePasswordPage from "./features/ChangePasswordLogin"; // Sửa từ "./pages/features/ChangePasswordLogin"
import Settings from "./features/Password"; // Sửa từ "./pages/features/Password"
//KienDev
import AdminLayout from "./layouts/admin_layout/admin_layout";
import Admin_Main from "./admin/Admin_Main"; // Sửa từ "./pages/admin/Admin_Main"
import Admin_request from "./admin/Admin_request"; // Sửa từ "./pages/admin/Admin_request"
import Admin_account from "./admin/Admin_account"; // Sửa từ "./pages/admin/Admin_account"
//KienDev

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<DefaultLayout />}>
            <Route index element={<Home />} />
            <Route path="transfer/internal" element={<Internal />} />
            <Route path="transfer/external" element={<External />} />
            <Route path="transfer/bills" element={<Bill />} />
            <Route path="account" element={<AccountAndCards />} />
            <Route path="statement" element={<Statement />} />
            <Route path="chequebook" element={<CheckRequest />} />
            <Route path="guide" element={<Guide />} />
            <Route path="admin" element={<Admin />} />
            <Route path="cancel" element={<CancelCheckPayment />} />
            <Route path="update-password-login" element={<ChangePasswordPage />} />
            <Route path="/password" element={<Settings />} />
          </Route>

          <Route path="/admin_new" element={<AdminLayout />}>
              <Route path="admin_main" element={<Admin_Main/>} />
              <Route path="admin_request" element={<Admin_request/>} />
               <Route path="admin_account" element={<Admin_account/>} />
          </Route>
        
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
