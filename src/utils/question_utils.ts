import type {
  Question,
  QuestionHashOnly,
  QuestionPublic,
} from "../types/question";
import ky from "ky";
import { sampleSize } from "lodash-es";

// Cache parsed questions to avoid refetching/JSON parsing for repeated rounds.
const questionCache = new Map<string, Question>();

let answersMapPromise: Promise<Record<string, string>> | null = null;
let questionPathMapPromise: Promise<Record<string, string>> | null = null;

async function getQuestionPathMap(): Promise<Record<string, string>> {
  if (!questionPathMapPromise) {
    questionPathMapPromise = fetchPublicJson<Record<string, string>>(
      "questions_paths.json",
      "[question_utils] Missing questions_paths.json. Run the prebuild script before starting the app.",
    ).catch((error) => {
      questionPathMapPromise = null;
      throw error;
    });
  }

  return questionPathMapPromise;
}

async function getAnswersMap(): Promise<Record<string, string>> {
  if (!answersMapPromise) {
    answersMapPromise = fetchPublicJson<Record<string, string>>(
      "answers_pairs.json",
      "[question_utils] Missing answers_pairs.json. Run the prebuild script before starting the app.",
    ).catch((error) => {
      answersMapPromise = null;
      throw error;
    });
  }

  return answersMapPromise;
}

async function fetchPublicJson<T>(
  relativePath: string,
  errorMessage: string,
): Promise<T> {
  const baseUrl = getBaseUrl();
  const response = await ky.get(`${baseUrl}/data/${relativePath}`, {
    cache: "no-store",
    throwHttpErrors: false,
  });

  if (!response.ok) {
    throw new Error(errorMessage);
  }

  return (await response.json()) as T;
}

export async function getRandomQuestions(
  count: number = 15,
): Promise<QuestionHashOnly[]> {
  // Randomly pick unique hashes from the index.
  const questionPathMap = await getQuestionPathMap();
  const hashes: string[] = Object.keys(questionPathMap);
  if (hashes.length === 0 || count <= 0) return [];

  const shuffled: string[] = sampleSize(hashes, count);
  return shuffled.map((hash) => ({ hash }));
}

function generateCountTime(questionDurationSeconds: number = 20) {
  // Round countdown baseline from "now".
  return Date.now() + questionDurationSeconds * 1000;
}

export async function getQuestions(
  questionHashes: string[],
  questionDurationSeconds: number = 20,
): Promise<QuestionPublic[]> {
  const uniqueHashes = [...new Set(questionHashes)];

  const questions = await Promise.all(
    uniqueHashes.map((hash) => readQuestionByHash(hash)),
  );

  return questions
    .filter((question): question is Question => question !== null)
    .map((question) => ({
      ...toPublicQuestion(question),
      challenge: {
        ...question.challenge,
        end_time: generateCountTime(questionDurationSeconds),
      },
    }));
}

// Expose only non-answer fields for public use.
function toPublicQuestion(question: Question): QuestionPublic {
  // Omit the "answer" field to prevent accidental exposure.
  const { answer, ...rest } = question;
  return rest as QuestionPublic;
}

async function readQuestionByHash(hash: string): Promise<Question | null> {
  // Return cached object when available.
  const cachedQuestion = questionCache.get(hash);
  if (cachedQuestion) {
    return cachedQuestion;
  }

  // Resolve relative data file path from hash index.
  const questionPathMap = await getQuestionPathMap();
  const relativePath = questionPathMap[hash];
  if (!relativePath) {
    return null;
  }

  try {
    // Fetch from the public data endpoint so build tools do not bundle the full question dataset.
    const baseUrl = getBaseUrl();
    const response = await ky.get(`${baseUrl}/data/popsauces/${relativePath}`, {
      cache: "no-store",
      throwHttpErrors: false,
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
  if (process.env.URL) {
    return process.env.URL;
  }

  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL;
  }

  return `http://localhost:${process.env.PORT || "3000"}`;
}

export async function findAnswer(hash: string): Promise<string> {
  // Constant-time lookup from precomputed hash -> answer map.
  const answersMap = await getAnswersMap();
  return answersMap[hash] ?? "";
}
// Use shared comparator implementation
export { AnswerComparator } from "./answer_comparator";
