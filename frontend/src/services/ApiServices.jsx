// import { env } from './env';

export let BASE_URL = import.meta.env.VITE_BASE_URL;

export const API_URL = BASE_URL + '/api';

export const URLS = {
    profile_status: API_URL + '/user/profile-status',
}
