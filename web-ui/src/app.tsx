import "./app.css"
import { PackGenerator } from "./generate-pack"

export function App() {
  return (
    <>
      <header>
        <h1>Capitalisation Fixes</h1>
      </header>
      <main>
        <p>Click the button below to generate a resource pack :)</p>
        <button onClick={() => false}>Generate resource pack</button>
      </main>
    </>
  )
}
