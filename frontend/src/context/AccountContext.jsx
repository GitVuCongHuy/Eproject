import React, { createContext, useEffect, useState } from "react";

export const AccountContext = createContext();

export const AccountProvider = ({ children }) => {
    const [customer, setCustomer] = useState(null);
    const [account, setAccount] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Fetch customer (sử dụng /1 thay vì ?id=1)
                const customerRes = await fetch("http://localhost:3001/customers/1");
                const customerData = await customerRes.json();
                setCustomer(customerData || null);

                if (customerData) {
                    // Fetch account (sử dụng ?customer_id=1)
                    const accountRes = await fetch(`http://localhost:3001/accounts?customer_id=1`);
                    const accountData = await accountRes.json();
                    setAccount(accountData[0] || null);

                    // Fetch transactions nếu có account
                    if (accountData[0]) {
                        const transactionsRes = await fetch(
                            `http://localhost:3001/transactions?account_id=1`
                        );
                        const transactionsData = await transactionsRes.json();
                        setTransactions(transactionsData);
                    }
                    if (loading) return <p>Đang tải...</p>;
                    if (error) return <p>Có lỗi xảy ra: {error}</p>;
                }
            } catch (err) {
                setError(err.message);
                console.error("Fetch error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <AccountContext.Provider value={{ customer, account, transactions, loading, error }}>
            {children}
        </AccountContext.Provider>
    );
};