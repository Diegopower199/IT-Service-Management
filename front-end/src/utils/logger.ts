import axios from "axios";

type LogContext = Record<string, unknown>;

type LogLevel = "INFO" | "WARN" | "ERROR";

const IS_DEVELOPMENT = process.env.NODE_ENV === "development";

/**
 * Formats a log message with timestamp and level.
 */
const formatMessage = (level: LogLevel, message: string): string => {
  const timestamp = new Date().toISOString();

  return `[${timestamp}] [${level}] ${message}`;
};

/**
 * Extracts relevant information from application errors.
 */
const normalizeError = (error: unknown): unknown => {
  if (axios.isAxiosError(error)) {
    return {
      name: error.name,
      message: error.message,
      status: error.response?.status,
      method: error.config?.method?.toUpperCase(),
      url: error.config?.url,
      response: error.response?.data,
    };
  }

  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  return error;
};

export const logger = {
  info: (message: string, context?: LogContext): void => {
    if (!IS_DEVELOPMENT) {
      return;
    }

    console.info(formatMessage("INFO", message), context ?? "");
  },

  warn: (message: string, context?: LogContext): void => {
    if (!IS_DEVELOPMENT) {
      return;
    }

    console.warn(formatMessage("WARN", message), context ?? "");
  },

  error: (message: string, error?: unknown, context?: LogContext): void => {
    if (!IS_DEVELOPMENT) {
      return;
    }

    console.error(formatMessage("ERROR", message), {
      error: normalizeError(error),
      context,
    });
  },
};
