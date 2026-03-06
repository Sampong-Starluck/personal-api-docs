<!-- app/components/SchemaViewer.vue -->
<script setup lang="ts">
import type {OaSchema} from '~/composables/useOpenApi'

const {uiConfig} = useSwaggerConfig()
const expandDepth = computed(() => {
  // swagger‑ui uses `-1` to mean “never auto‑expand”.
  const raw = uiConfig.value?.defaultModelsExpandDepth ?? '1'
  const n = parseInt(raw, 10)
  return Number.isNaN(n) ? 1 : n
})

const props = defineProps<{ schema: OaSchema; depth?: number }>()

const {resolveSchema} = useOpenApi()

const resolved = computed(() => resolveSchema(props.schema) ?? props.schema)
const hasProps = computed(() => {
  if (!resolved.value.properties) return false
  // If the UI config says “-1”, never expand children.
  if (expandDepth.value === -1) return false
  // Otherwise allow expansion up to the configured depth.
  return d.value < expandDepth.value
})
const d = computed(() => props.depth ?? 0)
</script>

<template>
  <div class="font-mono text-xs">
    <!-- Object with properties -->
    <div v-if="hasProps">
      <div
          v-for="(propSchema, propName) in resolved.properties"
          :key="propName"
          class="flex gap-3 border-b border-gray-100 py-2
               last:border-0 dark:border-gray-800/50"
          :style="{ paddingLeft: `${d * 16}px` }"
      >
        <span class="min-w-32 text-gray-800 dark:text-gray-200">
          {{ propName }}
          <span
              v-if="resolved.required?.includes(propName)"
              class="ml-1 text-red-400"
          >*</span
          >
        </span>
        <span class="text-sky-600 dark:text-sky-400">
          {{ propSchema.type ?? propSchema.$ref?.split('/').pop() ?? '?' }}
          <span
              v-if="propSchema.format"
              class="text-gray-400"
          >
            &lt;{{ propSchema.format }}&gt;
          </span>
        </span>
        <span
            v-if="propSchema.description"
            class="flex-1 text-gray-500 dark:text-gray-500"
        >
          // {{ propSchema.description }}
        </span>
      </div>
    </div>

    <!-- Primitive / ref -->
    <div v-else class="text-sky-600 dark:text-sky-400">
      {{
        resolved.$ref?.split('/').pop() ??
        resolved.type ??
        'unknown'
      }}
    </div>
  </div>
</template>