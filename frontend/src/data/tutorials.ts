export type TutorialLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export interface Tutorial {
  id: string;
  title: string;
  description: string;
  /** Human-readable length shown on the card, e.g. "3:00". */
  duration: string;
  level: TutorialLevel;
  /**
   * Path to the video file, served from frontend/public — e.g. drop the
   * recording in frontend/public/videos/welcome.mp4 and set this to
   * "/videos/welcome.mp4". Keep null until the recording exists: the card
   * and the player then show the "Video coming soon" placeholder.
   */
  videoUrl: string | null;
}

// Placeholder lessons that demonstrate the layout — replace the titles,
// descriptions and videoUrl values with the real recordings.
export const tutorials: Tutorial[] = [
  {
    id: 'welcome-to-aashna',
    title: 'Welcome to Aashna',
    description:
      'A quick walkthrough of the app: signing to the camera, watching your text build up, and speaking it aloud.',
    duration: '3:00',
    level: 'Beginner',
    videoUrl: null,
  },
  {
    id: 'fingerspelling-first-letters',
    title: 'Fingerspelling: Your First Letters',
    description:
      'Learn the correct handshapes for the first letters of the ASL alphabet, shown slowly from two angles.',
    duration: '5:30',
    level: 'Beginner',
    videoUrl: null,
  },
  {
    id: 'signing-numbers',
    title: 'Signing Numbers 0–9',
    description:
      'How to form each number clearly, and how to switch the recognizer into Numbers mode for practice.',
    duration: '4:15',
    level: 'Beginner',
    videoUrl: null,
  },
  {
    id: 'better-camera-recognition',
    title: 'Getting the Best Camera Recognition',
    description:
      'Lighting, hand placement, and steadiness tips that make the recognizer catch your signs every time.',
    duration: '2:45',
    level: 'Intermediate',
    videoUrl: null,
  },
  {
    id: 'games-and-quizzes',
    title: 'Practicing with Games & Quizzes',
    description:
      'A tour of Flashcards, Duolingo Mode, the Numbers Game, and Spelling Bee — and how each one builds your skills.',
    duration: '4:00',
    level: 'Intermediate',
    videoUrl: null,
  },
  {
    id: 'ai-chat-buddy',
    title: 'Chatting with Your AI Buddy',
    description:
      'How to sign a message, send it to the chat buddy in Roleplay mode, and follow the conversation.',
    duration: '3:30',
    level: 'Intermediate',
    videoUrl: null,
  },
];
