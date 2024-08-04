/**
 * Writes a chunk to a writable stream.
 *
 * ```ts
 * import { push } from "@core/streamutil/push";
 *
 * const results: number[] = [];
 * const writer = new WritableStream<number>({
 *   write(chunk) {
 *     results.push(chunk);
 *   },
 * });
 *
 * await push(writer, 1);
 * await push(writer, 2);
 * await push(writer, 3);
 * console.log(results); // [1, 2, 3]
 * ```
 *
 * @param stream The stream to write to.
 * @param value The chunk to write to the stream.
 * @returns A promise that resolves once the chunk has been written to the stream.
 */
export async function push<T>(
  stream: WritableStream<T>,
  value: T,
): Promise<void> {
  const writer = stream.getWriter();
  await writer.ready;
  await writer.write(value);
  writer.releaseLock();
}
