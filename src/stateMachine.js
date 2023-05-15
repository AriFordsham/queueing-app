import { assign, createMachine } from "xstate";

import { avgWait } from "./timings.ts";

const resets = { RESET: { target: "lengthNotSpecified" } };

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
          target: "lengthSpecified",
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

    lengthSpecified: {
      on: {
        ADVANCE: {
          target: "lengthSpecified",
          actions: assign({
            queuersQueued: (ctx) => ctx.queuersQueued - 1,
            queuersProcessed: (ctx) => ctx.queuersProcessed + 1,
          }),
        },
        ...resets,
        ...specifiesLengths,
      },

      entry: assign({
        lastTime: () => new Date(),
      }),
      after: [
        {
          delay: (ctx) =>
            avgWait(ctx.startTime, ctx.lastTime, ctx.queuersProcessed),
          cond: (ctx) => ctx.queuersQueued <= 1,
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
