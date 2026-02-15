//TODO load file path to hashMap to improved performance of each fetch
import { readdirSync, readFileSync } from "fs";
import path from "path"; // Optional, but useful for path manipulation
import { readFile } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { Challenge, Question } from "../types/question";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function getRandomQuestions(count: number = 10) {
  const dirPath = join(__dirname, "../../data/popsauces");
  const files = readdirSync(dirPath);
  const questions: Question[] = [];

  for (let i = 0; i < count; i++) {
    const randomFile = files[Math.floor(Math.random() * files.length)];
    const filePath = join(dirPath, randomFile);
    const fileContent = readFileSync(filePath, "utf-8");
    const question = JSON.parse(fileContent) as Question;
    questions.push(removedImageAndAnswer(question));
  }

  const newList = questions.map((q) => removedImageAndAnswer(q));
  return newList;
}

function removedImageAndAnswer(question: Question) {
  question.answer = "";
  question.challenge.image = null;
  return question;
}

// export function getImage(hash: string) {
//   const dirPath = join(__dirname, "../../data/popsauces");
//   const files = readdirSync(dirPath);

//   for (const file of files) {
//     const filePath = join(dirPath, file);
//     const fileContent = readFileSync(filePath, "utf-8");
//     const question = JSON.parse(fileContent) as Question;

//     if (question.challenge.hash === hash) {
//       return question.challenge.image?.base64;
//     }
//   }

//   return null;
// }

export async function getChallenge(hash: string): Promise<null | Challenge> {
  const dirPath = join(__dirname, "../../data/popsauces");
  const files = readdirSync(dirPath);

  for (const file of files) {
    const filePath = join(dirPath, file);
    const fileContent = readFileSync(filePath, "utf-8");
    const question = JSON.parse(fileContent) as Question;

    if (question.challenge.hash === hash) return question.challenge;
  }
  return null;
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
