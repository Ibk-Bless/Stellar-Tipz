import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export type ToastPriority = 'low' | 'medium' | 'high' | 'critical';

export type ToastPosition =
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right'
  | 'top-center'
  | 'bottom-center';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  priority: ToastPriority;
  duration?: number;
  actionLabel?: string;
  onAction?: () => void;
}

interface ToastState {
  visibleToasts: Toast[];
  queuedToasts: Toast[];
  maxVisible: number;
  position: ToastPosition;
}

interface ToastActions {
  addToast: (toast: Omit<Toast, 'id' | 'priority'> & { priority?: ToastPriority }) => string;
  removeToast: (id: string) => void;
  clearAll: () => void;
  setPosition: (position: ToastPosition) => void;
}

type ToastStore = ToastState & ToastActions;

const PRIORITY_SCORE: Record<ToastPriority, number> = {
  low: 1,
  medium: 2,
  high: 3,
  critical: 4,
};

function defaultDurationMs(priority: ToastPriority) {
  switch (priority) {
    case 'low':
      return 3000;
    case 'medium':
      return 5000;
    case 'high':
      return 8000;
    case 'critical':
      return undefined;
  }
}

function sortByPriorityDescThenNewest(a: Toast, b: Toast) {
  const diff = PRIORITY_SCORE[b.priority] - PRIORITY_SCORE[a.priority];
  if (diff !== 0) return diff;
  // crypto.randomUUID() is not time sortable; keep stable insertion by doing nothing
  return 0;
}

function toastDedupKey(t: Pick<Toast, 'message' | 'type'>) {
  return `${t.type}::${t.message}`;
}

export const useToastStore = create<ToastStore>((set, get) => ({
  visibleToasts: [],
  queuedToasts: [],
  maxVisible: 3,
  position: 'bottom-right',

  addToast: (toastInput) => {
    const priority: ToastPriority = toastInput.priority ?? 'medium';
    const id = crypto.randomUUID();
    const newToast: Toast = {
      id,
      message: toastInput.message,
      type: toastInput.type,
      priority,
      duration: toastInput.duration ?? defaultDurationMs(priority),
      actionLabel: toastInput.actionLabel,
      onAction: toastInput.onAction,
    };

    const dedupKey = toastDedupKey(newToast);
    const { visibleToasts, queuedToasts, maxVisible } = get();
    const existing =
      visibleToasts.find((t) => toastDedupKey(t) === dedupKey) ??
      queuedToasts.find((t) => toastDedupKey(t) === dedupKey);
    if (existing) return existing.id;

    set((state) => {
      // If there's room, add directly to visible
      if (state.visibleToasts.length < state.maxVisible) {
        return {
          visibleToasts: [...state.visibleToasts, newToast],
        };
      }

      // If full, allow higher priority to preempt the lowest visible toast
      const lowestVisible = [...state.visibleToasts].sort((a, b) => {
        const diff = PRIORITY_SCORE[a.priority] - PRIORITY_SCORE[b.priority];
        if (diff !== 0) return diff;
        return 0;
      })[0];

      if (lowestVisible && PRIORITY_SCORE[newToast.priority] > PRIORITY_SCORE[lowestVisible.priority]) {
        const remainingVisible = state.visibleToasts.filter((t) => t.id !== lowestVisible.id);
        const newVisible = [...remainingVisible, newToast];
        const newQueue = [...state.queuedToasts, lowestVisible].sort(sortByPriorityDescThenNewest);
        return { visibleToasts: newVisible, queuedToasts: newQueue };
      }

      // Otherwise enqueue
      return {
        queuedToasts: [...state.queuedToasts, newToast].sort(sortByPriorityDescThenNewest),
      };
    });

    // Ensure we don't exceed max visible after preemption edge cases
    const after = get();
    if (after.visibleToasts.length > maxVisible) {
      set((state) => {
        const overflow = state.visibleToasts.slice(maxVisible);
        return {
          visibleToasts: state.visibleToasts.slice(0, maxVisible),
          queuedToasts: [...state.queuedToasts, ...overflow].sort(sortByPriorityDescThenNewest),
        };
      });
    }

    return id;
  },

  removeToast: (id) => {
    set((state) => {
      const nextVisible = state.visibleToasts.filter((t) => t.id !== id);
      const nextQueued = state.queuedToasts.filter((t) => t.id !== id);

      const space = state.maxVisible - nextVisible.length;
      if (space <= 0) return { visibleToasts: nextVisible, queuedToasts: nextQueued };

      const promoted = nextQueued.slice(0, space);
      const remainingQueue = nextQueued.slice(space);
      return {
        visibleToasts: [...nextVisible, ...promoted],
        queuedToasts: remainingQueue,
      };
    });
  },

  clearAll: () => {
    set({ visibleToasts: [], queuedToasts: [] });
  },

  setPosition: (position) => {
    set({ position });
  },
}));
