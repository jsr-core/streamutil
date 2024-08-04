/**
 * Options for configuring the piping behavior.
 */
export type WriteAllOptions = StreamPipeOptions & {
  /** The size of each chunk to write to the stream (Default: 1024) */
  chunkSize?: number;
};

/**
 * Writes all data in a Uint8Array to a writable stream in chunk-size units.
 *
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import { writeAll } from "@core/streamutil/write-all";
 *
 * const encoder = new TextEncoder();
 * const chunks: Uint8Array[] = [];
 * const stream = new WritableStream({
 *   write(chunk) {
 *     chunks.push(chunk);
 *   },
 * });
 * await writeAll(stream, encoder.encode("HelloWorld"), { chunkSize: 3 });
 * assertEquals(chunks, [
 *   encoder.encode("Hel"),
 *   encoder.encode("loW"),
 *   encoder.encode("orl"),
 *   encoder.encode("d"),
 * ]);
 * ```
 *
 * @param stream The stream to write to.
 * @param data The data to write.
 * @returns A promise that resolves when all the data has been written to the stream.
 */
export async function writeAll(
  stream: WritableStream<Uint8Array>,
  data: Uint8Array,
  options: WriteAllOptions = {},
): Promise<void> {
  const { chunkSize = 1024, ...rest } = options;
  const input = new ReadableStream({
    start(controller) {
      let offset = 0;
      while (offset < data.length) {
        controller.enqueue(data.subarray(offset, offset + chunkSize));
        offset += chunkSize;
      }
      controller.close();
    },
  });
  await input.pipeTo(stream, rest);
}
