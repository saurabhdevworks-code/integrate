import { ExecutionResult } from '../types';

export class ExecutionsResource {
  constructor(private readonly request: <T>(path: string, options?: RequestInit) => Promise<T>) {}

  /**
   * List recent execution history and logs for the project.
   */
  async list(): Promise<ExecutionResult[]> {
    return this.request<ExecutionResult[]>('/executions');
  }

  /**
   * Inspect detailed status, output, and logs for a specific execution.
   */
  async get(executionId: string): Promise<ExecutionResult> {
    return this.request<ExecutionResult>(`/executions/${encodeURIComponent(executionId)}`);
  }
}
