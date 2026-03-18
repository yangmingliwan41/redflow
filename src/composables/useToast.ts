import { ref, h, render } from 'vue'
import Toast, { type ToastType, type Toast as ToastComponent } from '@/components/ui/Toast.vue'

const toastContainer = ref<HTMLElement | null>(null)
let toastInstance: any = null

const initToast = () => {
  if (!toastInstance) {
    const container = document.createElement('div')
    document.body.appendChild(container)
    toastInstance = h(Toast)
    render(toastInstance, container)
    toastContainer.value = container
  }
  return toastInstance.component?.exposed
}

const showToast = (type: ToastType, message: string, options?: {
  title?: string
  duration?: number
  closable?: boolean
}) => {
  if (typeof window === 'undefined') return
  
  initToast()
  const toast = toastInstance?.component?.exposed
  if (toast) {
    toast.addToast({
      type,
      message,
      ...options
    })
  }
}

export const useToast = () => {
  return {
    success: (message: string, options?: { title?: string; duration?: number; closable?: boolean }) => {
      showToast('success', message, options)
    },
    error: (message: string, options?: { title?: string; duration?: number; closable?: boolean }) => {
      showToast('error', message, options)
    },
    warning: (message: string, options?: { title?: string; duration?: number; closable?: boolean }) => {
      showToast('warning', message, options)
    },
    info: (message: string, options?: { title?: string; duration?: number; closable?: boolean }) => {
      showToast('info', message, options)
    }
  }
}




