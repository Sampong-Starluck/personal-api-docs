<!-- app/components/AppSidebar.vue -->
<script setup lang="ts">
import type { TagGroup } from '~/composables/useOpenApi'

const props = defineProps<{
  groups: TagGroup[]
  activeAnchor?: string
}>()

const emit = defineEmits<{ navigate: [anchor: string] }>()

const expanded = ref<Set<string>>(new Set(props.groups.map((g) => g.tag)))

function toggle(tag: string) {
  expanded.value.has(tag)
      ? expanded.value.delete(tag)
      : expanded.value.add(tag)
}

const METHOD_COLOR: Record<string, string> = {
  get: 'text-sky-500',
  post: 'text-emerald-500',
  put: 'text-amber-500',
  delete: 'text-red-500',
  patch: 'text-orange-500',
  head: 'text-purple-500',
  options: 'text-gray-500',
}
</script>

<template>
  <aside
      class="sidebar-scroll fixed inset-y-0 left-0 top-14 hidden
           w-64 overflow-y-auto border-r border-gray-200 bg-gray-50/80
           pb-10 pt-6 lg:block dark:border-gray-800
           dark:bg-gray-900/80"
  >
    <nav class="space-y-1 px-3">
      <div v-for="group in groups" :key="group.tag">
        <!-- Tag header -->
        <button
            class="flex w-full items-center justify-between rounded-md
                 px-2 py-1.5 text-left text-xs font-semibold
                 uppercase tracking-wider text-gray-500
                 hover:text-gray-900 dark:text-gray-400
                 dark:hover:text-white"
            @click="toggle(group.tag)"
        >
          {{ group.tag }}
          <UIcon
              :name="
              expanded.has(group.tag)
                ? 'i-lucide-chevron-down'
                : 'i-lucide-chevron-right'
            "
              class="size-3.5 transition-transform"
          />
        </button>

        <!-- Endpoints -->
        <Transition
            enter-active-class="transition-all duration-200"
            enter-from-class="opacity-0 -translate-y-1"
            leave-active-class="transition-all duration-150"
            leave-to-class="opacity-0 -translate-y-1"
        >
          <ul v-if="expanded.has(group.tag)" class="mt-1 space-y-0.5">
            <li v-for="ep in group.endpoints" :key="ep.anchor">
              <a
                  :href="`#${ep.anchor}`"
                  class="flex items-center gap-2 rounded-md px-2 py-1.5
                       text-sm transition-colors"
                  :class="[
                  activeAnchor === ep.anchor
                    ? 'bg-white font-medium text-sky-600 shadow-sm \
                       ring-1 ring-gray-200 dark:bg-gray-800 \
                       dark:text-sky-400 dark:ring-gray-700'
                    : 'text-gray-600 hover:bg-white hover:text-gray-900 \
                       dark:text-gray-400 dark:hover:bg-gray-800 \
                       dark:hover:text-white',
                ]"
                  @click="emit('navigate', ep.anchor)"
              >
                <span
                    class="w-12 shrink-0 font-mono text-[10px]
                         font-semibold uppercase"
                    :class="METHOD_COLOR[ep.method] ?? 'text-gray-500'"
                >
                  {{ ep.method }}
                </span>
                <span class="truncate text-xs">{{ ep.path }}</span>
              </a>
            </li>
          </ul>
        </Transition>
      </div>
    </nav>
  </aside>
</template>