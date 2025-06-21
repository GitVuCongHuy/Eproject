import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../../components/slider/Slidebar";
import styles from "./default_layout.module.css";

const DefaultLayout = () => {
    return (
        <div className={styles.dashboardContainer}>
            <Sidebar />
            <main className={styles.mainContent}>
                <Outlet /> 
            </main>
        </div>
    );
};

export default DefaultLayout;