/** Read until an empty batch, not a short batch: a server may cap responses below our requested limit. */
export async function collectPages<T>(
  read: (from: number, to: number) => Promise<T[]>,
  batchSize = 500,
): Promise<T[]> {
  const result: T[] = [];
  for (;;) {
    const rows = await read(result.length, result.length + batchSize - 1);
    if (rows.length === 0) return result;
    result.push(...rows);
  }
}
