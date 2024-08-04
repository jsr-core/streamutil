/**
 * A channel is a pair of a readable and writable stream.
 * It is useful for creating a communication channel between two parts of a program.
 */
export type Channel<T> = {
  /**
   * The readable side of the channel.
   */
  reader: ReadableStream<T>;
  /**
   * The writable side of the channel.
   */
  writer: WritableStream<T>;
};

/**
 * Creates a new channel, which is a pair of a readable and writable stream.
 *
 * ```ts
 * import { channel } from "@core/streamutil/channel";
 * import { push } from "@core/streamutil/push";
 * import { pop } from "@core/streamutil/pop";
 *
 * const { reader, writer } = channel<number>();
 *
 * await push(writer, 1);
 * await push(writer, 2);
 * await push(writer, 3);
 * console.log(await pop(reader)); // 1
 * console.log(await pop(reader)); // 2
 * console.log(await pop(reader)); // 3
 * ```
 *
 * @param writableStrategy The strategy for the writable side of the channel.
 * @param readableStrategy The strategy for the readable side of the channel.
 * @returns A channel object containing a readable stream and a writable stream.
 */
export function channel<T>(
  writableStrategy?: QueuingStrategy<T>,
  readableStrategy?: QueuingStrategy<T>,
): Channel<T> {
  writableStrategy ??= new CountQueuingStrategy({ highWaterMark: 1 });
  readableStrategy ??= new CountQueuingStrategy({ highWaterMark: 0 });
  let readerCancelled = false;
  let readerController: ReadableStreamDefaultController<T>;
  const reader = new ReadableStream<T>({
    start(constroller) {
      readerController = constroller;
    },
    cancel() {
      readerCancelled = true;
    },
  }, readableStrategy);
  const writer = new WritableStream<T>({
    write(chunk) {
      readerController.enqueue(chunk);
    },
    close() {
      if (!readerCancelled) {
        readerController.close();
      }
    },
  }, writableStrategy);
  return { reader, writer };
}
