<!-- app/components/ConfigInfo.vue -->
<script setup lang="ts">
import type { SwaggerUiConfig } from '~/composables/useSwaggerConfig'

defineProps<{
  config: SwaggerUiConfig
}>()
</script>

<template>
  <div class="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900">
    <h3 class="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-200">
      Swagger UI configuration (read‑only)
    </h3>
    <dl class="grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400">
      <dt class="font-medium">OAuth2 redirect</dt>
      <dd class="break-all">{{ config.oauth2RedirectUrl }}</dd>

      <dt class="font-medium">Validator URL</dt>
      <dd class="break-all">{{ config.validatorUrl || '(none)' }}</dd>

      <dt class="font-medium">Doc expansion</dt>
      <dd>{{ config.docExpansion }}</dd>

      <dt class="font-medium">Tags sorter</dt>
      <dd>{{ config.tagsSorter }}</dd>
    </dl>
  </div>
</template>