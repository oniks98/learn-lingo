// src/lib/constants/reasons.ts

export const learningReasons = [
  'careerAndBusiness',
  'lessonForKids',
  'livingAbroad',
  'examsAndCoursework',
  'cultureTravel',
] as const;

export type LearningReason = (typeof learningReasons)[number];
