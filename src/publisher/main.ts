import ModrinthClient from "./ModrinthClient.js"
import dotenv from "dotenv"

// Load environment variables from the .env file
dotenv.config()

const client = new ModrinthClient({
  baseURL: process.env.MODRINTH_API || "https://staging-api.modrinth.com",
  token: process.env.MODRINTH_API,
})

console.log(client.createURL("hello", "there").toString())
