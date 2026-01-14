import axios from "axios";

const BASE_URL = 'http://192.168.1.2:8000/';

export const endpoints = {
    'jobs': '/jobs/',
    'job-details': (jobId) => `/jobs/${jobId}/`,
    'applications': '/applications/',
    'change-status': (appId) => `/applications/${appId}/change-status/`,
    'login': '/o/token/',
    'current-user': '/profile/current-user/',
    'categories': '/categories/',
    'register-candidate': '/register/candidate/',
    'register-employer': '/register/employer/',


    'getShifts': '/employers/working-times/',
    'createShift': '/working-times/',
    'follow': (jobId) => `/jobs/${jobId}/follow/`,
    'employments': '/employments/',
    'appreciations': '/appreciations/',
    'getAppreciation': (id) => `/employers/${id}/ratings/`,
    'getMyCandidate': '/employers/employments/',
    'terminate': (id) => `/employers/${id}/terminate/`
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
    baseURL: BASE_URL
});

