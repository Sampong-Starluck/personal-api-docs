// ~/composables/useCopyToClipboard.ts
import { ref } from 'vue'

export function useCopyToClipboard() {
    const copied = ref(false)

    async function copy(text: string) {
        try {
            await navigator.clipboard.writeText(text)
            copied.value = true
            setTimeout(() => (copied.value = false), 1500)
        } catch (e) {
            console.error('Copy failed', e)
        }
    }

    return (text: string) => copy(text)
}