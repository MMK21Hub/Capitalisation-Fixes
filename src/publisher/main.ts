import ModrinthClient from "./ModrinthClient.js"

const client = new ModrinthClient()
console.log(client.createURL("hello", "there").toString())
