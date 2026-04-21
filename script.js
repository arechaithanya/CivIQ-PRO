/* =========================================================
   CivIQ-PRO — Chat Engine
   Rule-based assistant implementing all README decision logic
   ========================================================= */

"use strict";

// ── State ──────────────────────────────────────────────────
const state = {
  step: "start",
  userAge: null,
};

// ── Helpers ────────────────────────────────────────────────

function el(id) { return document.getElementById(id); }

function scrollToBottom() {
  const win = el("chatWindow");
  win.scrollTop = win.scrollHeight;
}

/** Show / hide the animated typing indicator */
function showTyping(visible) {
  el("typingIndicator").hidden = !visible;
  scrollToBottom();
}

/**
 * Append a message bubble to the chat window.
 * @param {"bot"|"user"} role
 * @param {string} html  - inner HTML for the bubble
 */
function appendMessage(role, html) {
  const win = el("chatWindow");
  const msg = document.createElement("div");
  msg.className = `message ${role}`;

  const avatar = document.createElement("div");
  avatar.className = "avatar";
  avatar.textContent = role === "bot" ? "🗳️" : "👤";

  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.innerHTML = html;

  msg.appendChild(avatar);
  msg.appendChild(bubble);
  win.appendChild(msg);
  scrollToBottom();

  // Wire up quick-reply chips inside this bubble
  bubble.querySelectorAll(".chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      handleUserInput(chip.textContent.trim());
    });
  });
}

/**
 * Bot replies after a short simulated delay.
 * @param {string} html
 */
function botReply(html) {
  showTyping(true);
  setTimeout(() => {
    showTyping(false);
    appendMessage("bot", html);
  }, 600);
}

/** Render bullet list items */
function ul(items) {
  return `<ul>${items.map((i) => `<li>${i}</li>`).join("")}</ul>`;
}

/** Render numbered steps */
function ol(items) {
  return `<ol>${items.map((i) => `<li>${i}</li>`).join("")}</ol>`;
}

/** Quick-reply chip row */
function chips(...labels) {
  return `<div class="chip-row">${labels
    .map((l) => `<button class="chip">${l}</button>`)
    .join("")}</div>`;
}

/** External link button */
function extLink(label, url) {
  return `<a class="ext-link" href="${url}" target="_blank" rel="noopener">${label}</a>`;
}

// ── Response Library ───────────────────────────────────────

