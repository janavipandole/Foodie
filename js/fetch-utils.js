(function () {
  'use strict';

  // If another script already defined fetchWithRetry, do not overwrite it.
  if (window.fetchWithRetry) return;

  /**
   * fetchWithRetry:
   * A safer version of fetch() that supports:
   * - timeout
   * - retries
   * - exponential backoff
   * - combined abort signals
   */
  window.fetchWithRetry = async function fetchWithRetry(
    url,
    options = {},
    retries = 2,       // number of retry attempts after the first failure
    backoff = 500      // base delay for exponential backoff in ms
  ) {
    const timeout = options.timeout || 8000;   // default timeout = 8 seconds
    let attempt = 0;
    let lastErr = null; // store last error to throw later

    // Try up to (retries + 1) attempts total
    while (attempt <= retries) {
      attempt++;

      // Controller for timeout-based aborting
      const controller = new AbortController();

      /**
       * COMBINED SIGNAL LOGIC:
       * If the caller provided a signal (options.signal), we want:
       * - the caller's abort to cancel our fetch
       * - our timeout abort to cancel fetch
       * So we create a new controller that aborts if either one aborts.
       */
      const combined = (function () {
        // If caller did NOT pass any abort signal → just use our controller
        if (!options.signal) return controller.signal;

        const combinedCtrl = new AbortController();

        const onAbort = () => combinedCtrl.abort(); // handler to abort combined

        try { options.signal.addEventListener('abort', onAbort); } catch (_) {}
        try { controller.signal.addEventListener('abort', onAbort); } catch (_) {}

        // Return a signal that listens to both abort sources
        return combinedCtrl.signal;
      })();

      try {
        // The actual fetch request using combined abort signal
        const fetchPromise = fetch(url, { ...options, signal: combined });

        // Timeout race: if timeout occurs first → reject
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => {
            try { controller.abort(); } catch (_) {}
            reject(new Error('timeout'));
          }, timeout)
        );

        // Whichever finishes first wins:
        // - fetch success
        // - or timeout triggers rejection
        const res = await Promise.race([fetchPromise, timeoutPromise]);

        // If fetch didn't return any response object
        if (!res) throw new Error('No response');

        // If response is not OK (4xx, 5xx), treat it as a failure → retry
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);

        // SUCCESS → return the response
        return res;

      } catch (err) {
        lastErr = err; // store last error for final throw

        // If caller aborted manually → immediately stop retrying
        if (options.signal && options.signal.aborted) throw err;

        // If no more retries left → exit loop
        if (attempt > retries) break;

        /**
         * Exponential backoff:
         * delay = backoff * 2^(attempt - 1)
         * Example: 500, 1000, 2000, ...
         */
        await new Promise(resolve =>
          setTimeout(resolve, backoff * Math.pow(2, attempt - 1))
        );
      }
    }

    // All attempts failed → throw the last error we caught
    throw lastErr || new Error('Failed to fetch');
  };
})();
