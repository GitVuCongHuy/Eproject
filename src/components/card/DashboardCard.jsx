import React from 'react';
import './Dashboard.css';

const DashboardCard = ({ title, children }) => {
    return (
        <section className="section">
            <h2>{title}</h2>
            {children}
        </section>
    );
};

export default DashboardCard;
