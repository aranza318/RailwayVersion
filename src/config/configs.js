import dotenv from "dotenv";
import { Command } from "commander";

const program = new Command();

program 
       .option('-d', 'Variable for debug', false)
       .option('-p <port>', 'Server port', 9090)
       .option('--mode <mode>', 'Option mode', 'development')
program.parse(process.argv);

console.log("Mode Option: ", program.opts().mode);

const environment = program.opts().mode;

let envPath;
if (environment === "production") {
  envPath = "./src/config/.env.production";
} else if (environment === "test") {
  envPath = "./src/config/.env.test"; 
} else {
  envPath = "./src/config/.env.development";
}

dotenv.config({ path: envPath });

export const PORT = process.env.PORT
export const MONGODB_CNX_STR = process.env.MONGODB_CNX_STR
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL 
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD
export const SECRET_SESSIONS = process.env.SECRET_SESSIONS
export const CLIENT_ID_GITHUB = process.env.CLIENT_ID_GITHUB
export const CLIENT_SECRET_GITHUB = process.env.CLIENT_SECRET_GITHUB
export const JWT_KEY = process.env.JWT_KEY
export const PERCISTENCE = process.env.PERCISTENCE
export const GMAIL_USER = process.env.GMAIL_USER
export const GMAIL_PASSWORD = process.env.GMAIL_PASSWORD
export const TWILIO_NUMBER = process.env.TWILIO_NUMBER
export const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID
export const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN
export const PREMIUM_EMAIL = process.env.PREMIUM_EMAIL
export const PREMIUM_PASSWORD = process.env.PREMIUM_PASSWORD
export const STRIPE_KEY = process.env.STRIPE_KEY

export default{
       environment: environment
}