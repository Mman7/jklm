import { readdirSync, readFileSync } from "fs";
import path from "path";
import { Challenge, Question, QuestionHashOnly } from "../types/question";

const answersPath = path.join(process.cwd(), "public/data/answers_pairs.json");
const indexPath = path.join(process.cwd(), "public/data/questions_paths.json");
const dataDir = path.join(process.cwd(), "public/data");

const answersFile = readFileSync(answersPath, "utf-8");
const parseFile = JSON.parse(answersFile);

const questionPathMap = loadQuestionPathMap();

const questionCache = new Map<string, Question>();

function loadQuestionPathMap(): Record<string, string> {
  try {
    const indexFile = readFileSync(indexPath, "utf-8");
    return JSON.parse(indexFile) as Record<string, string>;
  } catch {
    const fallbackQuestionsDir = path.join(dataDir, "popsauces");

    try {
      const files = readdirSync(fallbackQuestionsDir).filter((fileName) =>
        fileName.endsWith(".json"),
      );

      const fallbackMap: Record<string, string> = {};
      for (const fileName of files) {
        const hash = path.parse(fileName).name;
        fallbackMap[hash] = `popsauces/${fileName}`;
      }

      if (Object.keys(fallbackMap).length === 0) {
        throw new Error();
      }

      console.warn(
        "[question_utils] questions_paths.json not found. Using fallback question map from public/data/popsauces. Run `npm run prebuild` to regenerate the index.",
      );
      return fallbackMap;
    } catch {
      throw new Error(
        "[question_utils] Missing public/data/questions_paths.json and unable to build fallback map. Run `npm run prebuild` before starting the app.",
      );
    }
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

export function getQuestion(questionHash: string): Question | null {
  const question = readQuestionByHash(questionHash);
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
  const question = readQuestionByHash(hash);
  return question ? question.challenge : null;
}

function readQuestionByHash(hash: string): Question | null {
  const cachedQuestion = questionCache.get(hash);
  if (cachedQuestion) {
    return cachedQuestion;
  }

  const relativePath = questionPathMap[hash];
  if (!relativePath) {
    return null;
  }

  const absolutePath = path.join(dataDir, relativePath);
  const fileContent = readFileSync(absolutePath, "utf-8");
  const parsedQuestion = JSON.parse(fileContent) as Question;
  questionCache.set(hash, parsedQuestion);
  return parsedQuestion;
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
