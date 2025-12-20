import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
// import GridSystem from './GridSystem.jsx'
import GridCard from './GridCard.jsx'
import Gridcard2 from './GridCard2.jsx'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

function App() {
  return (
    <>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<GridCard />} />
        <Route path="/final" element={<Gridcard2 />} />
      </Routes>
    </BrowserRouter>
    </>
  )
}

export default App
