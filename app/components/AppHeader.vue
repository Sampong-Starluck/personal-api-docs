<!-- app/components/AppHeader.vue -->
<script setup lang="ts">
const colorMode = useColorMode()
const isDark = computed({
  get: () => colorMode.value === 'dark',
  set: (v) => (colorMode.preference = v ? 'dark' : 'light'),
})

const emit = defineEmits<{ search: [] }>()

defineProps<{ title: string; version?: string }>()
</script>

<template>
  <header
      class="sticky top-0 z-50 flex h-14 items-center border-b
           border-gray-200 bg-white/90 px-4 backdrop-blur-sm
           dark:border-gray-800 dark:bg-gray-950/90"
  >
    <!-- Logo / Title -->
    <div class="flex items-center gap-3 min-w-0">
      <div
          class="flex size-7 items-center justify-center rounded-md
               bg-sky-500 text-white text-xs font-bold shrink-0"
      >
        API
      </div>
      <span
          class="text-sm font-semibold text-gray-900
               dark:text-white truncate"
      >
        {{ title }}
      </span>
      <UBadge
          v-if="version"
          :label="version"
          variant="subtle"
          color="sky"
          size="xs"
          class="shrink-0"
      />
    </div>

    <div class="flex-1" />

    <!-- Search -->
    <UButton
        icon="i-lucide-search"
        color="neutral"
        variant="ghost"
        size="sm"
        class="mr-2 hidden text-gray-500 sm:flex"
        @click="emit('search')"
    >
      <span class="text-xs text-gray-400">Search...</span>
      <UKbd class="ml-8" value="⌘K" />
    </UButton>

    <!-- Dark mode toggle -->
    <UButton
        :icon="isDark ? 'i-lucide-sun' : 'i-lucide-moon'"
        color="neutral"
        variant="ghost"
        size="sm"
        @click="isDark = !isDark"
    />
  </header>
</template>