const messagesEl = document.querySelector("#messages");
const quickRepliesEl = document.querySelector("#quickReplies");
const mediaUploadBox = document.querySelector("#mediaUploadBox");
const mediaUpload = document.querySelector("#mediaUpload");
const mediaFileList = document.querySelector("#mediaFileList");
const adminEmailForm = document.querySelector("#adminEmailForm");
const form = document.querySelector("#chatForm");
const input = document.querySelector("#chatInput");
const resetBtn = document.querySelector("#resetBtn");
const emailAdminBtn = document.querySelector("#emailAdminBtn");
const copySummaryBtn = document.querySelector("#copySummaryBtn");
const downloadJsonBtn = document.querySelector("#downloadJsonBtn");

const APP_VERSION = "v1.0 native media submit";
const ADMIN_EMAIL = "info@evercresthomes.com";

const els = {
  stageBadge: document.querySelector("#stageBadge"),
  riskBadge: document.querySelector("#riskBadge"),
  tenant: document.querySelector("#summaryTenant"),
  address: document.querySelector("#summaryAddress"),
  category: document.querySelector("#summaryCategory"),
  vendor: document.querySelector("#summaryVendor"),
  priority: document.querySelector("#summaryPriority"),
  adminEmail: document.querySelector("#summaryAdminEmail"),
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

const issueDetailsByCategory = {
  Plumbing: [
    "Active leak or flooding",
    "Clogged toilet or drain",
    "No hot water",
    "Low water pressure",
    "Sewer smell",
    "Garbage disposal / sink issue",
    "Other plumbing issue"
  ],
  Electrical: [
    "Power out in part of home",
    "Outlet or switch not working",
    "Breaker keeps tripping",
    "Lights flickering",
    "Exposed wire / sparks",
    "Burning smell",
    "Other electrical issue"
  ],
  Appliance: [
    "Refrigerator",
    "Oven / stove",
    "Dishwasher",
    "Washer / dryer",
    "Microwave",
    "Garbage disposal",
    "Other appliance"
  ],
  "Roof / Exterior": [
    "Roof leak",
    "Gutter issue",
    "Fence or gate",
    "Door or window",
    "Exterior damage",
    "Pest entry point",
    "Other exterior issue"
  ],
  "HOA / Landscaping": [
    "Lawn service",
    "Tree or branch",
    "Irrigation / sprinkler",
    "HOA notice",
    "Trash or debris",
    "Other landscaping issue"
  ],
  Other: [
    "Lock or key",
    "Pest issue",
    "Door or window",
    "Noise / security concern",
    "General repair",
    "Other"
  ]
};

const followUpByCategory = {
  Plumbing: "Where is the plumbing issue located, and is water actively leaking now?",
  Electrical: "Which room or device is affected, and has the breaker tripped more than once?",
  Appliance: "What appliance is affected? Please include brand/model if visible and what it is doing.",
  "Roof / Exterior": "Where is the exterior issue located? Please describe whether water or security is affected.",
  "HOA / Landscaping": "Is this related to a notice, regular service, safety hazard, or property appearance?",
  Other: "Please add any extra details that would help the office route this request correctly."
};

const urgencyByCategory = {
  "AC / HVAC": {
    text: "AC safety check: is there a burning smell, repeated breaker trip, active water leak, electrical damage, or unsafe indoor heat?",
    replies: ["No urgent AC risk", "Burning smell", "Repeated breaker trips", "Active water leak", "Unsafe indoor heat", "Electrical damage"]
  },
  Plumbing: {
    text: "Plumbing safety check: is water actively leaking, flooding, backing up, or causing property damage?",
    replies: ["No active leak", "Active leak", "Flooding", "Sewage backup", "No working toilet", "Property damage"]
  },
  Electrical: {
    text: "Electrical safety check: are there sparks, burning smell, exposed wires, repeated breaker trips, or power loss?",
    replies: ["No electrical safety risk", "Sparks", "Burning smell", "Exposed wire", "Repeated breaker trips", "Power out"]
  },
  Appliance: {
    text: "Appliance safety check: is there leaking water, gas smell, burning smell, food spoilage risk, or a completely unusable appliance?",
    replies: ["No urgent appliance risk", "Leaking water", "Gas smell", "Burning smell", "Food spoilage risk", "Appliance unusable"]
  },
  "Roof / Exterior": {
    text: "Roof or exterior safety check: is there active water intrusion, storm damage, a security issue, or blocked access?",
    replies: ["No urgent exterior risk", "Active roof leak", "Storm damage", "Door/window security issue", "Blocked access", "Property damage"]
  },
  "HOA / Landscaping": {
    text: "HOA or landscaping priority check: is there a safety hazard, fallen branch/tree, blocked access, or HOA deadline?",
    replies: ["No urgent landscaping risk", "Safety hazard", "Fallen branch/tree", "Blocked access", "HOA deadline", "Trash/debris issue"]
  },
  Other: {
    text: "Priority check: is this creating a safety risk, access issue, active damage, or urgent tenant hardship?",
    replies: ["No urgent risk", "Safety risk", "Access issue", "Active damage", "Security concern", "Urgent tenant hardship"]
  }
};

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
  issueDetail: "",
  followUpDetail: "",
  checks: [],
  batteryCheck: "",
  resolved: "",
  media: "",
  mediaFiles: [],
  contactWindow: "",
  contactTimeSlot: "",
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
    text: "Is there any urgent risk or active property damage?",
    replies: ["No urgent risk", "Active damage", "Safety risk", "Access issue", "Property damage"]
  },
  hvacSymptoms: {
    text: "Which AC/HVAC symptom best matches the issue? You can choose more than one, then type done.",
    replies: [...hvacSymptoms, "Done"]
  },
  hvacChecks: {
    text: "Which safe checks has the tenant already tried? Choose all that apply, then type done.",
    replies: [...safeChecks, "Done"]
  },
  categoryDetail: {
    text: "Which specific issue best matches this request?",
    replies: []
  },
  categoryFollowUp: {
    text: "",
    replies: []
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
    text: "Please attach one photo or video if available. You can also choose No media yet.",
    replies: ["No media yet"]
  },
  contactWindow: {
    text: "What appointment windows work best for the tenant?",
    replies: ["Morning", "Afternoon", "Evening", "Anytime"]
  },
  contactTimeSlot: {
    text: "",
    replies: []
  },
  accessNotes: {
    text: "Any access notes, gate code, pets, or permission-to-enter details?",
    replies: ["No special notes", "Pets at property", "Gate code needed", "Permission to enter"]
  },
  complete: {
    text: "Thank you for contacting us. Our team will get in touch with you soon.",
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
  const prompt = getPrompt(step);
  addMessage("bot", prompt.text);
  renderQuickReplies(prompt.replies);
  renderMediaUpload();
  renderSummary();
}

