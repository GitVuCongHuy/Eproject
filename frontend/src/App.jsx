import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/Context";
import Home from "./pages/home/Home";
import Login from "./pages/account/login";
import AccountAndCards from "./pages/account/AccountAndCards";
import DefaultLayout from "./layouts/default_layout/default_layout";
import Internal from "./pages/transfer/Internal";
import External from "./pages/transfer/External";
import Bill from "./pages/transfer/Bills";
import CheckRequest from "./pages/home/Chequebook";
import Guide from "./pages/home/Guide";
import Admin from "./pages/account/Admin";
import CancelCheckPayment from "./pages/home/ChequebookDelete";
import Statement from "./pages/home/Statement";
import UpdateInfoRequest from "./pages/home/UpdateInfoRequest";
import  Settings from "./pages/features/settings";
//KienDev
import AdminLayout from "./layouts/admin_layout/admin_layout";
import Admin_Main from "./pages/admin/Admin_Main";
import Admin_request from "./pages/admin/Admin_request";
import Admin_account from "./pages/admin/Admin_account";
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
            <Route path="update-info" element={<UpdateInfoRequest />} />
            <Route path="/features/settings" element={<Settings />} />
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
