/**
 * Pipes the readable side of a TransformStream to a WritableStream.
 * Returns the writable side of the TransformStream for further piping.
 *
 * ```ts
 * import { channel } from "@core/streamutil/channel";
 * import { collect } from "@core/streamutil/collect";
 * import { pipeThroughFrom } from "@core/streamutil/pipe-through-from";
 *
 * const encoder = new TextEncoder();
 * const output = channel<string>();
 * const stream = pipeThroughFrom(output.writer, new TextDecoderStream());
 * const writer = stream.getWriter();
 *
 * await writer.write(encoder.encode("Hello"));
 * await writer.write(encoder.encode("World"));
 * await writer.close();
 * writer.releaseLock();
 *
 * const result = await collect(output.reader);
 * console.log(result); // ["Hello", "World"]
 * ```
 *
 * @param stream The destination WritableStream to pipe the data into.
 * @param transform The TransformStream that transforms the input data.
 * @returns The writable side of the TransformStream for further piping.
 */
export function pipeThroughFrom<I, O>(
  stream: WritableStream<O>,
  transform: TransformStream<I, O>,
): WritableStream<I> {
  transform.readable.pipeTo(stream);
  return transform.writable;
}
