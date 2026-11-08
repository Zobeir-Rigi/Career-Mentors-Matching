export const Region = {
  LONDON: 'LONDON',
  WEST_MIDLANDS: 'WEST_MIDLANDS',
  SCOTLAND: 'SCOTLAND',
  NORTH_WEST: 'NORTH_WEST',
  CAPE_TOWN: 'CAPE_TOWN',
  SHEFFIELD: 'SHEFFIELD',
  OTHER: 'OTHER',
} as const;

export type Region = (typeof Region)[keyof typeof Region];

export const AvailabilityOption = {
  WEEKDAY_MORNING: 'WEEKDAY_MORNING',
  WEEKDAY_AFTERNOON: 'WEEKDAY_AFTERNOON',
  WEEKDAY_EVENING: 'WEEKDAY_EVENING',
  WEEKEND_MORNING: 'WEEKEND_MORNING',
  WEEKEND_AFTERNOON: 'WEEKEND_AFTERNOON',
  WEEKEND_EVENING: 'WEEKEND_EVENING',
} as const;

export type AvailabilityOption =
  (typeof AvailabilityOption)[keyof typeof AvailabilityOption];

export const MeetingCadence = {
  WEEKLY: 'WEEKLY',
  FORTNIGHTLY: 'FORTNIGHTLY',
  MONTHLY: 'MONTHLY',
} as const;

export type MeetingCadence =
  (typeof MeetingCadence)[keyof typeof MeetingCadence];

export const MeetingStructure = {
  OPEN: 'OPEN',
  STRUCTURED: 'STRUCTURED',
  MIX: 'MIX',
} as const;

export type MeetingStructure =
  (typeof MeetingStructure)[keyof typeof MeetingStructure];
