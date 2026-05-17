import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { getServerEnv } from "@/server/config/env";

export function createId() {
  return randomUUID();
}

export function getUploadsRoot() {
  const normalizedUploadsDir = getServerEnv()
    .uploadsDir.replace(/^\.?[\\/]/, "")
    .split(/[\\/]+/)
    .filter((segment) => segment && segment !== "." && segment !== "..");

  return path.join(process.cwd(), ...normalizedUploadsDir);
}

export async function ensureDir(dirPath: string) {
  await mkdir(dirPath, { recursive: true });
  return dirPath;
}

export async function ensureUploadsDir(...segments: string[]) {
  return ensureDir(path.join(getUploadsRoot(), ...segments));
}

export async function writeJsonFile<T>(filePath: string, data: T) {
  await ensureDir(path.dirname(filePath));
  await writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
}

export async function readJsonFile<T>(filePath: string, fallback: T): Promise<T> {
  try {
    const content = await readFile(filePath, "utf8");
    return JSON.parse(content) as T;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return fallback;
    }
    throw error;
  }
}

export function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
}
