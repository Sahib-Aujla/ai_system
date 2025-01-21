import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function getFileContent(file) {
  try {
    const filePath = path.join(__dirname, file);
    if (!fs.existsSync(filePath)) {
      return null;
    }
    const data = fs.readFileSync(filePath, "utf8");
    return data;
  } catch (error) {
    console.error(`Error reading file ${file}:`, error);
    return null;
  }
}

export function writeFileContent(file, content) {
  try {
    const filePath = path.join(__dirname, file);
    fs.writeFileSync(filePath, content, "utf8");
  } catch (error) {
    console.error(`Error writing to file ${file}:`, error);
  }
}
