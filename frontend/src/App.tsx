import { useState } from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import { MainLayout } from './components/Layout/MainLayout';
import { CameraView } from './components/Camera/CameraView';
import { OutputPanel } from './components/Output/OutputPanel';
import { ControlsBar } from './components/Controls/ControlsBar';
import { ModeSwitcher } from './components/Controls/ModeSwitcher';
import { TabBar, type TabMode } from './components/Navigation/TabBar';
import { FlashcardsView } from './components/Flashcards/FlashcardsView';

function App() {
  const [activeTab, setActiveTab] = useState<TabMode>('practice');

  return (
    <Provider store={store}>
      <MainLayout>
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
          ) : (
            <div className="w-full">
              <FlashcardsView />
            </div>
          )}
        </div>
      </MainLayout>
    </Provider>
  );
}

export default App;
