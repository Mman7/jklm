import fs from "fs";
import path from "path";

const dataDir = path.join(process.cwd(), "public/data");
const questionsDir = path.join(dataDir, "popsauces");
const outputPath = path.join(dataDir, "questions_paths.json");

const files = fs
  .readdirSync(questionsDir)
  .filter((fileName) => fileName.endsWith(".json"));

const questionPaths = {};

for (const fileName of files) {
  const hash = path.parse(fileName).name;
  questionPaths[hash] = `popsauces/${fileName}`;
}

fs.writeFileSync(outputPath, JSON.stringify(questionPaths));
console.log(
  "Question path map built:",
  Object.keys(questionPaths).length,
  "questions",
);
