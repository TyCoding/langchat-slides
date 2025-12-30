<script lang="ts" setup>
import {useAppStore} from '@/stores/useAppStore'
import SlidePreview from './SlidePreview.vue'
import SlideThumbnail from './SlideThumbnail.vue'
import {Button} from '@/components/ui/button'
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select'
import {Download, Image, LayoutTemplate, ListPlus, Loader2, PlusCircle, RefreshCw, Trash2} from 'lucide-vue-next'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import {useI18n} from '@/composables/useI18n'
import CustomSlideDialog from '@/components/layout/CustomSlideDialog.vue'

type ExportFormat = 'png' | 'pdf'

const store = useAppStore()
const { t } = useI18n()

async function handleDownload(format: ExportFormat) {
  if (!store.currentSlide) return
  
  const element = document.getElementById(`slide-container-${store.currentSlide.id}`)
  if (!element) return

  try {
    const canvas = await html2canvas(element as HTMLElement, {
      scale: 2,
      useCORS: true
    })

    if (format === 'pdf') {
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
      })
      
      const imgProps = pdf.getImageProperties(imgData)
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
      pdf.save(`slide-${store.currentSlideIndex + 1}.pdf`)
    } else {
      const link = document.createElement('a')
      link.download = `slide-${store.currentSlideIndex + 1}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    }
  } catch (e) {
    console.error('Export failed:', e)
    alert('Export failed. See console.')
  }
}
</script>

<template>
  <div class="flex h-full bg-card overflow-hidden transition-colors duration-300">
    <!-- Left Sidebar: Thumbnails -->
    <div class="w-56 bg-muted/20 flex flex-col border-r border-border/50">
      <div class="p-4 flex items-center justify-between shrink-0">
        <span class="text-sm font-semibold flex items-center gap-2">
          <LayoutTemplate class="h-4 w-4" />
          {{ t('slides').value }}
        </span>
        <span class="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{{ store.slides.length }}</span>
      </div>
      <div class="flex-1 overflow-y-auto px-4 pb-4 custom-scrollbar">
        <div class="flex flex-col gap-3 py-2">
          <SlideThumbnail 
            v-for="(slide, index) in store.slides" 
            :key="slide.id" 
            :index="index"
            :isActive="index === store.currentSlideIndex"
            :slide="slide"
            @click="store.currentSlideIndex = index"
          />
          <div v-if="store.slides.length === 0" class="flex flex-col items-center justify-center py-8 text-center text-muted-foreground gap-2">
            <PlusCircle class="h-8 w-8 text-muted-foreground/30" />
            <span class="text-xs text-muted-foreground/50">{{ t('noSlides').value }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Area -->
    <div class="flex-1 flex flex-col h-full overflow-hidden relative bg-card">
      <!-- Toolbar -->
      <div class="h-14 flex items-center justify-between px-6 bg-card transition-colors duration-300">
        <div class="text-sm font-medium text-muted-foreground">
          {{ store.currentSlide?.title || t('preview').value }}
        </div>
        <div class="flex items-center gap-2">
          <CustomSlideDialog />
          
          <Button 
             :title="store.slideRenderMode === 'replace' ? t('currentReplaceMode').value : t('currentAppendMode').value"
             class="h-8 gap-2"
             size="sm"
             variant="ghost"
             @click="store.slideRenderMode = store.slideRenderMode === 'replace' ? 'append' : 'replace'"
          >
             <RefreshCw v-if="store.slideRenderMode === 'replace'" class="h-4 w-4" />
             <ListPlus v-else class="h-4 w-4" />
             <span class="text-xs">{{ store.slideRenderMode === 'replace' ? t('replaceMode').value : t('appendMode').value }}</span>
          </Button>

          <Button 
            :title="t('clearAllSlides').value"
            class="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
            size="icon"
            variant="ghost"
            @click="store.clearSlides"
          >
            <Trash2 class="h-4 w-4" />
          </Button>
          
          <div class="w-px h-4 bg-border/50 mx-1"></div>

          <div class="flex items-center gap-2">
            <Select>
              <SelectTrigger class="h-8">
                <Download class="h-4 w-4" />
                <SelectValue :placeholder="t('exportFormat').value" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="png" @click="handleDownload('png')">
                  <div class="flex items-center gap-2">
                    <Image class="h-3.5 w-3.5" />
                    <span>{{ t('exportPng').value }}</span>
                  </div>
                </SelectItem>
                <SelectItem value="pdf" @click="handleDownload('pdf')">
                  <div class="flex items-center gap-2">
                    <Download class="h-3.5 w-3.5" />
                    <span>{{ t('exportPdf').value }}</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <!-- Preview -->
      <div class="flex-1 p-4 bg-muted/20 overflow-hidden flex items-center justify-center relative">
        <Transition mode="out-in" name="fade">
          <div 
            v-if="store.currentSlide"
            :key="store.currentSlide.id"
            class="w-full h-full bg-background rounded-xl overflow-hidden relative border border-border/50 shadow-sm"
          >
             <SlidePreview 
               :id="store.currentSlide.id"
               :syntax="store.currentSlide.syntax"
             />
          </div>
          <div v-else class="flex flex-col items-center justify-center h-full text-muted-foreground gap-3">
             <div class="bg-muted p-4 rounded-full">
               <LayoutTemplate class="h-10 w-10 text-muted-foreground/50" />
             </div>
             <p class="font-medium">{{ t('readyToCreate').value }}</p>
             <p class="text-sm text-muted-foreground/70">{{ t('waitingPlaceholder').value }}</p>
          </div>
        </Transition>

        <!-- Loading Overlay -->
        <Transition name="fade">
          <div v-if="store.isStreaming" class="absolute top-6 right-6 bg-background/90 backdrop-blur-md border border-border rounded-full px-4 py-2 flex items-center gap-2.5 shadow-sm z-50">
             <Loader2 class="h-4 w-4 animate-spin text-primary" />
             <span class="text-xs font-medium text-foreground">{{ t('rendering').value }}</span>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
