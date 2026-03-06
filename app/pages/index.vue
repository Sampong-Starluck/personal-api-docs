<!-- app/pages/index.vue -->
<script setup lang="ts">
/* --------------------------------------------------------------
   Imports & composables
   -------------------------------------------------------------- */
import { computed, defineAsyncComponent } from 'vue'
import type { TagGroup } from '~/composables/useOpenApi'
import type { SwaggerConfig } from '~/composables/useSwaggerConfig'

// import { useApiConfig } from '~/composables/useApiConfig'
import { useSwaggerConfig } from '~/composables/useSwaggerConfig'
import { useOpenApi } from '~/composables/useOpenApi'

/* --------------------------------------------------------------
   Runtime config (base URL)
   -------------------------------------------------------------- */
const { public: pub } = useRuntimeConfig()
const base = pub.apiBaseUrl ?? ''

/* --------------------------------------------------------------
   Load swagger‑config (the JSON you posted)
   -------------------------------------------------------------- */
const {
  uiConfig,
  loading: cfgLoading,
  error: cfgError,
  load: loadCfg,
} = useSwaggerConfig()

/* --------------------------------------------------------------
   Load the OpenAPI spec for the selected URL
   -------------------------------------------------------------- */
const {
  spec,
  loading: specLoading,
  error: specError,
  load: loadSpec,
  tagGroups,
} = useOpenApi()

/* --------------------------------------------------------------
   Local state
   -------------------------------------------------------------- */
const activeConfig = ref<SwaggerConfig | null>(null)
const activeAnchor = ref('')

/* --------------------------------------------------------------
   Helper – build an absolute URL from the relative one in swagger‑config
   -------------------------------------------------------------- */
function buildUrl(relative: string): string {
  return relative.startsWith('http') ? relative : `${base}${relative}`
}

/* --------------------------------------------------------------
   Initialise – load config → first spec
   -------------------------------------------------------------- */
async function init() {
  await loadCfg()
  if (!uiConfig.value) return

  // pick the first entry as default (or keep a previously‑selected one)
  activeConfig.value = uiConfig.value.urls[0] ?? null
  if (activeConfig.value) {
    await loadSpec(buildUrl(activeConfig.value.url))
  }
}
onMounted(() => {
  init()
})

/* --------------------------------------------------------------
   Switch between the different swagger‑config URLs
   -------------------------------------------------------------- */
async function switchConfig(cfg: SwaggerConfig) {
  activeConfig.value = cfg
  await loadSpec(buildUrl(cfg.url))
}

/* --------------------------------------------------------------
   IntersectionObserver – keep track of the section that is in view
   -------------------------------------------------------------- */
onMounted(() => {
  const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) activeAnchor.value = e.target.id
        }
      },
      { rootMargin: '-30% 0px -60% 0px' },
  )
  watchEffect(() => {
    document
        .querySelectorAll('section[id]')
        .forEach((el) => observer.observe(el))
  })
  onUnmounted(() => observer.disconnect())
})

/* --------------------------------------------------------------
   Page title
   -------------------------------------------------------------- */
useHead({
  title: computed(() => spec.value?.info.title ?? 'API Documentation'),
})

/* --------------------------------------------------------------
   Computed: sorted tag groups (respect tagsSorter)
   -------------------------------------------------------------- */
const sortedGroups = computed<TagGroup[]>(() => {
  const groups = tagGroups.value ?? []
  if (uiConfig.value?.tagsSorter === 'alpha') {
    return [...groups].sort((a, b) => a.tag.localeCompare(b.tag))
  }
  return groups
})

/* --------------------------------------------------------------
   Async component registration (ConfigInfo)
   -------------------------------------------------------------- */
const ConfigInfo = defineAsyncComponent(() =>
    import('~/components/ConfigInfo.vue')
)
</script>

