import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import style from '../admin.module.css';
import { useNotifications } from '../../../components/notifications/NotificationProvider';
import { buildAssetUrl } from '../../../utils/media';

export const API_BASE_url = `${import.meta.env.VITE_API_BASE_URL}`;
export const API_BASE = `${import.meta.env.VITE_API_BASE_URL}/api`;
const getImageUrl = (path) => buildAssetUrl(path);



const BannersView = ({ banners, refreshData }) => {
    const [formData, setFormData] = useState({ title: '', description: '', link_url: '' });
    const [image, setImage] = useState(null);
    const [mobile_image, setmobile_image] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const { success, error: notifyError, warning } = useNotifications();

    const handleAddBanner = async (e) => {
        e.preventDefault();
        if (!formData.title || !image || !mobile_image) {
            warning('Missing fields', 'Title and images are required for a banner.');
            return;
        }
        const data = new FormData();
        data.append('title', formData.title);
        data.append('description', formData.description);
        data.append('link_url', formData.link_url);
        data.append('image', image);
        data.append('mobile_image', mobile_image);

        try {
            const res = await fetch(`${API_BASE}/banners`, { method: 'POST', body: data });
            if (!res.ok) throw new Error('Failed to add banner');
            success('Banner added', 'The banner is live on the homepage.');
            setFormData({ title: '', description: '', link_url: '' });
            setImage(null);
            setmobile_image(null);
            setShowForm(false);
            refreshData();
        } catch (err) {
            notifyError('Add failed', err.message);
        }
    };
    
    const handleDeleteBanner = async (id) => {
        if (!window.confirm('Are you sure you want to delete this banner?')) return;
        try {
            const res = await fetch(`${API_BASE}/banners/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete banner');
            refreshData();
            success('Banner deleted', 'The banner was removed.');
        } catch (err) {
            notifyError('Delete failed', err.message);
        }
    };
    
    return (
        <div className={style.viewContainer}>
            <div className={style.viewHeader}>
                <div>
                    <h2>Manage Banners</h2>
                    <p className={style.viewSubtitle}>Control homepage banner carousel</p>
                </div>
                <button className={style.primaryBtn} onClick={() => setShowForm(!showForm)}>
                    <Plus size={18} />
                    Add Banner
                </button>
            </div>

            {showForm && (
                <div className={style.formCard}>
                    <h3>Add New Banner</h3>
                    <form onSubmit={handleAddBanner} className={style.form}>
                        <div className={style.formGrid}>
                            <input 
                                type="text" 
                                placeholder="Banner Title" 
                                value={formData.title} 
                                onChange={e => setFormData({...formData, title: e.target.value})} 
                                required 
                                className={style.input}
                            />
                            <input 
                                type="text" 
                                placeholder="Link URL (Optional)" 
                                value={formData.link_url} 
                                onChange={e => setFormData({...formData, link_url: e.target.value})} 
                                className={style.input}
                            />
                        </div>
                        <textarea 
                            placeholder="Description (Optional)" 
                            value={formData.description} 
                            onChange={e => setFormData({...formData, description: e.target.value})}
                            className={style.textarea}
                        />
                        <div className={style.formGrid}>
                            <div className={style.fileInput}>
                                <label>Desktop Image</label>
                                <input type="file" onChange={e => setImage(e.target.files[0])} required accept="image/*" />
                            </div>
                            <div className={style.fileInput}>
                                <label>Mobile Image</label>
                                <input type="file" onChange={e => setmobile_image(e.target.files[0])} required accept="image/*" />
                            </div>
                        </div>
                        <div className={style.formActions}>
                            <button type="submit" className={style.primaryBtn}>Add Banner</button>
                            <button type="button" className={style.secondaryBtn} onClick={() => setShowForm(false)}>Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            <div className={style.tableContainer}>
                <table className={style.dataTable}>
                    <thead>
                        <tr>
                            <th>Desktop Image</th>
                            <th>Mobile Image</th>
                            <th>Title</th>
                            <th>Description</th>
                            <th>Link</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {banners.map(banner => (
                            <tr key={banner.banner_id}>
                          
                                <td><img src={getImageUrl(banner.image_url)} alt={banner.title} className={style.tableImage} /></td>
                                <td><img src={getImageUrl(banner.mobile_image_url)} alt={banner.title} className={style.tableImage} /></td>
                                <td>{banner.title}</td>
                                <td>{banner.description || '-'}</td>
                                <td>{banner.link_url ? <a href={banner.link_url} target="_blank" rel="noopener noreferrer" className={style.link}>View</a> : '-'}</td>
                                <td>
                                    <button className={style.deleteBtn} onClick={() => handleDeleteBanner(banner.banner_id)}>
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default BannersView;