function getPrompt(step) {
  if (step === "categoryDetail") {
    return {
      text: `For ${state.category}, which specific issue best matches the request?`,
      replies: issueDetailsByCategory[state.category] || issueDetailsByCategory.Other
    };
  }
  if (step === "categoryFollowUp") {
    return {
      text: followUpByCategory[state.category] || followUpByCategory.Other,
      replies: []
    };
  }
  if (step === "urgency") {
    return urgencyByCategory[state.category] || urgencyByCategory.Other;
  }
  if (step === "contactTimeSlot") {
    return getTimeSlotPrompt();
  }
  return prompts[step];
}

function getTimeSlotPrompt() {
  const slotsByWindow = {
    Morning: ["9 AM to 11 AM", "11 AM to 1 PM"],
    Afternoon: ["1 PM to 3 PM", "3 PM to 5 PM"],
    Evening: ["5 PM to 7 PM"],
    Anytime: ["Anytime"]
  };
  return {
    text: `Please choose a specific time slot for ${state.contactWindow || "the appointment"}.`,
    replies: slotsByWindow[state.contactWindow] || ["Anytime"]
  };
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
    renderQuickReplies(getPrompt(currentStep).replies);
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
      return state.category === "AC / HVAC" ? "hvacSymptoms" : "categoryDetail";
    case "categoryDetail":
      state.issueDetail = text;
      applyUrgencyFromText(text);
      return "categoryFollowUp";
    case "categoryFollowUp":
      state.followUpDetail = text;
      applyUrgencyFromText(text);
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
      return state.category === "AC / HVAC" ? "resolved" : "media";
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
      if (isDone(text)) return "description";
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
      return "contactTimeSlot";
    case "contactTimeSlot":
      state.contactTimeSlot = text;
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
  const clean = text.toLowerCase();
  if (/^no |no urgent|no active|no electrical|no urgent ac|no urgent appliance|no urgent exterior|no urgent landscaping/.test(clean)) {
    return;
  }
  const highRisk = /(burn|smoke|spark|exposed wire|repeated breaker|breaker trips|active leak|flood|flooding|sewage backup|gas smell|safety hazard|blocked access|security issue|property damage|roof leak|no heat|extreme heat|unsafe indoor heat|electrical smell)/i;
  const mediumRisk = /(leak|water|no cool|not cooling|frozen|breaker|trip|food spoilage|hoa deadline|fallen branch|fallen tree)/i;
  if (highRisk.test(clean)) {
    state.urgency = "high";
  } else if (state.urgency !== "high" && mediumRisk.test(clean)) {
    state.urgency = "medium";
  }
}

