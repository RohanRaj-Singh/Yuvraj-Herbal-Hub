import React from 'react';
import style from '../admin.module.css';
import { buildAssetUrl } from '../../../utils/media';
const getImageUrl = (path) => buildAssetUrl(path);


const OrderDetails = ({ order, items }) => (
    <div className={style.orderDetailsContainer}>
        <div className={style.orderDetailsHeader}>
            <div>
                <h4>Order Details</h4>
                <p className={style.orderInfo}>
                    <strong>Shipping Address:</strong> {order.shipping_address}
                </p>
                {order.email && <p className={style.orderInfo}><strong>Email:</strong> {order.email}</p>}
            </div>
        </div>
        
        <table className={style.subDataTable}>
            <thead>
                <tr>
                    <th>Image</th>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Subtotal</th>
                </tr>
            </thead>
            <tbody>
                {items.map(item => (
                    <tr key={item.order_item_id}>
                        <td>

                            <img 
                                src={getImageUrl(item.product.image_url)} 
                                alt={item.product_title} 
                                className={style.itemImage}
                            />
                        </td>
                        <td>{item.product.title}</td>
                        <td><span className={style.quantityBadge}>{item.quantity}</span></td>
                        <td>${parseFloat(item.price_per_item).toFixed(2)}</td>
                        <td><strong>${(parseFloat(item.price_per_item) * item.quantity).toFixed(2)}</strong></td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

export default OrderDetails;
