import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import style from '../admin.module.css';
import { API_BASE_URL } from '../Admin';
import { useNotifications } from '../../../components/notifications/NotificationProvider';
import { buildAssetUrl } from '../../../utils/media';

const getImageUrl = (path) => buildAssetUrl(path);


const CategoriesView = ({ categories, refreshData }) => {
    const [title, setTitle] = useState('');
    const [image, setImage] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const { success, error: notifyError, warning } = useNotifications();

    const handleAddCategory = async (e) => {
        e.preventDefault();
        if (!title || !image) {
            warning('Missing fields', 'Title and image are required.');
            return;
        }
        const formData = new FormData();
        formData.append('title', title);
        formData.append('image', image);

        try {
            const res = await fetch(`${API_BASE_URL}/categories`, { method: 'POST', body: formData });
            if (!res.ok) throw new Error('Failed to add category');
            success('Category added', 'The category is now available.');
            setTitle('');
            setImage(null);
            setShowForm(false);
            refreshData();
        } catch (err) {
            notifyError('Add failed', err.message);
        }
    };
    
    const handleDeleteCategory = async (id) => {
        if (!window.confirm('Are you sure you want to delete this category?')) return;
        try {
            const res = await fetch(`${API_BASE_URL}/categories/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete category');
            refreshData();
            success('Category deleted', 'The category was removed.');
        } catch (err) {
            notifyError('Delete failed', err.message);
        }
    };
    
    return (
        <div className={style.viewContainer}>
            <div className={style.viewHeader}>
                <div>
                    <h2>Manage Categories</h2>
                    <p className={style.viewSubtitle}>Organize your product categories</p>
                </div>
                <button className={style.primaryBtn} onClick={() => setShowForm(!showForm)}>
                    <Plus size={18} />
                    Add Category
                </button>
            </div>

            {showForm && (
                <div className={style.formCard}>
                    <h3>Add New Category</h3>
                    <form onSubmit={handleAddCategory} className={style.form}>
                        <input 
                            type="text" 
                            placeholder="Category Title" 
                            value={title} 
                            onChange={e => setTitle(e.target.value)} 
                            required 
                            className={style.input}
                        />
                        <div className={style.fileInput}>
                            <label>Category Image</label>
                            <input type="file" onChange={e => setImage(e.target.files[0])} required accept="image/*" />
                        </div>
                        <div className={style.formActions}>
                            <button type="submit" className={style.primaryBtn}>Add Category</button>
                            <button type="button" className={style.secondaryBtn} onClick={() => setShowForm(false)}>Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            <div className={style.categoryGrid}>
                {categories.map(cat => (
                    <div key={cat.category_id} className={style.categoryCard}>
                        <img src={getImageUrl(cat.image_url)} alt={cat.title} />
                        <div className={style.categoryCardContent}>
                            <h4>{cat.title}</h4>
                            <button className={style.deleteBtn} onClick={() => handleDeleteCategory(cat.category_id)}>
                                <Trash2 size={16} />
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CategoriesView;
