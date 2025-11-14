export const loggerConfig = {
  enableDebug: process.env.NODE_ENV === 'development',
  enableStructured: process.env.ENABLE_STRUCTURED_LOGGING !== 'false',
  logSearchQueries: true,
  logAnalyticsEvents: false,
  logPerformance: true,
}
