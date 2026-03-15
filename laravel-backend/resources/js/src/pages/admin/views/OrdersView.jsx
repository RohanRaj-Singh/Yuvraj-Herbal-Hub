import React, { useState, useMemo, lazy, Suspense } from 'react';
import { Search, Download, Eye, EyeOff, Trash2 } from 'lucide-react';
import style from '../admin.module.css';
import { API_BASE_URL } from '../Admin';
import { useNotifications } from '../../../components/notifications/NotificationProvider';
import PremiumLoader from '../../../components/ui/PremiumLoader';

const OrderDetails = lazy(() => import('../components/OrderDetails'));

const OrdersView = ({ orders, refreshData }) => {
    const [filter, setFilter] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedOrderId, setExpandedOrderId] = useState(null);
    const [detailedOrder, setDetailedOrder] = useState(null);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const { success, error: notifyError } = useNotifications();

    const filteredOrders = useMemo(() => {
        let result = orders;
        if (filter !== 'All') {
            result = result.filter(
                o => o.order_status === filter || o.payment_status === filter
            );
        }
        if (searchTerm) {
            result = result.filter(o =>
                o.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                o.contact_number.includes(searchTerm) ||
                o.order_id.toString().includes(searchTerm)
            );
        }
        return result;
    }, [orders, filter, searchTerm]);

    const handleStatusChange = async (orderId, field, value) => {
        try {
            const res = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ [field]: value }),
            });
            if (!res.ok) throw new Error('Failed to update status');
           
            refreshData();
            success('Status updated', `Order #${orderId} updated successfully.`);
        } catch (err) {
            notifyError('Update failed', err.message);
        }
    };

    const toggleOrderDetails = async (orderId) => {
        if (expandedOrderId === orderId) {
            setExpandedOrderId(null);
            setDetailedOrder(null);
        } else {
            setDetailsLoading(true);
            try {
                const res = await fetch(`${API_BASE_URL}/orders/${orderId}`);
                if (!res.ok) throw new Error("Could not fetch order details.");
                const result = await res.json();
                setDetailedOrder(result.data);
           
               
                setExpandedOrderId(orderId);
            } catch (err) {
                notifyError('Unable to load details', err.message);
            } finally {
                setDetailsLoading(false);
            }
        }
    };

    const downloadExcel = async () => {
        const XLSX = await import('xlsx');
        const worksheet = XLSX.utils.json_to_sheet(filteredOrders);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");
        XLSX.writeFile(workbook, "OrdersData.xlsx");
    };

    const deleteOrder = async (orderId) => {
        if (!window.confirm('Are you sure you want to delete this order?')) return;

        try {
            const res = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
                method: 'DELETE',
            });
            if (!res.ok) throw new Error('Failed to delete order');
           
            refreshData();
            success('Order deleted', `Order #${orderId} removed.`);
        } catch (err) {
            notifyError('Delete failed', err.message);
        }
    };

    return (
        <div className={style.viewContainer}>
            <div className={style.viewHeader}>
                <div>
                    <h2>Manage Orders</h2>
                    <p className={style.viewSubtitle}>Track and manage customer orders</p>
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
                        placeholder="Search by customer, phone, or order ID..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={style.searchInput}
                    />
                </div>
                <select onChange={(e) => setFilter(e.target.value)} className={style.select}>
                    <option value="All">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="Paid">Paid</option>
                    <option value="Unpaid">Unpaid</option>
                    <option value="Refunded">Refunded</option>
                </select>
            </div>

            <div className={style.tableContainer}>
                <table className={style.dataTable}>
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Customer</th>
                            <th>Contact</th>
                            <th>Total</th>
                            <th>Order Status</th>
                            <th>Payment</th>
                            <th>Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOrders.map(o => (
                            <React.Fragment key={o.order_id}>
                                <tr>
                                    <td><span className={style.orderId}>#{o.order_id}</span></td>
                                    <td>{o.customer_name}</td>
                                    <td>{o.contact_number}</td>
                                    <td><strong>${parseFloat(o.total_amount).toFixed(2)}</strong></td>
                                    <td>
                                        <select 
                                            value={o.order_status}
                                            onChange={(e) => handleStatusChange(o.order_id, 'order_status', e.target.value)}
                                            className={style.statusSelect}
                                        >
                                            <option>Pending</option>
                                            <option>Processing</option>
                                            <option>Shipped</option>
                                            <option>Delivered</option>
                                            <option>Cancelled</option>
                                        </select>
                                    </td>
                                    <td>
                                        <select 
                                            value={o.payment_status}
                                            onChange={(e) => handleStatusChange(o.order_id, 'payment_status', e.target.value)}
                                            className={style.statusSelect}
                                        >
                                            <option>Unpaid</option>
                                            <option>Paid</option>
                                            <option>Refunded</option>
                                        </select>
                                    </td>
                                    <td>{new Date(o.created_at).toLocaleDateString()}</td>
                                    <td className={style.actionsCell}>
                                        <button 
                                            className={style.viewBtn}
                                            onClick={() => toggleOrderDetails(o.order_id)}
                                            title="View details"
                                        >
                                            {expandedOrderId === o.order_id ? <EyeOff size={14} /> : <Eye size={14} />}
                                        </button>
                                        <button 
                                            className={style.deleteBtn}
                                            onClick={() => deleteOrder(o.order_id)}
                                            title="Delete order"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </td>
                                </tr>
                                {expandedOrderId === o.order_id && (
                                    <tr>
                                        <td colSpan="8" className={style.orderDetailsCell}>
                                            {detailsLoading && <p className={style.loadingText}>Loading details...</p>}
                                            {detailedOrder && (
                                                <Suspense fallback={<PremiumLoader title="Loading order details" subtitle="Fetching items and totals" variant="inline" />}>
                                                    <OrderDetails order={o} items={detailedOrder.items} />
                                                </Suspense>
                                            )}
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default OrdersView;