const RESPONSES = {

  greeting: () => `
    <span class="tag">👋 Welcome</span>
    <p>Hi! I'm <strong>CivIQ-PRO</strong>, your India Election Guidance Assistant.</p>
    <p>Are you a <strong>first-time voter</strong>, or do you need help with something specific?</p>
    ${chips(
      "First-time voter",
      "Register / No voter ID",
      "Lost my voter ID",
      "Moved city/state",
      "I'm under 18",
      "Voting day checklist"
    )}`,

  firstTimeVoter: () => `
    <span class="tag">🆕 First-Time Voter</span>
    <p>Welcome to your first election! Here's what you need to do:</p>
    <h3>Step 1 — Check Eligibility</h3>
    ${ul([
      "You must be <strong>18 years or older</strong> on the qualifying date",
      "Must be a <strong>citizen of India</strong>",
      "Must be an <strong>ordinary resident</strong> at your current address",
    ])}
    <h3>Step 2 — Register Online</h3>
    ${ol([
      `Visit ${extLink("NVSP", "https://nvsp.in")} and click <em>Apply online for registration of new voter</em>`,
      "Fill <strong>Form 6</strong> with your details",
      "Upload required documents (see below)",
      "Submit and note down your reference number",
    ])}
    <h3>Documents Required</h3>
    ${ul([
      "Recent passport-size photo",
      "Proof of Age: Aadhaar card, birth certificate, school certificate, or passport",
      "Proof of Address: Aadhaar, ration card, bank passbook, or utility bill",
    ])}
    <h3>⏱️ Timeline</h3>
    <p>Registration usually takes <strong>4–6 weeks</strong> to be processed.</p>
    <div class="link-row">
      ${extLink("Open NVSP", "https://nvsp.in")}
      ${extLink("Add reminder 📅", "https://calendar.google.com/calendar/r/eventedit")}
    </div>
    <p style="margin-top:.6rem">Need help finding your polling booth?</p>
    ${chips("Find my polling booth", "Voting day checklist", "What documents do I carry?")}`,

  noVoterId: () => `
    <span class="tag">📋 No Voter ID — Register Now</span>
    <p>No worries — registration is free and easy online!</p>
    <h3>How to Register</h3>
    ${ol([
      `Go to ${extLink("NVSP", "https://nvsp.in")} → <em>New Voter Registration</em>`,
      "Select <strong>Form 6</strong>",
      "Enter your personal details and address",
      "Upload photo and supporting documents",
      "Submit — you'll get a reference number",
    ])}
    <h3>Documents Needed</h3>
    ${ul([
      "<strong>Photo ID / Age proof</strong>: Aadhaar, passport, or school certificate",
      "<strong>Address proof</strong>: Aadhaar, ration card, electricity bill (not older than 3 months)",
      "One recent <strong>passport-size photo</strong>",
    ])}
    <h3>⏱️ Processing Time</h3>
    ${ul([
      "Verification: ~4–6 weeks",
      "Voter ID card dispatch: additional 2–4 weeks",
      "Check status anytime on NVSP with your reference number",
    ])}
    <h3>⚠️ Common Mistakes to Avoid</h3>
    ${ul([
      "Do NOT submit without a valid address proof",
      "Ensure your name matches exactly across all documents",
      "Register at your <em>current</em> address, not your home town",
    ])}
    <div class="link-row">
      ${extLink("Register on NVSP", "https://nvsp.in")}
      ${extLink("Set a reminder 📅", "https://calendar.google.com/calendar/r/eventedit")}
    </div>
    ${chips("What documents do I carry on voting day?", "First-time voter guide", "Voting day checklist")}`,

  lostVoterId: () => `
    <span class="tag">🔍 Lost Voter ID — Reissue Process</span>
    <p>Don't worry! You can get a duplicate voter ID card.</p>
    <h3>Online (Recommended)</h3>
    ${ol([
      `Visit ${extLink("NVSP", "https://nvsp.in")} → <em>Replacement of EPIC</em>`,
      "Fill <strong>Form 002</strong> (duplicate EPIC application)",
      "Provide your EPIC number (if you remember it) or date of birth + address to locate your record",
      "Upload a recent photo and submit",
    ])}
    <h3>Offline Option</h3>
    ${ol([
      "Visit your local <strong>Booth Level Officer (BLO)</strong> or ERO office",
      "Submit a written application with an FIR copy (if stolen) or self-declaration (if lost)",
      "Collect acknowledgement slip — use it as identity proof until the card arrives",
    ])}
    <h3>⏱️ Timeline</h3>
    <p>Duplicate card typically delivered in <strong>3–5 weeks</strong>.</p>
    <h3>💡 Tip</h3>
    <p>You can also vote using <strong>12 alternate documents</strong> approved by ECI (Aadhaar, Passport, PAN card, etc.) even without your voter ID card.</p>
    <div class="link-row">
      ${extLink("NVSP Duplicate EPIC", "https://nvsp.in")}
      ${extLink("ECI Contact", "https://eci.gov.in/contact-us/")}
    </div>
    ${chips("What documents can I use instead?", "Voting day checklist", "Find my polling booth")}`,

  movedCity: () => `
    <span class="tag">📦 Moved City / State — Transfer Voter Record</span>
    <p>If you've moved, update your voter registration so you can vote from your new address.</p>
    <h3>Steps to Transfer</h3>
    ${ol([
      `Go to ${extLink("NVSP", "https://nvsp.in")} → <em>Shifting of residence</em>`,
      "Fill <strong>Form 8A</strong> (within same constituency) or <strong>Form 6</strong> (new constituency/state)",
      "Enter your new address and upload proof",
      "Submit — your old registration will be cancelled automatically",
    ])}
    <h3>Documents Needed</h3>
    ${ul([
      "Proof of new address: Aadhaar, rent agreement, utility bill",
      "Your existing EPIC number (voter ID number)",
    ])}
    <h3>⏱️ Timeline</h3>
    <p>Transfer processed in <strong>4–6 weeks</strong>.</p>
    <h3>⚠️ Important Note</h3>
    <p>You can only vote from the <em>constituency where you are registered</em>. If you haven't transferred yet, you may need to travel to your old polling station for the upcoming election.</p>
    <div class="link-row">
      ${extLink("Open NVSP", "https://nvsp.in")}
    </div>
    ${chips("How do I find my new polling booth?", "Voting day checklist", "I also lost my voter ID")}`,

  under18: () => `
    <span class="tag">🎂 Under 18 — Not Yet Eligible</span>
    <p>You are currently <strong>not eligible</strong> to vote in India as the minimum age is <strong>18 years</strong>.</p>
    <h3>When Can You Register?</h3>
    ${ul([
      "You can apply as soon as you turn 18",
      "The qualifying date is usually <strong>1st January</strong> of the year (for annual rolls revision)",
      `Apply on ${extLink("NVSP", "https://nvsp.in")} once you turn 18`,
    ])}
    <h3>What You Can Do Now</h3>
    ${ul([
      "Bookmark <a href='https://nvsp.in' target='_blank' rel='noopener'>NVSP</a> and <a href='https://eci.gov.in' target='_blank' rel='noopener'>ECI</a>",
      "Read about the election process so you're ready",
      "Set a birthday reminder to register!",
    ])}
    <div class="link-row">
      ${extLink("Set Birthday Reminder 📅", "https://calendar.google.com/calendar/r/eventedit")}
    </div>
    ${chips("Tell me about elections in India", "How does EVM work?")}`,

  votingDayChecklist: () => `
    <span class="tag">✅ Voting Day Checklist</span>
    <p>Here's everything to prepare before you head to the polling booth:</p>
    <h3>Before You Go</h3>
    ${ul([
      "✅ Check your name on the voter list at NVSP or ECI website",
      "✅ Know your polling booth address (use Voter Helpline app or Google Maps)",
      "✅ Note the election date and booth opening hours (7 AM – 6 PM typically)",
      "✅ Charge your phone",
    ])}
    <h3>What to Carry</h3>
    ${ul([
      "📄 Voter ID (EPIC) card — or any of the 12 approved alternatives",
      "📄 Approved alternatives: Aadhaar, PAN card, Passport, Driving Licence, MNREGA Job Card, Smart Card, Pension document with photo, Bank / Post Office passbook with photo",
    ])}
    <h3>At the Booth</h3>
    ${ul([
      "Show your ID to the polling officer",
      "Get your finger inked — this is mandatory",
      "Use the EVM to cast your vote",
      "Verify on the VVPAT screen (shows for 7 seconds)",
    ])}
    <h3>⚠️ Common Mistakes to Avoid</h3>
    ${ul([
      "Don't carry a mobile phone inside the voting compartment",
      "Don't accept money or gifts in exchange for your vote — it's illegal",
      "Don't photograph the EVM or ballot",
    ])}
    <div class="link-row">
      ${extLink("Find Polling Booth 📍", "https://maps.google.com")}
      ${extLink("ECI Voter Helpline", "https://eci.gov.in/voter-helpline/")}
    </div>
    ${chips("How does EVM work?", "What if I lost my voter ID?", "Start over")}`,

  evmInfo: () => `
    <span class="tag">🖥️ Electronic Voting Machine (EVM)</span>
    <p>India uses EVMs for all major elections. Here's how they work:</p>
    <h3>Components</h3>
    ${ul([
      "<strong>Control Unit</strong> — operated by the polling officer to enable one vote at a time",
      "<strong>Balloting Unit</strong> — the machine you press to vote, showing candidate names and symbols",
      "<strong>VVPAT</strong> (Voter Verifiable Paper Audit Trail) — prints a paper slip confirming your vote (visible for 7 seconds)",
    ])}
    <h3>Voting Steps</h3>
    ${ol([
      "Polling officer enables the machine after verifying your ID",
      "Look for the candidate / party symbol on the balloting unit",
      "Press the blue button next to your choice",
      "A beep confirms your vote; VVPAT shows a paper slip",
    ])}
    <h3>Security Features</h3>
    ${ul([
      "EVMs are standalone — not connected to the internet",
      "Each machine is sealed and tested before elections",
      "Managed and audited by the Election Commission of India",
    ])}
    <div class="link-row">
      ${extLink("ECI on EVMs", "https://eci.gov.in/evm/")}
    </div>
    ${chips("Voting day checklist", "What is postal ballot?", "Start over")}`,

  postalBallot: () => `
    <span class="tag">✉️ Postal Ballot</span>
    <p>Certain voters can cast their vote by post instead of visiting a polling booth.</p>
    <h3>Who Is Eligible?</h3>
    ${ul([
      "Service voters (armed forces, central government abroad)",
      "Voters with disability (PwD) — added since 2019",
      "Senior citizens aged 85+ (added since 2020 in many states)",
      "COVID-19 or other health-quarantined voters",
      "Essential service workers on election duty",
    ])}
    <h3>How to Apply</h3>
    ${ol([
      "Submit <strong>Form 12D</strong> to the Returning Officer at least 5 days before the poll date",
      "You will receive a ballot paper by post",
      "Mark your vote, seal in the envelope, and send back before counting day",
    ])}
    <h3>⚠️ Note</h3>
    <p>Regular voters are NOT eligible for postal ballot. You must visit your designated polling booth.</p>
    <div class="link-row">
      ${extLink("ECI Postal Ballot Info", "https://eci.gov.in/postal-ballot/")}
    </div>
    ${chips("Voting day checklist", "Find my polling booth", "Start over")}`,

  typesOfElections: () => `
    <span class="tag">🏛️ Types of Elections in India</span>
    <h3>1. Lok Sabha Elections</h3>
    ${ul([
      "Elects members to the <strong>lower house of Parliament</strong>",
      "Held every <strong>5 years</strong> (or earlier if dissolved)",
      "543 constituencies across India",
      "Determines the ruling party / coalition at the Centre",
    ])}
    <h3>2. State Assembly (Vidhan Sabha) Elections</h3>
    ${ul([
      "Elects members to <strong>state legislatures</strong>",
      "Held every 5 years per state (each state has its own schedule)",
      "Determines the Chief Minister and state government",
    ])}
    <h3>3. Local Body Elections</h3>
    ${ul([
      "Panchayat elections (villages) and Municipal elections (cities)",
      "Conducted by State Election Commissions",
      "Elects ward councillors, Sarpanch, Mayor, etc.",
    ])}
    <div class="link-row">
      ${extLink("ECI Election Results", "https://results.eci.gov.in")}
    </div>
    ${chips("How to register to vote?", "Voting day checklist", "Start over")}`,

  findPollingBooth: () => `
    <span class="tag">📍 Find Your Polling Booth</span>
    <p>Use any of these official tools to find your designated polling booth:</p>
    ${ul([
      `<a href='https://electoralsearch.eci.gov.in' target='_blank' rel='noopener'>Electoral Search (ECI)</a> — search by name or EPIC number`,
      `<a href='https://nvsp.in' target='_blank' rel='noopener'>NVSP</a> → <em>Know Your Polling Station</em>`,
      "Voter Helpline App (Android / iOS) — search and navigate",
      "Call the national Voter Helpline: <strong>1950</strong>",
    ])}
    <div class="link-row">
      ${extLink("Electoral Search", "https://electoralsearch.eci.gov.in")}
      ${extLink("Get Directions 📍", "https://maps.google.com")}
    </div>
    ${chips("Voting day checklist", "What documents do I carry?", "Start over")}`,

  alternateDocuments: () => `
    <span class="tag">📄 Alternate Photo ID Documents</span>
    <p>If you don't have your voter ID card, you can use any of these <strong>12 ECI-approved documents</strong>:</p>
    ${ol([
      "Aadhaar Card",
      "Passport",
      "Driving Licence",
      "PAN Card (with photo)",
      "MNREGA Job Card",
      "NPR Smart Card",
      "Bank / Post Office Passbook with photograph",
      "Service Identity Card issued by Central/State Govt / PSUs / Public Ltd Companies",
      "Pension document with photograph",
      "Health Insurance Smart Card (RSBY)",
      "Student Identity Card with photograph issued by universities",
      "Social Justice Ministry disability document",
    ])}
    <p>Carry any <strong>one</strong> of the above on voting day.</p>
    ${chips("Voting day checklist", "Find my polling booth", "Start over")}`,

  docsToCarry: () => `
    <span class="tag">📋 Documents to Carry on Voting Day</span>
    <p>You need <strong>one valid photo ID</strong> from the list below:</p>
    ${ul([
      "Voter ID card (EPIC) — primary document",
      "Or any of the 12 approved alternatives: Aadhaar, Passport, PAN, Driving Licence, etc.",
    ])}
    <p>That's it! Just one document is enough to vote.</p>
    ${chips("Show me all 12 alternate documents", "Find my polling booth", "Voting day checklist")}`,

  fallback: (input) => `
    <p>I'm not sure I understood that. Let me help you with one of these:</p>
    ${chips(
      "First-time voter",
      "Register / No voter ID",
      "Lost my voter ID",
      "Moved city/state",
      "Voting day checklist",
      "Start over"
    )}`,
};

