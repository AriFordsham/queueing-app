import { endTime } from "./timings.ts";

import { test, expect } from "@jest/globals";

test("single tick", () => {
  expect(
    endTime({
      startTime: new Date(0),
      lastTime: new Date(1),
      queuersProcessed: 1,
      queueLength: 1,
    }).valueOf()
  ).toBe(1);
});

test("bigger tick", () => {
  expect(
    endTime({
      startTime: new Date(0),
      lastTime: new Date(5),
      queuersProcessed: 1,
      queueLength: 1,
    }).valueOf()
  ).toBe(5);
});

test("two ticks", () => {
  expect(
    endTime({
      startTime: new Date(0),
      lastTime: new Date(5),
      queuersProcessed: 1,
      queueLength: 2,
    }).valueOf()
  ).toBe(10);
});

test("three ticks", () => {
  expect(
    endTime({
      startTime: new Date(0),
      lastTime: new Date(10),
      queuersProcessed: 2,
      queueLength: 3,
    }).valueOf()
  ).toBe(15);
});
