/**
 * dotenv module for loading environment variables from .env files
 */
import dotenv from 'dotenv';
dotenv.config();

/**
 * Export the process.env object for easy access to environment variables
 * @type {Object}
 */
export const env = process.env;
