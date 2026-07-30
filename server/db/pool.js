import dotenv from "dotenv";
dotenv.config();

import { Pool } from "pg";

// connection for local db
const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST || "localhost",
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: Number(process.env.PGPORT) || 5432,
});

// connection for remote db
// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
// });

export default pool;