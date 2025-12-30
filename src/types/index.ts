// src/types/index.ts

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

export interface Slide {
  id: string
  title: string
  content: string
  syntax: string
}
