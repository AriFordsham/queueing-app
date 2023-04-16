import { createMachine } from "xstate";

export const queueMachine = createMachine(
  {
    predictableActionArguments: true,
    initial: "lengthNotSpecified",
    states: {
      lengthNotSpecified: {
        on: {
          SPECIFY_LENGTH: {
            target: "lengthSpecified",
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
                  COUNTED_DOWN: { target: "completed" },
                },
                after: {
                  EXPIRED: { target: "expiredEarly" },
                },
              },
              expiredEarly: {},
              completed: {},
            },
          },
        },
      },
    },
  },
  {
    delays: { EXPIRED: 0 },
  }
);
