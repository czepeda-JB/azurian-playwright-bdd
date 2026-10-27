import 'dotenv/config';
function required(name: string): string { const value = process.env[name]; if (!value) throw new Error(`Configura ${name} en .env`); return value; }
export const config = { baseUrl: (process.env.BASE_URL ?? 'http://localhost:3000').replace(/\/$/, ''), user: required('QA_USER'), password: required('QA_PASSWORD'), headless: process.env.HEADLESS !== 'false', notFound: 'El documento no existe en esta ejecución.' };
