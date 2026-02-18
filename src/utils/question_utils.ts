import { readdirSync, readFileSync } from "fs";
import path from "path"; // Optional, but useful for path manipulation
import { readFile } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { Challenge, Question, QuestionHashOnly } from "../types/question";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dirPath = join(__dirname, "../../data/popsauces");

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

export function getQuestion(questionHash: string): Question | null {
  const question = questionHashMap.get(questionHash);
  return question ? removeAnswerFromQuestion(question) : null;
}

function removeAnswerFromQuestion(question: Question): Question {
  question.answer = "";
  return question;
}

function convertToHashOnly(question: Question): QuestionHashOnly {
  return { hash: question.challenge.hash };
}

export async function getChallenge(hash: string): Promise<null | Challenge> {
  const question = questionHashMap.get(hash);
  return question ? question.challenge : null;
}

export async function findAnswer(hash: string) {
  const filePath = path.join(__dirname, "../../data/answers_pairs.json");
  const file = await readFile(filePath, "utf-8");
  const parseFile = JSON.parse(file);

  return parseFile[hash];
}

export async function AnswerComparator(
  answerInStore: string,
  submitAnswer: string,
) {
  return answerInStore === submitAnswer;
}
