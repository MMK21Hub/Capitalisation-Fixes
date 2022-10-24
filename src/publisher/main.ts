import ModrinthClient from "./ModrinthClient.js"
import dotenv from "dotenv"
import { Blob } from "node-fetch"

// Load environment variables from the .env file
dotenv.config()

const client = new ModrinthClient({
  baseURL: process.env.MODRINTH_API || "https://staging-api.modrinth.com",
  token: process.env.MODRINTH_TOKEN,
  brand: process.env.CLIENT_BRAND || "Capitalisation-Fixes Publisher Script",
})

console.log(
  await client.rest.createVersion({
    featured: false,
    files: {
      "nothing to see here.zip": new Blob(["hello"]),
    },
    game_versions: ["22w42a"],
    loaders: ["fabric"],
    name: "Cool version",
    project_id: process.env.MODRINTH_PROJECT_ID!,
    version_number: "2.0",
    version_type: "release",
  })
)
