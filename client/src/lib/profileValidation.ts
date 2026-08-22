type UserRole = "mentor" | "mentee";

export function getFieldLabels(role: UserRole): Record<string, string> {
  return {
    currentJobTitle: "Job title",
    bio: "Bio",
    linkedinURL: "LinkedIn URL",
    scheduleURL: "Schedule URL",
    region: "Region",
    capacity: "Capacity",
    meetingCadence: "Meeting cadence",
    meetingStructure: "Preferred meeting style",
    availability: "Availability",
    disciplines:
      role === "mentor"
        ? "Disciplines you can mentor in"
        : "Disciplines you want to learn in",
    skills:
      role === "mentor" ? "Skills you can mentor" : "Skills you want to learn",
    industries:
      role === "mentor" ? "Industry domain knowledge" : "Target industries",
  };
}

export function checkEmptyFields(
  role: UserRole,
  profileData: Record<string, unknown>,
): string[] {
  const FIELD_LABELS = getFieldLabels(role);
  const OPTIONAL_FIELDS =
    role === "mentee"
      ? new Set(["currentJobTitle", "scheduleURL"])
      : new Set(["scheduleURL"]);
  return Object.entries(profileData).reduce((acc, [key, value]) => {
    if (OPTIONAL_FIELDS.has(key)) return acc;
    if (typeof value === "string") {
      if (value.trim() === "") {
        acc.push(FIELD_LABELS[key] || key);
      }
    } else if (typeof value === "number") {
      if (value <= 0) {
        acc.push(FIELD_LABELS[key] || key);
      }
    } else if (Array.isArray(value)) {
      if (value.length === 0) {
        acc.push(FIELD_LABELS[key] || key);
      }
    }
    return acc;
  }, [] as string[]);
}
