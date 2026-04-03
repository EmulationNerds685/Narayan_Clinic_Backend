import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure .env is loaded from the root of the backend folder
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

console.log("Environment variables loaded from .env");
