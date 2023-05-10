import { interpret } from "xstate";

import { test, expect, jest } from "@jest/globals";

import { queueMachine } from "./stateMachine";
import { remainingTime } from "./timings";

expect.extend({
  toMatchState(state, value) {
    return {
      pass: state.matches(value),
      message: () =>
        `expected ${JSON.stringify(state.value)} to match ${JSON.stringify(
          value
        )}`,
    };
  },
});

jest.useFakeTimers();

test("single tick advances state", () => {
  const service = interpret(queueMachine);
  service.start();
  service.send("SPECIFY_LENGTH", { specifiedLength: 1 });
  jest.advanceTimersByTime(1);
  service.send("ADVANCE");
  jest.advanceTimersByTime(0);
  expect(service.getSnapshot()).toMatchState("lengthNotSpecified");
});

test("incomplete two ticks doesn't advance state", () => {
  const service = interpret(queueMachine);
  service.start();
  service.send("SPECIFY_LENGTH", { specifiedLength: 2 });
  jest.advanceTimersByTime(1);
  service.send("ADVANCE");
  expect(service.getSnapshot()).not.toMatchState("lengthNotSpecified");
});

test("two ticks advance state", () => {
  const service = interpret(queueMachine);
  service.start();
  service.send("SPECIFY_LENGTH", { specifiedLength: 2 });
  jest.advanceTimersByTime(1);
  service.send("ADVANCE");
  jest.advanceTimersByTime(1);
  expect(service.getSnapshot()).toMatchState("lengthNotSpecified");
});

test("incomplete two bigger ticks don't advance state", () => {
  const service = interpret(queueMachine);
  service.start();
  service.send("SPECIFY_LENGTH", { specifiedLength: 2 });
  jest.advanceTimersByTime(5);
  service.send("ADVANCE");
  jest.advanceTimersByTime(4);
  expect(service.getSnapshot()).not.toMatchState("lengthNotSpecified");
});

test("two bigger ticks advance state", () => {
  const service = interpret(queueMachine);
  service.start();
  service.send("SPECIFY_LENGTH", { specifiedLength: 2 });
  jest.advanceTimersByTime(5);
  service.send("ADVANCE");
  jest.advanceTimersByTime(5);
  expect(service.getSnapshot()).toMatchState("lengthNotSpecified");
});

test("one tick with empty queue gives correct remaining time", () => {
  const service = interpret(queueMachine);
  service.start();
  service.send("SPECIFY_LENGTH", { specifiedLength: 1 });
  jest.advanceTimersByTime(1);
  service.send("ADVANCE");
  expect(remainingTime(service.getSnapshot().context)).toEqual(0);
});

test("bigger tick with empty queue gives correct remaining time", () => {
  const service = interpret(queueMachine);
  service.start();
  service.send("SPECIFY_LENGTH", { specifiedLength: 1 });
  jest.advanceTimersByTime(5);
  service.send("ADVANCE");
  expect(remainingTime(service.getSnapshot().context)).toEqual(0);
});

test("one tick with non-empty queue gives correct remaining time", () => {
  const service = interpret(queueMachine);
  service.start();
  service.send("SPECIFY_LENGTH", { specifiedLength: 2 });
  jest.advanceTimersByTime(1);
  service.send("ADVANCE");
  expect(remainingTime(service.getSnapshot().context)).toEqual(1);
});

test("bigger tick with non-empty queue gives correct remaining time", () => {
  const service = interpret(queueMachine);
  service.start();
  service.send("SPECIFY_LENGTH", { specifiedLength: 2 });
  jest.advanceTimersByTime(5);
  service.send("ADVANCE");
  expect(remainingTime(service.getSnapshot().context)).toEqual(5);
});

test("incomplete second tick with non-empty queue gives correct remaining time", () => {
  const service = interpret(queueMachine);
  service.start();
  service.send("SPECIFY_LENGTH", { specifiedLength: 2 });
  jest.advanceTimersByTime(5);
  service.send("ADVANCE");
  jest.advanceTimersByTime(4);
  expect(remainingTime(service.getSnapshot().context)).toEqual(1);
});
