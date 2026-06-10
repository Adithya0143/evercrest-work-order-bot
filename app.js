const messagesEl = document.querySelector("#messages");
const quickRepliesEl = document.querySelector("#quickReplies");
const form = document.querySelector("#chatForm");
const input = document.querySelector("#chatInput");
const resetBtn = document.querySelector("#resetBtn");
const copySummaryBtn = document.querySelector("#copySummaryBtn");
const downloadJsonBtn = document.querySelector("#downloadJsonBtn");

const els = {
  stageBadge: document.querySelector("#stageBadge"),
  riskBadge: document.querySelector("#riskBadge"),
  tenant: document.querySelector("#summaryTenant"),
  address: document.querySelector("#summaryAddress"),
  category: document.querySelector("#summaryCategory"),
  vendor: document.querySelector("#summaryVendor"),
  appfolio: document.querySelector("#appfolioDraft"),
  team: document.querySelector("#teamDraft"),
  recommendation: document.querySelector("#recommendation"),
  checklist: document.querySelector("#checklist"),
  meter: document.querySelector("#completionMeter span")
};

const issueCategories = [
  "AC / HVAC",
  "Plumbing",
  "Electrical",
  "Appliance",
  "Roof / Exterior",
  "HOA / Landscaping",
  "Other"
];

const hvacSymptoms = [
  "No cool air",
  "AC will not turn on",
  "Water leak near unit",
  "Frozen line or coil",
  "Breaker trips",
  "Fan not spinning",
  "Weak airflow",
  "Thermostat issue"
];

const safeChecks = [
  "Thermostat checked",
  "Batteries replaced",
  "Filter checked",
  "Breaker reset once",
  "Furnace switch on",
  "Vents open",
  "None tried"
];

const vendorByCategory = {
  "AC / HVAC": "HVAC",
  Plumbing: "Plumbing",
  Electrical: "Electrical",
  Appliance: "Appliances",
  "Roof / Exterior": "Roof / Big Projects",
  "HOA / Landscaping": "Landscaping / HOA",
  Other: "Work Orders"
};

const initialState = () => ({
  step: "tenantName",
  stage: "Intake",
  tenantName: "",
  address: "",
  phone: "",
  email: "",
  category: "",
  description: "",
  startedAt: "",
  urgencyNotes: "",
  urgency: "normal",
  symptoms: [],
  checks: [],
  batteryCheck: "",
  resolved: "",
  media: "",
  contactWindow: "",
  accessNotes: "",
  conversation: []
});

let state = initialState();

const prompts = {
  tenantName: {
    text: "Hi, this is the Evercrest maintenance assistant. I can help troubleshoot and prepare a clean work order for the office.\n\nWhat is your full name?",
    replies: []
  },
  address: {
    text: "Thanks. What is the full property address for this request?",
    replies: []
  },
  contact: {
    text: "What is the best phone number and email for maintenance to contact you?",
    replies: []
  },
  category: {
    text: "What type of issue are you reporting?",
    replies: issueCategories
  },
  description: {
    text: "Please describe what is happening in your own words.",
    replies: []
  },
  startedAt: {
    text: "When did this issue start?",
    replies: ["Today", "Yesterday", "This week", "More than a week ago"]
  },
  urgency: {
    text: "Are any of these happening right now: burning smell, smoke, sparks, repeated breaker trips, active water leak, no cooling in extreme heat, or property damage?",
    replies: ["No urgent risk", "Active leak", "Burning smell / smoke", "Repeated breaker trips", "Extreme heat risk", "Property damage"]
  },
  hvacSymptoms: {
    text: "Which AC/HVAC symptom best matches the issue? You can choose more than one, then type done.",
    replies: [...hvacSymptoms, "Done"]
  },
  hvacChecks: {
    text: "Which safe checks has the tenant already tried? Choose all that apply, then type done.",
    replies: [...safeChecks, "Done"]
  },
  batteryCheck: {
    text: "Quick AC check: did you change the batteries in the thermostat or AC remote?",
    replies: ["Yes, batteries changed", "No, not yet", "Display is blank", "No remote / not sure"]
  },
  resolved: {
    text: "After those checks, is the issue resolved?",
    replies: ["Yes, resolved", "No, still needs help"]
  },
  media: {
    text: "Please note any photos or videos available. Example: thermostat photo, filter photo, outdoor unit video, water leak photo.",
    replies: ["Photos available", "Video available", "No media yet"]
  },
  contactWindow: {
    text: "What appointment windows work best for the tenant?",
    replies: ["Morning", "Afternoon", "Evening", "Anytime"]
  },
  accessNotes: {
    text: "Any access notes, gate code, pets, or permission-to-enter details?",
    replies: ["No special notes", "Pets at property", "Gate code needed", "Permission to enter"]
  },
  complete: {
    text: "The work order draft is ready for staff review. The office can create the Appfolio ticket, update the work_order-new report, and notify maintenance.",
    replies: ["Start another request"]
  }
};

