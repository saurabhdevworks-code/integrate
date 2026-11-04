import { ExecuteToolParams, ExecutionResult, ToolDefinition } from '../types';

export class ToolsResource {
  constructor(private readonly request: <T>(path: string, options?: RequestInit) => Promise<T>) {}

  /**
   * List all tools supported across all enabled integrations in the project.
   */
  async list(): Promise<ToolDefinition[]> {
    return this.request<ToolDefinition[]>('/tools');
  }

  /**
   * Get specific tool definition and JSON schema by its slug (e.g. 'gmail.search_emails').
   */
  async get(toolSlug: string): Promise<ToolDefinition> {
    return this.request<ToolDefinition>(`/tools/${encodeURIComponent(toolSlug)}`);
  }

  /**
   * Execute an integration tool on behalf of an end user through the central execution engine.
   */
  async execute<T = any>(params: ExecuteToolParams): Promise<ExecutionResult<T>> {
    return this.request<ExecutionResult<T>>('/tools/execute', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }
}
