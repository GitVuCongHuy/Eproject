import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/Context";
import Home from "./pages/home/Home";
import Login from "./pages/login/login";
import AccountAndCards from "./pages/account/AccountAndCards";
import DefaultLayout from "./layouts/default_layout/default_layout";
import Internal from "./pages/service/Internal";
import External from "./pages/service/External";
import Bill from "./pages/login/Bills";
import CheckRequest from "./pages/service/Chequebook";
import Guide from "./pages/features/Guide";
import Admin from "./pages/account/Admin";
import Statement from "./pages/service/Statement";

import ChangePasswordPage from "./pages/features/ChangePasswordLogin";
import  Settings from "./pages/features/Password";
//KienDev
import AdminLayout from "./layouts/admin_layout/admin_layout";
import Admin_Main from "./pages/admin/Admin_Main";
import Admin_request from "./pages/admin/Admin_request";
import Admin_account from "./pages/admin/Admin_account";
import ProtectedRoute from "./pages/admin/ProtectedRoute";
// import Admin_login from "./pages/admin/Admin_login";

//KienDev
import Admin_login from "./pages/admin/Admin_login";
function App() {
  return (
    <AuthProvider>
      {/* <AdminProvider> */}
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
            <Route path="update-password-login" element={<ChangePasswordPage />} />
            <Route path="/password" element={<Settings />} />
          </Route>

          {/* Admin */}
          <Route path="admin_login" element={<Admin_login/>} />
          <Route path="/admin_new" element={<AdminLayout />}>
              <Route path="admin_main" element={<ProtectedRoute><Admin_Main/></ProtectedRoute>} />
              <Route path="admin_request" element={<ProtectedRoute><Admin_request/></ProtectedRoute>} />
               <Route path="admin_account" element={<ProtectedRoute><Admin_account/></ProtectedRoute>} />
          </Route>
        
        </Routes>
      </Router>
      {/* </AdminProvider> */}
    </AuthProvider>
  );
}

export default App;
