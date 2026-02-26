// scripts/build-index.js
import fs from "fs";
import path from "path";

const dir = path.join(process.cwd(), "public/data/popsauces");
const files = fs.readdirSync(dir);
const hashes = files.map((f) => path.parse(f).name); // remove .json extension
fs.writeFileSync(
  path.join(dir, "questions_index.json"),
  JSON.stringify(hashes),
);
console.log("Index built:", hashes.length, "questions");
