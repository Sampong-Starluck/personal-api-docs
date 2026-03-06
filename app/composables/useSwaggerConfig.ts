import {ref} from 'vue'

export interface SwaggerConfig {
    url: string
    name: string
}

export interface SwaggerUiConfig {
    configUrl: string
    defaultModelsExpandDepth: string
    docExpansion: string
    oauth2RedirectUrl: string
    tagsSorter: string
    urls: SwaggerConfig[]
    validatorUrl: string
}

/** Load the JSON that the Spring‑doc “swagger‑config” endpoint returns. */
export function useSwaggerConfig() {
    const {public: pub} = useRuntimeConfig()
    const base = pub.apiBaseUrl ?? ''

    const uiConfig = ref<SwaggerUiConfig | null>(null)
    const loading = ref(false)
    const error = ref<string | null>(null)

    async function load() {
        loading.value = true
        error.value = null
        try {
            // The endpoint always returns the exact JSON you pasted.
            uiConfig.value = await $fetch<SwaggerUiConfig>(`${base}/v3/api-docs/swagger-config`)
        } catch (e: unknown) {
            error.value = e instanceof Error ? e.message : 'Failed to load swagger‑config'
        } finally {
            loading.value = false
        }
    }

    return {base, uiConfig, loading, error, load}
}