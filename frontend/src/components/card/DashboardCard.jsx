// src/components/card/DashboardCard.jsx
import React from 'react';
import './Dashboard.css';

const DashboardCard = ({ title, icon, children }) => {
    return (
        <section className="section card-shadow">
            <div className="section-header">
                {icon && <span className="section-icon">{icon}</span>}
                <h2>{title}</h2>
            </div>
            <div className="section-content">
                {children}
            </div>
        </section>
    );
};

export default DashboardCard;
