export interface Policy {
  id: string
  name: string
  description: string
  allow: string[]
  deny: string[]
  filesystem: {
    read: string[]
    write: string[]
  }
  network: boolean
  maxRuntime: number
  maxMemoryMb: number
  createdAt: string
  updatedAt: string
}

export interface PolicyValidationResult {
  valid: boolean
  errors: string[]
}
