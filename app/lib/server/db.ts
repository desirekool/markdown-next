import { Client } from "pg";
import config from "./config";


export const getClient = (): Client => {
  const client = new Client({
    connectionString: config.POSTGRES_URL,
  });
  return client;
}