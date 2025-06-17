import {
  generateResourcePacks,
  MinecraftVersionRange,
} from "capitalisation-fixes"
import fixes from "capitalisation-fixes/src/fixes"
import "./app.css"

function generatePack() {
  const zipFiles = generateResourcePacks(fixes, {
    assets: {
      packPng: Uint8Array.from([0]),
      readme: Uint8Array.from(
        "# Some README file content!".split("").map((c) => c.charCodeAt(0))
      ),
    },
    packDescription: "Cap fixes is a great pack and you have it installed now",
    targetLanguages: ["en_us"],
    targetVersions: new MinecraftVersionRange({
      only: "1.21.4",
    }),
  })

  console.log(zipFiles)
}

export function App() {
  return (
    <>
      <header>
        <h1>Capitalisation Fixes</h1>
      </header>
      <main>
        <p>Click the button below to generate a resource pack :)</p>
        <button onClick={generatePack}>Generate resource pack</button>
      </main>
    </>
  )
}
