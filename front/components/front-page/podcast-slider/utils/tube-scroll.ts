export function getLatestRowScrollOffset(
  rows: number,
  ySpacing: number,
  repeatCount: number,
): number {
  const totalRows = rows * repeatCount;
  const mid = (totalRows - 1) / 2;
  let bestRowIndex = 0;
  let bestDistance = Infinity;

  for (let rowIndex = 0; rowIndex < totalRows; rowIndex += rows) {
    const distance = Math.abs(rowIndex - mid);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestRowIndex = rowIndex;
    }
  }

  return (bestRowIndex - mid) * ySpacing;
}
