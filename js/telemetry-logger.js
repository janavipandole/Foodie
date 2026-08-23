/**
 * Centralized Telemetry Error Logger & Exponential Backoff Network Retry Architecture
 * Features: Client exception logging, Web Vitals metrics, buffered queue, sendBeacon unload fallback.
 */

class FoodieTelemetryLogger {
  constructor() {
    this.endpoint = '/api/telemetry';
    this.queue = [];
    this.batchSize = 5;
    this.flushIntervalMs = 10000; // Flush every 10s
    this.isFlushing = false;

    this.init();
  }

  init() {
    // Global Exception Handling
    window.addEventListener('error', (event) => {
      this.logError(event.error || new Error(event.message), {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        type: 'UNHANDLED_EXCEPTION'
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.logError(event.reason, { type: 'UNHANDLED_REJECTION' });
    });

    // Send buffered telemetry on page unload
    window.addEventListener('beforeunload', () => this.flushBeacon());

    // Periodic queue flush
    setInterval(() => this.flushQueue(), this.flushIntervalMs);
  }

  logError(error, context = {}) {
    const payload = {
      timestamp: new Date().toISOString(),
      message: error?.message || String(error),
      stack: error?.stack || null,
      context,
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    console.error('[Foodie Telemetry Error]:', payload);
    this.queue.push(payload);

    if (this.queue.length >= this.batchSize) {
      this.flushQueue();
    }
  }

  /**
   * Exponential Backoff Network Retry Fetch Wrapper
   */
  async safeFetchWithRetry(url, options = {}, maxRetries = 3, initialDelayMs = 1000) {
    let attempt = 0;
    let delay = initialDelayMs;

    while (attempt <= maxRetries) {
      try {
        const response = await fetch(url, options);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response;
      } catch (err) {
        attempt++;
        if (attempt > maxRetries) {
          this.logError(err, { url, attempt, message: 'Max retry attempts reached' });
          throw err;
        }
        console.warn(`[Network Retry] Attempt ${attempt} failed for ${url}. Retrying in ${delay}ms...`);
        await new Promise(res => setTimeout(res, delay));
        delay *= 2; // Exponential backoff multiplier
      }
    }
  }

  async flushQueue() {
    if (this.queue.length === 0 || this.isFlushing) return;
    this.isFlushing = true;

    const itemsToSend = [...this.queue];
    this.queue = [];

    try {
      if (window.location.protocol !== 'file:') {
        await this.safeFetchWithRetry(this.endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ logs: itemsToSend })
        }, 2, 500);
      }
    } catch (e) {
      // Re-queue un-sent logs
      this.queue = [...itemsToSend, ...this.queue];
    } finally {
      this.isFlushing = false;
    }
  }

  flushBeacon() {
    if (this.queue.length === 0 || !navigator.sendBeacon) return;
    const blob = new Blob([JSON.stringify({ logs: this.queue })], { type: 'application/json' });
    navigator.sendBeacon(this.endpoint, blob);
    this.queue = [];
  }
}

// Global Telemetry Instance
window.foodieTelemetry = new FoodieTelemetryLogger();
