import React, { Fragment, useCallback, useEffect, useState } from "react";

import { useMachine } from "@xstate-ninja/react";

import { queueMachine } from "./stateMachine";

import { remainingTime } from "./timings.ts";

export default function App() {
  const e = React.createElement;

  const [, setCurrentTime] = useState(new Date());

  const [state, send] = useMachine(queueMachine, { devTools: true });

  const remainingTime_ = useCallback(
    () => remainingTime(state.context),
    [state.context]
  );

  useEffect(() => {
    if (state.matches("lengthSpecified.showEstimate.running")) {
      const tick = setInterval(() => setCurrentTime(new Date()), 1000);

      return () => clearInterval(tick);
    }
  }, [state]);

  const advance = useCallback(() => send("ADVANCE"), [send]);

  return e(
    "form",
    { className: "main-form" },
    e("h1", {}, "How Long is This Queue?"),
    e("label", { htmlFor: "startTime" }, "When did you join the queue?"),
    e("input", {
      readOnly: true,
      id: "startTime",
      className: "form-control text-center",
      value: state.context.startTime.toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
      }),
    }),
    e(
      "label",
      { htmlFor: "queueLength" },
      "How many queuers are ahead of you?"
    ),
    e("input", {
      id: "queueLength",
      className: "form-control text-center",
      value: state.matches("lengthSpecified")
        ? state.context.queueLength - state.context.queuersProcessed
        : "",
      onChange: (e) =>
        send("SPECIFY_LENGTH", { specifiedLength: e.target.value }),
    }),
    state.matches("lengthSpecified") &&
      e(
        Fragment,
        null,
        e(
          "button",
          {
            type: "button",
            className: "form-control btn btn-success",
            onClick: advance,
          },
          "Advance"
        ),
        state.matches("lengthSpecified.showEstimate") &&
          e(
            Fragment,
            null,
            e("label", { htmlFor: "queuersProcessed" }, "Queuers processed"),
            e("input", {
              readOnly: true,
              id: "queuersProcessed",
              className: "form-control text-center",
              value: state.context.queuersProcessed,
            }),
            e("label", { htmlFor: "remainingTime" }, "Time remaining"),
            e("input", {
              readOnly: true,
              id: "remainingTime",
              className: "form-control text-center",
              value:
                {
                  running: remainingTime_().toLocaleTimeString(undefined, {
                    minute: "2-digit",
                    second: "2-digit",
                  }),
                  expiredEarly: "We might have been a tad optimistic!",
                }[state.value.lengthSpecified.showEstimate] ||
                console.log(state.value),
            })
          )
      )
  );
}
