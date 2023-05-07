import { interpret } from "xstate";

import { test, expect, jest } from "@jest/globals";

import { queueMachine } from "./stateMachine";

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
  expect(service.getSnapshot()).toMatchState(
    "lengthSpecified.advancedOnce.completed"
  );
});

test("incomplete two ticks doesn't advance state", () => {
  const service = interpret(queueMachine);
  service.start();
  service.send("SPECIFY_LENGTH", { specifiedLength: 2 });
  jest.advanceTimersByTime(1);
  service.send("ADVANCE");
  expect(service.getSnapshot()).not.toMatchState(
    "lengthSpecified.advancedOnce.completed"
  );
});

test("two ticks advance state", () => {
  const service = interpret(queueMachine);
  service.start();
  service.send("SPECIFY_LENGTH", { specifiedLength: 2 });
  jest.advanceTimersByTime(1);
  service.send("ADVANCE");
  jest.advanceTimersByTime(1);
  expect(service.getSnapshot()).toMatchState(
    "lengthSpecified.advancedOnce.completed"
  );
});

test("incomplete two bigger ticks don't advance state", () => {
  const service = interpret(queueMachine);
  service.start();
  service.send("SPECIFY_LENGTH", { specifiedLength: 2 });
  jest.advanceTimersByTime(5);
  service.send("ADVANCE");
  jest.advanceTimersByTime(4);
  expect(service.getSnapshot()).not.toMatchState(
    "lengthSpecified.advancedOnce.completed"
  );
});

test("two bigger ticks advance state", () => {
  const service = interpret(queueMachine);
  service.start();
  service.send("SPECIFY_LENGTH", { specifiedLength: 2 });
  jest.advanceTimersByTime(5);
  service.send("ADVANCE");
  jest.advanceTimersByTime(5);
  expect(service.getSnapshot()).toMatchState(
    "lengthSpecified.advancedOnce.completed"
  );
});
