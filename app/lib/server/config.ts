import { loadEnvConfig } from '@next/env';
const projectDir = process.cwd();
loadEnvConfig(projectDir);

const config = {
  POSTGRES_URL: process.env.POSTGRES_URL,
  JWT_SECRET: process.env.JWT_SECRET,
};

export default config;

// Now, you can use the  config  object to access the environment variables in your app.
// Path: app/lib/server/db.ts