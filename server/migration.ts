import { MongoClient } from "mongodb"
import { config } from "dotenv"
config()

const URL = process.env[`MONGO_URL`] || ""

const createDB = async (url: string) => {
    const client = await MongoClient.connect(url)
    const db = client.db("safe_tour")
    await db.createCollection("alerts")
    await client.close()
}