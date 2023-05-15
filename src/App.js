import React, { useCallback, useEffect, useState } from "react";

import { useMachine } from "@xstate-ninja/react";

import { queueMachine } from "./stateMachine";

import { remainingTime } from "./timings.ts";

const LabelledElement = ({ label, children }) => (
  <div>
    <label htmlFor={children.props.id} className="form-label">
      {label}
    </label>
    {children}
  </div>
);

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
      <LabelledElement label="When did you join the queue?">
        <div className="input-group">
          <input
            readOnly
            id="startTime"
            className="form-control text-center"
            value={state.context.startTime.toLocaleTimeString(undefined, {
              hour: "2-digit",
              minute: "2-digit",
            })}
          />
          <button
            type="button"
            className="form-control btn btn-danger"
            onClick={() => send("RESET")}
          >
            RESET
          </button>
        </div>
      </LabelledElement>

      <LabelledElement label="How many queuers are in the queue?">
        <input
          id="queuersQueued"
          className="form-control text-center"
          value={lengthSpecified() ? state.context.queuersQueued : ""}
          onChange={(e) => {
            if (e.target.value >= 2) {
              send("SPECIFY_LENGTH", { specifiedLength: e.target.value });
            }
          }}
        />
      </LabelledElement>
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
          <LabelledElement label="Queuers processed">
            <input
              id="queuersProcessed"
              className="form-control text-center"
              value={state.context.queuersProcessed}
              onChange={(e) =>
                send("SPECIFY_PROCESSED", { processed: e.target.value })
              }
            />
          </LabelledElement>
          {queueTail() && (
            <LabelledElement label="Time remaining">
              <input
                readOnly
                id="remainingTime"
                className="form-control text-center"
                value={remainingTimeFormatted()}
              />
            </LabelledElement>
          )}
        </>
      )}
    </form>
  );
}
