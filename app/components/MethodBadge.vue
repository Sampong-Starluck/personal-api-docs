<!-- app/components/MethodBadge.vue -->
<script setup lang="ts">
const props = defineProps<{ method: string; size?: 'sm' | 'md' }>()

const STYLES: Record<string, string> = {
  get: 'bg-sky-500/10 text-sky-600 ring-sky-500/20 dark:text-sky-400',
  post: 'bg-emerald-500/10 text-emerald-600 ring-emerald-500/20 \
         dark:text-emerald-400',
  put: 'bg-amber-500/10 text-amber-600 ring-amber-500/20 \
       dark:text-amber-400',
  delete: 'bg-red-500/10 text-red-600 ring-red-500/20 dark:text-red-400',
  patch: 'bg-orange-500/10 text-orange-600 ring-orange-500/20 \
          dark:text-orange-400',
  head: 'bg-purple-500/10 text-purple-600 ring-purple-500/20 \
         dark:text-purple-400',
  options: 'bg-gray-500/10 text-gray-600 ring-gray-500/20 \
            dark:text-gray-400',
}

const cls = computed(
    () =>
        STYLES[props.method.toLowerCase()] ??
        'bg-gray-500/10 text-gray-600 ring-gray-500/20',
)
</script>

<template>
  <span
      class="inline-flex items-center rounded ring-1 font-mono font-semibold
           uppercase"
      :class="[
      cls,
      size === 'sm'
        ? 'px-1.5 py-0.5 text-[10px]'
        : 'px-2 py-1 text-xs',
    ]"
  >
    {{ method }}
  </span>
</template>