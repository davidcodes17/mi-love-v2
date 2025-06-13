import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import ThemedView from '@/components/ui/themed-view'
import Post from '@/components/common/post'

const Posts = () => {
  return (
    <ThemedView marginTop={20} gap={20}>
      <Post />
      <Post />
      <Post />
      <Post />
      <Post />
    </ThemedView>
  )
}

export default Posts

const styles = StyleSheet.create({})