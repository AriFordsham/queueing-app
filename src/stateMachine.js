import { assign, createMachine } from "xstate";

import { remainingTime } from "./timings.ts";

export const queueMachine = createMachine({
  predictableActionArguments: true,
  initial: "lengthNotSpecified",
  states: {
    lengthNotSpecified: {
      on: {
        SPECIFY_LENGTH: {
          target: "firstQueuer",
          actions: assign({ queueLength: (_, e) => e.specifiedLength }),
        },
        RESET: { target: "lengthNotSpecified" },
      },
      entry: assign({
        startTime: () => new Date(),
      }),
    },

    firstQueuer: {
      on: {
        ADVANCE: { target: "intermediateQueuers" },
        RESET: { target: "lengthNotSpecified" },
      },
    },
    intermediateQueuers: {
      on: {
        ADVANCE: {
          target: "intermediateQueuers",
        },
        RESET: { target: "lengthNotSpecified" },
      },
      after: [
        {
          delay: (ctx) => remainingTime(ctx, new Date()).valueOf(),
          target: "lengthNotSpecified",
        },
      ],

      entry: assign({
        lastTime: () => new Date(),
        queuersProcessed: (ctx) => ctx.queuersProcessed + 1,
      }),
      always: {
        target: "lastQueuer",
        cond: (ctx) => ctx.queuersProcessed + 1 >= ctx.queueLength,
      },
    },
    lastQueuer: {
      on: {
        RESET: { target: "lengthNotSpecified" },
      },
      after: [
        {
          delay: (ctx) => remainingTime(ctx, new Date()).valueOf(),
          target: "lengthNotSpecified",
        },
      ],
    },
  },
  context: () => ({
    startTime: new Date(),
    lastTime: new Date(),
    queuersProcessed: 0,
    queueLength: 0,
  }),
});
