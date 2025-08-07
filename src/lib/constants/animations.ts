// src/lib/constants/animations.ts
import { Variants } from 'framer-motion';

// Container animations
export const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3,
    },
  },
};

// Card animations
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

// Load more button animations
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

// No results/empty state animations
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

// Header animations
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

// Empty state animations (with spring effect)
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

// Expanded content animations
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

// Heart/favorite button animations
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
