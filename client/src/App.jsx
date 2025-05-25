import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './page/Home'
import Auth from './page/Auth'
import './index.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/auth" element={<Auth/>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
