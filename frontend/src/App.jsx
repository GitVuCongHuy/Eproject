import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/context";
import Login from "./pages/account/login";
import Home from "./pages/home/home";
import DefaultLayout from "./layouts/default_layout/default_layout";
import AccountAndCards from "./pages/account/AccountAndCards";
import TransferPage from "./pages/transfer/internal";

// import Dashboard from "./pages/dashboard/Dashboard"; // nếu có

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Default layout for the home page */}
          <Route path="/" element={<DefaultLayout />}>
            <Route index element={<Home />} /> {/* Trang mặc định khi vào "/" */}
            <Route path="transfer" element={<TransferPage />} />
            <Route path="account" element={<AccountAndCards />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
