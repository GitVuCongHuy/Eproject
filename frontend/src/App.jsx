import { useState } from 'react'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <ContextProvider >
        <Routers>
          <div className="App">
            <Route path="/" element={<Default_Layout><Home/></Default_Layout>} />
          </div>
        </Routers>
      </ContextProvider>
    </>
  )
}

export default App
