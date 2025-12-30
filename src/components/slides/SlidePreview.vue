<script lang="ts" setup>
import {onMounted, onUnmounted, ref, watch} from 'vue'
import {Infographic} from '@antv/infographic'

const props = defineProps<{
  syntax: string
  id: string
}>()

const containerId = `slide-container-${props.id}`
let infographic: Infographic | null = null
let resizeObserver: ResizeObserver | null = null

const wrapperRef = ref<HTMLElement | null>(null)
const contentRef = ref<HTMLElement | null>(null)
const scale = ref(1)

// Standard 16:9 Slide Resolution
const BASE_WIDTH = 1280
const BASE_HEIGHT = 720

function renderInfographic(newSyntax: string) {
  if (infographic && newSyntax) {
    try {
      infographic.render(newSyntax)
    } catch (e) {
      console.error('Failed to render infographic:', e)
    }
  } else {
    console.warn(`⚠️ SlidePreview: Cannot render - infographic: ${!!infographic}, syntax: ${!!newSyntax}`)
  }
}

// Remove debounce and render immediately for smooth streaming
watch(() => props.syntax, (newSyntax) => {
  renderInfographic(newSyntax)
}, { immediate: true })

function updateScale() {
  if (!wrapperRef.value) return
  
  const { clientWidth: parentW, clientHeight: parentH } = wrapperRef.value
  // Add some padding (e.g. 60px total for safety)
  const availableW = Math.max(0, parentW - 60)
  const availableH = Math.max(0, parentH - 60)
  
  const scaleW = availableW / BASE_WIDTH
  const scaleH = availableH / BASE_HEIGHT
  
  // Fit contain
  scale.value = Math.min(scaleW, scaleH)
}

onMounted(() => {
  initInfographic()

  // Initial scale
  updateScale()

  if (wrapperRef.value) {
    resizeObserver = new ResizeObserver(() => {
      updateScale()
    })
    resizeObserver.observe(wrapperRef.value)
  }
})

onUnmounted(() => {
  if (resizeObserver) {
    resizeObserver.disconnect()
  }
  if (infographic) {
    infographic.destroy()
    infographic = null
  }
})

function initInfographic() {
  const container = document.getElementById(containerId)
  if (!container) {
    console.warn(`⚠️ SlidePreview: Container not found - ${containerId}`)
    return
  }

  container.innerHTML = ''

  infographic = new Infographic({
    container: `#${containerId}`,
    width: BASE_WIDTH,
    height: BASE_HEIGHT,
    editable: false,
  })

  if (props.syntax) {
    try {
      infographic.render(props.syntax)
      console.log(`✅ SlidePreview: Initial render completed - ${containerId}`)
    } catch (e) {
      console.error('Initial render failed:', e)
    }
  }
}
</script>

<template>
  <div ref="wrapperRef" class="w-full h-full flex items-center justify-center overflow-hidden relative">
    <!-- Scaled Container for AntV Infographic -->
    <div
      :id="containerId"
      ref="contentRef"
      :style="{
        width: `${BASE_WIDTH}px`,
        height: `${BASE_HEIGHT}px`,
        transform: `scale(${scale})`
      }"
      class="origin-center transition-transform duration-200"
    ></div>
  </div>
</template>
