import axios from 'axios';
import config from "../config/config"; 
const BASE_URL = config.baseurl.apibaseurl;
console.log("url ax ",BASE_URL);
const axiosInstance = axios.create({
  //baseURL: BASE_URL,
  baseURL: `${BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});


axiosInstance.interceptors.request.use(
  (req) => {
    const token = localStorage.getItem('token');
    if (token && req.headers) {
      req.headers['Authorization'] = `Bearer ${token}`;
    }
    const tenantId = localStorage.getItem('tenantId');
    if (tenantId && req.headers) {
      req.headers['X-Tenant-ID'] = tenantId;
    }
    return req;
  },
);
export default axiosInstance;