import { readFileSync } from "fs";
import path from "path";
import { Challenge, Question, QuestionHashOnly } from "../types/question";

const answersPath = path.join(process.cwd(), "public/data/answers_pairs.json");
const indexPath = path.join(process.cwd(), "public/data/questions_paths.json");

const answersFile = readFileSync(answersPath, "utf-8");
const parseFile = JSON.parse(answersFile);

const questionPathMap = loadQuestionPathMap();

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

export function getRandomQuestions(count: number = 10) {
  const hashes = Object.keys(questionPathMap);
  const questions: QuestionHashOnly[] = [];

  for (let i = 0; i < count; i++) {
    const randomHash = hashes[Math.floor(Math.random() * hashes.length)];
    if (randomHash) {
      questions.push({ hash: randomHash });
    }
  }

  return questions;
}

function generateCountTime() {
  // Set end time to 10 seconds from now
  return Date.now() + 10_000;
}

export async function getQuestion(
  questionHash: string,
): Promise<Question | null> {
  const question = await readQuestionByHash(questionHash);
  if (!question) {
    return null;
  }

  question.challenge.end_time = generateCountTime();

  // return question ? removeAnswerFromQuestion(question) : null;
  return question;
}

// function removeAnswerFromQuestion(question: Question): Question {
//   question.answer = "";
//   return question;
// }

export async function getChallenge(hash: string): Promise<null | Challenge> {
  const question = await readQuestionByHash(hash);
  return question ? question.challenge : null;
}

async function readQuestionByHash(hash: string): Promise<Question | null> {
  const cachedQuestion = questionCache.get(hash);
  if (cachedQuestion) {
    return cachedQuestion;
  }

  const relativePath = questionPathMap[hash];
  if (!relativePath) {
    return null;
  }

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
  return (
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.URL ||
    process.env.DEPLOY_PRIME_URL ||
    `http://127.0.0.1:${process.env.PORT || "3000"}`
  );
}

export async function findAnswer(hash: string): Promise<string> {
  return parseFile[hash];
}

export async function AnswerComparator(
  answerInStore: string,
  submitAnswer: string,
) {
  if (!submitAnswer || !submitAnswer.trim()) {
    return false; // Prevent empty or whitespace-only answers
  }

  const normalizedStore = answerInStore.trim().toLowerCase();
  const normalizedSubmit = submitAnswer.trim().toLowerCase();

  // Check exact match
  if (normalizedStore === normalizedSubmit) {
    return true;
  }

  // Split submit answer by space and check if any part matches store answer
  const submitParts = normalizedSubmit.split(" ");
  return submitParts.includes(normalizedStore);
}
