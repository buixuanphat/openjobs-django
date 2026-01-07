import axios from "axios";

const BASE_URL='http://192.168.1.5:8000/';

export const endpoints={
    'jobs':'/jobs/',
    'applications':'/applications/',
    'login': '/o/token/',
    'current-user': '/users/current-user/',
    'categories':'/categories/',
};

export default axios.create({
    baseURL:BASE_URL
});

