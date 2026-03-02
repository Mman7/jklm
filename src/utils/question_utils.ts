import { readFileSync } from "fs";
import path from "path";
import type { Question, QuestionHashOnly } from "../types/question";

// Static data files generated during prebuild.
const answersPath = path.join(process.cwd(), "public/data/answers_pairs.json");
const indexPath = path.join(process.cwd(), "public/data/questions_paths.json");

const answersFile = readFileSync(answersPath, "utf-8");
const parseFile = JSON.parse(answersFile);

// In-memory hash -> relative file path index for fast question lookups.
const questionPathMap = loadQuestionPathMap();

// Cache parsed questions to avoid refetching/JSON parsing for repeated rounds.
const questionCache = new Map<string, Question>();

function loadQuestionPathMap(): Record<string, string> {
  try {
    const indexFile = readFileSync(indexPath, "utf-8");
    return JSON.parse(indexFile) as Record<string, string>;
  } catch {
    throw new Error(
      "[question_utils] Missing public/data/questions_paths.json. Run `npm run prebuild` before starting the app.",
    );
  }
}

export function getRandomQuestions(count: number = 15): QuestionHashOnly[] {
  // Randomly pick unique hashes from the index.
  const hashes = Object.keys(questionPathMap);
  if (hashes.length === 0 || count <= 0) return [];

  const shuffled = [...hashes];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, Math.min(count, shuffled.length)).map((hash) => ({
    hash,
  }));
}

function generateCountTime() {
  // Round countdown baseline: 20 seconds from "now".
  return Date.now() + 20_000;
}

export async function getQuestions(
  questionHashes: string[],
): Promise<Question[]> {
  const uniqueHashes = [...new Set(questionHashes)];

  const questions = await Promise.all(
    uniqueHashes.map((hash) => readQuestionByHash(hash)),
  );

  return questions
    .filter((question): question is Question => question !== null)
    .map((question) => ({
      ...question,
      challenge: {
        ...question.challenge,
        end_time: generateCountTime(),
      },
    }));
}

// function removeAnswerFromQuestion(question: Question): Question {
//   question.answer = "";
//   return question;
// }

async function readQuestionByHash(hash: string): Promise<Question | null> {
  // Return cached object when available.
  const cachedQuestion = questionCache.get(hash);
  if (cachedQuestion) {
    return cachedQuestion;
  }

  // Resolve relative data file path from hash index.
  const relativePath = questionPathMap[hash];
  if (!relativePath) {
    return null;
  }

  try {
    // Fetch from public data endpoint to avoid bundling files into serverless functions
    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}/data/${relativePath}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      console.error(
        `Failed to fetch question ${hash}: ${response.status} ${response.statusText}`,
      );
      return null;
    }

    const parsedQuestion = (await response.json()) as Question;
    questionCache.set(hash, parsedQuestion);
    return parsedQuestion;
  } catch (error) {
    console.error(`Failed to read question file for hash ${hash}:`, error);
    return null;
  }
}

function getBaseUrl(): string {
  // For Netlify deployments, use URL env variable
  if (process.env.URL) {
    return process.env.URL;
  }

  // For other deployments or custom domains
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL;
  }

  // Local development fallback
  return `http://localhost:${process.env.PORT || "3000"}`;
}

export async function findAnswer(hash: string): Promise<string> {
  // Constant-time lookup from precomputed hash -> answer map.
  return parseFile[hash];
}

export async function AnswerComparator(
  answerInStore: string,
  submitAnswer: string,
) {
  if (!submitAnswer || !submitAnswer.trim()) {
    // Prevent empty or whitespace-only answers.
    return false;
  }

  // Case-insensitive + trimmed comparison.
  const normalizedStore = answerInStore.trim().toLowerCase();
  const normalizedSubmit = submitAnswer.trim().toLowerCase();

  // Exact full-string match wins.
  if (normalizedStore === normalizedSubmit) {
    return true;
  }

  // Split answer into words and remove punctuation from each word
  const answerParts = normalizedStore.split(" ");
  const cleanedAnswerParts = answerParts
    .map((word) => {
      let cleaned = "";
      for (let i = 0; i < word.length; i++) {
        const char = word[i];
        const code = char.charCodeAt(0);
        // Keep only alphanumeric characters (a-z, 0-9)
        if ((code >= 97 && code <= 122) || (code >= 48 && code <= 57)) {
          cleaned += char;
        }
      }
      return cleaned;
    })
    .filter((word) => word.length > 0); // Remove empty words

  // Check if all cleaned answer words appear in order in submitted text
  const submitParts = normalizedSubmit.split(" ");
  let answerIndex = 0;

  for (const submitWord of submitParts) {
    if (answerIndex >= cleanedAnswerParts.length) {
      break; // All answer words found
    }

    // Clean the submit word the same way
    let cleanedSubmitWord = "";
    for (let i = 0; i < submitWord.length; i++) {
      const char = submitWord[i];
      const code = char.charCodeAt(0);
      if ((code >= 97 && code <= 122) || (code >= 48 && code <= 57)) {
        cleanedSubmitWord += char;
      }
    }

    // If this cleaned word matches the current expected answer word, move to next
    if (cleanedSubmitWord === cleanedAnswerParts[answerIndex]) {
      answerIndex++;
    }
  }

  // If we found all answer words in order, return true
  if (answerIndex === cleanedAnswerParts.length) {
    return true;
  }

  // Fallback: any token in submitted text can match the expected answer.
  return submitParts.includes(normalizedStore);
}
