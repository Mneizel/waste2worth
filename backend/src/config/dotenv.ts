// Side-effect import: load .env before any other module reads process.env.
// Import this first (before ./app, ./db/prisma, etc.) in every entrypoint.
import { config } from 'dotenv';

config();
