import React from 'react';
import { Joyride, STATUS, type EventData, type Step } from 'react-joyride';

interface OnboardingTourProps {
  run: boolean;
  onFinish: () => void;
}

// Target selectors — each maps to a data-tour attribute on an existing element
// in the Practice tab. Attribute-only markers: no feature logic is touched.
const CAMERA_VIEW = "[data-tour='camera-view']";
const MODEL_BADGE = "[data-tour='model-badge']";
const MODE_SWITCHER = "[data-tour='mode-switcher']";
const TAB_BAR = "[data-tour='tab-bar']";
const OUTPUT_PANEL = "[data-tour='output-panel']";

// Show each tooltip immediately instead of a pulsing beacon first.
const STEP_DEFAULTS: Partial<Step> = { skipBeacon: true };

const steps: Step[] = [
  {
    ...STEP_DEFAULTS,
    target: 'body',
    placement: 'center',
    buttons: ['skip', 'primary'],
    title: 'Welcome to Aashna! 👋',
    content:
      "Aashna is your sign-language learning companion. Sign ASL letters and numbers to your camera and watch them turn into text you can speak aloud — then practice with games, quizzes, and an AI chat buddy. Ready for a quick look around?",
  },
  {
    ...STEP_DEFAULTS,
    target: CAMERA_VIEW,
    buttons: ['back', 'skip', 'primary'],
    title: 'Sign to the camera 📹',
    content:
      "This live view is where you sign. Hold up an ASL letter or number and Aashna recognizes it in real time. Good lighting and a steady hand get the best results.",
  },
  {
    ...STEP_DEFAULTS,
    target: MODE_SWITCHER,
    buttons: ['back', 'skip', 'primary'],
    title: 'Letters or numbers?',
    content:
      "Tell Aashna what you're practicing here — switch between Letters (A–Z) and Numbers (0–9) so the recognizer knows what to look for.",
  },
  {
    ...STEP_DEFAULTS,
    target: MODEL_BADGE,
    placement: 'top',
    buttons: ['back', 'skip', 'primary'],
    title: 'The recognition engine 🤙',
    content:
      "This badge means the Landmark Model is running — it tracks the key points of your hand through the camera and uses them to recognize each sign.",
  },
  {
    ...STEP_DEFAULTS,
    target: TAB_BAR,
    buttons: ['back', 'skip', 'primary'],
    title: 'Your learning toolkit 🎒',
    content:
      "Everything lives in these tabs: Flashcards to study signs, Duolingo Mode for quiz challenges, Numbers Game for counting and math, Spelling Bee to spell what you sign, Roleplay to chat with your AI buddy, plus Leaderboard and Badges to track your progress.",
  },
  {
    ...STEP_DEFAULTS,
    target: OUTPUT_PANEL,
    buttons: ['back', 'skip', 'primary'],
    title: 'Your words appear here ✍️',
    content:
      "Every sign you make builds into text in this panel. Use the Space and Delete buttons below to edit, then press Speak 🔊 to have your message read aloud.",
  },
  {
    ...STEP_DEFAULTS,
    target: 'body',
    placement: 'center',
    buttons: ['back', 'primary'],
    title: "You're all set! 🎉",
    content:
      "That's the tour! You can replay it anytime with the ? help button in the top-right corner. Happy signing!",
  },
];

export const OnboardingTour: React.FC<OnboardingTourProps> = ({ run, onFinish }) => {
  const handleEvent = (data: EventData) => {
    // The tour ended — the user either finished the last step or skipped out.
    if (data.status === STATUS.FINISHED || data.status === STATUS.SKIPPED) {
      onFinish();
    }
  };

  return (
    <Joyride
      run={run}
      steps={steps}
      continuous
      scrollToFirstStep
      onEvent={handleEvent}
      locale={{ last: 'Finish', skip: 'Skip tour' }}
      options={{
        // Theme — matches the app's teal/slate palette (light background).
        primaryColor: '#14b8a6',
        textColor: '#334155',
        backgroundColor: '#ffffff',
        arrowColor: '#ffffff',
        overlayColor: 'rgba(15, 23, 42, 0.6)',
        // Sit above the sticky header (Tailwind z-50).
        zIndex: 1000,
        // Rounded spotlight to match the app's soft corners.
        spotlightRadius: 16,
        spotlightPadding: 12,
        showProgress: true,
        // Keep the tour focused: clicks can't pass through the spotlight, and
        // clicking the dark overlay does nothing (Skip is the way out).
        blockTargetInteraction: true,
        overlayClickAction: false,
      }}
      styles={{
        tooltip: { borderRadius: 24 },
        tooltipTitle: { fontSize: 18, fontWeight: 900, color: '#0f172a' },
        tooltipContent: { fontSize: 15, lineHeight: 1.6 },
        buttonPrimary: { fontWeight: 800, borderRadius: 9999 },
        buttonBack: { fontWeight: 700, borderRadius: 9999 },
        buttonSkip: { fontWeight: 700, borderRadius: 9999 },
      }}
    />
  );
};
