<!-- app/components/ParamsTable.vue -->
<script setup lang="ts">
import type { OaParameter } from '~/composables/useOpenApi'

defineProps<{ params: OaParameter[] }>()
</script>

<template>
  <div class="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
    <table class="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-800">
      <thead class="bg-gray-50 dark:bg-gray-900">
      <tr>
        <th
            class="px-4 py-2.5 text-left text-xs font-semibold
                   uppercase tracking-wider text-gray-500"
        >
          Name
        </th>
        <th
            class="px-4 py-2.5 text-left text-xs font-semibold
                   uppercase tracking-wider text-gray-500"
        >
          In
        </th>
        <th
            class="px-4 py-2.5 text-left text-xs font-semibold
                   uppercase tracking-wider text-gray-500"
        >
          Type
        </th>
        <th
            class="px-4 py-2.5 text-left text-xs font-semibold
                   uppercase tracking-wider text-gray-500"
        >
          Required
        </th>
        <th
            class="px-4 py-2.5 text-left text-xs font-semibold
                   uppercase tracking-wider text-gray-500"
        >
          Description
        </th>
      </tr>
      </thead>
      <tbody
          class="divide-y divide-gray-100 bg-white
               dark:divide-gray-800/50 dark:bg-gray-950"
      >
      <tr
          v-for="p in params"
          :key="`${p.in}-${p.name}`"
          class="hover:bg-gray-50 dark:hover:bg-gray-900/50"
      >
        <td class="px-4 py-3">
          <code
              class="rounded bg-gray-100 px-1.5 py-0.5 text-xs
                     font-medium text-gray-800 dark:bg-gray-800
                     dark:text-gray-200"
          >
            {{ p.name }}
          </code>
        </td>
        <td class="px-4 py-3">
            <span
                class="rounded bg-gray-100 px-1.5 py-0.5 text-xs
                     text-gray-600 dark:bg-gray-800 dark:text-gray-400"
            >
              {{ p.in }}
            </span>
        </td>
        <td class="px-4 py-3 font-mono text-xs text-gray-600 dark:text-gray-400">
          {{ p.schema?.type ?? '—' }}
          <span v-if="p.schema?.format" class="text-gray-400">
              ({{ p.schema.format }})
            </span>
        </td>
        <td class="px-4 py-3">
            <span
                v-if="p.required"
                class="text-xs font-medium text-red-500"
            >
              required
            </span>
          <span v-else class="text-xs text-gray-400">optional</span>
        </td>
        <td
            class="px-4 py-3 text-xs text-gray-600
                   dark:text-gray-400"
        >
          {{ p.description ?? '—' }}
        </td>
      </tr>
      </tbody>
    </table>
  </div>
</template>