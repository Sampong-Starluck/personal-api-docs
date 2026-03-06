// // app/composables/useApiConfig.ts
// export interface SwaggerConfig {
//     url: string
//     name: string
//     swaggerVersion?: string
// }
//
// export function useApiConfig() {
//     const config = useRuntimeConfig()
//     const base = config.public.apiBaseUrl
//
//     async function fetchSwaggerConfig(): Promise<SwaggerConfig[]> {
//         const data = await $fetch<SwaggerConfig[] | SwaggerConfig>(
//             `${base}/v3/api-docs/swagger-config`,
//         )
//         return Array.isArray(data) ? data : [data]
//     }
//
//     return { base, fetchSwaggerConfig }
// }