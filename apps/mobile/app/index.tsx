import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'

export default function HomeScreen() {
  const router = useRouter()

  return (
    <View className="flex-1 items-center justify-center bg-background px-6">
      <Text className="text-3xl font-bold text-text mb-6">WeMemory</Text>
      <Text className="text-lg text-text/80 mb-8 text-center">
        Welcome! Create and share your memories.
      </Text>
      <TouchableOpacity
        className="w-full py-3 rounded-lg bg-wememory-primary items-center mb-4"
        onPress={() => router.push('/UploadMemoryScreen')}
      >
        <Text className="text-white font-semibold text-base">Create Memory</Text>
      </TouchableOpacity>
      <TouchableOpacity
        className="w-full py-3 rounded-lg bg-card border border-border items-center"
        onPress={() => router.push('/MemoryThreadScreen')}
      >
        <Text className="text-text font-semibold text-base">View Memories</Text>
      </TouchableOpacity>
    </View>
  )
} 