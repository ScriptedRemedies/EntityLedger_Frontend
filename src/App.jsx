import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import DashboardPage from "./pages/DashboardPage.jsx";
import ReviewChallengesPage from "./pages/ReviewChallengesPage.jsx";
import StartChallengePage from "./pages/StartChallengePage.jsx";
import CurrentSeasonPage from "./pages/CurrentSeasonPage.jsx";

function App() {
  return (
      <Router>
        <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/start-challenge" element={<StartChallengePage />} />
            <Route path="/review-challenges" element={<ReviewChallengesPage />} />
            <Route path="/current-season" element={<CurrentSeasonPage />} />
        </Routes>
      </Router>
  )
}

export default App
