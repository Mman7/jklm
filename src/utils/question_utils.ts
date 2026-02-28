import { readFileSync } from "fs";
import path from "path";
import type { Challenge, Question, QuestionHashOnly } from "../types/question";

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

export async function getQuestion(
  questionHash: string,
): Promise<Question | null> {
  // Load full question payload by hash.
  const question = await readQuestionByHash(questionHash);
  if (!question) {
    return null;
  }

  // Inject per-request round end time into challenge metadata.
  question.challenge.end_time = generateCountTime();

  // return question ? removeAnswerFromQuestion(question) : null;
  return question;
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

export async function getChallenge(hash: string): Promise<null | Challenge> {
  // Lightweight helper for challenge-only consumers.
  const question = await readQuestionByHash(hash);
  return question ? question.challenge : null;
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

  // Fetch from public data endpoint; no-store to avoid stale edge/client cache.
  const response = await fetch(`${getBaseUrl()}/data/${relativePath}`, {
    cache: "no-store",
  });
  if (!response.ok) {
    return null;
  }

  const parsedQuestion = (await response.json()) as Question;
  questionCache.set(hash, parsedQuestion);
  return parsedQuestion;
}

function getBaseUrl() {
  // Prefer explicit public URL envs, then deployment URL, then localhost.
  return (
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.URL ||
    process.env.DEPLOY_PRIME_URL ||
    `http://127.0.0.1:${process.env.PORT || "3000"}`
  );
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

  // Fallback: any token in submitted text can match the expected answer.
  const submitParts = normalizedSubmit.split(" ");
  return submitParts.includes(normalizedStore);
}
