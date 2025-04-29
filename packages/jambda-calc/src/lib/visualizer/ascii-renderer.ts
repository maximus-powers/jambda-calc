import { JSDOM } from 'jsdom';

export function renderSVGAsASCII(svgString: string): string {
  const dom = new JSDOM(svgString);
  const document = dom.window.document;
  const svgLineElements = document.querySelectorAll('line');

  // extract line coords from svg
  const svgLines = Array.from(svgLineElements).map((line) => ({
    x1: parseFloat(line.getAttribute('x1') || '0'),
    y1: parseFloat(line.getAttribute('y1') || '0'),
    x2: parseFloat(line.getAttribute('x2') || '0'),
    y2: parseFloat(line.getAttribute('y2') || '0'),
  }));

  // create bounding box
  let minX = Infinity,
    minY = Infinity;
  let maxX = -Infinity,
    maxY = -Infinity;
  svgLines.forEach((line) => {
    minX = Math.min(minX, line.x1, line.x2);
    minY = Math.min(minY, line.y1, line.y2);
    maxX = Math.max(maxX, line.x1, line.x2);
    maxY = Math.max(maxY, line.y1, line.y2);
  });

  // make lists for h lines and v lines
  const horizontalLines: { x1: number; x2: number; y: number }[] = [];
  const verticalLines: { x: number; y1: number; y2: number }[] = [];
  svgLines.forEach((line) => {
    if (Math.abs(line.y1 - line.y2) < 1) {
      horizontalLines.push({
        x1: Math.min(line.x1, line.x2),
        x2: Math.max(line.x1, line.x2),
        y: line.y1,
      });
    } else if (Math.abs(line.x1 - line.x2) < 1) {
      verticalLines.push({
        x: line.x1,
        y1: Math.min(line.y1, line.y2),
        y2: Math.max(line.y1, line.y2),
      });
    }
  });

  // map lines to unique grid coords
  const xPoints = new Set<number>();
  const yPoints = new Set<number>();

  verticalLines.forEach((line) => xPoints.add(Math.round(line.x)));
  horizontalLines.forEach((line) => yPoints.add(Math.round(line.y)));

  horizontalLines.forEach((line) => {
    xPoints.add(Math.round(line.x1));
    xPoints.add(Math.round(line.x2));
  });
  verticalLines.forEach((line) => {
    yPoints.add(Math.round(line.y1));
    yPoints.add(Math.round(line.y2));
  });

  const sortedX = Array.from(xPoints).sort((a, b) => a - b);
  const sortedY = Array.from(yPoints).sort((a, b) => a - b);

  // map original coords to grid coords
  const xMap = new Map<number, number>();
  const yMap = new Map<number, number>();

  sortedX.forEach((x, i) => xMap.set(x, i * 2)); // double spacing
  sortedY.forEach((y, i) => yMap.set(y, i));

  // create a grid (canvas) to draw our lines on
  const width = sortedX.length * 2 + 1; // double spacing
  const height = sortedY.length + 1;

  const grid = Array(height)
    .fill(0)
    .map(() => Array(width).fill(' '));

  // find intersections
  const intersections: Set<string> = new Set();
  for (const hLine of horizontalLines) {
    const hY = Math.round(hLine.y);
    const hX1 = Math.round(hLine.x1);
    const hX2 = Math.round(hLine.x2);

    for (const vLine of verticalLines) {
      const vX = Math.round(vLine.x);
      const vY1 = Math.round(vLine.y1);
      const vY2 = Math.round(vLine.y2);

      if (vX >= hX1 && vX <= hX2 && hY >= vY1 && hY <= vY2) {
        const gridX = xMap.get(vX) || 0;
        const gridY = yMap.get(hY) || 0;
        intersections.add(`${gridX},${gridY}`);
      }
    }
  }

  // draw v lines
  for (const line of verticalLines) {
    const gridX = xMap.get(Math.round(line.x)) || 0;
    const startY = yMap.get(Math.round(line.y1)) || 0;
    const endY = yMap.get(Math.round(line.y2)) || 0;

    for (let y = startY; y <= endY; y++) {
      grid[y][gridX] = '│';
    }
  }

  // draw h lines
  for (const line of horizontalLines) {
    const gridY = yMap.get(Math.round(line.y)) || 0;
    const startX = xMap.get(Math.round(line.x1)) || 0;
    const endX = xMap.get(Math.round(line.x2)) || 0;

    for (let x = startX; x <= endX; x++) {
      const key = `${x},${gridY}`;
      if (intersections.has(key)) {
        grid[gridY][x] = '┼';
      } else {
        grid[gridY][x] = '─';
      }
    }
  }

  return grid.map((row) => row.join('')).join('\n');
}
