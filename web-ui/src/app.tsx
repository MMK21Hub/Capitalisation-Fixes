import { useState } from "preact/hooks"
import "./app.css"

export function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <header>
        <h1>Capitalisation Fixes</h1>
      </header>
      <main>
        <p>Click the button below to generate a resource pack :)</p>
        <button onClick={() => setCount((count) => count + 1)}>
          Generate resource pack
        </button>
      </main>
    </>
  )
}
