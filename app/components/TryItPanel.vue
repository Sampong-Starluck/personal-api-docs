<!-- app/components/TryItPanel.vue -->
<script setup lang="ts">
import type { OaOperation, HttpMethod } from '~/composables/useOpenApi'

const props = defineProps<{
  method: HttpMethod
  path: string
  operation: OaOperation
  baseUrl: string
}>()

const open = ref(false)
const loading = ref(false)

const pathParams = computed(
    () => props.operation.parameters?.filter((p) => p.in === 'path') ?? [],
)
const queryParams = computed(
    () => props.operation.parameters?.filter((p) => p.in === 'query') ?? [],
)

const pathValues = reactive<Record<string, string>>({})
const queryValues = reactive<Record<string, string>>({})
const bodyText = ref('')

const response = ref<{
  status: number
  body: string
  time: number
} | null>(null)

function buildUrl() {
  let url = props.path
  for (const [k, v] of Object.entries(pathValues)) {
    url = url.replace(`{${k}}`, encodeURIComponent(v))
  }
  const qs = Object.entries(queryValues)
      .filter(([, v]) => v)
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join('&')
  return `${props.baseUrl}${url}${qs ? '?' + qs : ''}`
}

async function send() {
  loading.value = true
  response.value = null
  const start = Date.now()
  try {
    const res = await $fetch.raw(buildUrl(), {
      method: props.method.toUpperCase() as never,
      body: bodyText.value ? JSON.parse(bodyText.value) : undefined,
      headers: { 'Content-Type': 'application/json' },
    })
    response.value = {
      status: res.status,
      body: JSON.stringify(res._data, null, 2),
      time: Date.now() - start,
    }
  } catch (e: unknown) {
    const fe = e as { status?: number; data?: unknown }
    response.value = {
      status: fe.status ?? 0,
      body: JSON.stringify(fe.data ?? String(e), null, 2),
      time: Date.now() - start,
    }
  } finally {
    loading.value = false
  }
}

const statusColor = computed(() => {
  const s = response.value?.status ?? 0
  if (s >= 200 && s < 300) return 'text-emerald-500'
  if (s >= 400) return 'text-red-500'
  return 'text-gray-500'
})

const hasBody = computed(() =>
    ['post', 'put', 'patch'].includes(props.method),
)
</script>

<template>
  <div class="mt-4">
    <UButton
        :icon="open ? 'i-lucide-x' : 'i-lucide-play'"
        size="sm"
        color="sky"
        variant="soft"
        @click="open = !open"
    >
      {{ open ? 'Close' : 'Try it' }}
    </UButton>

    <Transition
        enter-active-class="transition-all duration-200"
        enter-from-class="opacity-0 -translate-y-2"
        leave-active-class="transition-all duration-150"
        leave-to-class="opacity-0 -translate-y-2"
    >
      <div
          v-if="open"
          class="mt-3 rounded-xl border border-gray-200
               bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900"
      >
        <!-- Path params -->
        <div v-if="pathParams.length" class="mb-4 space-y-2">
          <p
              class="text-xs font-semibold uppercase tracking-wider
                   text-gray-500"
          >
            Path
          </p>
          <div
              v-for="p in pathParams"
              :key="p.name"
              class="flex items-center gap-3"
          >
            <label
                class="w-28 shrink-0 font-mono text-xs text-gray-700
                     dark:text-gray-300"
            >
              {{ p.name }}
            </label>
            <UInput
                v-model="pathValues[p.name]"
                :placeholder="p.description ?? p.name"
                size="sm"
                class="flex-1"
            />
          </div>
        </div>

        <!-- Query params -->
        <div v-if="queryParams.length" class="mb-4 space-y-2">
          <p
              class="text-xs font-semibold uppercase tracking-wider
                   text-gray-500"
          >
            Query
          </p>
          <div
              v-for="p in queryParams"
              :key="p.name"
              class="flex items-center gap-3"
          >
            <label
                class="w-28 shrink-0 font-mono text-xs text-gray-700
                     dark:text-gray-300"
            >
              {{ p.name }}
            </label>
            <UInput
                v-model="queryValues[p.name]"
                :placeholder="p.description ?? p.name"
                size="sm"
                class="flex-1"
            />
          </div>
        </div>

        <!-- Request body -->
        <div v-if="hasBody" class="mb-4">
          <p
              class="mb-2 text-xs font-semibold uppercase tracking-wider
                   text-gray-500"
          >
            Body (JSON)
          </p>
          <UTextarea
              v-model="bodyText"
              :rows="5"
              placeholder="{}"
              class="font-mono text-xs"
          />
        </div>

        <!-- URL preview -->
        <div
            class="mb-3 flex items-center gap-2 rounded-lg border
                 border-gray-200 bg-white px-3 py-2 dark:border-gray-700
                 dark:bg-gray-950"
        >
          <MethodBadge :method="method" size="sm" />
          <code
              class="flex-1 truncate font-mono text-xs text-gray-700
                   dark:text-gray-300"
          >
            {{ buildUrl() }}
          </code>
        </div>

        <UButton
            :loading="loading"
            size="sm"
            color="sky"
            icon="i-lucide-send"
            @click="send"
        >
          Send Request
        </UButton>

        <!-- Response -->
        <div v-if="response" class="mt-4">
          <div class="mb-2 flex items-center gap-3">
            <span
                class="font-mono text-sm font-bold"
                :class="statusColor"
            >
              {{ response.status }}
            </span>
            <span class="text-xs text-gray-500">
              {{ response.time }}ms
            </span>
          </div>
          <pre
              class="max-h-64 overflow-auto rounded-lg bg-gray-900
                   p-4 font-mono text-xs text-gray-100"
          >{{ response.body }}</pre>
        </div>
      </div>
    </Transition>
  </div>
</template>