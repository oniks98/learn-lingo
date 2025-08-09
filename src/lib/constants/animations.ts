import { Variants } from 'framer-motion';

// Анімації контейнера
export const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3,
    },
  },
};

// Анімації карток
export const cardVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.3,
    y: 50,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      duration: 1.2,
      bounce: 0.3,
    },
  },
};

// Анімації кнопки "Завантажити більше"
export const loadMoreVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
    },
  },
};

// Анімації відсутності результатів/порожнього стану
export const noResultsVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
    },
  },
};

// Анімації заголовка
export const headerVariants: Variants = {
  hidden: {
    opacity: 0,
    y: -20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

// Анімації порожнього стану (з ефектом пружини)
export const emptyStateVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.6,
      type: 'spring' as const,
    },
  },
};

// Анімації розгорнутого контенту
export const expandedContentVariants: Variants = {
  hidden: {
    opacity: 0,
    height: 0,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    height: 'auto',
    scale: 1,
    transition: {
      duration: 0.4,
      height: { duration: 0.3 },
      opacity: { delay: 0.1, duration: 0.3 },
    },
  },
};

// Анімації кнопки серця/вподобання
export const heartVariants: Variants = {
  idle: { scale: 1 },
  hover: {
    scale: 1.1,
    transition: { duration: 0.2 },
  },
  tap: {
    scale: 0.9,
    transition: { duration: 0.1 },
  },
};
