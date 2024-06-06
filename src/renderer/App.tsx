import { Route, MemoryRouter as Router, Routes } from 'react-router-dom';
import Practice from 'src/renderer/components/Practice';
import AnalyticsDashboardPage from './components/AnalyticsDashboardPage/AnalyticsDashboardPage';
import HomePage from './components/HomePage/HomePage';
import LinkedinLeaderboardPage from './components/LinkedinLeaderboardPage/LinkedinLeaderboardPage';
import ManageLinkedinLeaderboardPage from './components/ManageLinkedinLeaderboardPage/ManageLinkedinLeaderboardPage';
import NavBar from './components/NavBar/NavBar';
import TrackPostPage from './components/TrackPostPage/TrackPostPage';
import { Toaster } from './components/ui/toaster';
import { ThemeProvider } from './providers/theme-provider';

export default function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="ui-theme">
      <Router>
        <NavBar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/practice" element={<Practice />} />
          <Route
            path="/linkedin-leaderboard"
            element={<LinkedinLeaderboardPage />}
          />
          <Route
            path="/analytics-dashboard"
            element={<AnalyticsDashboardPage />}
          />
          <Route path="/track-post" element={<TrackPostPage />} />
          <Route
            path="/manage-linkedin-leaderboard"
            element={<ManageLinkedinLeaderboardPage />}
          />
        </Routes>
      </Router>
      <Toaster />
    </ThemeProvider>
  );
}