function addMessage(role, text) {
  state.conversation.push({ role, text, at: new Date().toISOString() });
  const item = document.createElement("div");
  item.className = `message ${role}`;
  const avatar = document.createElement("div");
  avatar.className = "avatar";
  avatar.textContent = role === "tenant" ? "T" : "EC";
  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.textContent = text;
  if (role === "tenant") {
    item.append(bubble, avatar);
  } else {
    item.append(avatar, bubble);
  }
  messagesEl.appendChild(item);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function showPrompt(step) {
  state.step = step;
  const prompt = prompts[step];
  addMessage("bot", prompt.text);
  renderQuickReplies(prompt.replies);
  renderSummary();
}

function renderQuickReplies(replies) {
  quickRepliesEl.innerHTML = "";
  replies.forEach((reply) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "chip";
    button.textContent = reply;
    if (isSelectedReply(reply)) {
      button.classList.add("selected");
      button.disabled = true;
    }
    button.addEventListener("click", () => handleTenantInput(reply));
    quickRepliesEl.appendChild(button);
  });
}

function handleTenantInput(rawText) {
  const text = rawText.trim();
  if (!text) return;
  const currentStep = state.step;
  addMessage("tenant", text);
  input.value = "";

  if (state.step === "complete" && text === "Start another request") {
    resetConversation();
    return;
  }

  const next = processStep(state.step, text);
  renderSummary();
  if (next === currentStep && isMultiSelectStep(currentStep)) {
    addMessage("bot", `${formatSelectionLabel(currentStep)} recorded: ${formatSelections(currentStep)}.\nChoose another option or click Done.`);
    renderQuickReplies(prompts[currentStep].replies);
    return;
  }
  window.setTimeout(() => showPrompt(next), 240);
}

function processStep(step, text) {
  switch (step) {
    case "tenantName":
      state.tenantName = text;
      return "address";
    case "address":
      state.address = text;
      return "contact";
    case "contact":
      splitContact(text);
      return "category";
    case "category":
      state.category = normalizeChoice(text, issueCategories) || "Other";
      state.stage = state.category === "AC / HVAC" ? "HVAC Intake" : "General Intake";
      return "description";
    case "description":
      state.description = text;
      applyUrgencyFromText(text);
      return "startedAt";
    case "startedAt":
      state.startedAt = text;
      return "urgency";
    case "urgency":
      state.urgencyNotes = text;
      applyUrgencyFromText(text);
      if (state.category === "AC / HVAC" && state.urgency !== "high") return "hvacSymptoms";
      return "media";
    case "hvacSymptoms":
      if (isDone(text)) return "batteryCheck";
      addUnique(state.symptoms, text);
      return "hvacSymptoms";
    case "batteryCheck":
      state.batteryCheck = text;
      addUnique(state.checks, `Battery check: ${text}`);
      if (/no, not yet|blank|not sure/i.test(text)) {
        state.stage = "Tenant Check";
      }
      return "hvacChecks";
    case "hvacChecks":
      if (isDone(text)) return "resolved";
      addUnique(state.checks, text);
      return "hvacChecks";
    case "resolved":
      state.resolved = text;
      if (/yes/i.test(text)) {
        state.stage = "Resolved";
        return "complete";
      }
      state.stage = "Work Order Draft";
      return "media";
    case "media":
      state.media = text;
      return "contactWindow";
    case "contactWindow":
      state.contactWindow = text;
      return "accessNotes";
    case "accessNotes":
      state.accessNotes = text;
      state.stage = "Ready for Review";
      return "complete";
    default:
      return "tenantName";
  }
}

function splitContact(text) {
  const email = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  const phone = text.match(/(\+?\d[\d\s().-]{7,}\d)/);
  state.email = email ? email[0] : text;
  state.phone = phone ? phone[0] : text;
}

function normalizeChoice(text, choices) {
  return choices.find((choice) => choice.toLowerCase() === text.toLowerCase());
}

function isDone(text) {
  return /^done$/i.test(text);
}

function addUnique(list, value) {
  const normalized = value.trim();
  if (!list.some((item) => item.toLowerCase() === normalized.toLowerCase())) {
    list.push(normalized);
  }
}

function isMultiSelectStep(step) {
  return step === "hvacSymptoms" || step === "hvacChecks";
}

