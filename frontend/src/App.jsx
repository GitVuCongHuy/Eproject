import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/context";
import Home from "./pages/home/home";
import Login from "./pages/account/login";
import AccountAndCards from "./pages/account/AccountAndCards";
import DefaultLayout from "./layouts/default_layout/default_layout";
import Internal from "./pages/transfer/internal";
import External from "./pages/transfer/external";
import Bill from "./pages/transfer/bills";
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
           
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
