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
            ADVANCE: { target: "showEstimate" },
          },
        },
        showEstimate: {
          initial: "running",
          states: {
            running: {
              on: {
                ADVANCE: [
                  {
                    target: "running",
                    cond: (ctx) => ctx.queuersProcessed < ctx.queueLength,
                  },
                  {
                    target: "lastOne",
                  },
                ],
              },
              after: [
                {
                  delay: (ctx) => remainingTime(ctx, new Date()).valueOf(),
                  target: "expiredEarly",
                },
              ],
              entry: assign({
                lastTime: () => new Date(),
                queuersProcessed: (ctx) => ctx.queuersProcessed + 1,
              }),
            },
            lastOne: {},
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
