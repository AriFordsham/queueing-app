import { Queue, UninitializedQueue } from "./queueType.ts";

export function advanceQueue(queue: Queue): Queue {
  return new Queue({
    ...queue,
    lastTime: new Date(),
    queuersQueued: queue.queuersQueued - 1,
    queuersProcessed: queue.queuersProcessed + 1,
  });
}

export function setQueueLength(
  queue: Queue | UninitializedQueue,
  length: number
): Queue {
  if (queue instanceof Queue) {
    return new Queue({ ...queue, queuersQueued: length });
  } else {
    return new Queue({
      ...queue,
      queuersQueued: length,
      queuersProcessed: 0,
      lastTime: new Date(),
    });
  }
}

export function setQueuersProcessed(
  queue: Queue,
  queuersProcessed: number
): Queue {
  return new Queue({ ...queue, queuersProcessed });
}