// ── Intent Matching ────────────────────────────────────────

/**
 * Very lightweight keyword / phrase intent detector.
 * Returns a key from RESPONSES.
 */
function detectIntent(text) {
  const t = text.toLowerCase().trim();

  // restart
  if (/\b(start over|restart|reset|begin again|new chat)\b/.test(t)) return "restart";

  // age check — extract number
  const ageMatch = t.match(/\b(\d{1,2})\b/);
  if (ageMatch) {
    const age = parseInt(ageMatch[1], 10);
    if (age < 18 && /\b(year|old|age|yr|i am|im|i'm)\b/.test(t)) return { intent: "under18", age };
    if (age >= 18 && /\b(year|old|age|yr|i am|im|i'm)\b/.test(t)) {
      // check if they also mention no voter id
      if (/no voter|don't have|haven't got|not.*voter|without.*voter/.test(t)) {
        return { intent: "noVoterId", age };
      }
    }
  }

  // under-18 without explicit age
  if (/under\s*18|below\s*18|not\s*18|minor|can't vote/.test(t)) return "under18";

  // first-time voter
  if (/first.time|first time|new voter|never voted|how.*vote.*first/.test(t)) return "firstTimeVoter";

  // register / no voter id
  if (/register|no voter id|don.t have.*voter|haven.t.*voter|form 6|sign.*up|new.*voter|get.*voter.*id|apply.*voter/.test(t)) return "noVoterId";

  // lost voter id
  if (/lost|misplace|stolen|duplicate|missing.*voter|reissue|replace.*voter|find.*voter|forgot.*voter/.test(t)) return "lostVoterId";

  // moved city / state
  if (/moved|relocat|transfer|shift|new.*city|new.*state|new.*address|different.*city|different.*state/.test(t)) return "movedCity";

  // alternate documents
  if (/12.*doc|alternate.*doc|other.*doc|without.*voter.*card|aadhaar.*vote|pan.*vote|passport.*vote/.test(t)) return "alternateDocuments";

  // documents to carry
  if (/\b(carry|bring|take|need.*doc|what.*doc)\b/.test(t)) return "docsToCarry";

  // polling booth
  if (/polling booth|booth|polling station|find.*booth|where.*vote|location.*vote/.test(t)) return "findPollingBooth";

  // voting day checklist
  if (/checklist|voting day|before.*vot|prepare.*vot|day.*vot/.test(t)) return "votingDayChecklist";

  // EVM
  if (/\bevm\b|electronic.*voting|voting machine|how.*machine|vvpat/.test(t)) return "evmInfo";

  // postal ballot
  if (/postal|by post|mail.*vote|vote.*mail|absentee/.test(t)) return "postalBallot";

  // types of elections
  if (/type.*election|lok sabha|vidhan sabha|state.*election|assembly.*election|local.*body|panchayat|municipal/.test(t)) return "typesOfElections";

  // eligibility
  if (/eligib|qualify|can i vote|am i eligible/.test(t)) return "firstTimeVoter";

  // greetings
  if (/^(hi|hello|hey|namaste|hii|helo)\b/.test(t)) return "greeting";

  return "fallback";
}

// ── Main Handler ───────────────────────────────────────────

function handleUserInput(raw) {
  const text = raw.trim();
  if (!text) return;

  appendMessage("user", escapeHtml(text));
  el("userInput").value = "";

  const intentResult = detectIntent(text);
  const intent = typeof intentResult === "object" ? intentResult.intent : intentResult;

  if (intent === "restart") {
    setTimeout(() => {
      el("chatWindow").innerHTML = "";
      state.step = "start";
      state.userAge = null;
      botReply(RESPONSES.greeting());
    }, 300);
    return;
  }

  // Map topic shortcuts
  const topicMap = {
    "first-time":    "firstTimeVoter",
    "no-id":         "noVoterId",
    "lost-id":       "lostVoterId",
    "moved":         "movedCity",
    "under18":       "under18",
    "voting-day":    "votingDayChecklist",
    "evm":           "evmInfo",
    "postal":        "postalBallot",
    "elections":     "typesOfElections",
  };

  // Handle quick chip labels directly
  const chipMap = {
    "first-time voter":                  "firstTimeVoter",
    "first-time voter guide":            "firstTimeVoter",
    "register / no voter id":            "noVoterId",
    "register":                          "noVoterId",
    "how to register to vote?":          "noVoterId",
    "lost my voter id":                  "lostVoterId",
    "what if i lost my voter id?":       "lostVoterId",
    "i also lost my voter id":           "lostVoterId",
    "moved city/state":                  "movedCity",
    "i'm under 18":                      "under18",
    "voting day checklist":              "votingDayChecklist",
    "how does evm work?":                "evmInfo",
    "what is postal ballot?":            "postalBallot",
    "tell me about elections in india":  "typesOfElections",
    "find my polling booth":             "findPollingBooth",
    "what documents do i carry?":        "docsToCarry",
    "what documents can i use instead?": "alternateDocuments",
    "show me all 12 alternate documents":"alternateDocuments",
    "start over":                        "restart",
  };

  const normalised = text.toLowerCase();
  let resolvedIntent = chipMap[normalised] || topicMap[normalised] || intent;

  if (resolvedIntent === "restart") {
    setTimeout(() => {
      el("chatWindow").innerHTML = "";
      state.step = "start";
      state.userAge = null;
      botReply(RESPONSES.greeting());
    }, 300);
    return;
  }

  const replyFn = RESPONSES[resolvedIntent] || RESPONSES.fallback;
  botReply(replyFn(text));
}

// ── HTML escape helper ─────────────────────────────────────
function escapeHtml(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ── Init ───────────────────────────────────────────────────

function init() {
  // Send on Enter
  el("userInput").addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleUserInput(el("userInput").value);
    }
  });

  // Send button
  el("sendBtn").addEventListener("click", () => {
    handleUserInput(el("userInput").value);
  });

  // Restart button
  el("resetBtn").addEventListener("click", () => {
    el("chatWindow").innerHTML = "";
    state.step = "start";
    state.userAge = null;
    botReply(RESPONSES.greeting());
  });

  // Sidebar topic buttons
  document.querySelectorAll(".topic-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const topic = btn.dataset.topic;
      const topicLabels = {
        "first-time":  "First-time voter",
        "no-id":       "Register / No voter ID",
        "lost-id":     "Lost my voter ID",
        "moved":       "Moved city/state",
        "under18":     "I'm under 18",
        "voting-day":  "Voting day checklist",
        "evm":         "How does EVM work?",
        "postal":      "What is postal ballot?",
        "elections":   "Tell me about elections in India",
      };
      handleUserInput(topicLabels[topic] || topic);
    });
  });

  // Initial greeting
  botReply(RESPONSES.greeting());
}

document.addEventListener("DOMContentLoaded", init);
