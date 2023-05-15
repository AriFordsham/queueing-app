import { t } from "xstate";
import { endTime } from "./timings.ts";

import { test, expect } from "@jest/globals";

test("two ticks", () => {
  expect(
    endTime(
      {
        startTime: new Date(0),
        lastTime: new Date(5),
        queuersQueued: 1,
        queuersProcessed: 1,
      },
      new Date(5)
    ).valueOf()
  ).toBe(10);
});

test("three ticks", () => {
  expect(
    endTime(
      {
        startTime: new Date(0),
        lastTime: new Date(10),
        queuersQueued: 1,
        queuersProcessed: 2,
      },
      new Date(5)
    ).valueOf()
  ).toBe(15);
});

test("one tick under time", () => {
  expect(
    endTime(
      {
        startTime: new Date(0),
        lastTime: new Date(4),
        queuersQueued: 2,
        queuersProcessed: 1,
      },
      new Date(7)
    ).valueOf()
  ).toBe(12);
});

test("one tick over time", () => {
  expect(
    endTime(
      {
        startTime: new Date(0),
        lastTime: new Date(4),
        queuersQueued: 2,
        queuersProcessed: 1,
      },
      new Date(10)
    ).valueOf()
  ).toBe(15);
});
