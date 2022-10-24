import ModrinthClient from "./ModrinthClient.js"
import dotenv from "dotenv"
import { Blob } from "node-fetch"

// Load environment variables from the .env file
dotenv.config()

const client = new ModrinthClient({
  baseURL: process.env.MODRINTH_API || "https://staging-api.modrinth.com",
  token: process.env.MODRINTH_API,
  brand: process.env.CLIENT_BRAND || "Capitalisation-Fixes Publisher Script",
})

console.log(
  client.rest.createVersion(process.env.MODRINTH_PROJECT_ID!, {}, [
    ["rp.zip", new Blob(["hi"])],
    ["rp.zip", new Blob(["hello"])],
  ])
)