function priorityFlag() {
  const rawText = `${state.category} ${state.description} ${state.issueDetail} ${state.followUpDetail} ${state.urgencyNotes} ${state.symptoms.join(" ")} ${state.batteryCheck}`.toLowerCase();
  const text = rawText
    .replace(/no active leak/g, "")
    .replace(/no urgent ac risk/g, "")
    .replace(/no electrical safety risk/g, "")
    .replace(/no urgent appliance risk/g, "")
    .replace(/no urgent exterior risk/g, "")
    .replace(/no urgent landscaping risk/g, "")
    .replace(/no urgent risk/g, "")
    .replace(/no safety risk/g, "");

  const category = state.category || "Other";
  const critical = {
    "AC / HVAC": /(burn|smoke|electrical damage|repeated breaker|unsafe indoor heat|extreme heat)/,
    Plumbing: /(flood|flooding|active leak|burst|sewage backup|property damage|no working toilet)/,
    Electrical: /(spark|burn|smoke|exposed wire|electrical smell|repeated breaker|power out)/,
    Appliance: /(gas smell|burning smell|leaking water|food spoilage|refrigerator.*not|fridge.*not)/,
    "Roof / Exterior": /(active roof leak|roof leak|storm damage|security issue|door\/window security|property damage|blocked access)/,
    "HOA / Landscaping": /(safety hazard|fallen branch|fallen tree|blocked access|hoa deadline)/,
    Other: /(safety risk|security concern|active damage|access issue|urgent tenant hardship)/
  };

  const urgent = {
    "AC / HVAC": /(no cool|not cooling|frozen|fan not spinning|water leak|thermostat blank|display is blank)/,
    Plumbing: /(clog|toilet|drain|backup|no hot water|water heater|low water pressure|sewer smell)/,
    Electrical: /(outlet|switch|lights flicker|flickering|breaker|partial power)/,
    Appliance: /(refrigerator|freezer|dishwasher|washer|dryer|oven|stove|appliance unusable)/,
    "Roof / Exterior": /(gutter|fence|gate|door|window|pest entry|exterior damage)/,
    "HOA / Landscaping": /(hoa notice|violation|sprinkler|irrigation|tree|trash|debris)/,
    Other: /(lock|key|pest|door|window|general repair)/
  };

  if (state.urgency === "high" || critical[category].test(text)) {
    return {
      level: "Emergency",
      label: "Emergency",
      reason: priorityReason(category, "Emergency")
    };
  }

  if (state.urgency === "medium" || urgent[category].test(text)) {
    return {
      level: "Priority",
      label: "Priority",
      reason: priorityReason(category, "Priority")
    };
  }

  return {
    level: "Routine",
    label: "Routine",
    reason: priorityReason(category, "Routine")
  };
}

