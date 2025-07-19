import { Worker } from "worker_threads";
import path from "path";
import { generateMaze } from "./mazeGenerator";
import { GRID_SIZE } from "@config/constants";

const isProd = process.env.NODE_ENV === "production";
const pool: Promise<number[][]>[] = [];

if (isProd) {
  // Only create worker threads in production (where dist/ exists)
  for (let i = 0; i < 4; i++) {
    pool.push(
      new Promise<number[][]>((resolve) => {
        const workerPath = path.join(__dirname, "mazeWorker.js");
        const w = new Worker(workerPath);
        w.on("message", resolve);
        w.on("error", (err) => {
          console.error("Maze worker error:", err);
          // Fallback to sync generation if worker fails
          resolve(generateMaze(GRID_SIZE, GRID_SIZE).grid);
        });
      })
    );
  }
}

export async function getMaze(): Promise<number[][]> {
  if (!isProd) {
    // In dev, generate maze synchronously
    return generateMaze(GRID_SIZE, GRID_SIZE).grid;
  }

  const job = pool.shift()!;
  pool.push(job); // rotate the pool
  return job;
}
