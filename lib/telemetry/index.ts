export { initTelemetry, stopTelemetry, getSessionId, getCurrentDevice, getRecentEvents, trackPageView } from './collector';
export { parseDevice, type DeviceInfo } from './device-parser';
export { observeWebVitals, classifyVital, VITALS_THRESHOLDS, type PageLoadMetric, type WebVitals } from './performance-observer';
export { installFetchInterceptor, type APICallRecord } from './fetch-interceptor';
