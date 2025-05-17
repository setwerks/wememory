import { supabase } from './supabase'

export interface UploadOptions {
  bucket?: string
  path?: string
  contentType?: string
}

export async function uploadMedia(
  file: File | Blob,
  options: UploadOptions = {}
): Promise<string> {
  const {
    bucket = 'media',
    path = 'uploads',
    contentType = file.type
  } = options

  // Generate a unique filename
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 15)
  const extension = contentType.split('/')[1] || 'bin'
  const filename = `${timestamp}-${randomString}.${extension}`
  const filePath = `${path}/${filename}`

  // Upload the file
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      contentType,
      upsert: false
    })

  if (error) {
    throw new Error(`Failed to upload file: ${error.message}`)
  }

  // Get the public URL
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath)

  return publicUrl
}

// Helper for uploading images with automatic compression
export async function uploadImage(
  file: File | Blob,
  options: UploadOptions = {}
): Promise<string> {
  // Ensure content type is an image
  if (!file.type.startsWith('image/')) {
    throw new Error('File must be an image')
  }

  return uploadMedia(file, {
    ...options,
    bucket: options.bucket || 'images',
    path: options.path || 'images'
  })
}

// Helper for uploading videos
export async function uploadVideo(
  file: File | Blob,
  options: UploadOptions = {}
): Promise<string> {
  // Ensure content type is a video
  if (!file.type.startsWith('video/')) {
    throw new Error('File must be a video')
  }

  return uploadMedia(file, {
    ...options,
    bucket: options.bucket || 'videos',
    path: options.path || 'videos'
  })
} 