/**
 * Reads all chunks from a readable stream and returns them as an array of chunks.
 *
 * ```ts
 * import { collect } from "@core/streamutil/collect";
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
 * console.log(await collect(reader)); // [1, 2, 3]
 * ```
 *
 * @param stream The readable stream to read chunks from.
 * @returns A promise that resolves with an array of all the chunks read from the stream.
 */
export async function collect<T>(
  stream: ReadableStream<T>,
  options: StreamPipeOptions = {},
): Promise<T[]> {
  const chunks: T[] = [];
  await stream.pipeTo(
    new WritableStream({
      write(chunk) {
        chunks.push(chunk);
      },
    }),
    options,
  );
  return chunks;
}
