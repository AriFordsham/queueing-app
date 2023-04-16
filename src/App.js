import React, { Fragment, useCallback, useEffect, useState } from "react";

import { useMachine } from "@xstate-ninja/react";

import { queueMachine } from "./stateMachine";

export default function App() {
  const e = React.createElement;

  const [startTime, ,] = useState(new Date());
  const [lastTime, setLastTime] = useState(new Date());
  const [currentTime, setCurrentTime] = useState(new Date());
  const [queueLength, setQueueLength] = useState(0);
  const [queuersProcessed, setQueuersProcessed] = useState(0);

  const [state, send] = useMachine(queueMachine, { devTools: true });

  const remainingTime = useCallback(() => {
    const waitTime = new Date((lastTime - startTime) / queuersProcessed);
    return new Date(
      waitTime * queueLength + (waitTime - (currentTime - lastTime))
    );
  }, [currentTime, lastTime, queueLength, queuersProcessed, startTime]);

  useEffect(() => {
    if (state.matches("lengthSpecified.advancedOnce.running")) {
      const tick = setInterval(() => setCurrentTime(new Date()), 1000);

      return () => {
        clearInterval(tick);
      };
    }
  }, [
    lastTime,
    startTime,
    queuersProcessed,
    queueLength,
    currentTime,
    remainingTime,
    send,
    state,
  ]);

  function advanceQueue() {
    send("ADVANCE");

    if (queueLength > 0) {
      setLastTime(new Date());
      setQueueLength(queueLength - 1);
      setQueuersProcessed(queuersProcessed + 1);
    }
  }

  return e(
    "form",
    { className: "main-form vstack gap-50" },
    e("h1", {}, "How Long is This Queue?"),
    e("label", { htmlFor: "startTime" }, "When did you join the queue?"),
    e("input", {
      readOnly: true,
      id: "startTime",
      className: "form-control text-center",
      value: startTime.toLocaleTimeString(undefined, {
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
      value: state.matches("lengthSpecified") ? queueLength : "",
      onChange: (e) => {
        send("SPECIFY_LENGTH");
        setQueueLength(e.target.value);
      },
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
            onClick: advanceQueue,
          },
          "Advance"
        ),
        state.matches("lengthSpecified.advancedOnce") &&
          e(
            Fragment,
            null,
            e("label", { htmlFor: "queuersProcessed" }, "Queuers processed"),
            e("input", {
              readOnly: true,
              id: "queuersProcessed",
              className: "form-control text-center",
              value: queuersProcessed,
            }),
            e("label", { htmlFor: "remainingTime" }, "Time remaining"),
            e("input", {
              readOnly: true,
              id: "remainingTime",
              className: "form-control text-center",
              value:
                {
                  running: remainingTime().toLocaleTimeString(undefined, {
                    minute: "2-digit",
                    second: "2-digit",
                  }),
                  expiredEarly: "We might have been a tad optimistic!",
                }[state.value.lengthSpecified.advancedOnce] ||
                console.log(state.value),
            })
          )
      )
  );
}
