import React, { useState } from 'react';
import './header.css';

const Header = () => {
    const [activeMenu, setActiveMenu] = useState('');

    const handleMenuClick = (menu) => {
        setActiveMenu(menu === activeMenu ? '' : menu);
    };

    return (
        <aside className="sidebar">
            <div className="user-info">
                <p>Xin chào, VU THIEN HUU</p>
                <button>Thong tin tai khoan</button>
            </div>
            <nav>
                <ul>
                    <li>
                        <a
                            href="#"
                            onClick={() => handleMenuClick('trangchu')}
                            className={activeMenu === 'trangchu' ? 'active' : ''}
                        >
                            Trang chủ
                        </a>
                        {activeMenu === 'trangchu' && (
                            <ul className="submenu">
                                <li><a href="#">Tổng quan</a></li>

                            </ul>
                        )}
                    </li>
                    <li>
                        <a
                            href="#"
                            onClick={() => handleMenuClick('taikhoan')}
                            className={activeMenu === 'taikhoan' ? 'active' : ''}
                        >
                            Tài khoản & Thẻ
                        </a>
                        {activeMenu === 'taikhoan' && (
                            <ul className="submenu">
                                <li><a href="#">Xem số dư</a></li>
                                <li><a href="#">Sao kê</a></li>
                            </ul>
                        )}
                    </li>
                    <li>
                        <a
                            href="#"
                            onClick={() => handleMenuClick('chuyentien')}
                            className={activeMenu === 'chuyentien' ? 'active' : ''}
                        >
                            Chuyển tiền
                        </a>
                        {activeMenu === 'chuyentien' && (
                            <ul className="submenu">
                                <li><a href="#">Chuyển nội bộ</a></li>
                                <li><a href="#">Chuyển liên ngân hàng</a></li>
                            </ul>
                        )}
                    </li>
                    <li>
                        <a
                            href="#"
                            onClick={() => handleMenuClick('tinhang')}
                            className={activeMenu === 'tinhang' ? 'active' : ''}
                        >
                            Tính năng khác
                        </a>
                        {activeMenu === 'tinhang' && (
                            <ul className="submenu">
                                <li><a href="#">Yêu cầu sổ séc</a></li>
                                <li><a href="#">Ngừng thanh toán séc</a></li>
                                <li><a href="#">Thay đổi địa chỉ</a></li>
                            </ul>
                        )}
                    </li>
                    <li>
                        <a href="#">Đăng xuất</a>
                    </li>
                </ul>
            </nav>
        </aside>
    );
};

export default Header;
