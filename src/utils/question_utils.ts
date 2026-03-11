import { readFileSync } from "fs";
import path from "path";
import type { Question, QuestionHashOnly } from "../types/question";
import ky from "ky";
import { sampleSize } from "lodash-es";

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
        end_time: generateCountTime(questionDurationSeconds),
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
    const response = await ky.get(`${baseUrl}/data/${relativePath}`, {
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
// Use shared comparator implementation
export { AnswerComparator } from "./answer_comparator";
