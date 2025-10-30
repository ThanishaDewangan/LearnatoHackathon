import axios from 'axios';
export const API_BASE = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:4000';
export const api = axios.create({ baseURL: API_BASE });

export function setRoleHeader(role: 'instructor' | 'user' | null) {
  if (role) {
    api.defaults.headers.common['x-role'] = role;
  } else {
    delete (api.defaults.headers.common as any)['x-role'];
  }
}

