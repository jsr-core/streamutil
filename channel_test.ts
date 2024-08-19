import { test } from "@cross/test";
import { assertEquals, assertRejects } from "@std/assert";
import { deadline } from "./_testutil.ts";
import { provide } from "./provide.ts";
import { pop } from "./pop.ts";
import { push } from "./push.ts";
import { collect } from "./collect.ts";
import { channel } from "./channel.ts";

await test(
  "channel pushing data to the writer makes it available to the reader",
  async () => {
    const { reader, writer } = channel<number>();
    await provide(writer, [1, 2, 3]);
    assertEquals(await collect(reader), [1, 2, 3]);
  },
);

await test(
  "channel the reader waits for the writer to push data",
  async () => {
    const { reader, writer } = channel<number>();
    const waiter = pop(reader);
    await assertRejects(
      () => deadline(waiter, 100),
      DOMException,
      "Signal timed out.",
    );
    await push(writer, 1);
    assertEquals(await deadline(waiter, 100), 1);
  },
);

await test(
  "channel the reader is canceled when the writer is closed",
  async () => {
    const { reader, writer } = channel<number>();
    const waiter = collect(reader);
    await assertRejects(
      () => deadline(waiter, 100),
      DOMException,
      "Signal timed out.",
    );
    await push(writer, 1);
    await assertRejects(
      () => deadline(waiter, 100),
      DOMException,
      "Signal timed out.",
    );
    writer.close();
    assertEquals(await deadline(waiter, 100), [1]);
  },
);

await test(
  "channel closing the writer with already canceled reader does not throw an error",
  () => {
    const { reader, writer } = channel<number>();
    reader.cancel();
    writer.close();
  },
);
