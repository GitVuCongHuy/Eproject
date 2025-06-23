import React, { useState } from 'react';
import { Search, Plus } from 'lucide-react';
import './internal.css';

const TransferPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const recipients = [
    {
      id: 1,
      name: 'shoppe',
      fullName: 'PHUONG TRUNG HUNG',
      accountNumber: '934443017',
      bank: 'Ngân hàng TMCP Ngoại thương Việt Nam',
      avatar: '🛍️',
      color: 'bg-green-500'
    },
    {
      id: 2,
      name: 'shipper',
      fullName: 'NGUYEN TRONG DAT',
      accountNumber: '10487478415',
      bank: 'Ngân hàng TMCP Công thương Việt Nam',
      avatar: '🚚',
      color: 'bg-blue-500'
    },
    {
      id: 3,
      name: 'NGUYEN DUC TRUNG',
      fullName: 'NGUYEN DUC TRUNG',
      accountNumber: '06030862080888',
      bank: 'Ngân hàng TMCP Quân Đội',
      avatar: '👤',
      color: 'bg-pink-400'
    },
    {
      id: 4,
      name: 'trung',
      fullName: 'NGUYEN DUC TRUNG',
      accountNumber: '0862070705',
      bank: 'Ngân hàng TMCP Quân Đội',
      avatar: '👤',
      color: 'bg-pink-400'
    },
    {
      id: 5,
      name: 'viettelpost',
      fullName: 'LAM QUOC ANH',
      accountNumber: '0971660368',
      bank: 'Ngân hàng TMCP Quân Đội',
      avatar: '📮',
      color: 'bg-pink-400'
    }
  ];

  const filteredRecipients = recipients.filter(recipient =>
    recipient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    recipient.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    recipient.accountNumber.includes(searchQuery)
  );

  const tabs = [
    { id: 'all', label: 'Tất cả người nhận' },
    { id: 'techcombank', label: 'Trong Techcombank' },
    { id: 'other', label: 'Ngân hàng khác' }
  ];

  return (
    <div className="transfer-page">
      <div className="header">
        <div className="container">
          <h1>Chuyển tiền tới tài khoản khác</h1>
          <p>
            Bao gồm chuyển tiền trong Techcombank, Liên Ngân hàng, chuyển nhanh Napas 24/7 và chuyển tiền tới tài khoản chứng khoán
          </p>
        </div>
      </div>

      <div className="container">
        <div className="search-add">
          <div className="search-box">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Tìm người nhận đã lưu"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="add-btn">
            <Plus className="icon" />
            Người nhận mới
          </button>
        </div>

        <div className="tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="recipients">
          {filteredRecipients.length === 0 ? (
            <div className="empty">Không tìm thấy người nhận nào</div>
          ) : (
            filteredRecipients.map((recipient) => (
              <div key={recipient.id} className="recipient-item">
                <div className="avatar-container">
                  <div className={`avatar ${recipient.color}`}>{recipient.avatar}</div>
                </div>
                <div className="info">
                  <div className="name">{recipient.name}</div>
                  <div className="fullname">{recipient.fullName}</div>
                  <div className="account">{recipient.accountNumber} - {recipient.bank}</div>
                </div>
                <div className="arrow">
                  <svg className="arrow-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TransferPage;
