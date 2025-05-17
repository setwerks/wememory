import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import { signIn, signUp } from '@wememory/lib'
import { styled } from 'nativewind'

const StyledView = styled(View)
const StyledText = styled(Text)
const StyledTextInput = styled(TextInput)
const StyledButton = styled(TouchableOpacity)

export default function AuthScreen() {
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setError(null)
    setSuccess(null)
    setLoading(true)
    try {
      if (isLogin) {
        await signIn({ email, password })
        setSuccess('Logged in successfully!')
      } else {
        await signUp({ email, password })
        setSuccess('Account created successfully!')
      }
      // Optionally navigate to home or another screen
      // router.replace('/')
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <StyledView className="flex-1 items-center justify-center bg-background dark:bg-gray-950 px-6">
      <StyledView className="w-full max-w-md p-6 bg-card dark:bg-gray-900 rounded-2xl shadow-lg">
        <StyledText className="text-2xl font-bold text-center text-text dark:text-white mb-6">
          {isLogin ? 'Login' : 'Sign Up'}
        </StyledText>
        <StyledTextInput
          className="mb-4 px-4 py-3 bg-background dark:bg-gray-950 border border-border dark:border-gray-800 rounded-lg text-text dark:text-white"
          placeholder="Email"
          placeholderTextColor="#888"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <StyledTextInput
          className="mb-4 px-4 py-3 bg-background dark:bg-gray-950 border border-border dark:border-gray-800 rounded-lg text-text dark:text-white"
          placeholder="Password"
          placeholderTextColor="#888"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <StyledButton
          className="w-full py-3 rounded-lg bg-wememory-primary dark:bg-wememory-primary items-center mb-2"
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <StyledText className="text-white font-semibold text-base">
              {isLogin ? 'Login' : 'Sign Up'}
            </StyledText>
          )}
        </StyledButton>
        {error && (
          <StyledText className="mt-2 p-2 bg-error/10 dark:bg-red-900/30 text-error dark:text-red-400 rounded-lg text-center text-sm">
            {error}
          </StyledText>
        )}
        {success && (
          <StyledText className="mt-2 p-2 bg-success/10 dark:bg-green-900/30 text-success dark:text-green-400 rounded-lg text-center text-sm">
            {success}
          </StyledText>
        )}
        <StyledButton
          className="mt-4 items-center"
          onPress={() => setIsLogin(!isLogin)}
        >
          <StyledText className="text-primary dark:text-wememory-primary text-sm">
            {isLogin ? 'Need an account? Sign up' : 'Already have an account? Login'}
          </StyledText>
        </StyledButton>
      </StyledView>
    </StyledView>
  )
} 