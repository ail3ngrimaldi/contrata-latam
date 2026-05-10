const noop = () => {};
const logger = {
  trace: noop, debug: noop, info: noop, warn: noop,
  error: noop, fatal: noop, silent: noop,
  child: () => logger, level: "silent", isLevelEnabled: () => false,
};
const levels = { values: {}, labels: {} };
const pino = () => logger;
pino.destination = noop;
pino.transport = noop;
pino.multistream = noop;
pino.stdSerializers = {};
pino.stdTimeFunctions = {};
pino.levels = levels;
export default pino;
export { pino, levels };
