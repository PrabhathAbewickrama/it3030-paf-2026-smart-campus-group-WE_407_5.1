import axios from 'axios';

const AUTH_STORAGE_KEY = 'smartcampus_auth_user';

const api = axios.create({
    baseURL: 'http://localhost:8081',
});

api.interceptors.request.use((config) => {
    const storedUser = localStorage.getItem(AUTH_STORAGE_KEY);

    if (storedUser) {
        try {
            const currentUser = JSON.parse(storedUser);

            if (currentUser?.id && currentUser?.username && currentUser?.role) {
                config.headers['X-User-Id'] = String(currentUser.id);
                config.headers['X-User-Name'] = currentUser.username;
                config.headers['X-User-Role'] = currentUser.role;
            }
        } catch (error) {
            localStorage.removeItem(AUTH_STORAGE_KEY);
        }
    }

    return config;
});

export default api;

// ==================== TICKET API FUNCTIONS ====================

/**
 * Get all tickets
 */
export const getTickets = () => {
    return api.get('/api/tickets');
};

/**
 * Create a new ticket with files
 * @param {number} userId - The user ID creating the ticket
 * @param {object} data - Ticket data including files
 */
export const createTicket = (userId, data) => {
    const formData = new FormData();
    formData.append('category', data.category);
    formData.append('description', data.description);
    formData.append('priority', data.priority);
    formData.append('contactDetails', data.contactDetails);
    formData.append('locationOrResource', data.locationOrResource);

    // Add image files
    if (data.images && Array.isArray(data.images)) {
        data.images.forEach((file) => {
            formData.append('images', file);
        });
    }

    return api.post(`/api/tickets/user/${userId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
};

/**
 * Update ticket status
 * @param {number} ticketId - The ticket ID
 * @param {string} status - The new status
 * @param {string} note - Status update note
 */
export const updateTicketStatus = (ticketId, status, note) => {
    return api.patch(`/api/tickets/${ticketId}/status`, {
        status,
        note
    });
};

/**
 * Reject a ticket
 * @param {number} ticketId - The ticket ID
 * @param {string} reason - Rejection reason
 */
export const rejectTicket = (ticketId, reason) => {
    return api.patch(`/api/tickets/${ticketId}/reject`, {
        reason
    });
};

/**
 * Assign a technician to a ticket
 * @param {number} ticketId - The ticket ID
 * @param {number} technicianId - The technician ID
 */
export const assignTechnician = (ticketId, technicianId) => {
    return api.patch(`/api/tickets/${ticketId}/assign`, {
        technicianId
    });
};

/**
 * Get all technicians
 */
export const getTechnicians = () => {
    return api.get('/api/users/technicians');
};

/**
 * Get all resources
 */
export const getResources = () => {
    return Promise.resolve({ data: [] });
};

export const getUsers = () => {
    return api.get('/api/users');
};

export const getUserSummary = () => {
    return api.get('/api/users/summary');
};

export const registerUser = (payload) => {
    return api.post('/api/auth/register', payload);
};

// ==================== TICKET COMMENTS API FUNCTIONS ====================

/**
 * Get all comments for a ticket
 * @param {number} ticketId - The ticket ID
 */
export const getTicketComments = (ticketId) => {
    return api.get(`/api/tickets/${ticketId}/comments`);
};

/**
 * Add a comment to a ticket
 * @param {number} ticketId - The ticket ID
 * @param {number} userId - The user ID adding the comment
 * @param {string} comment - The comment text
 */
export const addTicketComment = (ticketId, userId, comment) => {
    return api.post(`/api/tickets/${ticketId}/comments/user/${userId}`, {
        comment
    });
};

/**
 * Update a ticket comment
 * @param {number} ticketId - The ticket ID
 * @param {number} commentId - The comment ID
 * @param {number} userId - The user ID updating the comment
 * @param {string} comment - The updated comment text
 */
export const updateTicketComment = (ticketId, commentId, userId, comment) => {
    return api.put(`/api/tickets/${ticketId}/comments/${commentId}/user/${userId}`, {
        comment
    });
};

/**
 * Delete a ticket comment
 * @param {number} ticketId - The ticket ID
 * @param {number} commentId - The comment ID
 * @param {number} userId - The user ID deleting the comment
 */
export const deleteTicketComment = (ticketId, commentId, userId) => {
    return api.delete(`/api/tickets/${ticketId}/comments/${commentId}/user/${userId}`);
};

// ==================== ASSETS API FUNCTIONS ====================

/**
 * Get all assets
 */
export const getAssets = () => {
    return api.get('/api/assets');
};

/**
 * Get a single asset by ID
 * @param {number} assetId - The asset ID
 */
export const getAssetById = (assetId) => {
    return api.get(`/api/assets/${assetId}`);
};

/**
 * Create a new asset
 * @param {object} data - Asset data
 */
export const createAsset = (data) => {
    return api.post('/api/assets', data);
};

/**
 * Update an asset
 * @param {number} assetId - The asset ID
 * @param {object} data - Updated asset data
 */
export const updateAsset = (assetId, data) => {
    return api.put(`/api/assets/${assetId}`, data);
};

/**
 * Update asset status
 * @param {number} assetId - The asset ID
 * @param {string} status - The new status
 */
export const updateAssetStatus = (assetId, status) => {
    return api.patch(`/api/assets/${assetId}/status`, { status });
};

/**
 * Delete an asset
 * @param {number} assetId - The asset ID
 */
export const deleteAsset = (assetId) => {
    return api.delete(`/api/assets/${assetId}`);
};

// ==================== BOOKING API FUNCTIONS ====================

/**
 * Get all bookings
 */
export const getBookings = () => {
    return api.get('/api/bookings');
};

/**
 * Create a new booking
 * @param {object} data - Booking data
 */
export const createBooking = (data) => {
    return api.post('/api/bookings', data);
};

/**
 * Update a booking
 * @param {number} bookingId - The booking ID
 * @param {object} data - Updated booking data
 */
export const updateBooking = (bookingId, data) => {
    return api.put(`/api/bookings/${bookingId}`, data);
};

/**
 * Approve or reject a booking
 * @param {number} bookingId - The booking ID
 * @param {object} data - Approval/rejection data
 */
export const approveBooking = (bookingId, data) => {
    return api.put(`/api/bookings/${bookingId}/approve`, data);
};
