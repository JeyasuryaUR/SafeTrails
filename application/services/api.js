import axios from 'axios';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080/api';

/**
 * API service for making HTTP requests
 */
const api = {
    /**
     * Make a GET request
     * @param {string} url - The endpoint URL
     * @param {Object} params - Query parameters
     * @param {Object} headers - Custom headers
     * @returns {Promise} - Response promise
     */
    get: (url, params = {}, headers = {}) => {
        return axios.get(`${BASE_URL}${url}`, {
            params,
            headers: {
                'Content-Type': 'application/json',
                ...headers
            }
        });
    },
    
    /**
     * Make a POST request
     * @param {string} url - The endpoint URL
     * @param {Object} data - Data to send
     * @param {Object} headers - Custom headers
     * @returns {Promise} - Response promise
     */
    post: (url, data = {}, headers = {}) => {
        return axios.post(`${BASE_URL}${url}`, data, {
            headers: {
                'Content-Type': 'application/json',
                ...headers
            }
        });
    },
    
    /**
     * Make a PUT request
     * @param {string} url - The endpoint URL
     * @param {Object} data - Data to send
     * @param {Object} headers - Custom headers
     * @returns {Promise} - Response promise
     */
    put: (url, data = {}, headers = {}) => {
        return axios.put(`${BASE_URL}${url}`, data, {
            headers: {
                'Content-Type': 'application/json',
                ...headers
            }
        });
    },
    
    /**
     * Make a DELETE request
     * @param {string} url - The endpoint URL
     * @param {Object} params - Query parameters
     * @param {Object} headers - Custom headers
     * @returns {Promise} - Response promise
     */
    delete: (url, params = {}, headers = {}) => {
        return axios.delete(`${BASE_URL}${url}`, {
            params,
            headers: {
                'Content-Type': 'application/json',
                ...headers
            }
        });
    }
};

export default api;