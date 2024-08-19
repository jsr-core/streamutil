import { test } from "@cross/test";
import { assertEquals } from "@std/assert";
import { push } from "./push.ts";

await test("push returns the next item in the stream", async () => {
  const results: number[] = [];
  const stream = new WritableStream<number>({
    write(chunk) {
      results.push(chunk);
    },
  });
  await push(stream, 1);
  await push(stream, 2);
  await push(stream, 3);
  assertEquals(results, [1, 2, 3]);
});