<template>
  <div class="min-h-screen bg-white dark:bg-gray-950">
    <!-- Header -->
    <AppHeader
        :title="spec?.info.title ?? 'API Documentation'"
        :version="spec?.info.version"
    />

    <div class="flex">
      <!-- Sidebar (only when spec is ready) -->
      <AppSidebar
          v-if="spec"
          :groups="sortedGroups"
          :active-anchor="activeAnchor"
      />

      <!-- Main content -->
      <main class="flex-1 lg:pl-64">
        <div class="mx-auto max-w-4xl px-6 py-12">
          <!-- ---------- Config loading / error ---------- -->
          <UAlert
              v-if="cfgLoading"
              color="neutral"
              variant="soft"
              title="Loading swagger‑config..."
              icon="i-lucide-loader"
              class="mb-4"
          />
          <UAlert
              v-else-if="cfgError"
              color="error"
              variant="soft"
              :title="cfgError"
              icon="i-lucide-alert-circle"
              class="mb-4"
          />

          <!-- ---------- Multi‑spec selector ---------- -->
          <div
              v-if="uiConfig?.urls?.length??0 > 1"
              class="mb-8 flex flex-wrap gap-2"
          >
            <UButton
                v-for="cfg in uiConfig?.urls??[]"
                :key="cfg.url"
                :label="cfg.name"
                size="sm"
                :variant="activeConfig?.url === cfg.url ? 'solid' : 'outline'"
                color="info"
                @click="switchConfig(cfg)"
            />
          </div>

          <!-- ---------- Spec loading / error ---------- -->
          <div v-if="specLoading" class="flex items-center gap-3 py-20">
            <UIcon
                name="i-lucide-loader"
                class="size-5 animate-spin text-sky-500"
            />
            <span class="text-gray-500">Loading API spec...</span>
          </div>

          <UAlert
              v-else-if="specError"
              color="error"
              variant="soft"
              :title="specError"
              icon="i-lucide-alert-circle"
          />

          <!-- ---------- Spec content ---------- -->
          <template v-else-if="spec">
            <!-- API Info -->
            <div
                class="mb-12 border-b border-gray-200 pb-10 dark:border-gray-800"
            >
              <h1
                  class="text-3xl font-bold tracking-tight text-gray-900 dark:text-white"
              >
                {{ spec.info.title }}
              </h1>
              <p
                  v-if="spec.info.description"
                  class="mt-3 text-base leading-relaxed text-gray-600 dark:text-gray-400"
              >
                {{ spec.info.description }}
              </p>
              <div class="mt-4 flex flex-wrap gap-2">
                <UBadge
                    :label="`OpenAPI ${spec.openapi}`"
                    color="info"
                    variant="subtle"
                    size="sm"
                />
                <UBadge
                    :label="`v${spec.info.version}`"
                    color="neutral"
                    variant="subtle"
                    size="sm"
                />
                <UBadge
                    v-for="server in spec.servers"
                    :key="server.url"
                    :label="server.url"
                    color="neutral"
                    variant="outline"
                    size="sm"
                    icon="i-lucide-server"
                />
              </div>
            </div>

            <!-- Optional: show swagger‑config details (read‑only) -->
            <ConfigInfo v-if="uiConfig" :config="uiConfig" class="mb-8" />

            <!-- Endpoints grouped by tag -->
            <div v-for="group in sortedGroups" :key="group.tag" class="mb-16">
              <div class="mb-6">
                <h2
                    class="text-xl font-bold text-gray-900 dark:text-white"
                >
                  {{ group.tag }}
                </h2>
                <p
                    v-if="group.description"
                    class="mt-1 text-sm text-gray-500 dark:text-gray-400"
                >
                  {{ group.description }}
                </p>
              </div>

              <EndpointSection
                  v-for="ep in group.endpoints"
                  :key="ep.anchor"
                  :method="ep.method"
                  :path="ep.path"
                  :operation="ep.operation"
                  :anchor="ep.anchor"
                  :base-url="spec.servers?.[0]?.url ?? base"
                  :collapsed-initially="uiConfig?.docExpansion === 'none'"
              />
            </div>
          </template>
        </div>
      </main>
    </div>
  </div>
</template>