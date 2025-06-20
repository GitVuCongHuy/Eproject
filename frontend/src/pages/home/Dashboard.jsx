import React, { useContext, useEffect } from "react";
import DashboardCard from "../../components/card/DashboardCard.jsx";
import "../../components/card/Dashboard.css";
import { AccountContext } from "../../context/AccountContext.jsx";
import { FaCreditCard, FaExchangeAlt } from 'react-icons/fa';

const Dashboard = () => {
    const { customer, account, transactions } = useContext(AccountContext);

    // Debug log
    useEffect(() => {
        console.log("CUSTOMER:", customer);
        console.log("ACCOUNT:", account);
        console.log("TRANSACTIONS:", transactions);
    }, [customer, account, transactions]);

    return (
        <main className="main-content">
            {customer && (
                <div className="greeting">
                    <h1>Xin chào, <strong>{customer.full_name}</strong> 👋</h1>
                    <p>Chúc bạn một ngày hiệu quả!</p>
                </div>
            )}

            <DashboardCard title="Tài khoản & Thẻ" icon={<FaCreditCard />}>
                {account ? (
                    <>
                        <p>Tài khoản thanh toán: <strong>{account.account_number}</strong></p>
                        <p className="balance">Số dư: <strong>VND {account.balance.toLocaleString()}</strong></p>
                        <a href="#">Xem tất cả</a>
                    </>
                ) : (
                    <p>Đang tải thông tin tài khoản...</p>
                )}
            </DashboardCard>

            <DashboardCard title="Hoạt động gần đây" icon={<FaExchangeAlt />}>
                {transactions && transactions.length > 0 ? (
                    <ul className="transaction-list">
                        {transactions.slice(0, 3).map((transaction) => (
                            <li key={transaction.id} className="transaction-item">
                                <div className="transaction-header">
                        <span className="transaction-type">
                            {transaction.transaction_type === "deposit" ? "💰 Gửi tiền" : "🔁 Chuyển khoản"}
                        </span>
                                    <span className={`transaction-amount ${transaction.amount >= 0 ? "positive" : "negative"}`}>
                            {transaction.amount >= 0 ? "+" : "-"} VND {Math.abs(transaction.amount).toLocaleString()}
                        </span>
                                </div>
                                <p className="transaction-description">{transaction.description}</p>
                                <p className="transaction-date">
                                    Ngày: {new Date(transaction.transaction_date).toLocaleDateString("vi-VN")}
                                </p>
                            </li>
                        ))}
                        <div className="transaction-footer">
                            <a href="#">Xem tất cả giao dịch</a>
                        </div>
                    </ul>
                ) : (
                    <p>Không có giao dịch nào gần đây</p>
                )}
            </DashboardCard>


            <footer>
                <p><strong>Liên hệ:</strong> 1800 588 822 / +84 243 944 6699 | Email: nhomvjp.com.vn</p>
                <p>Địa chỉ: Số xxx Trịnh Văn Bô, FPT Polytechnix | SWIFT: VXXXXXXX</p>
                <p style={{ marginTop: "10px", color: "#888" }}>&copy; 2025 AptechBank. All rights reserved.</p>
            </footer>
        </main>
    );
};

export default Dashboard;
