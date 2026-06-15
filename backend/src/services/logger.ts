export class Logger {
  private static format(severity: 'INFO' | 'WARNING' | 'ERROR', message: string, meta?: Record<string, any>): string {
    const payload = {
      timestamp: new Date().toISOString(),
      severity,
      message,
      ...(meta || {}),
    };
    return JSON.stringify(payload);
  }

  public static info(message: string, meta?: Record<string, any>): void {
    console.log(this.format('INFO', message, meta));
  }

  public static warn(message: string, meta?: Record<string, any>): void {
    console.warn(this.format('WARNING', message, meta));
  }

  public static error(message: string, meta?: Record<string, any>): void {
    console.error(this.format('ERROR', message, meta));
  }
}
