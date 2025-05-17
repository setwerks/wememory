import VideoThumbnails from 'expo-video-thumbnails'

export interface GenerateThumbnailOptions {
  timestamp?: number // Time in milliseconds to capture thumbnail
  quality?: number // Quality of the thumbnail (0-1)
}

export async function generateThumbnail(
  videoUri: string,
  options: GenerateThumbnailOptions = {}
): Promise<Blob> {
  const { timestamp = 0, quality = 0.8 } = options
  const { uri } = await VideoThumbnails.getThumbnailAsync(videoUri, {
    time: timestamp,
    quality
  })
  const response = await fetch(uri)
  return await response.blob()
} 