const EventEmitter = require('events');

/**
 * Singleton queue for managing Gemini API requests with rate limiting
 * Prevents 429 errors by enforcing delays and handling retries
 */
class GeminiQueue extends EventEmitter {
    constructor() {
        super();

        if (GeminiQueue.instance) {
            return GeminiQueue.instance;
        }

        this.queue = [];
        this.isProcessing = false;
        this.isPaused = false;
        this.minDelayMs = 6000; // 6 seconds between requests (10 RPM safety margin)
        this.lastRequestTime = 0;
        this.pauseDurationMs = 60000; // 60 seconds pause on rate limit

        GeminiQueue.instance = this;

        console.log('✅ GeminiQueue initialized (6s delay between requests)');
    }

    /**
     * Add a task to the queue
     * @param {Function} taskFunction - Async function to execute
     * @returns {Promise} Promise that resolves with task result
     */
    add(taskFunction) {
        return new Promise((resolve, reject) => {
            const task = {
                fn: taskFunction,
                resolve,
                reject,
                retries: 0,
                maxRetries: 3,
            };

            this.queue.push(task);

            if (!this.isProcessing && !this.isPaused) {
                this.processNext();
            }
        });
    }

    /**
     * Process the next task in the queue
     */
    async processNext() {
        if (this.queue.length === 0) {
            this.isProcessing = false;
            return;
        }

        if (this.isPaused) {
            return;
        }

        this.isProcessing = true;
        const task = this.queue.shift();

        try {
            // Enforce minimum delay between requests
            const now = Date.now();
            const timeSinceLastRequest = now - this.lastRequestTime;

            if (timeSinceLastRequest < this.minDelayMs) {
                const waitTime = this.minDelayMs - timeSinceLastRequest;
                console.log(`⏳ GeminiQueue: Waiting ${waitTime}ms before next request`);
                await this.sleep(waitTime);
            }

            this.lastRequestTime = Date.now();

            // Execute the task
            const result = await task.fn();
            task.resolve(result);

            // Process next task
            setTimeout(() => this.processNext(), 0);

        } catch (error) {
            await this.handleError(error, task);
        }
    }

    /**
     * Handle task errors with retry logic
     * @param {Error} error - The error that occurred
     * @param {Object} task - The task that failed
     */
    async handleError(error, task) {
        const errorMessage = error.message || error.toString();

        // Check if it's a 429 error
        if (errorMessage.includes('429') || errorMessage.includes('Resource has been exhausted')) {

            // Check if it's a daily quota error (permanent)
            if (errorMessage.includes('GenerateRequestsPerDay')) {
                console.error('❌ Daily Gemini API quota exceeded - permanent error');
                task.reject(new Error('Daily API Quota Exceeded. Please try again tomorrow.'));

                // Continue processing other tasks
                setTimeout(() => this.processNext(), 0);
                return;
            }

            // It's a rate limit error (temporary) - retry
            if (task.retries < task.maxRetries) {
                task.retries++;
                console.warn(`⚠️ Rate limit hit. Pausing queue for ${this.pauseDurationMs / 1000}s. Retry ${task.retries}/${task.maxRetries}`);

                // Re-queue at front
                this.queue.unshift(task);

                // Pause the queue
                this.isPaused = true;
                await this.sleep(this.pauseDurationMs);
                this.isPaused = false;

                // Resume processing
                this.processNext();
                return;
            } else {
                console.error(`❌ Max retries (${task.maxRetries}) exceeded for task`);
                task.reject(new Error('Rate limit error: Max retries exceeded'));
            }
        } else {
            // Non-429 error - reject immediately
            console.error(`❌ Task failed with error: ${errorMessage}`);
            task.reject(error);
        }

        // Process next task
        setTimeout(() => this.processNext(), 0);
    }

    /**
     * Sleep utility
     * @param {number} ms - Milliseconds to sleep
     * @returns {Promise}
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Get queue status
     * @returns {Object} Queue status
     */
    getStatus() {
        return {
            queueLength: this.queue.length,
            isProcessing: this.isProcessing,
            isPaused: this.isPaused,
        };
    }
}

// Export singleton instance
const geminiQueue = new GeminiQueue();
module.exports = geminiQueue;
