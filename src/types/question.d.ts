export interface Question {
  answer: string;
  submitter: string;
  details: string;
  challenge: Challenge;
  tags: Tag[];
}

<<<<<<< HEAD
// Expose only non-answer fields for public use.
=======
>>>>>>> e5057de8b9c9f8878624de1501eedbec96a8bb9f
export type QuestionPublic = Omit<Question, "answer">;

export interface QuestionHashOnly {
  hash: string;
}

export interface Challenge {
  end_time: number; // Unix timestamp (ms)
  image: ChallengeImage | null;
  prompt: string;
  text: string | null;
  hash: string;
}

export interface ChallengeImage {
  type: `image/${string}`; // e.g. image/jpeg, image/png
  data: {
    _placeholder: boolean;
    num: number;
  };
  base64: string;
  extension: "jpeg" | "png" | "jpg" | string;
}

export type Tag = "Easy" | "Medium" | "Hard" | string;
