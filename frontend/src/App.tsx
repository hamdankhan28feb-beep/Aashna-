import { Provider } from 'react-redux';
import { store } from './store';
import { MainLayout } from './components/Layout/MainLayout';
import { CameraView } from './components/Camera/CameraView';
import { OutputPanel } from './components/Output/OutputPanel';
import { ControlsBar } from './components/Controls/ControlsBar';

function App() {
  return (
    <Provider store={store}>
      <MainLayout>
        <CameraView />
        <div className="w-full lg:w-[40%] flex flex-col gap-4">
          <OutputPanel />
          <ControlsBar />
        </div>
      </MainLayout>
    </Provider>
  );
}

export default App;
