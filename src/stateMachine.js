import { assign, createMachine } from "xstate";

import { remainingTime } from "./timings.ts";

export const queueMachine = createMachine({
  predictableActionArguments: true,
  initial: "lengthNotSpecified",
  states: {
    lengthNotSpecified: {
      on: {
        SPECIFY_LENGTH: {
          target: "lengthSpecified",
          actions: assign({ queueLength: (_, e) => e.specifiedLength }),
        },
      },
    },
    lengthSpecified: {
      initial: "neverAdvanced",
      states: {
        neverAdvanced: {
          on: {
            ADVANCE: { target: "advancedOnce" },
          },
        },
        advancedOnce: {
          initial: "running",
          states: {
            running: {
              on: {
                ADVANCE: {
                  target: "running",
                },
                COUNTED_DOWN: { target: "completed" },
                EXPIRED: { target: "expiredEarly" },
              },
              after: [
                {
                  delay: (ctx) => remainingTime(ctx, new Date()).valueOf(),
                  target: "completed",
                },
              ],
              entry: assign({
                lastTime: () => new Date(),
                queuersProcessed: (ctx) => ctx.queuersProcessed + 1,
              }),
            },
            expiredEarly: {},
            completed: {},
          },
        },
      },
    },
  },
  context: () => ({
    startTime: new Date(),
    lastTime: new Date(),
    queuersProcessed: 0,
    queueLength: 0,
  }),
});
