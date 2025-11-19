
import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props} className="group border-primary/10 dark:border-primary/20 shadow-lg backdrop-blur-sm animate-in data-[state=open]:fade-in-90 data-[state=closed]:fade-out-90 data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)]">
            <div className="grid gap-1">
              {title && <ToastTitle className="text-sm font-medium flex items-center gap-1.5">{title}</ToastTitle>}
              {description && (
                <ToastDescription className="text-xs text-muted-foreground">{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose className="opacity-70 group-hover:opacity-100 transition-opacity" />
          </Toast>
        )
      })}
      <ToastViewport className="bottom-0 right-0 top-auto flex flex-col-reverse p-4 sm:bottom-4 sm:right-4 sm:top-auto sm:flex-col md:max-w-[420px]" />
    </ToastProvider>
  )
}
