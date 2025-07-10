export const learningReasons = [
  'Career and business',
  'Lesson for kids',
  'Living abroad',
  'Exams and coursework',
  'Culture, travel or hobby',
] as const;

export type LearningReason = (typeof learningReasons)[number];
