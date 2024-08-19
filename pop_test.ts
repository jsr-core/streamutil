import { test } from "@cross/test";
import { assertEquals } from "@std/assert";
import { pop } from "./pop.ts";

await test(
  "pop returns the next item in the stream or null if the stream is closed",
  async () => {
    const stream = new ReadableStream<number>({
      start(controller) {
        controller.enqueue(1);
        controller.enqueue(2);
        controller.enqueue(3);
        controller.close();
      },
    });
    assertEquals(await pop(stream), 1);
    assertEquals(await pop(stream), 2);
    assertEquals(await pop(stream), 3);
    assertEquals(await pop(stream), null);
  },
);
