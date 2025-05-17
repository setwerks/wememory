import React, { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native'
import { useTheme } from '@react-navigation/native'
import { Video, ResizeMode } from 'expo-av'
import * as ImagePicker from 'expo-image-picker'
import { uploadVideo, uploadImage } from '@wememory/lib'
import { supabase } from '@wememory/lib'
import { Memory } from '@wememory/types'
import { generateThumbnail } from '../utils/generateThumbnail'

interface Props {
  eventId: string
  onUploadComplete?: (memory: Memory) => void
}

interface CustomTheme {
  colors: {
    primary: string
    background: string
    card: string
    text: string
    border: string
    notification: string
    error: string
  }
}

export function UploadMemoryScreen({ eventId, onUploadComplete }: Props) {
  const { colors } = useTheme() as any
  const [video, setVideo] = useState<ImagePicker.ImagePickerAsset | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const pickVideo = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 1,
      })

      if (!result.canceled) {
        setVideo(result.assets[0])
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to pick video'
      setError(errorMessage)
    }
  }

  const handleUpload = async () => {
    if (!video) return

    try {
      setUploading(true)
      setError(null)

      // Convert video to Blob for upload
      const videoUri = video.uri
      const videoResponse = await fetch(videoUri)
      const videoBlob = await videoResponse.blob()

      // Upload video
      const videoUrl = await uploadVideo(videoBlob)

      // Generate and upload thumbnail
      const thumbnailBlob = await generateThumbnail(video.uri, {
        timestamp: 0, // Capture first frame
        quality: 0.8
      })
      const thumbnailUrl = await uploadImage(thumbnailBlob, {
        bucket: 'thumbnails',
        path: 'videos',
        contentType: 'image/jpeg'
      })

      // Create memory record
      const { data: memory, error: dbError } = await supabase
        .from('memories')
        .insert({
          event_id: eventId,
          media_url: videoUrl,
          thumbnail_url: thumbnailUrl,
          media_type: 'video',
          title: 'New Memory',
          description: '',
          tags: []
        })
        .select()
        .single()

      if (dbError) throw dbError

      onUploadComplete?.(memory)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred'
      setError(errorMessage)
    } finally {
      setUploading(false)
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {video ? (
        <View style={styles.preview}>
          <Video
            source={{ uri: video.uri }}
            style={styles.video}
            useNativeControls
            resizeMode={ResizeMode.CONTAIN}
          />
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={handleUpload}
            disabled={uploading}
          >
            {uploading ? (
              <ActivityIndicator color={colors.background} />
            ) : (
              <Text style={[styles.buttonText, { color: colors.background }]}>
                Upload Memory
              </Text>
            )}
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={pickVideo}
        >
          <Text style={[styles.buttonText, { color: colors.background }]}>
            Select Video
          </Text>
        </TouchableOpacity>
      )}
      {error && (
        <Text style={[styles.error, { color: colors.error || 'red' }]}>{error}</Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  preview: {
    width: '100%',
    aspectRatio: 16 / 9,
    marginBottom: 20,
  },
  video: {
    flex: 1,
    borderRadius: 8,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  error: {
    marginTop: 10,
    textAlign: 'center',
  },
}) 