export type LogLevel = "debug" | "info" | "warn" | "error";

export type LogEntry = {
  level: LogLevel;
  message: string;
  scope: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
};

export function createLogEntry(
  level: LogLevel,
  scope: string,
  message: string,
  metadata?: Record<string, unknown>,
): LogEntry {
  return {
    level,
    scope,
    message,
    timestamp: new Date().toISOString(),
    ...(metadata ? { metadata } : {}),
  };
}
