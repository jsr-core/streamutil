# streamutil

[![JSR](https://jsr.io/badges/@core/streamutil)](https://jsr.io/@core/streamutil)
[![Test](https://github.com/jsr-core/streamutil/workflows/Test/badge.svg)](https://github.com/jsr-core/streamutil/actions?query=workflow%3ATest)
[![Codecov](https://codecov.io/github/jsr-core/streamutil/graph/badge.svg?token=Ug4J3xkG8T)](https://codecov.io/github/jsr-core/streamutil)

A utility pack for handling [Streams API](https://streams.spec.whatwg.org/).

## Usage

### channel

`channel` creates a new channel, which is a pair of a readable and writable
stream.

```ts
import { channel } from "@core/streamutil/channel";
import { push } from "@core/streamutil/push";
import { pop } from "@core/streamutil/pop";

const { reader, writer } = channel<number>();

await push(writer, 1);
await push(writer, 2);
await push(writer, 3);
console.log(await pop(reader)); // 1
console.log(await pop(reader)); // 2
console.log(await pop(reader)); // 3
```

### collect/provide

`collect` reads all chunks from a readable stream and returns them as an array
of chunks.

```ts
import { collect } from "@core/streamutil/collect";

const reader = new ReadableStream<number>({
  start(controller) {
    controller.enqueue(1);
    controller.enqueue(2);
    controller.enqueue(3);
    controller.close();
  },
});

console.log(await collect(reader)); // [1, 2, 3]
```

`provide` provides the given values to the writable stream by piping them from a
readable stream created from the values. Returns a promise that resolves when
all the values have been successfully written to the stream.

```ts
import { provide } from "@core/streamutil/provide";

const results: number[] = [];
const writer = new WritableStream<number>({
  write(chunk) {
    results.push(chunk);
  },
});

await provide(writer, [1, 2, 3]);
console.log(results); // [1, 2, 3]
```

### pipeThroughFrom

Pipes the readable side of a `TransformStream` to a `WritableStream`. Returns
the writable side of the `TransformStream` for further piping.

```ts
import { channel } from "@core/streamutil/channel";
import { collect } from "@core/streamutil/collect";
import { pipeThroughFrom } from "@core/streamutil/pipe-through-from";

const encoder = new TextEncoder();
const output = channel<string>();
const stream = pipeThroughFrom(output.writer, new TextDecoderStream());
const writer = stream.getWriter();

await writer.write(encoder.encode("Hello"));
await writer.write(encoder.encode("World"));
await writer.close();
writer.releaseLock();

const result = await collect(output.reader);
console.log(result); // ["Hello", "World"]
```

### pop/push

`pop` reads the next chunk from a readable stream.

```ts
import { pop } from "@core/streamutil/pop";

const reader = new ReadableStream<number>({
  start(controller) {
    controller.enqueue(1);
    controller.enqueue(2);
    controller.enqueue(3);
    controller.close();
  },
});

console.log(await pop(reader)); // 1
console.log(await pop(reader)); // 2
console.log(await pop(reader)); // 3
console.log(await pop(reader)); // null
```

`push` writes a chunk to a writable stream.

```ts
import { push } from "@core/streamutil/push";

const results: number[] = [];
const writer = new WritableStream<number>({
  write(chunk) {
    results.push(chunk);
  },
});

await push(writer, 1);
await push(writer, 2);
await push(writer, 3);
console.log(results); // [1, 2, 3]
```

### readAll/writeAll

`readAll` reads all available bytes from a given `ReadableStream<Uint8Array>`
and concatenates them into a single `Uint8Array`.

```ts
import { assertEquals } from "@std/assert";
import { readAll } from "@core/streamutil/read-all";

const encoder = new TextEncoder();
const stream = new ReadableStream({
  start(controller) {
    controller.enqueue(encoder.encode("Hello"));
    controller.enqueue(encoder.encode("World"));
    controller.close();
  },
});
const result = await readAll(stream);
assertEquals(result, encoder.encode("HelloWorld"));
```

`writeAll` writes all data in a Uint8Array to a writable stream in chunk-size
units.

```ts
import { assertEquals } from "@std/assert";
import { writeAll } from "@core/streamutil/write-all";

const encoder = new TextEncoder();
const chunks: Uint8Array[] = [];
const stream = new WritableStream({
  write(chunk) {
    chunks.push(chunk);
  },
});
await writeAll(stream, encoder.encode("HelloWorld"), { chunkSize: 3 });
assertEquals(chunks, [
  encoder.encode("Hel"),
  encoder.encode("loW"),
  encoder.encode("orl"),
  encoder.encode("d"),
]);
```

## License

The code is released under the MIT license, which is included in the
[LICENSE](./LICENSE) file. By contributing to this repository, contributors
agree to follow the license for any modifications made.
