// import { env } from './env';

// Use environment variable for base URL, fallback to localhost for development
export let BASE_URL = import.meta.env.VITE_BASE_URL ||
    (import.meta.env.DEV ? 'http://localhost:5000' : window.location.origin);

export const API_URL = BASE_URL + '/api';

console.log('API Configuration:', {
    BASE_URL,
    API_URL,
    environment: import.meta.env.MODE
});

export const URLS = {
    profile_status: API_URL + '/user/profile-status',
    complete_profile: API_URL + '/user/complete-profile',
    sign_in: API_URL + '/auth/signin',
    sign_up: API_URL + '/auth/signup',
    create_organization: API_URL + '/create/agency',
}
