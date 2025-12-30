<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Settings } from 'lucide-vue-next'
import { useAppStore } from '@/stores/useAppStore'
import { useI18n } from '@/composables/useI18n'

const store = useAppStore()
const { t } = useI18n()
const open = ref(false)

function handleSave() {
  open.value = false
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogTrigger as-child>
      <Button variant="ghost" size="icon" class="rounded-full">
        <Settings class="h-4 w-4" />
      </Button>
    </DialogTrigger>
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>{{ t('settings').value }}</DialogTitle>
        <DialogDescription>
          {{ t('welcomeDesc').value }}
        </DialogDescription>
      </DialogHeader>
      <div class="grid gap-4 py-4">
        <div class="grid grid-cols-4 items-center gap-4">
          <Label for="api-key" class="text-right">
            {{ t('apiKey').value }}
          </Label>
          <Input id="api-key" v-model="store.apiKey" type="password" class="col-span-3" placeholder="sk-..." />
        </div>
        <div class="grid grid-cols-4 items-center gap-4">
          <Label for="base-url" class="text-right">
             {{ t('baseUrl').value }}
          </Label>
          <Input id="base-url" v-model="store.baseUrl" class="col-span-3" placeholder="https://api.openai.com/v1" />
        </div>
        <div class="grid grid-cols-4 items-center gap-4">
          <Label for="model" class="text-right">
             {{ t('model').value }}
          </Label>
          <Input id="model" v-model="store.model" class="col-span-3" placeholder="gpt-4o" />
        </div>


      </div>
      <DialogFooter>
        <Button type="submit" @click="handleSave">{{ t('save').value }}</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
