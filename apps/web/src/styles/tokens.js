// Shared design tokens and formatter utilities used across all pages.

//  Colors

export const colors = {
  border: "#e5e5e5",
  borderLight: "#eee",
  text: "#1a1a1a",
  textMuted: "#666",
  textLight: "#999",
  background: "#f7f8fa",
  surface: "#fff",
  success: "#2d7a2d",
  successBg: "#f0faf0",
  successBorder: "#b8e0b8",
  error: "#c0392b",
  errorBg: "#fff5f5",
  errorBorder: "#f3c2c2",
  warning: "#b26b00",
  info: "#1a5fbf",
  infoBg: "#f0f6ff",
  infoBorder: "#ccdeff",
  statusColors: {
    succeeded: "#2d7a2d",
    failed: "#c0392b",
    processing: "#b26b00",
    queued: "#555",
  },
};

// Spacing & Radius

export const radius = {
  sm: "8px",
  md: "10px",
  lg: "12px",
};

// Reusable Style Objects

export const card = {
  background: colors.surface,
  border: `1px solid ${colors.border}`,
  borderRadius: radius.lg,
  padding: "20px",
};

export const cardItem = {
  border: `1px solid ${colors.borderLight}`,
  borderRadius: radius.md,
  padding: "14px",
};

export const pageHeader = {
  title: {
    marginBottom: "8px",
  },
  subtitle: {
    marginTop: 0,
    color: colors.textMuted,
    marginBottom: "20px",
  },
};

export const formField = {
  label: {
    marginBottom: "6px",
    fontWeight: 600,
  },
};

export const flexColumn = {
  display: "flex",
  flexDirection: "column",
  gap: "12px",
};

// Domain Formatters
// Centralised here so pages don't each copy paste these functions.

export function formatDepartment(value) {
  const map = {
    warehouse: "Warehouse",
    mechanic: "Mechanic",
    body_shop: "Body Shop",
    painting: "Painting",
    inspection: "Inspection",
    customer_service: "Customer Service",
  };
  return map[value] ?? value ?? "—";
}

export function formatRole(role) {
  const map = { staff: "Staff", manager: "Manager", admin: "Admin" };
  return map[role] ?? role;
}

export function formatJobType(type) {
  const map = {
    ADD_COMMENT: "Add Jira comment",
    SEND_EMAIL: "Send manager email",
  };
  return map[type] ?? type;
}

export function formatJobStatus(status) {
  const map = {
    queued: "Queued",
    processing: "Processing",
    succeeded: "Succeeded",
    failed: "Failed",
  };
  return map[status] ?? status;
}

export function formatEventType(type) {
  const map = { issue_created: "Issue created" };
  return map[type] ?? type;
}

export function formatSource(source) {
  const map = { jira: "Jira", demo: "Simulation" };
  return map[source] ?? source ?? "—";
}

export function formatTrigger(trigger) {
  const map = { issue_created: "Issue created" };
  return map[trigger] ?? trigger;
}

export function statusColor(status) {
  return colors.statusColors[status] ?? colors.text;
}
