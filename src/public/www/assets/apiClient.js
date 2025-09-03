// public/js/apiClient.js
import axios from "https://cdn.jsdelivr.net/npm/axios@1.6.8/+esm";
let csrfToken = null;
let UID = null;
async function initCsrf() {
    const { data } = await axios.get('/csrf-token');
    csrfToken = data.csrfToken;
}

export function setTValue(token) {
    csrfToken = token;
}
export function setUIDalue(UID) {
    UID = UID;
}
// Create a reusable axios instance
const api = axios.create({
    baseURL: "/api", // change if your API has a prefix like "/api"
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true // allows sending cookies with requests
});
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('mt');
    if (csrfToken) {
        config.headers["X-CSRF-Token"] = csrfToken;
    }
    if(token){
        config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
});
// Generic GET request
export async function getData(url, params = {}) {
    try {
        const response = await api.get(url, { params });
        return response.data;
    } catch (error) {
        handleError(error);
    }
}

// Generic POST request
export async function postData(url, data = {}) {
    try {
        const response = await api.post(url, data);
        return response.data;
    } catch (error) {
        handleError(error);
    }
}

// Common error handler
function handleError(error) {
    console.error("API Error:", error.response?.data || error.message);
    alert(error.response?.data?.message || "Something went wrong!");
}