function isSelectedReply(reply) {
  if (/^done$/i.test(reply)) return false;
  const source = state.step === "hvacSymptoms" ? state.symptoms : state.step === "hvacChecks" ? state.checks : [];
  return source.some((item) => item.toLowerCase() === reply.toLowerCase());
}

function formatSelectionLabel(step) {
  return step === "hvacSymptoms" ? "Symptom" : "Safe check";
}

function formatSelections(step) {
  const source = step === "hvacSymptoms" ? state.symptoms : state.checks;
  return source.length ? source.join(", ") : "none yet";
}

function applyUrgencyFromText(text) {
  const highRisk = /(burn|smoke|spark|repeated breaker|breaker trips|active leak|flood|property damage|extreme heat|electrical smell)/i;
  const mediumRisk = /(leak|water|no cool|not cooling|frozen|breaker|trip)/i;
  if (highRisk.test(text)) {
    state.urgency = "high";
  } else if (state.urgency !== "high" && mediumRisk.test(text)) {
    state.urgency = "medium";
  }
}

function likelyCause() {
  const text = `${state.description} ${state.symptoms.join(" ")} ${state.batteryCheck}`.toLowerCase();
  if (/(display is blank|batteries|remote|thermostat)/.test(text) && /(not yet|blank|not sure|battery)/.test(text)) return "Possible thermostat or AC remote battery issue";
  if (/(water|drain|pan|leak near unit|condensate)/.test(text)) return "Possible clogged condensate drain or drain pan issue";
  if (/(frozen|ice|no cool|not cooling|low freon|refrigerant)/.test(text)) return "Possible refrigerant leak or low freon";
  if (/(hums|fan not spinning|outside fan|capacitor)/.test(text)) return "Possible bad capacitor or condenser fan motor";
  if (/(thermostat|blank|battery|display)/.test(text)) return "Possible thermostat or thermostat battery issue";
  if (/(weak airflow|filter|vent|return)/.test(text)) return "Possible dirty filter or restricted airflow";
  if (/(breaker|trip|short)/.test(text)) return "Possible electrical short, breaker, wiring, or compressor issue";
  return state.category === "AC / HVAC" ? "HVAC diagnosis needed by technician" : "Diagnosis needed by assigned vendor";
}

function recommendationText() {
  if (state.stage === "Resolved") return "No dispatch needed. Log as tenant self-help resolution and send confirmation.";
  if (state.urgency === "high") return "Urgent work order recommended. Stop tenant troubleshooting and dispatch maintenance.";
  if (state.stage === "Ready for Review") return "Ready for staff review. Create Appfolio work order and notify maintenance team.";
  if (state.category === "AC / HVAC" && state.symptoms.length) return `${likelyCause()}. Continue collecting media and scheduling details.`;
  return "Continue intake before creating a work order.";
}

