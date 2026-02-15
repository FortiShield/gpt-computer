export interface Tool {
  name: string
  description: string
  inputSchema: Record<string, any>
  run: (input: any) => Promise<any>
}

export interface ToolResult {
  success: boolean
  output: string
  error?: string
}
