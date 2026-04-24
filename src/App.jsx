import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import DashboardPage from "./pages/DashboardPage.jsx";
import ReviewChallengesPage from "./pages/ReviewChallengesPage.jsx";

function App() {
  return (
      <Router>
        <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/review-challenges" element={<ReviewChallengesPage />} />
        </Routes>
      </Router>
  )
}

export default App
