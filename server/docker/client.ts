import Docker from 'dockerode'

let dockerInstance: Docker | null = null

/**
 * Get or create a singleton Docker client instance
 * Supports both local Unix socket and TCP connections
 */
export function getDockerClient(): Docker {
  if (dockerInstance) {
    return dockerInstance
  }

  const dockerHost = process.env.DOCKER_HOST || 'unix:///var/run/docker.sock'
  const dockerPort = process.env.DOCKER_PORT || 2375

  try {
    if (dockerHost.startsWith('unix://')) {
      // Local Unix socket connection
      dockerInstance = new Docker({
        socketPath: dockerHost.replace('unix://', ''),
      })
    } else if (dockerHost.startsWith('tcp://')) {
      // TCP connection to remote Docker daemon
      const url = new URL(dockerHost)
      const proto = url.protocol === 'tcp:' ? 'http' : url.protocol.replace(':', '')
      dockerInstance = new Docker({
        host: url.hostname,
        port: parseInt(url.port || dockerPort.toString()),
        protocol: proto as 'http' | 'https',
      })
    } else {
      // Default to Unix socket
      dockerInstance = new Docker()
    }

    console.log('[Docker] Client initialized with host:', dockerHost)
  } catch (error) {
    console.error('[Docker] Failed to initialize client:', error)
    throw new Error('Failed to initialize Docker client')
  }

  return dockerInstance
}

/**
 * Health check for Docker daemon connectivity
 */
export async function checkDockerHealth(): Promise<boolean> {
  try {
    const client = getDockerClient()
    const info = await client.getEvents({
      filters: { type: ['service'] },
    })
    return !!info
  } catch (error) {
    console.error('[Docker] Health check failed:', error)
    return false
  }
}

/**
 * Get Docker system info and stats
 */
export async function getDockerInfo() {
  try {
    const client = getDockerClient()
    const info = await client.info()
    const version = await client.version()

    return {
      version: version.Version,
      os: info.OSType,
      architecture: info.Architecture,
      containers: info.Containers,
      runningContainers: info.ContainersRunning,
      images: info.Images,
      cpus: info.NCPU,
      memoryBytes: info.MemTotal,
    }
  } catch (error) {
    console.error('[Docker] Failed to get info:', error)
    throw new Error('Failed to get Docker info')
  }
}
