import { assign, createMachine } from "xstate";

import { remainingTime } from "./timings.ts";

const resets = { RESET: { target: "lengthNotSpecified" } };

const advancesToIntermediate = {
  ADVANCE: { target: "intermediateQueuers" },
};

const expiryDelay = {
  delay: (ctx) => remainingTime(ctx, new Date()).valueOf(),
  target: "lengthNotSpecified",
};

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
        ...resets,
      },
      entry: assign({
        startTime: () => new Date(),
      }),
    },

    firstQueuer: {
      on: {
        ...advancesToIntermediate,
        ...resets,
      },
    },
    intermediateQueuers: {
      on: {
        ...advancesToIntermediate,
        ...resets,
      },
      after: [expiryDelay],

      entry: assign({
        lastTime: () => new Date(),
        queuersProcessed: (ctx) => ctx.queuersProcessed + 1,
      }),
      always: {
        cond: (ctx) => ctx.queuersProcessed + 1 >= ctx.queueLength,
        target: "lastQueuer",
      },
    },
    lastQueuer: {
      on: resets,
      after: [expiryDelay],
    },
  },
  context: () => ({
    startTime: new Date(),
    lastTime: new Date(),
    queuersProcessed: 0,
    queueLength: 0,
  }),
});
