import { getDockerClient } from './client'

export const BASE_IMAGES = {
  node: 'node:18-alpine',
  python: 'python:3.11-alpine',
  bash: 'alpine:latest',
} as const

export type BaseImageType = keyof typeof BASE_IMAGES

/**
 * Ensure required base images are pulled and available
 */
export async function ensureBaseImagesAvailable(): Promise<void> {
  const client = getDockerClient()

  for (const [name, imageName] of Object.entries(BASE_IMAGES)) {
    try {
      // Check if image exists locally
      const images = await client.listImages({
        filters: {
          reference: [imageName],
        },
      })

      if (images.length === 0) {
        console.log(`[Docker] Pulling image: ${imageName}`)
        await new Promise((resolve, reject) => {
          client.pull(imageName, (err: any, stream: any) => {
            if (err) {
              reject(err)
              return
            }

            // Consume the stream to track progress
            stream.on('data', () => {
              // Image pulling in progress
            })
            stream.on('end', () => {
              console.log(`[Docker] Image pulled successfully: ${imageName}`)
              resolve(null)
            })
            stream.on('error', reject)
          })
        })
      } else {
        console.log(`[Docker] Image already available: ${imageName}`)
      }
    } catch (error) {
      console.error(`[Docker] Failed to ensure image ${name}:`, error)
      throw new Error(`Failed to pull Docker image: ${imageName}`)
    }
  }
}

/**
 * Get the appropriate base image for a given runtime
 */
export function getBaseImage(runtime: string): string {
  switch (runtime.toLowerCase()) {
    case 'node':
    case 'javascript':
    case 'js':
      return BASE_IMAGES.node
    case 'python':
    case 'py':
      return BASE_IMAGES.python
    case 'bash':
    case 'shell':
    case 'sh':
      return BASE_IMAGES.bash
    default:
      // Default to bash/alpine for unknown runtimes
      return BASE_IMAGES.bash
  }
}

/**
 * List all available images on the system
 */
export async function listAvailableImages() {
  try {
    const client = getDockerClient()
    const images = await client.listImages()

    return images.map((img) => ({
      id: img.Id,
      tags: img.RepoTags || [],
      size: img.Size,
      created: img.Created,
    }))
  } catch (error) {
    console.error('[Docker] Failed to list images:', error)
    throw new Error('Failed to list Docker images')
  }
}

/**
 * Remove an unused image
 */
export async function removeImage(imageName: string): Promise<void> {
  try {
    const client = getDockerClient()
    const image = client.getImage(imageName)
    await image.remove({ force: true })
    console.log(`[Docker] Removed image: ${imageName}`)
  } catch (error) {
    console.error(`[Docker] Failed to remove image ${imageName}:`, error)
    throw new Error(`Failed to remove Docker image: ${imageName}`)
  }
}
