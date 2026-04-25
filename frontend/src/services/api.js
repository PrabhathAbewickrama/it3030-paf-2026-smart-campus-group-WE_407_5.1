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
    
    if (data.resourceId) {
        formData.append('resourceId', data.resourceId);
    }

    // Add image files
    if (data.images && Array.isArray(data.images)) {
        data.images.forEach((file, index) => {
            formData.append(`files`, file);
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
