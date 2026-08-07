import { Provider } from 'react-redux';
import { store } from './store';
import { MainLayout } from './components/Layout/MainLayout';
import { CameraView } from './components/Camera/CameraView';
import { OutputPanel } from './components/Output/OutputPanel';
import { ControlsBar } from './components/Controls/ControlsBar';
import { ModeSwitcher } from './components/Controls/ModeSwitcher';

function App() {
  return (
    <Provider store={store}>
      <MainLayout>
        {/* Adjusted Camera to take up 65% of the screen instead of 60% */}
        <div className="w-full lg:w-[65%]">
          <CameraView />
        </div>
        <div className="w-full lg:w-[35%] flex flex-col gap-5">
          <ModeSwitcher />
          <OutputPanel />
          <ControlsBar />
        </div>
      </MainLayout>
    </Provider>
  );
}

export default App;
