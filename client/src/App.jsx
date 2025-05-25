import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './page/Home'
import Register from './page/Register'
import './index.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/register" element={<Register/>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
