import { CameraView } from "./components/Camera/CameraView";
import { OutputPanel } from "./components/Output/OutputPanel";

function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b bg-white px-6 py-4">
        <h1 className="text-xl font-semibold">🤟 Sign Language Bridge</h1>
      </header>

      <main className="mx-auto grid max-w-5xl grid-cols-1 gap-6 p-6 md:grid-cols-2">
        <CameraView />
        <OutputPanel />
      </main>
    </div>
  );
}

export default App;
