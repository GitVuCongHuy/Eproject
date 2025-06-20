import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/context";
import DefaultLayout from "./layouts/default_layout/default_layout";
// Pages
import Login from "./pages/account/login";
import Home from "./pages/home/Home";

// Layouts
// import DefaultLayout from "./layouts/DefaultLayout"; 
// import NoFooterLayout from "./layouts/NoFooterLayout"; 

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Pages */}
          <Route path="/" element={<DefaultLayout><Home /></DefaultLayout>} />
          <Route path="/login" element={<Login />} />

          {/* Sau này có thể thêm: */}
          {/* <Route path="/about" element={<DefaultLayout><About /></DefaultLayout>} /> */}
          {/* <Route path="/reset-password" element={<NoFooterLayout><ResetPassword /></NoFooterLayout>} /> */}
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
