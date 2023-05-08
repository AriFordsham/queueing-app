type Context = {
  startTime: Date;
  lastTime: Date;
  queuersProcessed: number;
  queueLength: number;
};

export function endTime({
  startTime,
  lastTime,
  queuersProcessed,
  queueLength,
}: Context): Date {
  const waitTime = new Date(
    (lastTime.valueOf() - startTime.valueOf()) / queuersProcessed
  );

  const totalWaitTime = new Date(waitTime.valueOf() * queueLength);

  return new Date(startTime.valueOf() + totalWaitTime.valueOf());
}

export function remainingTime(args: Context): Date {
  return new Date(endTime(args).valueOf() - Date.now());
}
