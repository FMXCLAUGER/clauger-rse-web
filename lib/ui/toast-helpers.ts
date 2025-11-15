import { toast, type ExternalToast } from 'sonner'

interface ToastOptions extends ExternalToast {
  duration?: number
}

/**
 * Custom toast helper library with pre-configured notifications
 * Provides consistent UX across the application
 */
export const customToast = {
  /**
   * Success notification with custom icon and duration
   */
  success: (message: string, options?: ToastOptions) => {
    return toast.success(message, {
      duration: options?.duration ?? 4000,
      ...options,
    })
  },

  /**
   * Error notification with custom styling
   */
  error: (message: string, description?: string, options?: ToastOptions) => {
    return toast.error(message, {
      description,
      duration: options?.duration ?? 5000,
      ...options,
    })
  },

  /**
   * Warning notification
   */
  warning: (message: string, description?: string, options?: ToastOptions) => {
    return toast.warning(message, {
      description,
      duration: options?.duration ?? 4000,
      ...options,
    })
  },

  /**
   * Info notification
   */
  info: (message: string, description?: string, options?: ToastOptions) => {
    return toast.info(message, {
      description,
      duration: options?.duration ?? 3500,
      ...options,
    })
  },

  /**
   * Loading notification with promise support
   */
  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string
      success: string | ((data: T) => string)
      error: string | ((error: Error) => string)
    }
  ) => {
    return toast.promise(promise, messages)
  },

  /**
   * Custom notification with custom content
   */
  custom: (message: string, options?: ToastOptions) => {
    return toast(message, {
      duration: options?.duration ?? 4000,
      ...options,
    })
  },

  /**
   * Quick success feedback (shorter duration)
   */
  quickSuccess: (message: string) => {
    return toast.success(message, {
      duration: 2000,
    })
  },

  /**
   * Action toast with undo capability
   */
  actionable: (
    message: string,
    actionLabel: string,
    onAction: () => void,
    options?: ToastOptions
  ) => {
    return toast(message, {
      duration: options?.duration ?? 5000,
      action: {
        label: actionLabel,
        onClick: onAction,
      },
      ...options,
    })
  },
}

/**
 * Common toast messages for the application
 */
export const commonToasts = {
  saved: () => customToast.quickSuccess('Enregistré'),
  copied: () => customToast.quickSuccess('Copié dans le presse-papiers'),
  deleted: () => customToast.success('Supprimé avec succès'),
  updated: () => customToast.success('Mis à jour'),
  created: () => customToast.success('Créé avec succès'),
  error: () => customToast.error('Une erreur est survenue', 'Veuillez réessayer'),
  networkError: () =>
    customToast.error('Erreur réseau', 'Vérifiez votre connexion internet'),
  unauthorized: () =>
    customToast.error('Non autorisé', 'Vous n\'avez pas les permissions nécessaires'),
  rateLimited: (retryAfter: number) =>
    customToast.warning(
      'Trop de requêtes',
      `Veuillez patienter ${retryAfter}s avant de réessayer`
    ),
}
