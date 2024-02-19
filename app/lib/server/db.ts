import { Client, QueryResult } from "pg";
import config from "./config";


export const getClient = (): Client => {
  const client = new Client({
    connectionString: config.POSTGRES_URL,
  });
  return client;
}

export const sql = async (sql: string, values?: Array<any>): Promise<QueryResult<any>> => {
  const client = getClient();
  await client.connect();
  const res = await client.query(sql, values);
  await client.end();
  return res;
}