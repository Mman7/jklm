import { readdirSync, readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { Question } from "../types/question";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function getRandomQuestions(count: number = 10) {
  const dirPath = join(__dirname, "../data/popsauces");
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
  question.challenge.image.base64 = "";
  question.answer = "";
  return question;
}
