import React, { useState, useEffect } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Plus, X } from 'lucide-react';
import { Badge } from '../components/common/Badge';
import { Input } from '../components/common/Input';
import { useAuth } from '../context/AuthContext.jsx';
import {
    getTickets,
    getTechnicians,
    createTicket,
    updateTicketStatus,
    rejectTicket,
    assignTechnician,
    getResources,
    getTicketComments,
    addTicketComment,
    updateTicketComment,
    deleteTicketComment
} from '../services/api';

export const Tickets = () => {
    const { user } = useAuth();
    const currentUserId = user?.id || 1;
    const [tickets, setTickets] = useState([]);
    const [technicians, setTechnicians] = useState([]);
    const [resources, setResources] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [selectedImages, setSelectedImages] = useState([]);
    const [assigneeByTicket, setAssigneeByTicket] = useState({});
    const [statusNoteByTicket, setStatusNoteByTicket] = useState({});
    const [commentsByTicket, setCommentsByTicket] = useState({});
    const [newCommentByTicket, setNewCommentByTicket] = useState({});
    const [editingCommentById, setEditingCommentById] = useState({});
    const [editingTextByCommentId, setEditingTextByCommentId] = useState({});
    const [formData, setFormData] = useState({
        category: '',
        description: '',
        priority: 'LOW',
        contactDetails: '',
        locationOrResource: '',
        resourceId: ''
    });

    const fetchData = async () => {
        let ticketsData = [];

        try {
            const resTick = await getTickets();
            setTickets(resTick.data);
            ticketsData = resTick.data;
        } catch (e) {
            console.error(e);
            return;
        }

        try {
            const resTech = await getTechnicians();
            setTechnicians(resTech.data);
        } catch (e) {
            console.error('Failed to load technicians', e);
            setTechnicians([]);
        }

        try {
            const resRes = await getResources();
            setResources(resRes.data);
        } catch (e) {
            console.error('Failed to load resources', e);
            setResources([]);
        }

        try {
            const commentPairs = await Promise.all(
                ticketsData.map(async (ticket) => {
                    const commentRes = await getTicketComments(ticket.id);
                    return [ticket.id, commentRes.data];
                })
            );
            setCommentsByTicket(Object.fromEntries(commentPairs));
        } catch (e) {
            console.error('Failed to load ticket comments', e);
            setCommentsByTicket({});
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await createTicket(currentUserId, {
                ...formData,
                images: selectedImages
            });
            fetchData();
            setShowForm(false);
            setSelectedImages([]);
            setFormData({
                category: '',
                description: '',
                priority: 'LOW',
                contactDetails: '',
                locationOrResource: '',
                resourceId: ''
            });
        } catch (e) {
            alert('Error creating ticket.');
        }
    };

    const handleImageSelection = (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 3) {
            alert('You can upload up to 3 image evidence files.');
            e.target.value = '';
            return;
        }
        setSelectedImages(files);
    };

    const handleStatusChange = async (id, status) => {
        const note = statusNoteByTicket[id] || '';
        try {
            await updateTicketStatus(id, status, note);
            setStatusNoteByTicket({ ...statusNoteByTicket, [id]: '' });
            fetchData();
        } catch (e) {
            alert('Error updating ticket status.');
        }
    };

    const handleReject = async (id) => {
        const reason = window.prompt('Enter rejection reason:');
        if (!reason) {
            return;
        }

        try {
            await rejectTicket(id, reason);
            fetchData();
        } catch (e) {
            alert('Error rejecting ticket.');
        }
    };

    const handleAssignTechnician = async (ticketId) => {
        const selectedTechId = assigneeByTicket[ticketId];
        if (!selectedTechId) {
            alert('Please select a technician first.');
            return;
        }

        try {
            await assignTechnician(ticketId, Number(selectedTechId));
            fetchData();
        } catch (e) {
            alert('Error assigning technician.');
        }
    };

    const handleAddComment = async (ticketId) => {
        const text = (newCommentByTicket[ticketId] || '').trim();
        if (!text) {
            return;
        }
        try {
            await addTicketComment(ticketId, currentUserId, text);
            setNewCommentByTicket({ ...newCommentByTicket, [ticketId]: '' });
            fetchData();
        } catch (e) {
            alert('Error adding comment.');
        }
    };

    const handleUpdateComment = async (ticketId, commentId) => {
        const text = (editingTextByCommentId[commentId] || '').trim();
        if (!text) {
            return;
        }
        try {
            await updateTicketComment(ticketId, commentId, currentUserId, text);
            setEditingCommentById({ ...editingCommentById, [commentId]: false });
            fetchData();
        } catch (e) {
            alert('Error updating comment.');
        }
    };

    const handleDeleteComment = async (ticketId, commentId) => {
        try {
            await deleteTicketComment(ticketId, commentId, currentUserId);
            fetchData();
        } catch (e) {
            alert('Error deleting comment.');
        }
    };

    const getPriorityBadge = (p) => {
        switch (p) {
            case 'HIGH': return 'danger';
            case 'MEDIUM': return 'warning';
            default: return 'neutral';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Incident Ticketing</h1>
                </div>
                <Button onClick={() => setShowForm(!showForm)} className="gap-2">
                    {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {showForm ? 'Cancel' : 'Report Issue'}
                </Button>
            </div>

            {showForm && (
                <Card className="mb-6 border-accent/50 border">
                    <h3 className="text-lg font-bold text-white mb-4">Submit New Ticket</h3>
                    <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <select
                            className="flex h-10 w-full rounded-md border border-gray-700 bg-gray-800/50 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            required
                        >
                            <option value="">Select category</option>
                            <option value="Electrical">Electrical</option>
                            <option value="IT issue">IT issue</option>
                            <option value="HVAC">HVAC</option>
                            <option value="Plumbing">Plumbing</option>
                            <option value="General">General</option>
                        </select>
                        <select
                            className="flex h-10 w-full rounded-md border border-gray-700 bg-gray-800/50 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
                            value={formData.priority} onChange={e => setFormData({ ...formData, priority: e.target.value })}
                        >
                            <option value="LOW">Low</option>
                            <option value="MEDIUM">Medium</option>
                            <option value="HIGH">High</option>
                        </select>
                        <Input
                            placeholder="Contact details (email/phone)"
                            value={formData.contactDetails}
                            onChange={(e) => setFormData({ ...formData, contactDetails: e.target.value })}
                            required
                        />
                        <Input
                            placeholder="Location / resource (e.g., Lab A2 projector)"
                            value={formData.locationOrResource}
                            onChange={(e) => setFormData({ ...formData, locationOrResource: e.target.value })}
                            required
                        />
                        <select
                            className="flex h-10 w-full rounded-md border border-gray-700 bg-gray-800/50 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
                            value={formData.resourceId} onChange={e => setFormData({ ...formData, resourceId: e.target.value })}
                        >
                            <option value="">No linked system resource</option>
                            {resources.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                        </select>
                        <div className="md:col-span-2">
                            <Input
                                placeholder="Description (what happened?)"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                required
                            />
                        </div>
                        <div className="md:col-span-2">
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleImageSelection}
                                className="block w-full text-sm text-gray-300 file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:opacity-90"
                            />
                            <p className="text-xs text-gray-400 mt-2">
                                Add image evidence (max 3). Example: photo of broken screen.
                            </p>
                            {selectedImages.length > 0 && (
                                <p className="text-xs text-gray-300 mt-1">{selectedImages.length} image(s) selected</p>
                            )}
                        </div>

                        <div className="md:col-span-2 flex justify-end mt-2">
                            <Button type="submit" className="bg-accent shadow-[0_0_15px_rgba(59,130,246,0.5)]">Submit Ticket</Button>
                        </div>
                    </form>
                </Card>
            )}

            <div className="bg-card border flex flex-col border-gray-800 rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-400">
                        <thead className="bg-gray-900/50 text-gray-300 border-b border-gray-800">
                            <tr>
                                <th className="px-6 py-4 font-medium">Ticket ID</th>
                                <th className="px-6 py-4 font-medium">Issue Detail</th>
                                <th className="px-6 py-4 font-medium">Location / Resource</th>
                                <th className="px-6 py-4 font-medium">Contact</th>
                                <th className="px-6 py-4 font-medium">Assigned Technician</th>
                                <th className="px-6 py-4 font-medium">Evidence</th>
                                <th className="px-6 py-4 font-medium">Priority</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium">Resolution Notes</th>
                                <th className="px-6 py-4 font-medium">Comments</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {tickets.map((t) => (
                                <tr key={t.id} className="hover:bg-gray-800/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-primary">TKT-{t.id}</td>
                                    <td className="px-6 py-4">
                                        <p className="text-white font-medium">{t.category}</p>
                                        <p className="text-xs mt-1">{t.description}</p>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-300">{t.locationOrResource || '-'}</td>
                                    <td className="px-6 py-4 text-sm text-gray-300">{t.contactDetails || '-'}</td>
                                    <td className="px-6 py-4 text-sm text-gray-300">
                                        {t.technicianName ? `IT Technician - ${t.technicianName}` : 'Unassigned'}
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        {t.attachmentUrls ? (
                                            t.attachmentUrls.split(',').map((url, idx) => (
                                                <a
                                                    key={`${t.id}-img-${idx}`}
                                                    href={`http://localhost:8081${url}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="text-primary hover:underline mr-2"
                                                >
                                                    Image {idx + 1}
                                                </a>
                                            ))
                                        ) : '-'}
                                    </td>
                                    <td className="px-6 py-4"><Badge variant={getPriorityBadge(t.priority)}>{t.priority}</Badge></td>
                                    <td className="px-6 py-4">
                                        <Badge variant={t.status === 'RESOLVED' || t.status === 'CLOSED' ? 'success' : t.status === 'REJECTED' ? 'danger' : 'default'}>
                                            {t.status}
                                        </Badge>
                                        {t.status === 'REJECTED' && t.rejectedReason && (
                                            <p className="text-xs text-red-300 mt-1">{t.rejectedReason}</p>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-xs text-gray-300 whitespace-pre-line">{t.resolutionNotes || '-'}</td>
                                    <td className="px-6 py-4 min-w-80">
                                        <div className="space-y-2">
                                            {(commentsByTicket[t.id] || []).map((c) => (
                                                <div key={c.id} className="text-xs bg-gray-800/60 rounded p-2">
                                                    <p className="text-gray-300 mb-1">
                                                        <span className="font-semibold text-white">{c.userName}:</span>
                                                    </p>
                                                    {editingCommentById[c.id] ? (
                                                        <div className="space-y-1">
                                                            <Input
                                                                value={editingTextByCommentId[c.id] || ''}
                                                                onChange={(e) => setEditingTextByCommentId({ ...editingTextByCommentId, [c.id]: e.target.value })}
                                                                className="h-8 text-xs"
                                                            />
                                                            <div>
                                                                <Button size="sm" variant="outline" className="mr-1" onClick={() => handleUpdateComment(t.id, c.id)}>Save</Button>
                                                                <Button size="sm" variant="outline" onClick={() => setEditingCommentById({ ...editingCommentById, [c.id]: false })}>Cancel</Button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <p className="text-gray-200">{c.comment}</p>
                                                    )}
                                                    {c.userId === currentUserId && !editingCommentById[c.id] && (
                                                        <div className="mt-1">
                                                            <button
                                                                type="button"
                                                                className="text-primary text-[11px] mr-2"
                                                                onClick={() => {
                                                                    setEditingCommentById({ ...editingCommentById, [c.id]: true });
                                                                    setEditingTextByCommentId({ ...editingTextByCommentId, [c.id]: c.comment });
                                                                }}
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="text-red-300 text-[11px]"
                                                                onClick={() => handleDeleteComment(t.id, c.id)}
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                            <div className="flex gap-2">
                                                <Input
                                                    placeholder="Add comment..."
                                                    value={newCommentByTicket[t.id] || ''}
                                                    onChange={(e) => setNewCommentByTicket({ ...newCommentByTicket, [t.id]: e.target.value })}
                                                    className="h-8 text-xs"
                                                />
                                                <Button size="sm" variant="outline" onClick={() => handleAddComment(t.id)}>Post</Button>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {t.status === 'OPEN' && (
                                            <>
                                                <select
                                                    className="h-8 rounded-md border border-gray-700 bg-gray-800/50 px-2 py-1 text-xs text-white mr-2"
                                                    value={assigneeByTicket[t.id] || ''}
                                                    onChange={(e) => setAssigneeByTicket({ ...assigneeByTicket, [t.id]: e.target.value })}
                                                >
                                                    <option value="">Assign technician</option>
                                                    {technicians.map((tech) => (
                                                        <option key={tech.id} value={tech.id}>
                                                            IT Technician - {tech.name}
                                                        </option>
                                                    ))}
                                                </select>
                                                <Button variant="outline" size="sm" onClick={() => handleAssignTechnician(t.id)} className="mr-2">
                                                    Assign
                                                </Button>
                                                <Button variant="outline" size="sm" onClick={() => handleStatusChange(t.id, 'IN_PROGRESS')} className="mr-2">
                                                    Start
                                                </Button>
                                                <Button variant="outline" size="sm" onClick={() => handleReject(t.id)}>
                                                    Reject
                                                </Button>
                                            </>
                                        )}
                                        {t.status === 'IN_PROGRESS' && (
                                            <>
                                                <Input
                                                    placeholder='Add progress note (e.g., "Replaced HDMI cable and tested successfully")'
                                                    value={statusNoteByTicket[t.id] || ''}
                                                    onChange={(e) => setStatusNoteByTicket({ ...statusNoteByTicket, [t.id]: e.target.value })}
                                                    className="h-8 text-xs mr-2 w-72"
                                                />
                                                <Button variant="outline" size="sm" onClick={() => handleStatusChange(t.id, 'RESOLVED')}>
                                                    Resolve
                                                </Button>
                                            </>
                                        )}
                                        {t.status === 'RESOLVED' && (
                                            <>
                                                <Input
                                                    placeholder="Add final verification note"
                                                    value={statusNoteByTicket[t.id] || ''}
                                                    onChange={(e) => setStatusNoteByTicket({ ...statusNoteByTicket, [t.id]: e.target.value })}
                                                    className="h-8 text-xs mr-2 w-56"
                                                />
                                                <Button variant="outline" size="sm" onClick={() => handleStatusChange(t.id, 'CLOSED')}>
                                                    Close
                                                </Button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {tickets.length === 0 && <tr><td colSpan="11" className="p-6 text-center text-gray-500">No tickets submitted.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