function completionScore() {
  const checks = [
    state.tenantName,
    state.address,
    state.phone || state.email,
    state.category,
    state.description,
    state.startedAt,
    state.urgencyNotes,
    state.category !== "AC / HVAC" || state.symptoms.length || state.urgency === "high",
    state.category !== "AC / HVAC" || state.batteryCheck || state.urgency === "high",
    state.media,
    state.contactWindow,
    state.accessNotes
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

function renderSummary() {
  els.stageBadge.textContent = state.stage;
  els.riskBadge.className = `risk-badge ${state.urgency === "high" ? "high" : state.urgency === "medium" ? "medium" : "neutral"}`;
  els.riskBadge.textContent = state.urgency === "high" ? "Urgent" : state.urgency === "medium" ? "Watch" : "Normal";
  els.tenant.textContent = state.tenantName || "Not captured";
  els.address.textContent = state.address || "Not captured";
  els.category.textContent = state.category || "Not selected";
  els.vendor.textContent = state.category ? vendorByCategory[state.category] : "Pending";
  els.appfolio.value = buildAppfolioDraft();
  els.team.value = buildTeamDraft();
  els.recommendation.textContent = recommendationText();
  els.recommendation.className = `recommendation ${state.urgency === "high" ? "high" : state.stage === "Ready for Review" || state.stage === "Resolved" ? "ready" : ""}`;
  els.meter.style.width = `${completionScore()}%`;
  renderChecklist();
}

function buildAppfolioDraft() {
  const lines = [
    `Property: ${state.address || "[address pending]"}`,
    `Tenant: ${state.tenantName || "[tenant pending]"}`,
    `Contact: ${state.phone || "[phone pending]"} / ${state.email || "[email pending]"}`,
    `Category: ${state.category || "[category pending]"}`,
    `Urgency: ${state.urgency.toUpperCase()}${state.urgencyNotes ? ` - ${state.urgencyNotes}` : ""}`,
    `Issue: ${state.description || "[description pending]"}`,
    `Started: ${state.startedAt || "[start date pending]"}`
  ];
  if (state.category === "AC / HVAC") {
    lines.push(`Symptoms: ${state.symptoms.length ? state.symptoms.join(", ") : "[symptoms pending]"}`);
    lines.push(`Thermostat / remote batteries: ${state.batteryCheck || "[battery check pending]"}`);
    lines.push(`Safe checks tried: ${state.checks.length ? state.checks.join(", ") : "[checks pending]"}`);
    lines.push(`Likely cause: ${likelyCause()}`);
  }
  lines.push(`Media: ${state.media || "[media pending]"}`);
  lines.push(`Access / pets: ${state.accessNotes || "[access notes pending]"}`);
  return lines.join("\n");
}

function buildTeamDraft() {
  return [
    `New ${state.category || "maintenance"} request`,
    `Address: ${state.address || "[address pending]"}`,
    `Tenant: ${state.tenantName || "[tenant pending]"}`,
    `Phone / email: ${state.phone || "[phone pending]"} / ${state.email || "[email pending]"}`,
    `Job description: ${state.description || "[description pending]"}`,
    `Urgency: ${state.urgency.toUpperCase()}`,
    state.category === "AC / HVAC" ? `HVAC notes: ${likelyCause()}. Battery check: ${state.batteryCheck || "[pending]"}` : `Vendor section: ${state.category ? vendorByCategory[state.category] : "[pending]"}`,
    `Media: ${state.media || "[pending]"}`,
    `Preferred time: ${state.contactWindow || "[pending]"}`,
    `Notes: ${state.accessNotes || "None captured"}`
  ].join("\n");
}

function renderChecklist() {
  const items = [
    ["Tenant name", state.tenantName],
    ["Property address", state.address],
    ["Phone or email", state.phone || state.email],
    ["Issue category", state.category],
    ["Issue description", state.description],
    ["Urgency screen", state.urgencyNotes],
    ["AC symptom/check notes", state.category !== "AC / HVAC" || state.symptoms.length || state.urgency === "high"],
    ["Thermostat or remote battery check", state.category !== "AC / HVAC" || state.batteryCheck || state.urgency === "high"],
    ["Media note", state.media],
    ["Schedule/access notes", state.contactWindow && state.accessNotes]
  ];
  els.checklist.innerHTML = "";
  items.forEach(([label, done]) => {
    const li = document.createElement("li");
    li.className = done ? "complete" : "";
    const dot = document.createElement("span");
    dot.className = "check-dot";
    dot.textContent = done ? "OK" : "";
    li.append(dot, document.createTextNode(label));
    els.checklist.appendChild(li);
  });
}

function copySummary() {
  const summary = [
    "EVERCREST WORK ORDER SUMMARY",
    buildAppfolioDraft(),
    "",
    "MAINTENANCE MESSAGE",
    buildTeamDraft(),
    "",
    `BOT RECOMMENDATION: ${recommendationText()}`
  ].join("\n");
  navigator.clipboard.writeText(summary).then(() => {
    copySummaryBtn.textContent = "Copied";
    window.setTimeout(() => {
      copySummaryBtn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2" /><rect x="2" y="2" width="13" height="13" rx="2" /></svg>Copy Summary';
    }, 1200);
  });
}

function exportJson() {
  const payload = {
    tenant: {
      name: state.tenantName,
      address: state.address,
      phone: state.phone,
      email: state.email
    },
    workOrder: {
      category: state.category,
      vendorType: state.category ? vendorByCategory[state.category] : "",
      urgency: state.urgency,
      description: state.description,
      startedAt: state.startedAt,
      symptoms: state.symptoms,
      safeChecks: state.checks,
      likelyCause: likelyCause(),
      media: state.media,
      contactWindow: state.contactWindow,
      accessNotes: state.accessNotes,
      recommendation: recommendationText()
    },
    drafts: {
      appfolio: buildAppfolioDraft(),
      maintenanceTeam: buildTeamDraft()
    },
    conversation: state.conversation
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `evercrest-work-order-${Date.now()}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

function resetConversation() {
  state = initialState();
  messagesEl.innerHTML = "";
  quickRepliesEl.innerHTML = "";
  renderSummary();
  showPrompt("tenantName");
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  handleTenantInput(input.value);
});

resetBtn.addEventListener("click", resetConversation);
copySummaryBtn.addEventListener("click", copySummary);
downloadJsonBtn.addEventListener("click", exportJson);

resetConversation();
