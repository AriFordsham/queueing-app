import React, { useCallback, useEffect, useState } from "react";

import { avgWait, remainingTime } from "./timings.ts";

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

  const [startTime, setStartTime] = useState(new Date());
  const [queue, setQueue] = useState(null);

  const reset = () => {
    setQueue(null);
    setStartTime(new Date());
  };

  const remainingTimeFormatted = useCallback(
    () =>
      new Date(
        remainingTime({
          startTime,
          ...queue,
        })
      ).toLocaleTimeString(undefined, {
        minute: "2-digit",
        second: "2-digit",
      }),
    [startTime, queue]
  );

  useEffect(() => {
    const tick = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(tick);
  }, []);

  const advance = useCallback(() => {
    setQueue((prev) => ({
      queuersQueued: prev.queuersQueued - 1,
      queuersProcessed: prev.queuersProcessed + 1,
      lastTime: new Date(),
    }));

    if (queue.queuersQueued <= 1) {
      setInterval(
        reset,
        avgWait(startTime, queue.lastTime, queue.queuersProcessed)
      );
    }
  }, [startTime, queue]);

  const lengthSpecified = useCallback(() => queue !== null, [queue]);

  return (
    <form className="main-form">
      <h1>How Long is This Queue?</h1>
      <LabelledElement label="When did you join the queue?">
        <div className="input-group">
          <input
            readOnly
            id="startTime"
            className="form-control text-center"
            value={startTime.toLocaleTimeString(undefined, {
              hour: "2-digit",
              minute: "2-digit",
            })}
          />
          <button
            type="button"
            className="form-control btn btn-danger"
            onClick={() => {
              reset();
            }}
          >
            RESET
          </button>
        </div>
      </LabelledElement>

      <LabelledElement label="How many queuers are in the queue ahead of you?">
        <input
          id="queuersQueued"
          className="form-control text-center"
          value={lengthSpecified() ? queue.queuersQueued : ""}
          onChange={(e) => {
            if (e.target.value >= 2) {
              const q = lengthSpecified()
                ? queue
                : { queuersProcessed: 0, lastTime: new Date() };

              setQueue({ ...q, queuersQueued: e.target.value });
            }
          }}
        />
      </LabelledElement>
      {lengthSpecified() && (
        <>
          <button
            type="button"
            className="form-control btn btn-success"
            disabled={queue.queuersQueued <= 1}
            onClick={advance}
          >
            ADVANCE
          </button>
          <LabelledElement label="Queuers processed">
            <input
              id="queuersProcessed"
              className="form-control text-center"
              value={queue.queuersProcessed}
              onChange={(e) => {
                setQueue((prev) => ({
                  ...prev,
                  queuersProcessed: e.target.value,
                }));
              }}
            />
          </LabelledElement>
          {queue.queuersProcessed >= 1 && (
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
