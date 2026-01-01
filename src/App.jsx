// import GridSystem from './GridSystem.jsx'
import GridCard from './components/GridCard.jsx'
import Gridcard2 from './components/GridCard2.jsx'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Dashboard from './page/Dashboard.jsx'

function App() {
  return (
    <>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/start" element={<GridCard />} />
        <Route path="/final" element={<Gridcard2 />} />
      </Routes>
    </BrowserRouter>
    </>
  )
}

export default App
