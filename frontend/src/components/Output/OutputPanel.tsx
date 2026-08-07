import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../../store";
import { clearText, backspace } from "../../store/predictionSlice";

export function OutputPanel() {
  const { text, current } = useSelector((state: RootState) => state.prediction);
  const dispatch = useDispatch();

  return (
    <div className="rounded-lg border bg-white p-4">
      <div className="min-h-[120px] rounded-md bg-slate-50 p-4 text-lg">
        {text || <span className="text-slate-400">Your signed text will appear here…</span>}
      </div>

      {current && (
        <p className="mt-2 text-sm text-slate-500">
          Last: <strong>{current.letter}</strong> ({Math.round(current.confidence * 100)}% confidence)
        </p>
      )}

      <div className="mt-4 flex gap-2">
        <button
          onClick={() => dispatch(backspace())}
          className="rounded-md border px-3 py-1.5 text-sm hover:bg-slate-100"
        >
          ⌫ Backspace
        </button>
        <button
          onClick={() => dispatch(clearText())}
          className="rounded-md border px-3 py-1.5 text-sm hover:bg-slate-100"
        >
          🗑️ Clear
        </button>
      </div>
    </div>
  );
}
