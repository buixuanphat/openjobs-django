import axios from "axios";

const BASE_URL='http://192.168.1.4:8000/';

export const endpoints={
    'jobs':'/jobs/',
    'job-details':(jobId)=>`/jobs/${jobId}/`,
    'applications':'/applications/',
    'change-status': (appId) => `/applications/${appId}/change-status/`,
    'login': '/o/token/',
    'current-user': '/profile/current-user/',
    'categories':'/categories/',
    'register-candidate': '/register/candidate/',
    'register-employer': '/register/employer/',
    'working-times':'/working-times/',
};

export const authApis = (token) => {
    return axios.create({
        baseURL: BASE_URL,
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
}

export default axios.create({
    baseURL:BASE_URL
});

