import { readFileSync } from "fs";
import { readFile } from "fs/promises";
import path from "path";
import type {
  Question,
  QuestionHashOnly,
  QuestionPublic,
} from "../types/question";
import { sampleSize } from "lodash-es";

// Static data files generated during prebuild.
const dataDir = path.join(process.cwd(), "public");
const questionsDir = path.join(dataDir, "popsauces");
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
      "[question_utils] Missing public/data/questions_paths.json. Run the prebuild script before starting the app.",
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
    const questionPath = path.join(questionsDir, relativePath);
    const questionFile = await readFile(questionPath, "utf-8");
    const parsedQuestion = JSON.parse(questionFile) as Question;
    questionCache.set(hash, parsedQuestion);
    return parsedQuestion;
  } catch (error) {
    console.error(`Failed to read question file for hash ${hash}:`, error);
    return null;
  }
}

export async function findAnswer(hash: string): Promise<string> {
  // Constant-time lookup from precomputed hash -> answer map.
  return parseFile[hash] ?? "";
}
// Use shared comparator implementation
export { AnswerComparator } from "./answer_comparator";
