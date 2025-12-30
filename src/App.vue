<script setup lang="ts">
import Header from '@/components/layout/Header.vue'
import ChatContainer from '@/components/chat/ChatContainer.vue'
import SlidesContainer from '@/components/slides/SlidesContainer.vue'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
</script>

<template>
  <div 
    class="h-screen w-full flex flex-col overflow-hidden bg-background text-foreground transition-colors duration-300"
  >
    <Header />
    
    <div class="flex-1 overflow-hidden p-4">
      <ResizablePanelGroup direction="horizontal" class="h-full rounded-xl overflow-visible gap-2">
        
        <ResizablePanel :default-size="30" :min-size="25" :max-size="45" class="bg-card rounded-xl border border-border/50 overflow-hidden">
          <ChatContainer />
        </ResizablePanel>
        
        <ResizableHandle with-handle class="w-1 bg-transparent hover:bg-primary/20 transition-colors rounded-full" />
        
        <ResizablePanel :default-size="70" class="bg-card rounded-xl border border-border/50 overflow-hidden">
          <SlidesContainer />
        </ResizablePanel>

      </ResizablePanelGroup>
    </div>
  </div>
</template>