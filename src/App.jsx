import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import DashboardPage from "./pages/DashboardPage.jsx";
import ReviewChallengesPage from "./pages/ReviewChallengesPage.jsx";
import StartChallengePage from "./pages/StartChallengePage.jsx";
import CurrentSeasonPage from "./pages/CurrentSeasonPage.jsx";
import useSessionHeartbeat from "./hooks/useSessionHeartbeat";
import {NavigationProvider} from "./hooks/NavigationContext.jsx";

function AppContent() {

    useSessionHeartbeat();

    return (
        <Routes>
            <Route path="/" element={<LoginPage/>}/>
            <Route path="/dashboard" element={<DashboardPage/>}/>
            <Route path="/start-challenge" element={<StartChallengePage/>}/>
            <Route path="/review-challenges" element={<ReviewChallengesPage/>}/>
            <Route path="/current-season/:seasonId" element={<CurrentSeasonPage/>}/>
        </Routes>
    );
}

function App() {
    return (
        <Router>
            <NavigationProvider>
                <AppContent />
            </NavigationProvider>
        </Router>
    )
}

export default App
