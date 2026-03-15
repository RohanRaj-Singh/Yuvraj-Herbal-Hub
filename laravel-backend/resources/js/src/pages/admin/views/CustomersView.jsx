import React, { useState, useMemo } from 'react';
import { Search, Download } from 'lucide-react';
import style from '../admin.module.css';

const CustomersView = ({ orders }) => {
    const [searchTerm, setSearchTerm] = useState('');
    
    const customers = useMemo(() => {
        const customerMap = new Map();
        orders.forEach(order => {
            const key = order.email || order.contact_number;
            if (key) {
                if (!customerMap.has(key)) {
                    customerMap.set(key, {
                        name: order.customer_name,
                        contact: order.contact_number,
                        email: order.email,
                        address: order.shipping_address,
                        totalOrders: 0,
                        totalSpent: 0
                    });
                }
                const customer = customerMap.get(key);
                customer.totalOrders += 1;
                customer.totalSpent += parseFloat(order.total_amount || 0);
            }
        });
        return Array.from(customerMap.values());
    }, [orders]);

    const filteredCustomers = useMemo(() => {
        if (!searchTerm) return customers;
        return customers.filter(c => 
            c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.contact.includes(searchTerm) ||
            (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [customers, searchTerm]);

    const downloadExcel = async () => {
        const XLSX = await import('xlsx');
        const worksheet = XLSX.utils.json_to_sheet(customers);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Customers");
        XLSX.writeFile(workbook, "CustomersData.xlsx");
    };

    return (
        <div className={style.viewContainer}>
            <div className={style.viewHeader}>
                <div>
                    <h2>Customer Directory</h2>
                    <p className={style.viewSubtitle}>View and manage customer information</p>
                </div>
                <button className={style.primaryBtn} onClick={downloadExcel}>
                    <Download size={18} />
                    Export Excel
                </button>
            </div>

            <div className={style.filtersBar}>
                <div className={style.searchBox}>
                    <Search size={18} />
                    <input 
                        type="text" 
                        placeholder="Search customers..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={style.searchInput}
                    />
                </div>
                <div className={style.statsInfo}>
                    <span>Total Customers: <strong>{customers.length}</strong></span>
                </div>
            </div>

            <div className={style.tableContainer}>
                <table className={style.dataTable}>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Contact</th>
                            <th>Email</th>
                            <th>Total Orders</th>
                            <th>Total Spent</th>
                            <th>Address</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCustomers.map((cust, index) => (
                            <tr key={index}>
                                <td><strong>{cust.name}</strong></td>
                                <td>{cust.contact}</td>
                                <td>{cust.email || '-'}</td>
                                <td><span className={style.badge}>{cust.totalOrders}</span></td>
                                <td><strong className={style.priceText}>${cust.totalSpent.toFixed(2)}</strong></td>
                                <td>{cust.address}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CustomersView;
