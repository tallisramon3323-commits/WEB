import "dotenv/config";
import mysql from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
import * as schema from "./schema";
const poolConnection = mysql.createPool(process.env.DATABASE_URL!);
export const db = drizzle(poolConnection, { schema, mode: "default" });