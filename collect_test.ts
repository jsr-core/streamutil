import { test } from "@cross/test";
import { assertEquals, assertRejects } from "@std/assert";
import { deadline } from "@std/async";
import { collect } from "./collect.ts";

test("collect returns an empty array for an empty stream", async () => {
  const stream = new ReadableStream<string>({
    start(controller) {
      controller.close();
    },
  });
  const result = await collect(stream);
  assertEquals(result, []);
});

test("collect returns all chunks in order for a non-empty stream", async () => {
  const chunks = ["a", "b", "c"];
  const stream = new ReadableStream<string>({
    start(controller) {
      chunks.forEach((chunk) => controller.enqueue(chunk));
      controller.close();
    },
  });
  const result = await collect(stream);
  assertEquals(result, chunks);
});

test("collect throws an error when the stream emits an error", async () => {
  const error = new Error("test error");
  const stream = new ReadableStream<string>({
    start(controller) {
      controller.error(error);
    },
  });
  await assertRejects(
    () => collect(stream),
  );
});

test("collect waits forever when the stream is not closed", async () => {
  const stream = new ReadableStream<string>();
  await assertRejects(
    () => deadline(collect(stream), 100),
    DOMException,
    "Signal timed out.",
  );
});
