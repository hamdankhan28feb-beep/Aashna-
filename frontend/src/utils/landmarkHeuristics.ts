import { NormalizedLandmarkList } from '@mediapipe/hands';

// MediaPipe Landmark Indices
// Thumb: 1-4 (4 is tip)
// Index: 5-8 (8 is tip, 6 is PIP)
// Middle: 9-12 (12 is tip, 10 is PIP)
// Ring: 13-16 (16 is tip, 14 is PIP)
// Pinky: 17-20 (20 is tip, 18 is PIP)

const isFingerFolded = (landmarks: NormalizedLandmarkList, fingerIdx: number) => {
  return landmarks[fingerIdx].y > landmarks[fingerIdx - 2].y;
};

const isThumbTucked = (landmarks: NormalizedLandmarkList) => {
  const thumbTipX = landmarks[4].x;
  const indexMcpX = landmarks[5].x;
  const pinkyMcpX = landmarks[17].x;
  const minX = Math.min(indexMcpX, pinkyMcpX);
  const maxX = Math.max(indexMcpX, pinkyMcpX);
  return thumbTipX > minX && thumbTipX < maxX;
};

const isThumbExtendedOut = (landmarks: NormalizedLandmarkList) => {
  // Thumb is pointing away from the index finger
  const thumbTipX = landmarks[4].x;
  const indexMcpX = landmarks[5].x;
  // if right hand, thumb x < index x. if left hand, thumb x > index x.
  // We can measure distance
  return Math.abs(thumbTipX - indexMcpX) > 0.1;
};

