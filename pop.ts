/**
 * Reads the next chunk from a readable stream.
 *
 * ```ts
 * import { pop } from "@core/streamutil/pop";
 *
 * const reader = new ReadableStream<number>({
 *   start(controller) {
 *     controller.enqueue(1);
 *     controller.enqueue(2);
 *     controller.enqueue(3);
 *     controller.close();
 *   },
 * });
 *
 * console.log(await pop(reader)); // 1
 * console.log(await pop(reader)); // 2
 * console.log(await pop(reader)); // 3
 * console.log(await pop(reader)); // null
 * ```
 *
 * @param stream The stream to read from.
 * @returns A promise that resolves with the next chunk from the stream or null if the stream is closed.
 */
export async function pop<T>(stream: ReadableStream<T>): Promise<T | null> {
  const reader = stream.getReader();
  const result = await reader.read();
  reader.releaseLock();
  if (result.done) {
    return null;
  }
  return result.value;
}
