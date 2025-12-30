<script lang="ts" setup>
import {Button} from '@/components/ui/button'
import {useAppStore} from '@/stores/useAppStore'
import {nanoid} from 'nanoid'
import {PlayCircle} from 'lucide-vue-next'
import {useI18n} from '@/composables/useI18n'
import {useThrottleFn} from '@vueuse/core'
import type {Slide} from '@/types'

const store = useAppStore()
const { t } = useI18n()

// Store reference to initial slides for throttled updates
let initialSlides: Slide[] = []

// Throttle updates to avoid excessive re-renders
const throttledUpdate = useThrottleFn((content: string) => {
  store.updateLastMessage(content)
  parseSlides(content)
}, 100)

// Mock data for 5 slides
const MOCK_SLIDES = [
  {
    title: '互联网技术演进史',
    syntax: `infographic list-row-horizontal-icon-arrow
data
  title 互联网技术演进史
  desc 从Web 1.0到AI时代的关键里程碑
  items
    - time 1991
      label 万维网诞生
      desc Tim Berners-Lee发布首个网站，开启互联网时代
      icon mdi/web
    - time 2004
      label Web 2.0兴起
      desc 社交媒体和用户生成内容成为主流
      icon mdi/account-multiple
    - time 2007
      label 移动互联网
      desc iPhone发布，智能手机改变世界
      icon mdi/cellphone
    - time 2023
      label AI大模型
      desc ChatGPT引爆生成式AI革命
      icon mdi/brain`
  },
  {
    title: 'SWOT Analysis',
    syntax: `infographic compare-swot
data
  title SWOT Analysis
  desc Strategic planning technique
  items
    - label Strengths
      desc Internal positive factors
      icon mdi/arm-flex
    - label Weaknesses
      desc Internal negative factors
      icon mdi/alert-circle-outline
    - label Opportunities
      desc External positive factors
      icon mdi/lightbulb-on-outline
    - label Threats
      desc External negative factors
      icon mdi/skull-outline`
  },
  {
    title: 'Project Roadmap',
    syntax: `infographic sequence-roadmap-vertical-simple
data
  title Project Roadmap
  desc Key phases and milestones
  items
    - label Phase 1: Planning
      desc Q1 2024 - Requirements gathering
      icon mdi/clipboard-text-outline
    - label Phase 2: Design
      desc Q2 2024 - UI/UX and Architecture
      icon mdi/pencil-ruler
    - label Phase 3: Development
      desc Q3 2024 - Implementation
      icon mdi/code-tags
    - label Phase 4: Launch
      desc Q4 2024 - Go live
      icon mdi/rocket-launch`
  },
  {
    title: 'Market Share',
    syntax: `infographic chart-pie-donut-plain-text
data
  title Market Share
  desc Global Smartphone Market 2023
  items
    - label Apple
      value 20
      desc Premium segment leader
    - label Samsung
      value 19
      desc Broad portfolio
    - label Xiaomi
      value 13
      desc Value champion
    - label Others
      value 48
      desc Diverse players`
  },
  {
    title: 'Core Values',
    syntax: `infographic list-grid-badge-card
data
  title Core Values
  desc What drives our culture
  items
    - label Innovation
      desc Constantly pushing boundaries
      icon mdi/lightbulb
    - label Integrity
      desc Doing the right thing
      icon mdi/shield-check
    - label Teamwork
      desc Stronger together
      icon mdi/account-group
    - label Customer Focus
      desc Putting users first
      icon mdi/heart`
  }
]

// Mock AI response content
const MOCK_RESPONSE = `[slide]
infographic list-row-horizontal-icon-arrow
data
  title 互联网技术演进史
  desc 从Web 1.0到AI时代的关键里程碑
  items
    - time 1991
      label Web 1.0
      desc Tim Berners-Lee发布首个网站，开启互联网时代
      icon mdi/web
    - time 2004
      label Web 2.0
      desc 社交媒体和用户生成内容成为主流
      icon mdi/account-multiple
    - time 2007
      label 移动互联网
      desc iPhone发布，智能手机改变世界
      icon mdi/cellphone
    - time 2015
      label 云原生时代
      desc 容器化和微服务架构广泛应用
      icon mdi/cloud
    - time 2020
      label 低代码平台
      desc 可视化开发降低技术门槛
      icon mdi/application-brackets
    - time 2023
      label AI大模型
      desc ChatGPT引爆生成式AI革命
      icon mdi/brain
theme
  palette #3b82f6 #8b5cf6 #f97316
[/slide]

[slide]infographic compare-swot
data
  title SWOT Analysis
  desc Strategic planning technique
  items
    - label Strengths
      desc Internal positive factors
      icon mdi/arm-flex
    - label Weaknesses
      desc Internal negative factors
      icon mdi/alert-circle-outline
    - label Opportunities
      desc External positive factors
      icon mdi/lightbulb-on-outline
    - label Threats
      desc External negative factors
      icon mdi/skull-outline
[/slide]`

// Simulate streaming output
async function simulateStreamResponse() {
  // Add user message with natural language
  store.addMessage({
    id: nanoid(),
    role: 'user',
    content: '请帮我生成关于互联网技术演进史和 SWOT 战略分析的幻灯片'
  })

  // Add placeholder AI message
  const aiMsgId = nanoid()
  store.addMessage({
    id: aiMsgId,
    role: 'assistant',
    content: ''
  })

  store.isStreaming = true
  let fullContent = ''

  try {
    // Simulate streaming with chunks
    const chunkSize = 10 // Process 20 characters at a time
    const delay = 100 // 30ms delay between chunks (faster for smoother typing effect)

    for (let i = 0; i < MOCK_RESPONSE.length; i += chunkSize) {
      const chunk = MOCK_RESPONSE.slice(i, i + chunkSize)
      fullContent += chunk
      // Use throttled update for smooth rendering
      throttledUpdate(fullContent)
      
      // Wait before next chunk
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  } catch (error: any) {
    store.updateLastMessage(`Error: ${error.message}`)
    console.error('Stream error:', error)
  } finally {
    store.isStreaming = false
    // Final update to ensure all content is rendered
    store.updateLastMessage(fullContent)
    parseSlides(fullContent)
  }
}

function parseSlides(content: string) {
  const parts = content.split('[slide]')
  const potentialSlides = parts.slice(1)
  
  if (potentialSlides.length > 0) {
    const newSlides = potentialSlides.map((part, index) => {
      let body = part
      const closingIndex = part.indexOf('[/slide]')
      if (closingIndex !== -1) {
        body = part.substring(0, closingIndex)
      }
      
      body = body.trim()
      
      const titleMatch = body.match(/^title\s+(.*)/m)
      
      const slide = {
        id: `slide-${index}`,
        title: (titleMatch && titleMatch[1]) ? titleMatch[1] : `Slide ${index + 1}`,
        content: body,
        syntax: body
      }
      return slide
    })
    
    const validSlides = newSlides.filter(s => s.content.length > 5)
    
    if (validSlides.length > 0) {
      const latestIndex = validSlides.length - 1
      
      store.setSlides(validSlides)
      // Always switch to the latest slide
      store.currentSlideIndex = latestIndex
    }
  }
}

function handleGenerateExample() {
  simulateStreamResponse()
}
</script>

<template>
  <Button class="gap-2" size="sm" variant="outline" @click="handleGenerateExample">
    <PlayCircle class="h-4 w-4" />
    Example
  </Button>
</template>