function priorityReason(category, level) {
  const reasons = {
    "AC / HVAC": {
      Emergency: "HVAC safety or habitability risk. Dispatch quickly.",
      Priority: "HVAC comfort or equipment issue. Schedule technician.",
      Routine: "HVAC request appears non-emergency. Review and schedule."
    },
    Plumbing: {
      Emergency: "Active water, sewage, or property damage risk. Dispatch plumber urgently.",
      Priority: "Plumbing function issue. Schedule plumber.",
      Routine: "Plumbing request appears non-emergency. Review and schedule."
    },
    Electrical: {
      Emergency: "Electrical safety risk. Stop tenant troubleshooting and dispatch electrician.",
      Priority: "Electrical function issue. Schedule electrician.",
      Routine: "Electrical request appears non-emergency. Review and schedule."
    },
    Appliance: {
      Emergency: "Appliance safety, leak, or food-spoilage risk. Prioritize service.",
      Priority: "Appliance is not working properly. Schedule appliance vendor.",
      Routine: "Appliance request appears non-emergency. Review and schedule."
    },
    "Roof / Exterior": {
      Emergency: "Water intrusion, security, access, or storm damage risk. Prioritize repair.",
      Priority: "Exterior repair needed. Route to the correct vendor.",
      Routine: "Exterior request appears non-emergency. Review and schedule."
    },
    "HOA / Landscaping": {
      Emergency: "Safety, blocked access, or HOA deadline risk. Prioritize review.",
      Priority: "HOA or landscaping issue needs timely follow-up.",
      Routine: "HOA or landscaping request appears non-emergency. Review and schedule."
    },
    Other: {
      Emergency: "Safety, access, damage, or security concern. Prioritize review.",
      Priority: "General maintenance issue needs timely follow-up.",
      Routine: "General maintenance request appears non-emergency. Review and schedule."
    }
  };
  return (reasons[category] || reasons.Other)[level];
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

function categoryAssessment() {
  const text = `${state.category} ${state.description} ${state.issueDetail} ${state.followUpDetail} ${state.urgencyNotes}`.toLowerCase();
  if (state.category === "AC / HVAC") return likelyCause();
  if (state.category === "Plumbing") {
    if (/(active leak|flood|water actively|burst|property damage)/.test(text)) return "Urgent plumbing leak. Dispatch plumber and ask tenant to protect area if safe.";
    if (/(clog|toilet|drain|backup|sewer)/.test(text)) return "Drain or sewer blockage. Route to plumbing and ask for location/photo.";
    if (/(hot water|water heater)/.test(text)) return "Water heater issue. Route to plumbing with appliance age/model if available.";
    if (/(pressure|low water)/.test(text)) return "Water pressure issue. Route to plumbing for diagnosis.";
    return "Plumbing diagnosis needed.";
  }
  if (state.category === "Electrical") {
    if (/(spark|burn|smoke|exposed wire|electrical smell|breaker keeps|repeated breaker)/.test(text)) return "Electrical safety risk. Stop tenant troubleshooting and dispatch electrician.";
    if (/(power out|outlet|switch|lights flicker|flickering)/.test(text)) return "Electrical circuit or fixture issue. Route to electrician with affected room/device.";
    return "Electrical diagnosis needed.";
  }
  if (state.category === "Appliance") {
    if (/(refrigerator|fridge|freezer)/.test(text)) return "Refrigerator issue. Prioritize if food spoilage risk; collect model/photo.";
    if (/(oven|stove|range|gas)/.test(text)) return "Cooking appliance issue. Route to appliance vendor; check for gas/safety concern.";
    if (/(dishwasher|washer|dryer|leak)/.test(text)) return "Appliance service needed. Ask for model, error code, leak/photo if present.";
    return "Appliance diagnosis needed. Route to appliance vendor.";
  }
  if (state.category === "Roof / Exterior") {
    if (/(roof leak|water|storm|ceiling|property damage)/.test(text)) return "Roof or exterior water intrusion. Prioritize to prevent property damage.";
    if (/(gate|fence|door|window|lock|security)/.test(text)) return "Exterior access/security issue. Route to appropriate vendor.";
    if (/(pest|entry)/.test(text)) return "Exterior opening may be allowing pests. Route for inspection/repair.";
    return "Exterior repair diagnosis needed.";
  }
  if (state.category === "HOA / Landscaping") {
    if (/(hoa notice|violation|fine)/.test(text)) return "HOA notice or violation. Route to HOA/deed violation workflow with deadline.";
    if (/(tree|branch|hazard|fallen)/.test(text)) return "Landscaping safety issue. Route to landscaping/tree vendor.";
    if (/(lawn|sprinkler|irrigation|trash|debris)/.test(text)) return "Landscaping or exterior cleanup request. Route to landscaping.";
    return "HOA or landscaping review needed.";
  }
  if (/(lock|security|pest|door|window)/.test(text)) return "General repair request with possible access/security concern. Route for staff review.";
  return "General maintenance diagnosis needed.";
}

function recommendationText() {
  const priority = priorityFlag();
  if (state.stage === "Resolved") return "No dispatch needed. Log as tenant self-help resolution and send confirmation.";
  if (priority.level === "Emergency") return `${priority.label}: ${priority.reason}`;
  if (state.stage === "Ready for Review") return "Ready for staff review. Create Appfolio work order and notify maintenance team.";
  if (state.category === "AC / HVAC" && state.symptoms.length) return `${likelyCause()}. Continue collecting media and scheduling details.`;
  if (state.category && state.category !== "AC / HVAC" && state.issueDetail) return `${categoryAssessment()} Continue collecting media and scheduling details.`;
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
    state.category === "AC / HVAC" || state.issueDetail,
    state.category === "AC / HVAC" || state.followUpDetail,
    state.media,
    state.contactWindow,
    state.contactTimeSlot,
    state.accessNotes
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

function renderSummary() {
  const priority = priorityFlag();
  els.stageBadge.textContent = state.stage;
  els.riskBadge.className = `risk-badge ${priority.level === "Emergency" ? "high" : priority.level === "Priority" ? "medium" : "neutral"}`;
  els.riskBadge.textContent = priority.label;
  els.tenant.textContent = state.tenantName || "Not captured";
  els.address.textContent = state.address || "Not captured";
  els.category.textContent = state.category || "Not selected";
  els.vendor.textContent = state.category ? vendorByCategory[state.category] : "Pending";
  els.priority.textContent = `${priority.label} - ${priority.reason}`;
  els.adminEmail.textContent = ADMIN_EMAIL;
  els.appfolio.value = buildAppfolioDraft();
  els.team.value = buildTeamDraft();
  els.recommendation.textContent = recommendationText();
  els.recommendation.className = `recommendation ${state.urgency === "high" ? "high" : state.stage === "Ready for Review" || state.stage === "Resolved" ? "ready" : ""}`;
  els.meter.style.width = `${completionScore()}%`;
  renderChecklist();
}

function renderMediaUpload() {
  const visible = state.step === "media";
  mediaUploadBox.hidden = !visible;
  if (visible) {
    renderMediaFileList();
  }
}

function renderMediaFileList() {
  mediaFileList.textContent = state.mediaFiles.length
    ? `Attached: ${state.mediaFiles.join(", ")}`
    : "No files attached yet.";
}

function buildAppfolioDraft() {
  const priority = priorityFlag();
  const lines = [
    `Admin email: ${ADMIN_EMAIL}`,
    `Priority: ${priority.label} - ${priority.reason}`,
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
  } else if (state.category) {
    lines.push(`Specific issue: ${state.issueDetail || "[specific issue pending]"}`);
    lines.push(`Follow-up detail: ${state.followUpDetail || "[follow-up detail pending]"}`);
    lines.push(`Assessment: ${categoryAssessment()}`);
  }
  lines.push(`Media: ${mediaSummary()}`);
  lines.push(`Preferred appointment: ${formatAppointmentWindow()}`);
  lines.push(`Access / pets: ${state.accessNotes || "[access notes pending]"}`);
  return lines.join("\n");
}

function buildTeamDraft() {
  const priority = priorityFlag();
  return [
    `Admin email: ${ADMIN_EMAIL}`,
    `Priority: ${priority.label} - ${priority.reason}`,
    `New ${state.category || "maintenance"} request`,
    `Address: ${state.address || "[address pending]"}`,
    `Tenant: ${state.tenantName || "[tenant pending]"}`,
    `Phone / email: ${state.phone || "[phone pending]"} / ${state.email || "[email pending]"}`,
    `Job description: ${state.description || "[description pending]"}`,
    `Urgency: ${state.urgency.toUpperCase()}`,
    state.category === "AC / HVAC" ? `HVAC notes: ${likelyCause()}. Battery check: ${state.batteryCheck || "[pending]"}` : `Assessment: ${state.category ? categoryAssessment() : "[pending]"}`,
    state.category !== "AC / HVAC" ? `Issue detail: ${state.issueDetail || "[pending]"} - ${state.followUpDetail || "[pending]"}` : null,
    `Media: ${mediaSummary()}`,
    `Preferred time: ${formatAppointmentWindow()}`,
    `Notes: ${state.accessNotes || "None captured"}`
  ].filter(Boolean).join("\n");
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
    ["Category-specific issue detail", state.category === "AC / HVAC" || state.issueDetail],
    ["Category follow-up detail", state.category === "AC / HVAC" || state.followUpDetail],
    ["Media files or note", state.media || state.mediaFiles.length],
    ["Appointment window", state.contactWindow && state.contactTimeSlot],
    ["Access notes", state.accessNotes]
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

function buildAdminEmailBody() {
  return [
    "Hello Evercrest Admin,",
    "",
    "A tenant work order request is ready for review.",
    "",
    "APPFOLIO DRAFT",
    buildAppfolioDraft(),
    "",
    "MAINTENANCE TEAM MESSAGE",
    buildTeamDraft(),
    "",
    `BOT RECOMMENDATION: ${recommendationText()}`,
    "",
    "Please review and create the official work order if approved."
  ].join("\n");
}

function emailAdmin() {
  if (!validateMediaSize()) {
    return false;
  }
  populateAdminForm();
  addMessage("bot", "Submitting the work order information and attached media to the admin email now.");
  return true;
}

function populateAdminForm() {
  const priority = priorityFlag();
  const fields = {
    _subject: `Evercrest Work Order - ${state.category || "Maintenance"} - ${state.address || "Address pending"}`,
    tenant_name: state.tenantName || "",
    tenant_phone: state.phone || "",
    tenant_email: state.email || "",
    property_address: state.address || "",
    category: state.category || "",
    vendor_type: state.category ? vendorByCategory[state.category] : "",
    priority: `${priority.label} - ${priority.reason}`,
    issue_description: state.description || "",
    appfolio_draft: buildAppfolioDraft(),
    maintenance_message: buildTeamDraft(),
    bot_recommendation: recommendationText()
  };
  Object.entries(fields).forEach(([name, value]) => {
    const input = adminEmailForm.querySelector(`[name="${name}"]`);
    if (input) input.value = value;
  });
}

function validateMediaSize() {
  const maxBytes = 10 * 1024 * 1024;
  const files = Array.from(mediaUpload.files || []);
  const totalBytes = files.reduce((sum, file) => sum + file.size, 0);
  if (totalBytes > maxBytes) {
    addMessage("bot", "The attached media is too large to send. Please keep the total file size under 10 MB.");
    return false;
  }
  return true;
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
      priority: priorityFlag(),
      description: state.description,
      startedAt: state.startedAt,
      issueDetail: state.issueDetail,
      followUpDetail: state.followUpDetail,
      symptoms: state.symptoms,
      safeChecks: state.checks,
      assessment: state.category === "AC / HVAC" ? likelyCause() : categoryAssessment(),
      media: state.media,
      mediaFiles: state.mediaFiles,
      contactWindow: state.contactWindow,
      contactTimeSlot: state.contactTimeSlot,
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

function formatAppointmentWindow() {
  if (!state.contactWindow) return "[pending]";
  if (!state.contactTimeSlot) return `${state.contactWindow} - [time slot pending]`;
  return `${state.contactWindow}: ${state.contactTimeSlot}`;
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
adminEmailForm.addEventListener("submit", (event) => {
  if (!emailAdmin()) {
    event.preventDefault();
  }
});
copySummaryBtn.addEventListener("click", copySummary);
downloadJsonBtn.addEventListener("click", exportJson);
mediaUpload.addEventListener("change", () => {
  state.mediaFiles = Array.from(mediaUpload.files || []).map((file) => file.name);
  state.media = state.mediaFiles.length ? `${state.mediaFiles.length} file(s) attached` : "";
  renderMediaFileList();
  renderSummary();
});

resetConversation();

function mediaSummary() {
  const parts = [];
  if (state.media) parts.push(state.media);
  if (state.mediaFiles.length) parts.push(`Files: ${state.mediaFiles.join(", ")}`);
  return parts.length ? parts.join(" | ") : "[media pending]";
}
