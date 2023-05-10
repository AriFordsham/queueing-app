import React, { Fragment, useCallback, useEffect, useState } from "react";

import { useMachine } from "@xstate-ninja/react";

import { queueMachine } from "./stateMachine";

import { remainingTime } from "./timings.ts";

export default function App() {
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

  const queueTail = () =>
    state.matches("intermediateQueuers") || state.matches("lastQueuer");

  useEffect(() => {
    if (queueTail()) {
      const tick = setInterval(() => setCurrentTime(new Date()), 1000);

      return () => clearInterval(tick);
    }
  }, [state]);

  const advance = useCallback(() => send("ADVANCE"), [send]);

  const lengthSpecified = () =>
    state.matches("firstQueuer") ||
    state.matches("intermediateQueuers") ||
    state.matches("lastQueuer");

  return (
    <form className="main-form">
      <h1>How Long is This Queue?</h1>
      <label htmlFor="startTime">When did you join the queue?</label>
      <button
        type="button"
        className="form-control btn btn-danger"
        onClick={() => send("RESET")}
      >
        RESET
      </button>
      <input
        readOnly
        id="startTime"
        className="form-control text-center"
        value={state.context.startTime.toLocaleTimeString(undefined, {
          hour: "2-digit",
          minute: "2-digit",
        })}
      />
      <label htmlFor="queueLength">How many queuers are in the queue?</label>
      <input
        id="queueLength"
        readOnly={lengthSpecified()}
        className="form-control text-center"
        value={
          lengthSpecified()
            ? state.context.queueLength - state.context.queuersProcessed
            : ""
        }
        onChange={(e) =>
          send("SPECIFY_LENGTH", { specifiedLength: e.target.value })
        }
      />
      {lengthSpecified() && (
        <>
          <button
            type="button"
            className="form-control btn btn-success"
            disabled={
              !(
                state.matches("firstQueuer") ||
                state.matches("intermediateQueuers")
              )
            }
            onClick={advance}
          >
            ADVANCE
          </button>
          <label htmlFor="queuersProcessed">Queuers processed</label>
          <input
            readOnly
            id="queuersProcessed"
            className="form-control text-center"
            value={state.context.queuersProcessed}
          />
          <label htmlFor="remainingTime">Time remaining</label>
          {queueTail() && (
            <input
              readOnly
              id="remainingTime"
              className="form-control text-center"
              value={remainingTimeFormatted()}
            />
          )}
        </>
      )}
    </form>
  );
}
