import { assign, createMachine } from "xstate";

import { avgWait } from "./timings.ts";

const resets = { RESET: { target: "lengthNotSpecified" } };

const advancesToIntermediate = {
  ADVANCE: { target: "intermediateQueuers" },
};

const specifiesLengthActions = {
  actions: assign({ queuersQueued: (_, e) => e.specifiedLength }),
};

const specifiesLengths = {
  SPECIFY_LENGTH: specifiesLengthActions,
  SPECIFY_PROCESSED: {
    actions: assign({ queuersProcessed: (_, e) => e.processed }),
  },
};

export const queueMachine = createMachine({
  predictableActionArguments: true,
  initial: "lengthNotSpecified",
  states: {
    lengthNotSpecified: {
      on: {
        SPECIFY_LENGTH: {
          target: "firstQueuer",
          ...specifiesLengthActions,
        },
        ...resets,
      },
      entry: assign({
        startTime: () => new Date(),
        queuersProcessed: 0,
        queuersQueued: undefined,
      }),
    },

    firstQueuer: {
      on: {
        ...advancesToIntermediate,
        ...resets,
        ...specifiesLengths,
      },
    },
    intermediateQueuers: {
      on: {
        ...advancesToIntermediate,
        ...resets,
        ...specifiesLengths,
      },

      entry: assign({
        lastTime: () => new Date(),
        queuersQueued: (ctx) => ctx.queuersQueued - 1,
        queuersProcessed: (ctx) => ctx.queuersProcessed + 1,
      }),
      always: {
        cond: (ctx) => ctx.queuersQueued <= 1,
        target: "lastQueuer",
      },
    },

    lastQueuer: {
      on: { ...resets },
      after: [
        {
          delay: (ctx) =>
            avgWait(ctx.startTime, ctx.lastTime, ctx.queuersProcessed),
          target: "lengthNotSpecified",
        },
      ],
    },
  },
  context: () => ({
    startTime: new Date(),
    lastTime: new Date(),
    queuersProcessed: 0,
  }),
});
