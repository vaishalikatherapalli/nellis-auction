import axios from "axios";

const BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8001";

export const getStats        = ()           => axios.get(`${BASE}/api/stats`).then(r => r.data);
export const getItems        = (params)     => axios.get(`${BASE}/api/items`, { params }).then(r => r.data);
export const searchItems     = (q)          => axios.get(`${BASE}/api/search`, { params: { q } }).then(r => r.data);
export const batchScan       = (lot_numbers)=> axios.post(`${BASE}/api/pickup/batch-scan`, { lot_numbers }).then(r => r.data);
export const getPendingPickup= ()           => axios.get(`${BASE}/api/pickup/pending`).then(r => r.data);
export const updatePickup    = (id, pickup_status) => axios.patch(`${BASE}/api/items/${id}/pickup`, { pickup_status }).then(r => r.data);
export const getCategories   = ()           => axios.get(`${BASE}/api/categories`).then(r => r.data);

export const getProfile      = ()           => axios.get(`${BASE}/api/profile`).then(r => r.data);
export const updatePlates    = (plates)     => axios.put(`${BASE}/api/profile/plates`, { plates }).then(r => r.data);
export const checkinByPlate  = (plate)      => axios.post(`${BASE}/api/checkin/plate`, { plate }).then(r => r.data);
export const checkinByQR     = (customer_id)=> axios.post(`${BASE}/api/checkin/qr`, { customer_id }).then(r => r.data);
export const getCheckinHistory = ()         => axios.get(`${BASE}/api/checkin/history`).then(r => r.data);
