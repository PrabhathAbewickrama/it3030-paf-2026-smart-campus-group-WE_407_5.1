import React, { useEffect, useState } from 'react';
import { Plus, Search, Trash2, Edit2, X } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Input } from '../../components/common/Input';
import { getAssets, createAsset, updateAsset, deleteAsset, updateAssetStatus } from '../../services/api';
import { useNotifications } from '../../context/NotificationContext.jsx';

export const AssetsList = () => {
    const [assets, setAssets] = useState([]);
    const [filteredAssets, setFilteredAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        location: '',
        type: '',
        status: 'AVAILABLE'
    });
    const [editingId, setEditingId] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const { addNotification } = useNotifications();

    const emptyForm = {
        name: '',
        description: '',
        location: '',
        type: '',
        status: 'AVAILABLE'
    };

    const resetForm = () => {
        setFormData(emptyForm);
        setEditingId(null);
        setShowForm(false);
    };

    const fetchAssets = async () => {
        try {
            setLoading(true);
            const response = await getAssets();
            setAssets(response.data || []);
            filterAssets(response.data || [], searchTerm, statusFilter);
        } catch (error) {
            console.error('Error fetching assets:', error);
            addNotification({
                title: 'Error',
                message: 'Failed to load assets',
                type: 'error',
                module: 'assets'
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAssets();
    }, []);

    const filterAssets = (data, search, status) => {
        let filtered = data;
        if (search) {
            filtered = filtered.filter(asset =>
                asset.name?.toLowerCase().includes(search.toLowerCase()) ||
                asset.location?.toLowerCase().includes(search.toLowerCase()) ||
                asset.type?.toLowerCase().includes(search.toLowerCase())
            );
        }
        if (status) {
            filtered = filtered.filter(asset => asset.status === status);
        }
        setFilteredAssets(filtered);
    };

    useEffect(() => {
        filterAssets(assets, searchTerm, statusFilter);
    }, [searchTerm, statusFilter, assets]);

    const handleSubmitAsset = async (e) => {
        e.preventDefault();
        
        // Validate form
        if (!formData.name.trim()) {
            addNotification({
                title: 'Validation Error',
                message: 'Asset name is required',
                type: 'error',
                module: 'assets'
            });
            return;
        }
        
        if (!formData.location.trim()) {
            addNotification({
                title: 'Validation Error',
                message: 'Location is required',
                type: 'error',
                module: 'assets'
            });
            return;
        }
        
        if (!formData.type.trim()) {
            addNotification({
                title: 'Validation Error',
                message: 'Asset type is required',
                type: 'error',
                module: 'assets'
            });
            return;
        }

        try {
            setSubmitting(true);
            const payload = {
                name: formData.name.trim(),
                location: formData.location.trim(),
                type: formData.type.trim(),
                description: formData.description.trim(),
                status: formData.status
            };

            if (editingId) {
                await updateAsset(editingId, payload);
            } else {
                await createAsset(payload);
            }
            
            addNotification({
                title: editingId ? 'Asset updated' : 'Asset created',
                message: `${formData.name} has been successfully ${editingId ? 'updated' : 'added to inventory'}`,
                type: 'success',
                module: 'assets'
            });
            
            resetForm();
            fetchAssets();
        } catch (error) {
            addNotification({
                title: 'Error',
                message: error.response?.data?.message || `Failed to ${editingId ? 'update' : 'create'} asset`,
                type: 'error',
                module: 'assets'
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (asset) => {
        setEditingId(asset.id);
        setFormData({
            name: asset.name || '',
            description: asset.description || '',
            location: asset.location || '',
            type: asset.type || '',
            status: asset.status || 'AVAILABLE'
        });
        setShowForm(true);
    };

    const handleStatusChange = async (assetId, status) => {
        try {
            await updateAssetStatus(assetId, status);
            addNotification({
                title: 'Asset status updated',
                message: `Asset status changed to ${status}`,
                type: 'success',
                module: 'assets'
            });
            fetchAssets();
        } catch (error) {
            addNotification({
                title: 'Error',
                message: error.response?.data?.message || 'Failed to update asset status',
                type: 'error',
                module: 'assets'
            });
        }
    };

    const handleDelete = async (assetId) => {
        if (!window.confirm('Are you sure you want to delete this asset?')) return;
        
        try {
            await deleteAsset(assetId);
            addNotification({
                title: 'Asset deleted',
                message: 'Asset has been successfully removed from inventory',
                type: 'success',
                module: 'assets'
            });
            fetchAssets();
        } catch (error) {
            addNotification({
                title: 'Error',
                message: 'Failed to delete asset',
                type: 'error',
                module: 'assets'
            });
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'AVAILABLE':
                return 'success';
            case 'IN_USE':
                return 'warning';
            case 'MAINTENANCE':
                return 'danger';
            default:
                return 'default';
        }
    };

    return (
        <div className="space-y-8">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-8">
                <h1 className="text-4xl font-bold text-white">Assets Management</h1>
                <p className="mt-2 text-purple-100">Manage campus equipment and resources</p>
            </div>

            {!showForm && (
                <Button
                    onClick={() => {
                        setFormData(emptyForm);
                        setEditingId(null);
                        setShowForm(true);
                    }}
                    className="gap-2 self-start"
                >
                    <Plus className="w-4 h-4" />
                    Add New Asset
                </Button>
            )}

            {showForm && (
                <Card className="border border-accent/50">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-white">{editingId ? 'Edit Asset' : 'Upload New Asset'}</h3>
                        <button 
                            onClick={resetForm}
                            className="text-gray-400 hover:text-white"
                            type="button"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    
                    <form onSubmit={handleSubmitAsset} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Asset Name */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-200 mb-2">Asset Name *</label>
                            <Input
                                placeholder="e.g., Projector, Laptop, Whiteboard"
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                required
                            />
                        </div>

                        {/* Asset Type */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-200 mb-2">Asset Type *</label>
                            <select
                                className="w-full px-3 py-2 rounded-lg border border-gray-700 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-primary"
                                value={formData.type}
                                onChange={(e) => setFormData({...formData, type: e.target.value})}
                                required
                            >
                                <option value="">Select asset type</option>
                                <option value="Equipment">Equipment</option>
                                <option value="Furniture">Furniture</option>
                                <option value="Technology">Technology</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        {/* Location */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-200 mb-2">Location *</label>
                            <Input
                                placeholder="e.g., Lab A2, Lecture Hall 101"
                                value={formData.location}
                                onChange={(e) => setFormData({...formData, location: e.target.value})}
                                required
                            />
                        </div>

                        {/* Status */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-200 mb-2">Status *</label>
                            <select
                                className="w-full px-3 py-2 rounded-lg border border-gray-700 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-primary"
                                value={formData.status}
                                onChange={(e) => setFormData({...formData, status: e.target.value})}
                                required
                            >
                                <option value="AVAILABLE">Available</option>
                                <option value="IN_USE">In Use</option>
                                <option value="MAINTENANCE">Maintenance</option>
                            </select>
                        </div>

                        {/* Description - Full Width */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-200 mb-2">Description</label>
                            <textarea
                                placeholder="Add asset details, specifications, or notes..."
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                className="w-full px-3 py-2 rounded-lg border border-gray-700 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                                rows="4"
                            />
                        </div>

                        {/* Form Actions */}
                        <div className="md:col-span-2 flex gap-3">
                            <Button 
                                type="submit" 
                                className="bg-accent shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                                disabled={submitting}
                            >
                                {submitting ? 'Saving...' : editingId ? 'Update Asset' : 'Upload Asset'}
                            </Button>
                            <Button 
                                type="button" 
                                variant="outline" 
                                onClick={resetForm}
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                </Card>
            )}

            {/* Search and Filter */}
            <div className="flex gap-4 flex-col sm:flex-row">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <Input
                        placeholder="Search assets by name or location..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <select
                    className="px-4 py-2 rounded-lg border border-gray-700 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-primary"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="">All Status</option>
                    <option value="AVAILABLE">Available</option>
                    <option value="IN_USE">In Use</option>
                    <option value="MAINTENANCE">Maintenance</option>
                </select>
            </div>

            {/* Assets Table */}
            <div className="flex flex-col overflow-hidden rounded-xl border border-gray-800 bg-card shadow-sm">
                <div className="border-b border-gray-800 bg-gray-900/40 px-6 py-4">
                    <h2 className="text-lg font-semibold text-white">Inventory</h2>
                    <p className="mt-1 text-sm text-gray-400">All assets in the system with current status</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-400">
                        <thead className="border-b border-gray-800 bg-gray-900/50 text-gray-300">
                            <tr>
                                <th className="px-6 py-4 font-medium">Asset Name</th>
                                <th className="px-6 py-4 font-medium">Type</th>
                                <th className="px-6 py-4 font-medium">Location</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 text-right font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                                        Loading assets...
                                    </td>
                                </tr>
                            ) : filteredAssets.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                                        {searchTerm || statusFilter ? 'No assets match your search' : 'No assets yet. Click "Add New Asset" to get started'}
                                    </td>
                                </tr>
                            ) : (
                                filteredAssets.map((asset) => (
                                    <tr key={asset.id} className="hover:bg-gray-800/50 transition">
                                        <td className="px-6 py-4 font-medium text-white">{asset.name}</td>
                                        <td className="px-6 py-4">{asset.type}</td>
                                        <td className="px-6 py-4">{asset.location}</td>
                                        <td className="px-6 py-4">
                                            <div className="inline-flex items-center gap-2">
                                                <Badge variant={getStatusColor(asset.status)}>
                                                    {asset.status}
                                                </Badge>
                                                <select
                                                    value={asset.status}
                                                    onChange={(e) => handleStatusChange(asset.id, e.target.value)}
                                                    className="rounded-md border border-gray-700 bg-gray-800 px-2 py-1 text-xs text-white focus:outline-none focus:ring-2 focus:ring-primary"
                                                >
                                                    <option value="AVAILABLE">Available</option>
                                                    <option value="IN_USE">In Use</option>
                                                    <option value="MAINTENANCE">Maintenance</option>
                                                </select>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleEdit(asset)}
                                                className="text-primary hover:text-primary/80 mr-3"
                                                title="Edit asset"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(asset.id)}
                                                className="text-red-400 hover:text-red-300"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AssetsList;
