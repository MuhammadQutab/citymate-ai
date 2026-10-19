import { Mate, type MateState } from "./Mate";

const states: { state: MateState; label: string }[] = [
  { state: "idle", label: "Idle" },
  { state: "listening", label: "Listening" },
  { state: "thinking", label: "Thinking" },
  { state: "found", label: "Found it" },
  { state: "unsure", label: "Unsure" },
  { state: "resting", label: "Resting" },
];

export function MateGallery() {
  return (
    <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
      {states.map(({ state, label }) => (
        <li key={state} className="glass flex flex-col items-center rounded-panel p-4">
          <Mate state={state} className="h-36 w-full" />
          <span className="mt-2 text-sm font-semibold text-indigo-200">{label}</span>
        </li>
      ))}
    </ul>
  );
}
