import React, { Fragment, useCallback, useEffect, useState } from "react";

import { useMachine } from "@xstate-ninja/react";

import { queueMachine } from "./stateMachine";

import { remainingTime } from "./timings.ts";

export default function App() {
  const e = React.createElement;

  const [, setCurrentTime] = useState(new Date());

  const [state, send] = useMachine(queueMachine, { devTools: true });

  const remainingTimeFormatted = useCallback(
    () =>
      new Date(remainingTime(state.context)).toLocaleTimeString(undefined, {
        minute: "2-digit",
        second: "2-digit",
      }),
    [state.context]
  );

  useEffect(() => {
    if (state.matches("intermediateQueuers") || state.matches("lastQueuer")) {
      const tick = setInterval(() => setCurrentTime(new Date()), 1000);

      return () => clearInterval(tick);
    }
  }, [state]);

  const advance = useCallback(() => send("ADVANCE"), [send]);

  const lengthSpecified = () =>
    state.matches("firstQueuer") ||
    state.matches("intermediateQueuers") ||
    state.matches("lastQueuer");

  return e(
    "form",
    { className: "main-form" },
    e("h1", {}, "How Long is This Queue?"),
    e("label", { htmlFor: "startTime" }, "When did you join the queue?"),
    e(
      "button",
      {
        type: "button",
        className: "form-control btn btn-danger",
        onClick: () => send("RESET"),
      },
      "RESET"
    ),
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
      "How many queuers are in the queue?"
    ),
    e("input", {
      id: "queueLength",
      readOnly: lengthSpecified(),
      className: "form-control text-center",
      value: lengthSpecified()
        ? state.context.queueLength - state.context.queuersProcessed
        : "",
      onChange: (e) =>
        send("SPECIFY_LENGTH", { specifiedLength: e.target.value }),
    }),
    lengthSpecified() &&
      e(
        Fragment,
        null,
        e(
          "button",
          {
            type: "button",
            className: "form-control btn btn-success",
            disabled: !(
              state.matches("firstQueuer") ||
              state.matches("intermediateQueuers")
            ),
            onClick: advance,
          },
          "ADVANCE"
        ),
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
                intermediateQueuers: remainingTimeFormatted(),
                lastQueuer: remainingTimeFormatted(),
              }[state.value] || console.log(state.value),
          })
        )
      )
  );
}
