import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import RoverFeed from './pages/RoverFeed'
import Rewards from './pages/Rewards'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/rover-feed" element={<RoverFeed />} />
        <Route path="/rewards" element={<Rewards />} />
      </Routes>
    </Router>
  )
}

export default App

