export class UninitializedQueue {
  startTime: Date = new Date();
}

export class Queue {
  startTime: Date;
  lastTime: Date;
  queuersQueued: number;
  queuersProcessed: number;

  constructor(arg: {
    startTime: Date;
    lastTime: Date;
    queuersQueued: number;
    queuersProcessed: number;
  }) {
    this.startTime = arg.startTime;
    this.lastTime = arg.lastTime;
    this.queuersQueued = arg.queuersQueued;
    this.queuersProcessed = arg.queuersProcessed;
  }
}
