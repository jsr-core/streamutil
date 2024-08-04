import { concat } from "@std/bytes";
import { collect } from "./collect.ts";

/**
 * Reads all available bytes from a given `ReadableStream<Uint8Array>` and concatenates them into a single `Uint8Array`.
 *
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import { readAll } from "@core/streamutil/read-all";
 *
 * const encoder = new TextEncoder();
 * const stream = new ReadableStream({
 *   start(controller) {
 *     controller.enqueue(encoder.encode("Hello"));
 *     controller.enqueue(encoder.encode("World"));
 *     controller.close();
 *   },
 * });
 * const result = await readAll(stream);
 * assertEquals(result, encoder.encode("HelloWorld"));
 * ```
 *
 * @param stream The stream to read from.
 * @returns A promise that resolves to a `Uint8Array` containing all the bytes read from the stream.
 */
export async function readAll(
  stream: ReadableStream<Uint8Array>,
  options: StreamPipeOptions = {},
): Promise<Uint8Array> {
  const chunks = await collect(stream, options);
  return concat(chunks);
}
