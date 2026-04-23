import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8081/api',
});

// --- RESOURCES ---
export const getResources = () => api.get('/resources');
export const createResource = (data) => api.post('/resources', data);

// --- BOOKINGS ---
export const getBookings = () => api.get('/bookings');
// Hardcoding userId=1 for starter demo purposes. 
// In a real app with JWT, this ID comes from Auth Context/Token.
export const createBooking = (data) => api.post(`/bookings/user/1`, data);

// --- TICKETS ---
export const getTickets = () => api.get('/tickets');
export const getUsers = () => api.get('/users');
export const getTechnicians = () => api.get('/users/technicians');
export const getUserSummary = () => api.get('/users/summary');
export const createTicket = (userId, data) => {
    const formData = new FormData();
    formData.append('title', data.title || data.locationOrResource || '');
    formData.append('category', data.category);
    formData.append('description', data.description);
    formData.append('priority', data.priority);
    formData.append('contactDetails', data.contactDetails);
    formData.append('locationOrResource', data.locationOrResource);

    if (Array.isArray(data.images)) {
        data.images.forEach((imageFile) => {
            formData.append('images', imageFile);
        });
    }

    return api.post(`/tickets/user/${userId}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
};
export const updateTicketStatus = (ticketId, status, note = '') => api.patch(`/tickets/${ticketId}/status`, { status, note });
export const rejectTicket = (ticketId, reason) => api.patch(`/tickets/${ticketId}/reject`, { reason });
export const assignTechnician = (ticketId, technicianId) => api.patch(`/tickets/${ticketId}/assign`, { technicianId });

// --- TICKET COMMENTS ---
export const getTicketComments = (ticketId) => api.get(`/tickets/${ticketId}/comments`);
export const addTicketComment = (ticketId, userId, comment) => api.post(`/tickets/${ticketId}/comments/user/${userId}`, { comment });
export const updateTicketComment = (ticketId, commentId, userId, comment) =>
    api.put(`/tickets/${ticketId}/comments/${commentId}/user/${userId}`, { comment });
export const deleteTicketComment = (ticketId, commentId, userId) =>
    api.delete(`/tickets/${ticketId}/comments/${commentId}/user/${userId}`);
