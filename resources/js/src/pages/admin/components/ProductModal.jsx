import React, { useState } from 'react';
import style from '../admin.module.css';
import { API_BASE_URL } from '../Admin';
import { useNotifications } from '../../../components/notifications/NotificationProvider';

const ProductModal = ({ product, categories, closeModal, refreshData }) => {
    const [formData, setFormData] = useState({
        category_id: product?.category_id || '',
        title: product?.title || '',
        description: product?.description || '',
        cost_price: product?.cost_price || '',
        selling_price: product?.selling_price || '',
        discount_percent: product?.discount_percent || 0,
        stock_quantity: product?.stock_quantity || 0,
        is_active: product ? (product.is_active ? '1' : '0') : '1',
    });
    const [image, setImage] = useState(null);
    const { success, error: notifyError } = useNotifications();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        for (const key in formData) {
            data.append(key, formData[key]);
        }
        if (image) {
            data.append('image', image);
        }

        const url = product ? `${API_BASE_URL}/products/${product.product_id}` : `${API_BASE_URL}/products`;
        const method = product ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, { method, body: data });
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || 'Operation failed');
            }
            success(
                `Product ${product ? 'updated' : 'added'}`,
                product ? 'The product details were saved.' : 'The new product is now live.'
            );
            refreshData();
            closeModal();
        } catch (err) {
            notifyError('Save failed', err.message);
        }
    };

    return (
        <div className={style.modalOverlay} onClick={closeModal}>
            <div className={style.modalContent} onClick={e => e.stopPropagation()}>
                <div className={style.modalHeader}>
                    <h2>{product ? 'Edit Product' : 'Add New Product'}</h2>
                    <button className={style.closeBtn} onClick={closeModal}>×</button>
                </div>
                <form onSubmit={handleSubmit} className={style.modalForm}>
                    <div className={style.formGrid}>
                        <input 
                            type="text" 
                            name="title" 
                            placeholder="Product Title" 
                            value={formData.title} 
                            onChange={handleChange} 
                            required 
                            className={style.input}
                        />
                        <select 
                            name="category_id" 
                            value={formData.category_id} 
                            onChange={handleChange} 
                            required
                            className={style.select}
                        >
                            <option value="">Select Category</option>
                            {categories.map(c => <option key={c.category_id} value={c.category_id}>{c.title}</option>)}
                        </select>
                        <input 
                            type="number" 
                            name="cost_price" 
                            placeholder="Cost Price" 
                            value={formData.cost_price} 
                            onChange={handleChange} 
                            required 
                            step="0.01"
                            className={style.input}
                        />
                        <input 
                            type="number" 
                            name="selling_price" 
                            placeholder="Selling Price" 
                            value={formData.selling_price} 
                            onChange={handleChange} 
                            required 
                            step="0.01"
                            className={style.input}
                        />
                        <input 
                            type="number" 
                            name="discount_percent" 
                            placeholder="Discount %" 
                            value={formData.discount_percent} 
                            onChange={handleChange} 
                            min="0" 
                            max="100"
                            className={style.input}
                        />
                        <input 
                            type="number" 
                            name="stock_quantity" 
                            placeholder="Stock Quantity" 
                            value={formData.stock_quantity} 
                            onChange={handleChange} 
                            min="0"
                            className={style.input}
                        />
                        <select 
                            name="is_active" 
                            value={formData.is_active} 
                            onChange={handleChange}
                            className={style.select}
                        >
                            <option value="1">Active</option>
                            <option value="0">Inactive</option>
                        </select>
                        <div className={style.fileInput}>
                            <label>Product Image</label>
                            <input type="file" name="image" onChange={(e) => setImage(e.target.files[0])} accept="image/*" />
                        </div>
                    </div>
                    <textarea 
                        name="description" 
                        placeholder="Product Description" 
                        value={formData.description} 
                        onChange={handleChange}
                        className={style.textarea}
                    ></textarea>
                    <div className={style.modalActions}>
                        <button type="submit" className={style.primaryBtn}>{product ? 'Update Product' : 'Add Product'}</button>
                        <button type="button" className={style.secondaryBtn} onClick={closeModal}>Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProductModal;
