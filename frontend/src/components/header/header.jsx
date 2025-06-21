import React, { useState } from 'react';
import styles from './header.module.css';

const Header = () => {
    const [activeMenu, setActiveMenu] = useState('');

    const handleMenuClick = (menu) => {
        setActiveMenu(menu === activeMenu ? '' : menu);
    };

    return (
        <aside className={styles.sidebar}>
            <div className={styles.userInfo}>
                <p>Xin chào, VU THIEN HUU</p>
                <button>Thong tin tai khoan</button>
            </div>
            <nav>
                <ul>
                    <li>
                        <a
                            href="#"
                            onClick={() => handleMenuClick('trangchu')}
                            className={`${styles.link} ${activeMenu === 'trangchu' ? styles.active : ''}`}
                        >
                            Trang chủ
                        </a>
                        {activeMenu === 'trangchu' && (
                            <ul className={styles.submenu}>
                                <li><a href="#">Tổng quan</a></li>
                            </ul>
                        )}
                    </li>
                    <li>
                        <a
                            href="#"
                            onClick={() => handleMenuClick('taikhoan')}
                            className={`${styles.link} ${activeMenu === 'taikhoan' ? styles.active : ''}`}
                        >
                            Tài khoản & Thẻ
                        </a>
                        {activeMenu === 'taikhoan' && (
                            <ul className={styles.submenu}>
                                <li><a href="#">Xem số dư</a></li>
                                <li><a href="#">Sao kê</a></li>
                            </ul>
                        )}
                    </li>
                    <li>
                        <a
                            href="#"
                            onClick={() => handleMenuClick('chuyentien')}
                            className={`${styles.link} ${activeMenu === 'chuyentien' ? styles.active : ''}`}
                        >
                            Chuyển tiền
                        </a>
                        {activeMenu === 'chuyentien' && (
                            <ul className={styles.submenu}>
                                <li><a href="#">Chuyển nội bộ</a></li>
                                <li><a href="#">Chuyển liên ngân hàng</a></li>
                            </ul>
                        )}
                    </li>
                    <li>
                        <a
                            href="#"
                            onClick={() => handleMenuClick('tinhang')}
                            className={`${styles.link} ${activeMenu === 'tinhang' ? styles.active : ''}`}
                        >
                            Tính năng khác
                        </a>
                        {activeMenu === 'tinhang' && (
                            <ul className={styles.submenu}>
                                <li><a href="#">Yêu cầu sổ séc</a></li>
                                <li><a href="#">Ngừng thanh toán séc</a></li>
                                <li><a href="#">Thay đổi địa chỉ</a></li>
                            </ul>
                        )}
                    </li>
                    <li>
                        <a className={styles.link} href="#">Đăng xuất</a>
                    </li>
                </ul>
            </nav>
        </aside>
    );
};

export default Header;
