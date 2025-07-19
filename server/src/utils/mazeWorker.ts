import { parentPort } from "worker_threads";
import { generateMaze } from "./mazeGenerator";
import { GRID_SIZE } from "@config/constants";

// generate & send only the grid
const { grid } = generateMaze(GRID_SIZE, GRID_SIZE);
parentPort!.postMessage(grid);
