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

                // Fetch customer (giả sử luôn lấy customer đầu tiên)
                const customerRes = await fetch("http://localhost:3001/customers?id=1");
                const customerData = await customerRes.json();
                setCustomer(customerData[0] || null);

                if (customerData[0]) {
                    // Fetch account
                    const accountRes = await fetch(`http://localhost:3001/accounts?customer_id=${customerData[0].id}`);
                    const accountData = await accountRes.json();
                    setAccount(accountData[0] || null);

                    // Fetch transactions nếu có account
                    if (accountData[0]) {
                        const transactionsRes = await fetch(
                            `http://localhost:3001/transactions?account_id=${accountData[0].id}&_sort=transaction_date&_order=desc`
                        );
                        const transactionsData = await transactionsRes.json();
                        setTransactions(transactionsData);
                    }
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