/**
 * Simple in-memory queue for background embedding generation
 * This prevents timeouts and allows for better error handling
 */

interface QueueJob {
  id: string;
  type: 'page' | 'ticket' | 'pageVersion';
  itemId: string;
  retries: number;
  createdAt: Date;
}

class EmbeddingQueue {
  private queue: QueueJob[] = [];
  private processing = false;
  private maxRetries = 3;
  private processingDelay = 1000; // 1 second between jobs to avoid rate limits

  /**
   * Add an item to the embedding queue
   */
  enqueue(type: 'page' | 'ticket' | 'pageVersion', itemId: string): void {
    const job: QueueJob = {
      id: `${type}-${itemId}-${Date.now()}`,
      type,
      itemId,
      retries: 0,
      createdAt: new Date(),
    };

    this.queue.push(job);
    console.log(`Added ${type} ${itemId} to embedding queue`);

    // Start processing if not already running
    if (!this.processing) {
      this.processQueue().catch(err =>
        console.error('Queue processing error:', err)
      );
    }
  }

  /**
   * Process the queue
   */
  private async processQueue(): Promise<void> {
    if (this.processing) return;
    this.processing = true;

    while (this.queue.length > 0) {
      const job = this.queue.shift();
      if (!job) break;

      try {
        await this.processJob(job);
        console.log(`Successfully processed job ${job.id}`);
      } catch (error) {
        console.error(`Failed to process job ${job.id}:`, error);

        // Retry if under max retries
        if (job.retries < this.maxRetries) {
          job.retries++;
          this.queue.push(job);
          console.log(`Retrying job ${job.id} (attempt ${job.retries}/${this.maxRetries})`);
        } else {
          console.error(`Job ${job.id} failed after ${this.maxRetries} retries`);
        }
      }

      // Wait between jobs to avoid rate limits
      if (this.queue.length > 0) {
        await new Promise(resolve => setTimeout(resolve, this.processingDelay));
      }
    }

    this.processing = false;
  }

  /**
   * Process a single job
   */
  private async processJob(job: QueueJob): Promise<void> {
    const {
      updatePageEmbedding,
      updateTicketEmbedding,
      updatePageVersionEmbedding
    } = await import('./embeddings');

    switch (job.type) {
      case 'page':
        await updatePageEmbedding(job.itemId);
        break;
      case 'ticket':
        await updateTicketEmbedding(job.itemId);
        break;
      case 'pageVersion':
        await updatePageVersionEmbedding(job.itemId);
        break;
      default:
        throw new Error(`Unknown job type: ${job.type}`);
    }
  }

  /**
   * Get queue status
   */
  getStatus(): { queueLength: number; processing: boolean } {
    return {
      queueLength: this.queue.length,
      processing: this.processing,
    };
  }

  /**
   * Clear the queue (for testing/admin purposes)
   */
  clear(): void {
    this.queue = [];
    console.log('Embedding queue cleared');
  }
}

// Singleton instance
export const embeddingQueue = new EmbeddingQueue();
