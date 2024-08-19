import { test } from "@cross/test";
import { assertEquals } from "@std/assert";
import { provide } from "./provide.ts";

test("provide writes all values to stream", async () => {
  const chunks: number[] = [];
  const stream = new WritableStream<number>({
    write(chunk) {
      chunks.push(chunk);
    },
  });
  const values = [1, 2, 3];
  await provide(stream, values);
  assertEquals(chunks, values);
});
