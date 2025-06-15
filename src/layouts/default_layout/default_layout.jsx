import React from "react";
import Header from "..//../components/header/header.jsx"; // Sidebar của bạn
import { Outlet } from "react-router-dom";

const default_layout = () => {
    return (
        <div >
            <Header />
            <div >
                <Outlet /> {/* Đây là nơi hiển thị nội dung từng page */}
            </div>
        </div>
    );
};

export default default_layout;
