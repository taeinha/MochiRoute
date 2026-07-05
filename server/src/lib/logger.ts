type LogMeta = Record<string, unknown>;

export const logger = {
  info(message: string, meta?: LogMeta) {
    console.log(formatLogMessage("INFO", message, meta));
  },
  error(message: string, meta?: LogMeta) {
    console.error(formatLogMessage("ERROR", message, meta));
  },
  warn(message: string, meta?: LogMeta) {
    console.warn(formatLogMessage("WARN", message, meta));
  },
  debug(message: string, meta?: LogMeta) {
    if (process.env.NODE_ENV !== "production") {
      console.debug(formatLogMessage("DEBUG", message, meta));
    }
  },

  // Used by morgan for HTTP access logs
  http(message: string) {
    console.log(message.trim());
  },
};

const formatLogMessage = (level: string, message: string, meta?: LogMeta) => {
  const timestamp = new Date().toISOString();
  const base = `[${timestamp}] [${level}] ${message}`;
  return meta ? `${base} ${JSON.stringify(meta)}` : base;
};
