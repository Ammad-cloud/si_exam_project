import { MongoClient } from "mongodb";
import * as dotenv from "dotenv";
dotenv.config();

const url = process.env.MONGODB_ATLAS_URL;
const client = new MongoClient(url);

const dbName = "test";

async function get_connection() {
    await client.connect();
    const db = client.db(dbName);
    console.log("Connected successfully to database server");
    return db;
}

export default get_connection;
