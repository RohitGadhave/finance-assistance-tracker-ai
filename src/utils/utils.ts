import path from "path";
import fs from "fs";

export const getPath = (filePath:string) => {
  const cwdPath = path.join(process.cwd(), filePath);
  if (fs.existsSync(cwdPath)) {
    return cwdPath; // Running outside `pkg`
  }
  return path.join(__dirname, filePath); // Inside `pkg`
};