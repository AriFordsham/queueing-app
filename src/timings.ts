type Queue = {
  startTime: Date;
  lastTime: Date;
  queuersQueued: number;
  queuersProcessed: number;
};

function dateDiff(x: Date, y: Date) {
  return x.valueOf() - y.valueOf();
}

export function queueLength(queue: Queue) {
  return queue.queuersQueued + queue.queuersProcessed;
}

export function avgWait(
  startTime: Date,
  endTime: Date,
  queuersProcessed: number
) {
  return dateDiff(endTime, startTime) / queuersProcessed;
}

export function endTime(queue: Queue, currentTime: Date): Date {
  const oldAvg = avgWait(
    queue.startTime,
    queue.lastTime,
    queue.queuersProcessed
  );
  const newAvg = avgWait(
    queue.startTime,
    currentTime,
    queue.queuersProcessed + 1
  );

  const currentQueuerTime = dateDiff(currentTime, queue.lastTime);

  const avg = currentQueuerTime < oldAvg ? oldAvg : newAvg;

  const totalWaitTime = avg * queueLength(queue);

  return new Date(queue.startTime.valueOf() + totalWaitTime);
}

export function remainingTime(args: Queue): number {
  const now = new Date();
  return dateDiff(endTime(args, now), now);
}
