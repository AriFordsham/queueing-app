import React, { useCallback, useEffect, useState } from "react";

import { avgWait, remainingTime } from "./timings.ts";
import { Queue, UninitializedQueue } from "./queueType.ts";
import { advanceQueue, setQueueLength, setQueuersProcessed } from "./queue.ts";

interface LabelledElementProps {
  label: string;
  children: React.ReactElement;
}

const LabelledElement = ({ label, children }: LabelledElementProps) => (
  <div>
    <label
      htmlFor={children.props.id}
      className="form-label form-label-lg"
      style={{ fontSize: "1.25rem" }}
    >
      {label}
    </label>
    {children}
  </div>
);

export default function App() {
  const [, setCurrentTime] = useState(new Date());

  const [queue, setQueue] = useState<Queue | UninitializedQueue>(
    new UninitializedQueue()
  );

  function reset() {
    setQueue(new UninitializedQueue());
  }

  const remainingTimeFormatted = useCallback(
    () =>
      queue instanceof Queue
        ? new Date(remainingTime(queue)).toLocaleTimeString(undefined, {
            minute: "2-digit",
            second: "2-digit",
          })
        : "",
    [queue]
  );

  useEffect(() => {
    const tick = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(tick);
  }, []);

  const advance = () => {
    const newQueue = advanceQueue(queue as Queue);
    setQueue(newQueue);

    if (newQueue.queuersQueued <= 1) {
      setTimeout(
        reset,
        avgWait(
          newQueue.startTime,
          newQueue.lastTime,
          newQueue.queuersProcessed
        )
      );
    }
  };

  return (
    <form className="main-form">
      <div className="vstack gap-3">
        <h1>How Long Will I Wait?</h1>
        <LabelledElement label="You joined this line at">
          <div className="input-group input-group-lg">
            <span id="startTime" className="text-center form-control">
              {queue.startTime.toLocaleTimeString(undefined, {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </span>
            <button
              type="button"
              className="btn btn-lg btn-danger input-group-append"
              onClick={reset}
            >
              RESET
            </button>
          </div>
        </LabelledElement>

        <LabelledElement label="How many people are in line ahead of you?">
          <input
            id="queuersQueued"
            className="form-control form-control-lg text-center"
            value={queue instanceof Queue ? queue.queuersQueued : ""}
            onChange={(e) => {
              if (+e.target.value >= 2) {
                setQueue((prev) => setQueueLength(prev, +e.target.value));
              }
            }}
          />
        </LabelledElement>
        {queue instanceof Queue && (
          <>
            <div>
              <button
                type="button"
                className="form-control btn btn-lg btn-success"
                disabled={queue.queuersQueued <= 1}
                onClick={advance}
              >
                ADVANCE
              </button>
              <span>
                Press this every time the line moves forward one place.
              </span>
            </div>
            <LabelledElement label="Number of people who have left the line">
              <input
                id="queuersProcessed"
                className="form-control form-control-lg text-center"
                value={queue.queuersProcessed}
                onChange={(e) => {
                  setQueue((prev) =>
                    setQueuersProcessed(prev as Queue, +e.target.value)
                  );
                }}
              />
            </LabelledElement>
            {queue.queuersProcessed >= 1 && (
              <>
                <LabelledElement label="You'll wait around">
                  <span
                    id="remainingTime"
                    className="form-control form-control-lg text-center"
                    style={{ fontSize: "2rem" }}
                  >
                    {remainingTimeFormatted()}
                  </span>
                </LabelledElement>
                <span>
                  I'm Ari Fordsham and I'm open to work.
                  <br />
                  <a href="https://docs.google.com/document/d/1D5AmLMLdUqQLu-gS6RribCi7HEeYYfLtP6RvtEHgKPg/edit?ouid=102776542320394462102&usp=docs_home&ths=true">
                    CV
                  </a>{" "}
                  - <a href="https://linkedin.com/in/ari-fordsham">LinkedIn</a>{" "}
                  - <a href="https://github.com/AriFordsham">GitHub</a> -{" "}
                  <a href="mailto:arifordsham@gmail.com">Email</a>
                </span>
              </>
            )}
          </>
        )}
      </div>
    </form>
  );
}
