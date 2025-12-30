import { computed } from 'vue'
import { useAppStore } from '@/stores/useAppStore'
import en from '@/locales/en.json'
import zh from '@/locales/zh.json'

const messages = {
  en,
  zh
}

export function useI18n() {
  const store = useAppStore()

  const t = (key: string) => {
    return computed(() => {
      const locale = store.locale as 'en' | 'zh'
      const translations = messages[locale] as Record<string, string>
      return translations[key] || key
    })
  }

  return {
    t,
    locale: computed(() => store.locale)
  }
}