export const generateHandFeedback = (targetLetter: string, landmarks: NormalizedLandmarkList): string | null => {
  const indexFolded = isFingerFolded(landmarks, 8);
  const middleFolded = isFingerFolded(landmarks, 12);
  const ringFolded = isFingerFolded(landmarks, 16);
  const pinkyFolded = isFingerFolded(landmarks, 20);

  switch (targetLetter) {
    case 'A':
      if (!indexFolded) return "Fold your index finger down.";
      if (!middleFolded) return "Fold your middle finger down.";
      if (isThumbTucked(landmarks)) return "Rest your thumb on the side of your index finger, don't tuck it in.";
      return "Make a tight fist with your thumb on the side.";
      
    case 'B':
      if (indexFolded || middleFolded || ringFolded || pinkyFolded) return "Keep all four fingers straight up and together.";
      if (!isThumbTucked(landmarks)) return "Tuck your thumb across your palm.";
      return "Fingers straight, thumb tucked.";

    case 'C':
      return "Curve all your fingers and thumb to form a 'C' shape.";

    case 'D':
      if (indexFolded) return "Point your index finger straight up.";
      if (!middleFolded || !ringFolded || !pinkyFolded) return "Fold your middle, ring, and pinky fingers down.";
      return "Touch your thumb to your middle finger to form a circle, keeping index up.";

    case 'E':
      if (!indexFolded || !middleFolded) return "Curl your fingers in tightly like a claw.";
      if (!isThumbTucked(landmarks)) return "Tuck your thumb tight across your palm.";
      return "Tighten your fingers down toward your thumb.";
      
    case 'F':
      if (middleFolded || ringFolded || pinkyFolded) return "Extend your middle, ring, and pinky fingers straight up.";
      if (!indexFolded) return "Pinch your index finger and thumb together.";
      return "Form a circle with your index and thumb.";

    case 'G':
      if (!middleFolded || !ringFolded || !pinkyFolded) return "Fold your middle, ring, and pinky fingers.";
      return "Point your index finger and thumb out horizontally, parallel to each other.";

    case 'H':
      if (!ringFolded || !pinkyFolded) return "Fold your ring and pinky fingers.";
      if (indexFolded || middleFolded) return "Extend your index and middle fingers together.";
      return "Point your index and middle fingers horizontally.";

    case 'I':
      if (indexFolded && middleFolded && ringFolded && !pinkyFolded) {
        if (!isThumbTucked(landmarks)) return "Tuck your thumb across your folded fingers.";
        return null;
      }
      if (pinkyFolded) return "Extend your pinky finger straight up.";
      return "Fold all fingers except your pinky.";

    case 'J':
      if (pinkyFolded) return "Extend your pinky finger.";
      return "Hold up your pinky finger and trace a 'J' in the air.";

    case 'K':
      if (indexFolded || middleFolded) return "Extend your index and middle fingers.";
      if (!ringFolded || !pinkyFolded) return "Fold your ring and pinky fingers.";
      return "Put your thumb between your extended index and middle fingers.";

    case 'L':
      if (indexFolded) return "Point your index finger straight up.";
      if (!middleFolded || !ringFolded || !pinkyFolded) return "Fold your middle, ring, and pinky fingers down.";
      if (!isThumbExtendedOut(landmarks)) return "Stick your thumb straight out to the side to make an 'L' shape.";
      return null;

    case 'M':
      if (!indexFolded || !middleFolded || !ringFolded) return "Fold your index, middle, and ring fingers down over your thumb.";
      return "Tuck your thumb UNDER your first three fingers.";

    case 'N':
      if (!indexFolded || !middleFolded) return "Fold your index and middle fingers down over your thumb.";
      return "Tuck your thumb UNDER your first two fingers.";

    case 'O':
      return "Touch all your fingertips to your thumb to form an 'O' shape.";

    case 'P':
      return "Make a 'K' sign (index and middle out, thumb between) but point it down.";

    case 'Q':
      return "Make a 'G' sign (index and thumb out) but point them down.";

    case 'R':
      if (indexFolded || middleFolded) return "Extend your index and middle fingers.";
      return "Cross your middle finger over your index finger.";

    case 'S':
      if (!indexFolded || !middleFolded || !ringFolded || !pinkyFolded) return "Fold all your fingers into a tight fist.";
      return "Make a fist and wrap your thumb ACROSS the front of your fingers.";

    case 'T':
      if (!indexFolded) return "Fold your index finger down over your thumb.";
      return "Tuck your thumb UNDER exactly one finger (your index finger).";

    case 'U':
      if (indexFolded || middleFolded) return "Extend your index and middle fingers.";
      if (!ringFolded || !pinkyFolded) return "Fold your ring and pinky fingers down.";
      const distanceU = Math.abs(landmarks[8].x - landmarks[12].x);
      if (distanceU > 0.05) return "Keep your index and middle fingers pressed tightly together.";
      return null;

    case 'V':
      if (indexFolded || middleFolded) return "Extend your index and middle fingers.";
      if (!ringFolded || !pinkyFolded) return "Fold your ring and pinky fingers down.";
      const distanceV = Math.abs(landmarks[8].x - landmarks[12].x);
      if (distanceV < 0.05) return "Spread your index and middle fingers apart like a peace sign.";
      return null;

    case 'W':
      if (indexFolded || middleFolded || ringFolded) return "Extend your index, middle, and ring fingers.";
      if (!pinkyFolded) return "Fold your pinky finger down and hold it with your thumb.";
      return null;

    case 'X':
      if (!middleFolded || !ringFolded || !pinkyFolded) return "Fold your middle, ring, and pinky fingers.";
      return "Make a fist, but hook your index finger out like a pirate hook.";

    case 'Y':
      if (!indexFolded || !middleFolded || !ringFolded) return "Fold your index, middle, and ring fingers down.";
      if (pinkyFolded) return "Extend your pinky finger.";
      if (!isThumbExtendedOut(landmarks)) return "Extend your thumb out to the side.";
      return "Make a 'hang loose' sign with thumb and pinky out.";

    case 'Z':
      if (indexFolded) return "Point your index finger straight up.";
      return "Hold up your index finger and trace a 'Z' in the air.";

    default:
      return null; // Model handles the rest!
  }
};
