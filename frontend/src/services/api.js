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
export const createTicket = (data) => api.post(`/tickets/user/1`, data);
export const updateTicketStatus = (ticketId, status) => api.patch(`/tickets/${ticketId}/status?status=${status}`);
