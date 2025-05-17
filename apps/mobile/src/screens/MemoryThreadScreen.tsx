import React, { useState } from 'react'
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, LayoutAnimation, Platform, UIManager } from 'react-native'
import { useTheme, useRoute } from '@react-navigation/native'
import { supabase } from '@wememory/lib'
import { Memory } from '@wememory/types'

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true)
}

interface MemoryThreadScreenRouteParams {
  eventId: string
}

export function MemoryThreadScreen() {
  const { colors } = useTheme() as any
  const route = useRoute()
  const { eventId } = route.params as MemoryThreadScreenRouteParams
  const [memories, setMemories] = React.useState<Memory[]>([])
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  React.useEffect(() => {
    const fetchMemories = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('memories')
        .select('*')
        .eq('event_id', eventId)
        .eq('visibility', 'public')
        .order('created_at', { ascending: true })
      if (!error && data) setMemories(data)
      setLoading(false)
    }
    fetchMemories()
  }, [eventId])

  const handleExpand = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setExpandedId(expandedId === id ? null : id)
  }

  const renderItem = ({ item }: { item: Memory }) => {
    const expanded = expandedId === item.id
    // Fallback for thumbnail: use first media_urls if it's an image
    const thumbnailUrl = (item as any).thumbnail_url || (item.media_urls && item.media_urls[0])
    // Fallback for tags: use emotion_tags
    const tags = (item as any).tags || item.emotion_tags || []
    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={() => handleExpand(item.id)}
        activeOpacity={0.9}
      >
        <View style={styles.row}>
          {thumbnailUrl ? (
            <Image
              source={{ uri: thumbnailUrl }}
              style={styles.thumbnail}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.thumbnail, { backgroundColor: colors.border }]} />
          )}
          <View style={styles.info}>
            <Text style={[styles.title, { color: colors.text }]}>Memory</Text>
            <View style={styles.tagsRow}>
              {tags.map((tag: string) => (
                <Text key={tag} style={[styles.tag, { backgroundColor: colors.primary + '22', color: colors.primary }]}> {tag} </Text>
              ))}
            </View>
          </View>
        </View>
        {expanded && (
          <View style={styles.expandedContent}>
            <Text style={[styles.description, { color: colors.text }]}>{item.content}</Text>
            {/* Media URLs */}
            {item.media_urls && item.media_urls.length > 0 && (
              <Image
                source={{ uri: item.media_urls[0] }}
                style={styles.expandedImage}
                resizeMode="cover"
              />
            )}
            {/* Emotion tags */}
            <View style={styles.tagsRow}>
              {item.emotion_tags?.map((tag: string) => (
                <Text key={tag} style={[styles.emotionTag, { borderColor: colors.primary, color: colors.primary }]}> {tag} </Text>
              ))}
            </View>
          </View>
        )}
      </TouchableOpacity>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      {loading ? (
        <Text style={{ color: colors.text, textAlign: 'center', marginTop: 40 }}>Loading memories...</Text>
      ) : (
        <FlatList
          data={memories}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      )}
      {!loading && memories.length === 0 && (
        <Text style={{ color: colors.text, textAlign: 'center', marginTop: 40 }}>
          No memories yet. Be the first to share one!
        </Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  listContent: {
    paddingBottom: 32,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumbnail: {
    width: 64,
    height: 64,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#eee',
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 6,
    marginBottom: 4,
    overflow: 'hidden',
  },
  expandedContent: {
    marginTop: 12,
  },
  description: {
    fontSize: 14,
    marginBottom: 8,
  },
  expandedImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: '#eee',
  },
  emotionTag: {
    fontSize: 12,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 6,
    marginBottom: 4,
    overflow: 'hidden',
  },
}) 