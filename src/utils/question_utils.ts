import { readFileSync } from "fs";
import path from "path";
import type {
  Question,
  QuestionHashOnly,
  QuestionPublic,
} from "../types/question";
import ky from "ky";
import { sampleSize } from "lodash-es";

// Static data files generated during prebuild.
const dataDir = path.join(process.cwd(), "public", "data");
const answersPath = path.join(dataDir, "answers_pairs.json");
const indexPath = path.join(dataDir, "questions_paths.json");

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
      "[question_utils] Missing questions_paths.json. Run the prebuild script before starting the app.",
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
  return parseFile[hash] ?? "";
}
// Use shared comparator implementation
export { AnswerComparator } from "./answer_comparator";
