// import { env } from './env';

export let BASE_URL = import.meta.env.VITE_BASE_URL;

export const API_URL = BASE_URL + '/api';

export const URLS = {
    profile_status: API_URL + '/user/profile-status',
    complete_profile: API_URL + '/user/complete-profile',
    sign_in: API_URL + '/auth/signin',
    sign_up: API_URL + '/auth/signup',
}
