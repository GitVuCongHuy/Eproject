import React, { useContext } from "react";
import DashboardCard from "../../components/card/DashboardCard.jsx";
import "../../components/card/Dashboard.css";
import { AccountContext } from "../../context/AccountContext.jsx";

const Dashboard = () => {
    const { customer, account, transactions } = useContext(AccountContext);

    return (
        <main className="main-content">
            <DashboardCard title="Tài khoản & Thẻ">
                {customer && account ? (
                    <>
                        <p>Tài khoản thanh toán: {account.account_number}</p>
                        <p className="balance">Số dư: VND {account.balance.toLocaleString()}</p>
                        <a href="#">Xem tất cả</a>
                    </>
                ) : (
                    <p>Đang tải dữ liệu...</p>
                )}
            </DashboardCard>

            <DashboardCard title="Hoạt động gần đây">
                {transactions.length > 0 ? (
                    <>
                        <p>{transactions[0].description}</p>
                        <p>Số tiền: VND {transactions[0].amount.toLocaleString()}</p>
                        <a href="#">Xem tất cả giao dịch</a>
                    </>
                ) : (
                    <p>Không có giao dịch nào gần đây</p>
                )}
            </DashboardCard>

            <DashboardCard title="Liên hệ">
                <p>Hotline: 1800 588 822 / +84 243 944 6699</p>
                <p>Email: contact@techcombank.com.vn</p>
                <p>Địa chỉ: Số 6 Phố Quang Trung, Quận Hoàn Kiếm, Hà Nội</p>
                <p>Mã SWIFT: VTCBVNVX</p>
            </DashboardCard>

            <DashboardCard title="Hướng dẫn sử dụng">
                <p>Tải ứng dụng Techcombank Mobile để trải nghiệm dịch vụ ngân hàng điện tử mới nhất.</p>
                <p><a href="#">ATM & Chi nhánh</a></p>
            </DashboardCard>

            <footer>
                <p>Bản Quyền Thuộc Về Ngân Hàng TMCP Kỹ Thương Việt Nam - Techcombank</p>
            </footer>
        </main>
    );
};

export default Dashboard;
