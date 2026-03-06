<!-- app/components/EndpointSection.vue -->
<script setup lang="ts">
import type { HttpMethod, OaOperation } from '~/composables/useOpenApi'
import {useCopyToClipboard} from "~/composables/useCopyToClipboard";

const props = defineProps<{
  method: HttpMethod
  path: string
  operation: OaOperation
  anchor: string
  baseUrl: string
  /** If true, the section starts collapsed (docExpansion = "none") */
  collapsedInitially?: boolean
}>()

const { resolveSchema } = useOpenApi()
// The UI config may ask for all sections to be collapsed initially.
const expanded = ref(!props.collapsedInitially)

const copyPath = useCopyToClipboard()

const successResponse = computed(() =>
    Object.entries(props.operation.responses).find(
        ([code]) => code.startsWith('2'),
    ),
)

const requestSchema = computed(() => {
  const content = props.operation.requestBody?.content
  if (!content) return null
  const mediaType = content['application/json'] ?? Object.values(content)[0]
  return resolveSchema(mediaType?.schema)
})

const responseSchema = computed(() => {
  if (!successResponse.value) return null
  const content = successResponse.value[1].content
  if (!content) return null
  const mediaType = content['application/json'] ?? Object.values(content)[0]
  return resolveSchema(mediaType?.schema)
})
</script>

<template>
  <section
      :id="anchor"
      class="scroll-mt-20 border-b border-gray-100 py-10
           dark:border-gray-800/60"
  >
    <!-- Header row -->
    <div class="flex flex-wrap items-start gap-3">
      <MethodBadge :method="method" />
      <code
          class="flex-1 break-all font-mono text-sm font-medium
               text-gray-900 dark:text-white"
      >
        {{ path }}
      </code>
      <div class="flex items-center gap-2">
        <UBadge
            v-if="operation.deprecated"
            label="Deprecated"
            color="error"
            variant="subtle"
            size="xs"
        />
        <UTooltip text="Copy path">
          <UButton
              icon="i-lucide-copy"
              size="xs"
              color="neutral"
              variant="ghost"
              @click="copyPath(path)"
          />
        </UTooltip>
        <UButton
            :icon="
            expanded ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'
          "
            size="xs"
            color="neutral"
            variant="ghost"
            @click="expanded = !expanded"
        />
      </div>
    </div>

    <!-- Summary + description -->
    <p
        v-if="operation.summary"
        class="mt-3 text-base font-medium text-gray-900 dark:text-white"
    >
      {{ operation.summary }}
    </p>
    <p
        v-if="operation.description"
        class="mt-1.5 text-sm leading-relaxed text-gray-600
             dark:text-gray-400"
    >
      {{ operation.description }}
    </p>

    <!-- Expanded detail -->
    <Transition
        enter-active-class="transition-all duration-200"
        enter-from-class="opacity-0"
    >
      <div v-if="expanded" class="mt-6 space-y-6">
        <!-- Parameters -->
        <div v-if="operation.parameters?.length">
          <h4
              class="mb-3 text-xs font-semibold uppercase tracking-wider
                   text-gray-500"
          >
            Parameters
          </h4>
          <ParamsTable :params="operation.parameters" />
        </div>

        <!-- Request body -->
        <div v-if="requestSchema">
          <h4
              class="mb-3 text-xs font-semibold uppercase tracking-wider
                   text-gray-500"
          >
            Request Body
          </h4>
          <div
              class="rounded-xl border border-gray-200 bg-white p-4
                   dark:border-gray-800 dark:bg-gray-950"
          >
            <SchemaViewer :schema="requestSchema" />
          </div>
        </div>

        <!-- Responses -->
        <div>
          <h4
              class="mb-3 text-xs font-semibold uppercase tracking-wider
                   text-gray-500"
          >
            Responses
          </h4>
          <div class="space-y-3">
            <div
                v-for="([code, res]) in Object.entries(operation.responses)"
                :key="code"
                class="rounded-xl border bg-white p-4 dark:bg-gray-950"
                :class="
                code.startsWith('2')
                  ? 'border-emerald-200 dark:border-emerald-900'
                  : code.startsWith('4')
                    ? 'border-red-200 dark:border-red-900'
                    : 'border-gray-200 dark:border-gray-800'
              "
            >
              <div class="flex items-center gap-3">
                <span
                    class="font-mono text-sm font-bold"
                    :class="
                    code.startsWith('2')
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : code.startsWith('4')
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-gray-600 dark:text-gray-400'
                  "
                >
                  {{ code }}
                </span>
                <span class="text-sm text-gray-600 dark:text-gray-400">
                  {{ res.description }}
                </span>
              </div>
              <div v-if="responseSchema && code.startsWith('2')" class="mt-3">
                <SchemaViewer :schema="responseSchema" />
              </div>
            </div>
          </div>
        </div>

        <!-- Try It -->
        <TryItPanel
            :method="method"
            :path="path"
            :operation="operation"
            :base-url="baseUrl"
        />
      </div>
    </Transition>

    <!-- Quick expand hint -->
    <button
        v-if="!expanded"
        class="mt-3 text-xs text-gray-400 hover:text-sky-500
             dark:hover:text-sky-400"
        @click="expanded = true"
    >
      Show details →
    </button>
  </section>
</template>