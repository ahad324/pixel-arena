import type { Maze } from '@app-types/index';

export function generateMaze(width: number, height: number): Omit<Maze, 'end'> & { start: {x:number, y:number}, end: {x:number,y:number} } {
  // Ensure width and height are odd
  const w = width % 2 === 0 ? width - 1 : width;
  const h = height % 2 === 0 ? height - 1 : height;

  const grid: number[][] = Array(h)
    .fill(null)
    .map(() => Array(w).fill(1)); // 1 for wall

  const stack: { x: number; y: number }[] = [];
  const start = { x: 1, y: 1 };
  
  stack.push(start);
  grid[start.y][start.x] = 0; // 0 for path

  const shuffle = <T,>(array: T[]): T[] => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  while (stack.length > 0) {
    const current = stack.pop()!;
    const neighbors = [];

    const directions = [ { x: 0, y: -2 }, { x: 2, y: 0 }, { x: 0, y: 2 }, { x: -2, y: 0 }];

    for (const dir of shuffle(directions)) {
      const nx = current.x + dir.x;
      const ny = current.y + dir.y;

      if (nx > 0 && nx < w - 1 && ny > 0 && ny < h - 1 && grid[ny][nx] === 1) {
        neighbors.push({ nx, ny, dir });
      }
    }
    
    if (neighbors.length > 0) {
      stack.push(current);
      const { nx, ny, dir } = neighbors[0];
      
      grid[ny][nx] = 0;
      grid[current.y + dir.y / 2][current.x + dir.x / 2] = 0;

      stack.push({ x: nx, y: ny });
    }
  }

  // Post-processing: remove some dead ends to create loops and complexity
  const deadEndRemovalRate = 0.35; // Remove 35% of dead ends
  for (let y = 1; y < h - 1; y += 2) {
      for (let x = 1; x < w - 1; x += 2) {
          if (grid[y][x] === 0) {
              let wallCount = 0;
              const walls = [];
              const wallDirs = [ {x: 0, y: -1}, {x: 1, y: 0}, {x: 0, y: 1}, {x: -1, y: 0} ];
              for(const dir of wallDirs) {
                  if (grid[y + dir.y]?.[x + dir.x] === 1) {
                      wallCount++;
                      walls.push(dir);
                  }
              }
              if (wallCount >= 3 && Math.random() < deadEndRemovalRate) {
                  const wallToBreak = walls[Math.floor(Math.random() * walls.length)];
                  grid[y + wallToBreak.y][x + wallToBreak.x] = 0;
              }
          }
      }
  }

  return {
    grid,
    start: { x: 1, y: 1 },
    end: { x: w - 2, y: h - 2 },
  };
}