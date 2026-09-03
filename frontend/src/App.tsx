import { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import { MainLayout } from './components/Layout/MainLayout';
import { CameraView } from './components/Camera/CameraView';
import { OutputPanel } from './components/Output/OutputPanel';
import { ControlsBar } from './components/Controls/ControlsBar';
import { ModeSwitcher } from './components/Controls/ModeSwitcher';
import { TabBar, type TabMode } from './components/Navigation/TabBar';
import { FlashcardsView } from './components/Flashcards/FlashcardsView';
import { QuizView } from './components/Quiz/QuizView';
import { NumbersGameView } from './components/NumbersGame/NumbersGameView';
import { SpellingView } from './components/Spelling/SpellingView';
import { RoleplayView } from './components/Roleplay/RoleplayView';
import { AuthView } from './components/Auth/AuthView';
import { LeaderboardView } from './components/Leaderboard/LeaderboardView';
import { AchievementsView } from './components/Achievements/AchievementsView';
import { OnboardingTour } from './components/Tour/OnboardingTour';

// localStorage flag marking that the user has seen (or dismissed) the guided
// tour, so it only auto-starts on their very first visit.
const TOUR_SEEN_KEY = 'hasSeenAashnaTour';

function App() {
  const [activeTab, setActiveTab] = useState<TabMode>('practice');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [tourRunning, setTourRunning] = useState(false);

  // The tour highlights elements that only exist in the Practice tab, so
  // always return there before starting (covers replays from other tabs).
  const startTour = () => {
    setActiveTab('practice');
    setTourRunning(true);
  };

  // Auto-start on a user's very first authenticated visit.
  useEffect(() => {
    if (isAuthenticated && !localStorage.getItem(TOUR_SEEN_KEY)) {
      localStorage.setItem(TOUR_SEEN_KEY, 'true');
      setActiveTab('practice');
      setTourRunning(true);
    }
  }, [isAuthenticated]);

  return (
    <Provider store={store}>
      <MainLayout onHelpClick={isAuthenticated ? startTour : undefined}>
        {!isAuthenticated ? (
          <AuthView onLogin={() => setIsAuthenticated(true)} />
        ) : (
          <div className="w-full flex flex-col">
            <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
            
            {activeTab === 'practice' ? (
              <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 w-full">
                <div className="w-full lg:w-[65%]">
                  <CameraView />
                </div>
                <div className="w-full lg:w-[35%] flex flex-col gap-5">
                  <ModeSwitcher />
                  <OutputPanel />
                  <ControlsBar />
                </div>
              </div>
            ) : activeTab === 'flashcards' ? (
              <div className="w-full">
                <FlashcardsView />
              </div>
            ) : activeTab === 'numbers_game' ? (
              <div className="w-full">
                <NumbersGameView />
              </div>
            ) : activeTab === 'quiz' ? (
              <div className="w-full">
                <QuizView />
              </div>
            ) : activeTab === 'spelling' ? (
              <div className="w-full">
                <SpellingView />
              </div>
            ) : activeTab === 'roleplay' ? (
              <div className="w-full">
                <RoleplayView />
              </div>
            ) : activeTab === 'leaderboard' ? (
              <div className="w-full">
                <LeaderboardView />
              </div>
            ) : (
              <div className="w-full">
                <AchievementsView />
              </div>
            )}

            <OnboardingTour run={tourRunning} onFinish={() => setTourRunning(false)} />
          </div>
        )}
      </MainLayout>
    </Provider>
  );
}

export default App;
