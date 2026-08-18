export const DISCIPLINE_OPTIONS = [
  'Software Engineering',
  'Data & Analytics',
  'Data Engineering',
  'DevOps, Cloud & Platform',
  'Cybersecurity',
  'QA & Testing',
  'Product & Project Management',
  'Business Analysis',
  'UX & Design',
  'Career Development & Interview Prep',
  'Leadership & Management',
  'AI & Machine Learning',
] as const;

export // The frontend currently sends mentorshipOptions through `wantedSkills`.
const SKILL_OPTIONS = [
  'Career advice',
  'Interview prep',
  'Technical growth',
  'Confidence',
  'LinkedIn Optimisation',
  'CV',
  'Career transition',
  'Soft skills',
  'Networking',
  'Job search',
] as const;

export const INDUSTRY_OPTIONS = [
  'Agriculture & Natural Resources',
  'Construction & Real Estate',
  'Manufacturing & Industrial',
  'Technology & Telecoms',
  'Finance & Insurance',
  'Healthcare & Life Sciences',
  'Retail & Consumer Goods',
  'Hospitality & Leisure',
  'Transportation & Logistics',
  'Professional & Business Services',
  'Education & Training',
  'Public Sector & Non-Profit',
] as const;

export type DisciplineOption = (typeof DISCIPLINE_OPTIONS)[number];
export type SkillOption = (typeof SKILL_OPTIONS)[number];
export type IndustryOption = (typeof INDUSTRY_OPTIONS)[number];
