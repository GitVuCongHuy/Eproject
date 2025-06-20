import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./layouts/default_layout/default_layout.jsx";
import Dashboard from "./pages/home/Dashboard.jsx";
import { AccountProvider } from "./context/AccountContext.jsx"; // 👈 thêm dòng này
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Pages
import Login from "./pages/account/login";
import Home from "./pages/home/Home";
const App = () => {
    return (
        <AccountProvider> {/* 👈 bọc toàn bộ */}
            <Router>
                <Routes>
                    <Route path="/" element={<Layout />}>
                        <Route path="/login" element={<Login />} />
                        <Route index element={<Dashboard />} />
                        {/* Các route khác */}
                    </Route>
                </Routes>
            </Router>
        </AccountProvider>
    );
};

export default App;
