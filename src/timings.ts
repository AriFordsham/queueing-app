type Context = {
  startTime: Date;
  lastTime: Date;
  queuersProcessed: number;
  queueLength: number;
};

function dateDiff(x: Date, y: Date) {
  return x.valueOf() - y.valueOf();
}

function avgWait(startTime: Date, endTime: Date, queuersProcessed: number) {
  return dateDiff(endTime, startTime) / queuersProcessed;
}

export function endTime(
  { startTime, lastTime, queuersProcessed, queueLength }: Context,
  currentTime: Date
): Date {
  const oldAvg = avgWait(startTime, lastTime, queuersProcessed);
  const newAvg = avgWait(startTime, currentTime, queuersProcessed + 1);

  const currentQueuerTime = dateDiff(currentTime, lastTime);

  const avg = currentQueuerTime < oldAvg ? oldAvg : newAvg;

  const totalWaitTime = avg * queueLength;

  return new Date(startTime.valueOf() + totalWaitTime);
}

export function remainingTime(args: Context): number {
  const now = new Date();
  return dateDiff(endTime(args, now), now);
}
