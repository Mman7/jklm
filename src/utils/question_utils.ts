import { readdirSync, readFileSync } from "fs";
import path from "path"; // Optional, but useful for path manipulation
import { join } from "path";
import { Challenge, Question, QuestionHashOnly } from "../types/question";

// const __filename = fileURLToPath(import.meta.url);
// process.env.NEXT_PUBLIC_BASE_URL
// const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/data/answers_pairs.json`)
// options 3 move data to src folder
// const dirPath = join(__dirname, "../data/popsauces");
const dirPath = path.join(process.cwd(), "src/data/popsauces");
const filePath = path.join(process.cwd(), "src/data/answers_pairs.json");

const file = readFileSync(filePath, "utf-8");
const parseFile = JSON.parse(file);

const questionHashMap = new Map<string, Question>();
const files = readdirSync(dirPath);

files.forEach((file) => {
  const filePath = join(dirPath, file);
  const fileContent = readFileSync(filePath, "utf-8");
  const question = JSON.parse(fileContent) as Question;
  questionHashMap.set(question.challenge.hash, question);
});

export function getRandomQuestions(count: number = 10) {
  const hashes = Array.from(questionHashMap.keys());
  const questions: QuestionHashOnly[] = [];

  for (let i = 0; i < count; i++) {
    const randomHash = hashes[Math.floor(Math.random() * hashes.length)];
    const question = questionHashMap.get(randomHash);
    if (question) {
      questions.push(convertToHashOnly(question));
    }
  }

  return questions;
}

function generateCountTime() {
  // Set end time to 10 seconds from now
  return Date.now() + 10_000;
}

export function getQuestion(questionHash: string): Question | null {
  const question = questionHashMap.get(questionHash);
  question!.challenge.end_time = generateCountTime();

  // return question ? removeAnswerFromQuestion(question) : null;
  return question || null;
}

// function removeAnswerFromQuestion(question: Question): Question {
//   question.answer = "";
//   return question;
// }

function convertToHashOnly(question: Question): QuestionHashOnly {
  return { hash: question.challenge.hash };
}

export async function getChallenge(hash: string): Promise<null | Challenge> {
  const question = questionHashMap.get(hash);
  return question ? question.challenge : null;
}

export async function findAnswer(hash: string): Promise<string> {
  return parseFile[hash];
}

//TODO fix weird bug when sometimes answer cant be parsed correctly, maybe need to check if the hash exist in parseFile or not before return answer
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
