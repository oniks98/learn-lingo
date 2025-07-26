// src/utils/pending-actions.ts
interface PendingFavoriteAction {
  type: 'favorite';
  teacherId: string;
  timestamp: number;
}

interface PendingBookingAction {
  type: 'booking';
  teacherId: string;
  timestamp: number;
}

type PendingAction = PendingFavoriteAction | PendingBookingAction;

const STORAGE_KEY = 'pendingUserAction';
const EXPIRY_TIME = 24 * 60 * 60 * 1000; // 24 часа

export const savePendingAction = (
  action: Omit<PendingAction, 'timestamp'>,
): void => {
  const pendingAction: PendingAction = {
    ...action,
    timestamp: Date.now(),
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pendingAction));
  } catch (error) {
    console.error('Failed to save pending action:', error);
  }
};

export const getPendingAction = (): PendingAction | null => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    console.warn('Invalid JSON in pending action:', error);
    removePendingAction();
    return null;
  }

  // Валидация
  if (!validatePendingAction(parsed)) {
    console.warn('Invalid pending action structure:', parsed);
    removePendingAction();
    return null;
  }

  // Проверка актуальности
  if (Date.now() - parsed.timestamp > EXPIRY_TIME) {
    console.log('Pending action expired, removing...');
    removePendingAction();
    return null;
  }

  return parsed;
};

export const removePendingAction = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};

const validatePendingAction = (data: any): data is PendingAction => {
  return (
    data &&
    typeof data === 'object' &&
    typeof data.teacherId === 'string' &&
    data.teacherId.length > 0 &&
    typeof data.timestamp === 'number' &&
    data.timestamp > 0 &&
    (data.type === 'favorite' || data.type === 'booking')
  );
};
