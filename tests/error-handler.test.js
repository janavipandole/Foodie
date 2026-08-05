/**
 * Unit Tests for Error Handler & Circuit Breaker
 */

describe('Error Handler Module', () => {
  class CircuitBreaker {
    constructor(threshold = 3, timeout = 1000) {
      this.failureThreshold = threshold;
      this.cooldownTimeout = timeout;
      this.failureCount = 0;
      this.state = 'CLOSED'; // CLOSED, OPEN, HALF-OPEN
      this.lastFailureTime = null;
    }

    async execute(fn) {
      if (this.state === 'OPEN') {
        if (Date.now() - this.lastFailureTime > this.cooldownTimeout) {
          this.state = 'HALF-OPEN';
        } else {
          throw new Error('Circuit Breaker is OPEN');
        }
      }

      try {
        const result = await fn();
        this.reset();
        return result;
      } catch (err) {
        this.recordFailure();
        throw err;
      }
    }

    recordFailure() {
      this.failureCount++;
      this.lastFailureTime = Date.now();
      if (this.failureCount >= this.failureThreshold) {
        this.state = 'OPEN';
      }
    }

    reset() {
      this.failureCount = 0;
      this.state = 'CLOSED';
    }
  }

  test('CircuitBreaker starts in CLOSED state', () => {
    const breaker = new CircuitBreaker();
    expect(breaker.state).toBe('CLOSED');
  });

  test('CircuitBreaker transitions to OPEN after threshold failures', async () => {
    const breaker = new CircuitBreaker(2, 5000);
    const failingFn = jest.fn().mockRejectedValue(new Error('Network failure'));

    await expect(breaker.execute(failingFn)).rejects.toThrow('Network failure');
    expect(breaker.state).toBe('CLOSED');

    await expect(breaker.execute(failingFn)).rejects.toThrow('Network failure');
    expect(breaker.state).toBe('OPEN');

    // Subsequent calls block execution immediately
    await expect(breaker.execute(failingFn)).rejects.toThrow('Circuit Breaker is OPEN');
  });

  test('CircuitBreaker resets to CLOSED on successful execution', async () => {
    const breaker = new CircuitBreaker(3, 5000);
    const successFn = jest.fn().mockResolvedValue('Success Data');

    const result = await breaker.execute(successFn);
    expect(result).toBe('Success Data');
    expect(breaker.state).toBe('CLOSED');
  });
});
