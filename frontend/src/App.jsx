import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/context";
import Home from "./pages/home/home";
import Login from "./pages/account/login";
import AccountAndCards from "./pages/account/AccountAndCards";
import DefaultLayout from "./layouts/default_layout/default_layout";
import Internal from "./pages/transfer/internal";
import External from "./pages/transfer/external";
import Bill from "./pages/transfer/bills";
import CheckRequest from "./pages/home/chequebook";
import Statement from "./pages/home/statement";
import Guide from "./pages/home/Guide";
import Admin from "./pages/account/Admin";
import CancelCheckPayment from "./pages/home/ChequebookDelete";

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
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
