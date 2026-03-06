// app/composables/useOpenApi.ts
import {useSwaggerConfig} from "~/composables/useSwaggerConfig";

export interface OaInfo {
    title: string
    version: string
    description?: string
}

export interface OaServer {
    url: string
    description?: string
}

export interface OaSchema {
    type?: string
    format?: string
    description?: string
    example?: unknown
    enum?: unknown[]
    $ref?: string
    items?: OaSchema
    properties?: Record<string, OaSchema>
    required?: string[]
    additionalProperties?: boolean | OaSchema
    nullable?: boolean
    allOf?: OaSchema[]
    oneOf?: OaSchema[]
    anyOf?: OaSchema[]
}

export interface OaParameter {
    name: string
    in: 'query' | 'path' | 'header' | 'cookie'
    description?: string
    required?: boolean
    schema?: OaSchema
    example?: unknown
}

export interface OaOperation {
    operationId?: string
    summary?: string
    description?: string
    tags?: string[]
    parameters?: OaParameter[]
    requestBody?: {
        required?: boolean
        description?: string
        content: Record<string, { schema?: OaSchema }>
    }
    responses: Record<
        string,
        {
            description: string
            content?: Record<string, { schema?: OaSchema }>
        }
    >
    security?: Record<string, string[]>[]
    deprecated?: boolean
}

export type HttpMethod =
    | 'get'
    | 'post'
    | 'put'
    | 'delete'
    | 'patch'
    | 'head'
    | 'options'

export type OaPathItem = Partial<Record<HttpMethod, OaOperation>>

export interface OaSpec {
    openapi: string
    info: OaInfo
    servers?: OaServer[]
    tags?: { name: string; description?: string }[]
    paths: Record<string, OaPathItem>
    components?: {
        schemas?: Record<string, OaSchema>
        securitySchemes?: Record<string, unknown>
    }
}

export interface TagGroup {
    tag: string
    description?: string
    endpoints: {
        method: HttpMethod
        path: string
        operation: OaOperation
        anchor: string
    }[]
}

export function useOpenApi() {
    const { base } = useSwaggerConfig()
    // `useState` makes the spec survive the client‑side hydration pass.
    const spec = useState<OaSpec | null>('openapi-spec', () => null)
    // const spec = ref<OaSpec | null>(null)
    const loading = ref(false)
    const error = ref<string | null>(null)

    const METHODS: HttpMethod[] = [
        'get', 'post', 'put', 'delete', 'patch', 'head', 'options',
    ]

    async function load(docsUrl?: string) {
        loading.value = true
        error.value = null
        try {
            spec.value = await $fetch<OaSpec>(
                docsUrl ?? `${base}/v3/api-docs`,
            )
        } catch (e: unknown) {
            error.value =
                e instanceof Error ? e.message : 'Failed to load spec'
        } finally {
            loading.value = false
        }
    }

    // Resolve $ref from components/schemas
    function resolveSchema(schema?: OaSchema): OaSchema | undefined {
        if (!schema) return undefined
        if (schema.$ref) {
            const name = schema.$ref.split('/').pop()!
            return spec.value?.components?.schemas?.[name]
        }
        return schema
    }

    const tagGroups = computed<TagGroup[]>(() => {
        if (!spec.value) return []
        const groups = new Map<string, TagGroup>()
        const tagDefs = Object.fromEntries(
            (spec.value.tags ?? []).map((t) => [t.name, t.description]),
        )

        for (const [path, item] of Object.entries(spec.value.paths)) {
            for (const method of METHODS) {
                const op = item[method]
                if (!op) continue
                const tags = op.tags?.length ? op.tags : ['default']
                for (const tag of tags) {
                    if (!groups.has(tag)) {
                        groups.set(tag, {
                            tag,
                            description: tagDefs[tag],
                            endpoints: [],
                        })
                    }
                    const anchor = `${method}-${path}`
                        .replace(/[^a-z0-9]/gi, '-')
                        .toLowerCase()
                    groups.get(tag)!.endpoints.push({
                        method,
                        path,
                        operation: op,
                        anchor,
                    })
                }
            }
        }
        return [...groups.values()]
    })

    return { spec, loading, error, load, tagGroups, resolveSchema }
}