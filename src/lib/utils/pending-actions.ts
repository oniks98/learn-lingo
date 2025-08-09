// Типи відкладених дій
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

// Константи
const STORAGE_KEY = 'pendingUserAction';
const EXPIRY_TIME = 24 * 60 * 60 * 1000; // 24 години

/**
 * Зберігає відкладену дію користувача у localStorage
 * @param action - дія без timestamp
 */
export const savePendingAction = (
  action: Omit<PendingAction, 'timestamp'>,
): void => {
  const pendingAction: PendingAction = {
    ...action,
    timestamp: Date.now(),
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pendingAction));
  } catch {
    // Мовчки обробляємо помилку - localStorage може бути недоступний
  }
};

/**
 * Отримує відкладену дію з localStorage з валідацією та перевіркою терміну дії
 * @returns відкладена дія або null
 */
export const getPendingAction = (): PendingAction | null => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    removePendingAction();
    return null;
  }

  // Валідація структури даних
  if (!validatePendingAction(parsed)) {
    removePendingAction();
    return null;
  }

  // Перевірка актуальності (термін дії)
  if (Date.now() - parsed.timestamp > EXPIRY_TIME) {
    removePendingAction();
    return null;
  }

  return parsed;
};

/**
 * Видаляє відкладену дію з localStorage
 */
export const removePendingAction = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};

/**
 * Валідує структуру даних відкладеної дії
 * @param data - дані для валідації
 * @returns true, якщо дані валідні
 */
const validatePendingAction = (data: unknown): data is PendingAction => {
  if (!data || typeof data !== 'object') {
    return false;
  }

  const obj = data as Record<string, unknown>;

  return (
    typeof obj.teacherId === 'string' &&
    obj.teacherId.length > 0 &&
    typeof obj.timestamp === 'number' &&
    obj.timestamp > 0 &&
    (obj.type === 'favorite' || obj.type === 'booking')
  );
};
