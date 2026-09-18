/**
 * CircuitBreaker manages the state of requests to the Control Plane.
 * It prevents cascading failures by stopping requests when the CP is down.
 */
class CircuitBreaker {
    constructor(failureThreshold = 3, recoveryTimeout = 30000) {
        this.failureThreshold = failureThreshold;
        this.recoveryTimeout = recoveryTimeout;
        this.failures = 0;
        this.lastFailureTime = null;
        this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    }

    async call(action) {
        if (this.state === 'OPEN') {
            if (Date.now() - this.lastFailureTime > this.recoveryTimeout) {
                this.state = 'HALF_OPEN';
                console.log("[Hares AI] Circuit Breaker: HALF_OPEN - Attempting recovery");
            } else {
                throw new Error("Circuit Breaker is OPEN");
            }
        }

        try {
            const result = await action();
            this.reset();
            return result;
        } catch (error) {
            this.recordFailure();
            throw error;
        }
    }

    recordFailure() {
        this.failures++;
        this.lastFailureTime = Date.now();
        if (this.failures >= this.failureThreshold) {
            this.state = 'OPEN';
            console.error("[Hares AI] Circuit Breaker: OPEN - Too many failures, blocking CP requests");
        }
    }

    reset() {
        this.failures = 0;
        this.lastFailureTime = null;
        this.state = 'CLOSED';
    }
}

export const cpCircuitBreaker = new CircuitBreaker();
