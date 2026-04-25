import React, { useEffect, useState } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Plus, X } from 'lucide-react';
import { Badge } from '../components/common/Badge';
import { Input } from '../components/common/Input';
import { useAuth } from '../context/AuthContext.jsx';
import { useNotifications } from '../context/NotificationContext.jsx';
import { TicketOverview } from '../components/tickets/TicketOverview';
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
    deleteTicketComment,
    getUserSummary,
    registerUser
} from '../services/api';

export const Tickets = () => {
    const { user, loginWithProfile } = useAuth();
    const { addNotification } = useNotifications();
    const currentUserId = user?.id || 1;
    const currentRole = user?.role?.replace('ROLE_', '') || 'USER';
    const isStudentView = currentRole === 'USER';
    const isAdminView = currentRole === 'ADMIN';
    const isTechnicianView = currentRole === 'TECHNICIAN';
    const [tickets, setTickets] = useState([]);
    const [technicians, setTechnicians] = useState([]);
    const [summary, setSummary] = useState(null);
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
    const REGISTERED_USERS_KEY = 'smartcampus_registered_users';

    const syncCurrentUserToBackend = async () => {
        const normalizedEmail = (user?.email || user?.username || '').trim().toLowerCase();
        const registeredUsers = JSON.parse(localStorage.getItem(REGISTERED_USERS_KEY) || '[]');
        const matchedAccount = registeredUsers.find(
            (account) =>
                account.email === normalizedEmail &&
                account.role === currentRole
        );

        if (!matchedAccount?.password || !normalizedEmail) {
            throw new Error('Your account needs to be created again. Please sign up or log in again.');
        }

        const response = await registerUser({
            name: user?.name || matchedAccount.name || 'User',
            email: normalizedEmail,
            password: matchedAccount.password,
            role: currentRole
        });

        const syncedUser = {
            id: response.data.id,
            name: response.data.name,
            username: response.data.email,
            email: response.data.email,
            role: response.data.role
        };

        loginWithProfile(syncedUser);

        const nextRegisteredUsers = registeredUsers.map((account) =>
            account.email === normalizedEmail && account.role === currentRole
                ? { ...account, id: response.data.id }
                : account
        );
        localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(nextRegisteredUsers));

        return response.data.id;
    };

    const syncRegisteredTechniciansToBackend = async () => {
        const registeredUsers = JSON.parse(localStorage.getItem(REGISTERED_USERS_KEY) || '[]');
        const technicianAccounts = registeredUsers.filter(
            (account) => account.role === 'TECHNICIAN' && account.email && account.password
        );

        if (technicianAccounts.length === 0) {
            return [];
        }

        await Promise.all(
            technicianAccounts.map(async (account) => {
                try {
                    await registerUser({
                        name: account.name || 'Technician',
                        email: account.email,
                        password: account.password,
                        role: 'TECHNICIAN'
                    });
                } catch (error) {
                    if (error.response?.status !== 409) {
                        throw error;
                    }
                }
            })
        );

        const resTech = await getTechnicians();
        setTechnicians(resTech.data);
        return resTech.data;
    };

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

            if (isAdminView && resTech.data.length === 0) {
                await syncRegisteredTechniciansToBackend();
            }
        } catch (e) {
            console.error('Failed to load technicians', e);
            setTechnicians([]);
        }

        try {
            const resSummary = await getUserSummary();
            setSummary(resSummary.data);
        } catch (e) {
            console.error('Failed to load user summary', e);
            setSummary(null);
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
            addNotification({
                title: 'Ticket created',
                message: `${formData.category} issue reported for ${formData.locationOrResource}. Support teams have been notified.`,
                type: 'success',
                module: 'tickets',
                roleScope: ['USER', 'TECHNICIAN', 'MANAGER', 'ADMIN']
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
            const backendMessage =
                e.response?.data?.message ||
                e.response?.data?.error ||
                'The issue could not be submitted. Please try again.';

            if (backendMessage === 'User not found') {
                try {
                    const syncedUserId = await syncCurrentUserToBackend();
                    await createTicket(syncedUserId, {
                        ...formData,
                        images: selectedImages
                    });
                    addNotification({
                        title: 'Ticket created',
                        message: `${formData.category} issue reported for ${formData.locationOrResource}. Support teams have been notified.`,
                        type: 'success',
                        module: 'tickets',
                        roleScope: ['USER', 'TECHNICIAN', 'MANAGER', 'ADMIN']
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
                    return;
                } catch (syncError) {
                    addNotification({
                        title: 'Ticket creation failed',
                        message: syncError.response?.data?.message || syncError.message || 'Your account could not be synchronized.',
                        type: 'error',
                        module: 'tickets'
                    });
                    return;
                }
            }

            addNotification({
                title: 'Ticket creation failed',
                message: backendMessage,
                type: 'error',
                module: 'tickets'
            });
        }
    };

    const handleImageSelection = (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 3) {
            addNotification({
                title: 'Too many images selected',
                message: 'You can upload up to 3 image evidence files per ticket.',
                type: 'warning',
                module: 'tickets'
            });
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
            addNotification({
                title: `Ticket moved to ${status}`,
                message: `Ticket #${id} status was updated${note ? ` with note: ${note}` : '.'}`,
                type: status === 'CLOSED' || status === 'RESOLVED' ? 'success' : 'info',
                module: 'tickets',
                roleScope: ['TECHNICIAN', 'MANAGER', 'ADMIN', 'USER']
            });
            fetchData();
        } catch (e) {
            addNotification({
                title: 'Ticket status update failed',
                message: `Ticket #${id} could not be updated.`,
                type: 'error',
                module: 'tickets'
            });
        }
    };

    const handleReject = async (id) => {
        const reason = window.prompt('Enter rejection reason:');
        if (!reason) {
            return;
        }

        try {
            await rejectTicket(id, reason);
            addNotification({
                title: 'Ticket rejected',
                message: `Ticket #${id} was rejected${reason ? `: ${reason}` : '.'}`,
                type: 'warning',
                module: 'tickets',
                roleScope: ['USER', 'MANAGER', 'ADMIN']
            });
            fetchData();
        } catch (e) {
            addNotification({
                title: 'Ticket rejection failed',
                message: `Ticket #${id} could not be rejected.`,
                type: 'error',
                module: 'tickets'
            });
        }
    };

    const handleAssignTechnician = async (ticketId) => {
        const selectedTechId = assigneeByTicket[ticketId];
        if (!selectedTechId) {
            addNotification({
                title: 'Technician required',
                message: 'Please select a technician before assigning the ticket.',
                type: 'warning',
                module: 'tickets'
            });
            return;
        }

        try {
            await assignTechnician(ticketId, Number(selectedTechId));
            const technician = technicians.find((tech) => String(tech.id) === String(selectedTechId));
            addNotification({
                title: 'Technician assigned',
                message: `${technician?.name || 'A technician'} was assigned to ticket #${ticketId}.`,
                type: 'success',
                module: 'tickets',
                roleScope: ['TECHNICIAN', 'ADMIN', 'MANAGER']
            });
            fetchData();
        } catch (e) {
            addNotification({
                title: 'Technician assignment failed',
                message: `Ticket #${ticketId} could not be assigned.`,
                type: 'error',
                module: 'tickets'
            });
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
            addNotification({
                title: 'Comment added',
                message: `A new comment was posted on ticket #${ticketId}.`,
                type: 'info',
                module: 'tickets',
                roleScope: ['USER', 'TECHNICIAN', 'MANAGER', 'ADMIN']
            });
            fetchData();
        } catch (e) {
            addNotification({
                title: 'Comment failed',
                message: `Your comment could not be saved for ticket #${ticketId}.`,
                type: 'error',
                module: 'tickets'
            });
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
            addNotification({
                title: 'Comment updated',
                message: `Comment #${commentId} on ticket #${ticketId} was updated.`,
                type: 'success',
                module: 'tickets'
            });
            fetchData();
        } catch (e) {
            addNotification({
                title: 'Comment update failed',
                message: `Comment #${commentId} could not be updated.`,
                type: 'error',
                module: 'tickets'
            });
        }
    };

    const handleDeleteComment = async (ticketId, commentId) => {
        try {
            await deleteTicketComment(ticketId, commentId, currentUserId);
            addNotification({
                title: 'Comment deleted',
                message: `Comment #${commentId} was removed from ticket #${ticketId}.`,
                type: 'warning',
                module: 'tickets'
            });
            fetchData();
        } catch (e) {
            addNotification({
                title: 'Comment deletion failed',
                message: `Comment #${commentId} could not be removed.`,
                type: 'error',
                module: 'tickets'
            });
        }
    };

    const getPriorityBadge = (p) => {
        switch (p) {
            case 'HIGH':
                return 'danger';
            case 'MEDIUM':
                return 'warning';
            default:
                return 'neutral';
        }
    };

    const visibleTickets = isStudentView
        ? tickets.filter((ticket) => String(ticket.userId) === String(currentUserId))
        : tickets;

    return (
        <div className="space-y-8">
            {!isStudentView && <TicketOverview tickets={tickets} technicians={technicians} summary={summary} />}

            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Tickets Workspace</p>
                    <h1 className="mt-2 text-2xl font-bold tracking-tight text-white">
                        {isStudentView ? 'Report Issues' : 'Incident Ticketing'}
                    </h1>
                    <p className="mt-2 text-sm text-slate-400">
                        {isStudentView
                            ? 'Report campus issues and track only the requests you have submitted.'
                            : 'Create maintenance requests, assign technicians, and keep each resolution documented.'}
                    </p>
                </div>
            </div>

            {showForm && (
                <Card className="mb-6 border border-accent/50">
                    <h3 className="mb-4 text-lg font-bold text-white">Submit New Ticket</h3>
                    <form onSubmit={handleCreate} className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                            value={formData.priority}
                            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
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
                            value={formData.resourceId}
                            onChange={(e) => setFormData({ ...formData, resourceId: e.target.value })}
                        >
                            <option value="">No linked system resource</option>
                            {resources.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
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
                            <p className="mt-2 text-xs text-gray-400">
                                Add image evidence (max 3). Example: photo of broken screen.
                            </p>
                            {selectedImages.length > 0 && (
                                <p className="mt-1 text-xs text-gray-300">{selectedImages.length} image(s) selected</p>
                            )}
                        </div>

                        <div className="mt-2 flex justify-end md:col-span-2">
                            <Button type="submit" className="bg-accent shadow-[0_0_15px_rgba(59,130,246,0.5)]">Submit Ticket</Button>
                        </div>
                    </form>
                </Card>
            )}

            <div className="flex flex-col overflow-hidden rounded-xl border border-gray-800 bg-card shadow-sm">
                <div className="border-b border-gray-800 bg-gray-900/40 px-6 py-4">
                    <h2 className="text-lg font-semibold text-white">
                        {isStudentView ? 'My Issues' : 'All Issues'}
                    </h2>
                    <p className="mt-1 text-sm text-gray-400">
                        {isStudentView
                            ? 'Review the tickets you reported and follow their progress.'
                            : 'Review submitted incidents, coordinate assignments, and track resolution progress.'}
                    </p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-400">
                        <thead className="border-b border-gray-800 bg-gray-900/50 text-gray-300">
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
                                <th className="px-6 py-4 text-right font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {visibleTickets.map((t) => (
                                <tr key={t.id} className="transition-colors hover:bg-gray-800/50">
                                    <td className="px-6 py-4 font-medium text-primary">TKT-{t.id}</td>
                                    <td className="px-6 py-4">
                                        <p className="font-medium text-white">{t.category}</p>
                                        <p className="mt-1 text-xs">{t.description}</p>
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
                                                    className="mr-2 text-primary hover:underline"
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
                                            <p className="mt-1 text-xs text-red-300">{t.rejectedReason}</p>
                                        )}
                                    </td>
                                    <td className="whitespace-pre-line px-6 py-4 text-xs text-gray-300">{t.resolutionNotes || '-'}</td>
                                    <td className="min-w-80 px-6 py-4">
                                        <div className="space-y-2">
                                            {(commentsByTicket[t.id] || []).map((c) => (
                                                <div key={c.id} className="rounded bg-gray-800/60 p-2 text-xs">
                                                    <p className="mb-1 text-gray-300">
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
                                                                className="mr-2 text-[11px] text-primary"
                                                                onClick={() => {
                                                                    setEditingCommentById({ ...editingCommentById, [c.id]: true });
                                                                    setEditingTextByCommentId({ ...editingTextByCommentId, [c.id]: c.comment });
                                                                }}
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="text-[11px] text-red-300"
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
                                        {isAdminView && t.status === 'OPEN' && (
                                            <>
                                                <select
                                                    className="mr-2 h-8 rounded-md border border-gray-700 bg-gray-800/50 px-2 py-1 text-xs text-white"
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
                                                <Button variant="outline" size="sm" onClick={() => handleReject(t.id)}>
                                                    Reject
                                                </Button>
                                            </>
                                        )}
                                        {(isAdminView || isTechnicianView) && t.status === 'OPEN' && t.technicianId && (
                                            <Button variant="outline" size="sm" onClick={() => handleStatusChange(t.id, 'IN_PROGRESS')} className="mr-2">
                                                Start
                                            </Button>
                                        )}
                                        {(isAdminView || isTechnicianView) && t.status === 'IN_PROGRESS' && (
                                            <>
                                                <Input
                                                    placeholder='Add progress note (e.g., "Replaced HDMI cable and tested successfully")'
                                                    value={statusNoteByTicket[t.id] || ''}
                                                    onChange={(e) => setStatusNoteByTicket({ ...statusNoteByTicket, [t.id]: e.target.value })}
                                                    className="mr-2 h-8 w-72 text-xs"
                                                />
                                                <Button variant="outline" size="sm" onClick={() => handleStatusChange(t.id, 'RESOLVED')}>
                                                    Resolve
                                                </Button>
                                            </>
                                        )}
                                        {(isAdminView || isTechnicianView) && t.status === 'RESOLVED' && (
                                            <>
                                                <Input
                                                    placeholder="Add final verification note"
                                                    value={statusNoteByTicket[t.id] || ''}
                                                    onChange={(e) => setStatusNoteByTicket({ ...statusNoteByTicket, [t.id]: e.target.value })}
                                                    className="mr-2 h-8 w-56 text-xs"
                                                />
                                                <Button variant="outline" size="sm" onClick={() => handleStatusChange(t.id, 'CLOSED')}>
                                                    Close
                                                </Button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {visibleTickets.length === 0 && (
                                <tr>
                                    <td colSpan="11" className="p-6 text-center text-gray-500">
                                        {isStudentView ? 'You have not reported any issues yet.' : 'No tickets submitted.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
