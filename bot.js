#!/usr/bin/env node
/*
 * GameLoop #get-key auto-grant bot — the REAL Discord bot (lifetime).
 *
 * A proper gateway bot (discord.js), NOT browser automation. It logs in with the
 * bot token (which never expires), listens for image posts in #get-key, verifies
 * each with Google Gemini vision via /api/grant-sub, and DMs the poster a fresh
 * subscriber-LIFETIME key. Runs headless 24/7 — deploy once, works forever.
 *
 * Behaviour per channel:
 *   #get-key  — DM the person who posted the proof.
 *   #bot-test — DM a fixed test recipient (abraruleiman) no matter who posts, so
 *               you can test any time (works around "can't DM yourself").
 *
 * Polite outcomes (owner asked for these):
 *   verified + new      → send the key.
 *   verified + existing → "you already have a key" reminder (re-sends it).
 *   not verified (fake) → polite "couldn't verify, please repost a clear proof".
 *
 * Config (env, or a .env file next to this — all have safe in-repo fallbacks
 * EXCEPT the bot token, which is read from ./.discord-token, gitignored):
 *   DISCORD_BOT_TOKEN   the bot token (or put it in ./.discord-token)
 *   GRANT_ENDPOINT      default https://www.gameloopoptimizer.com/api/grant-sub
 *   GRANT_SECRET        must match the endpoint's GRANT_SECRET
 *   BOT_CHANNELS        "getkey,bottest" (default both) — which channels are live
 *   BACKLOG_LIMIT       past messages per channel to scan on startup (default 25; 0 = live-only)
 *   DRY_RUN=1           verify only — no mint, no DM (safe test)
 */

const { Client, GatewayIntentBits, Partials, Events } = require("discord.js");
const fs = require("fs");
const path = require("path");

// ---- config ---------------------------------------------------------------
function readTokenFile() {
  try {
    return fs.readFileSync(path.join(__dirname, ".discord-token"), "utf8").trim();
  } catch {
    return null;
  }
}
const TOKEN = process.env.DISCORD_BOT_TOKEN || readTokenFile();
const ENDPOINT = process.env.GRANT_ENDPOINT || "https://www.gameloopoptimizer.com/api/grant-sub";
const SECRET = process.env.GRANT_SECRET || "";
const GUILD_ID = process.env.GUILD_ID || "1508846086452940890";

const CH = {
  getkey: "1520501551951773716",
  bottest: "1525793934272499742",
  general: "1508846087367032943",
};
// Fixed DM recipient for #bot-test so posting there always delivers a test key
// regardless of who posted. Defaults to the OWNER (umarabdullahmansoori) — the bot
// is a separate account, so it CAN DM the owner directly, and the owner sees the
// test key land in their own inbox (from "Gameloop optimizer bot"). Override with
// BOTTEST_DM_USER (e.g. 866742506347298826 = abraruleiman/MAMBA).
const BOTTEST_DM_USER = process.env.BOTTEST_DM_USER || "524878568845737985";

// Grant-log channel: the bot mirrors every action (grant / flag / DM-failed) here so
// you get a live audit feed of the DMs it sends — since you can't open the bot's own
// DM inbox. Defaults to #bot-test; set GRANT_LOG_CHANNEL to a dedicated channel id,
// or "0" to disable.
const GRANT_LOG_CHANNEL = process.env.GRANT_LOG_CHANNEL || CH.bottest;

const active = (process.env.BOT_CHANNELS || "getkey,bottest,general").split(",").map((s) => s.trim());
const WATCH = new Map(); // channelId -> "getkey" | "bottest" | "general"
if (active.includes("getkey")) WATCH.set(CH.getkey, "getkey");
if (active.includes("bottest")) WATCH.set(CH.bottest, "bottest");
if (active.includes("general")) WATCH.set(CH.general, "general");

const BACKLOG_LIMIT = process.env.BACKLOG_LIMIT != null ? parseInt(process.env.BACKLOG_LIMIT, 10) : 25;
const DRY_RUN = process.env.DRY_RUN === "1" || process.env.DRY_RUN === "true";

// Self-hosted vision fallback (Ollama). Used ONLY when every cloud provider is down,
// so the bot keeps granting for free even if Gemini/Grok are exhausted/offline. Runs
// locally on this machine (the bot runs here too, so it can reach localhost). Auto
// no-ops if Ollama isn't running. `ollama pull qwen2.5vl:3b` (or moondream) to enable.
const OLLAMA_URL = process.env.OLLAMA_URL || "http://127.0.0.1:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "qwen2.5vl:3b";
const OLLAMA_ENABLED = process.env.OLLAMA_ENABLED !== "0";

// Shared prompt + verdict parser (mirrors the endpoint) for the local fallback.
// LIGHT + LENIENT + MULTILINGUAL: the "Subscribed" button text varies by language,
// so we tell the model to judge by the VISUAL state (muted button + bell/chevron) as
// much as the words, and we list foreign-language examples so Arabic/Russian/Urdu/etc.
// proofs stop getting wrongly rejected. Keep in sync with the endpoint's VISION_PROMPT.
const VISION_PROMPT =
  "You are checking a screenshot a user posted to prove they SUBSCRIBED to the YouTube channel \"Jeral Gaming\" (handle @jeralgaming853, shown as \"JeralGaming\"). Do a LIGHT, LENIENT check and APPROVE any image that PLAUSIBLY shows a subscribed state, in ANY language.\n\nOn YouTube the SUBSCRIBED state is a muted/grey pill button (works in light OR dark theme) usually with a BELL/notification icon and/or a dropdown chevron (v) next to it — NOT the solid red \"Subscribe\" call-to-action. The button word changes by language; ALL of these (and similar) count as subscribed: English \"Subscribed\", Arabic \"تم الاشتراك\" or \"مشترك\", Russian \"Вы подписаны\", Urdu \"سبسکرائب\" / Hindi \"सदस्यता ली\", Spanish \"Suscrito\", Portuguese \"Inscrito\", Indonesian \"Berlangganan\", French \"Abonné\", Turkish \"Abone olundu\", German \"Abonniert\", etc. Judge by the VISUAL grey-button + bell/chevron state as much as by the word — if you cannot read the language, the muted button with a bell still means subscribed.\n\nAPPROVE (subscribed:true) for ANY plausible proof: mobile OR desktop, dark OR light theme, the expanded subscribe dropdown menu, this channel's page, or this channel appearing in the user's Subscriptions list. When it looks like a YouTube subscribe context for this channel, approve.\n\nREJECT (subscribed:false) ONLY for clearly-unrelated images: a random photo, a game screenshot with no YouTube UI, a blank/black image, or a still solid-red never-pressed \"Subscribe\" button.\n\nRespond with ONLY compact JSON, no markdown: {\"subscribed\": true|false, \"reason\": \"<=12 words\"}";
function parseVerdict(text) {
  const m = (text || "").match(/\{[\s\S]*\}/);
  if (!m) return { subscribed: false, reason: "no verdict" };
  try {
    const j = JSON.parse(m[0]);
    return { subscribed: Boolean(j.subscribed), reason: String(j.reason || "").slice(0, 80) };
  } catch {
    return { subscribed: false, reason: "unparseable verdict" };
  }
}

// ---- #ai-help AI support agent --------------------------------------------
// Answers user questions in #ai-help from a PUBLIC knowledge base (app info,
// pricing, optimization guides, fixes) with hard guardrails against leaking any
// proprietary internals. Uses Ollama Cloud chat (key from env — never in the repo).
const AIHELP_CHANNEL = process.env.AIHELP_CHANNEL || "1525938944246550558";
const OLLAMA_CLOUD_URL = process.env.OLLAMA_CLOUD_URL || "https://ollama.com/api/chat";
const OLLAMA_CLOUD_API_KEY = process.env.OLLAMA_CLOUD_API_KEY || "";
// #ai-help RELIABILITY — a single model retirement / provider outage must NEVER take
// it down again (that's exactly what happened when Ollama Cloud retired gemma3:27b on
// 2026-07-15 → HTTP 410). The chat path now (a) rotates across several LIVE, FREE-tier
// Ollama Cloud models, then (b) falls back to OpenRouter (a different provider).
// Model choice (benchmarked 2026-07-17 on the free key): gpt-oss:120b = best grounding +
// lowest hallucination (~10s); gpt-oss:20b (~4s) and gemma4:31b (~3.5s) are the fast
// free backups. The premium models (deepseek/glm/kimi/qwen/…) return 403 "needs a paid
// subscription" on the free key, so they are deliberately NOT in the list. A startup
// health-check (checkAiHelpModels) warns if any listed model stops being live, so a
// future retirement is caught immediately. gpt-oss is TEXT-ONLY; the #general vision
// classifier uses its own multimodal SPAM_MODEL below.
const OLLAMA_CHAT_MODELS = (
  process.env.OLLAMA_CHAT_MODELS ||
  process.env.OLLAMA_CHAT_MODEL ||
  "gpt-oss:120b,gpt-oss:20b,gemma4:31b"
)
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
// Cross-provider fallback — OpenRouter free chat models (same free key the site's vision
// endpoint uses). The in-repo key works locally; the PUBLIC deploy mirror STRIPS it, so
// set OPENROUTER_API_KEY on Render to keep the cross-provider fallback active in prod.
// (Even without it, the 3-model Ollama rotation above already survives any single-model
// retirement — the exact failure we hit.)
const OPENROUTER_URL = process.env.OPENROUTER_URL || "https://openrouter.ai/api/v1/chat/completions";
const OPENROUTER_API_KEY =
  process.env.OPENROUTER_API_KEY || "";
const OPENROUTER_CHAT_MODELS = (
  process.env.OPENROUTER_CHAT_MODELS ||
  "meta-llama/llama-3.3-70b-instruct:free,qwen/qwen3-next-80b-a3b-instruct:free,nvidia/nemotron-3-super-120b-a12b:free"
)
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

// ---- #general moderation ---------------------------------------------------
// In #general, images are MIXED: some are subscription proofs (grant a key, same as
// #get-key), most are normal gaming chat, and some are abusive SPAM (memes, random
// celebrities like MrBeast, ads, unrelated flood). We only ever act on IMAGES (never
// text — "photos only"), and we DELETE only when the AI is highly confident an image
// is off-topic abuse. Uses a multimodal Ollama Cloud model (gemma4:31b) for vision.
const SPAM_MODEL = process.env.SPAM_MODEL || "gemma4:31b"; // multimodal (gpt-oss chat model is text-only)
const SPAM_THRESHOLD = Number(process.env.SPAM_THRESHOLD || "0.9"); // delete only at >= this confidence
const GENERAL_MODERATION = process.env.GENERAL_MODERATION !== "0"; // set 0 to grant-only, never delete
// On a DELETED spam image, optionally also REMOVE (ban) the member — but ONLY after a
// SECOND, stricter, independent "are you 100% certain this is abuse" check passes (a
// real user must never be banned on one fluke). Set GENERAL_BAN=0 to only ever delete.
const GENERAL_BAN = process.env.GENERAL_BAN !== "0";
// Classifier prompt for a #general image. Deliberately CONSERVATIVE about "spam"
// because a false positive DELETES a real user's message.
const SPAM_PROMPT =
  "You are moderating a SINGLE image posted in the #general chat of the Discord for \"GameLoop Optimization by Jeral Gaming\" — a free tool that boosts PUBG Mobile FPS on the GameLoop emulator. Sort the image into exactly ONE category and return ONLY compact JSON, no markdown: {\"category\": \"subscription\"|\"spam\"|\"other\", \"spam_confidence\": 0.0-1.0, \"reason\": \"<=12 words\"}\n\nCategories:\n- \"subscription\" = plausibly a proof of subscribing to the \"Jeral Gaming\" YouTube channel (handle @jeralgaming853 / \"JeralGaming\"): a YouTube channel page, or a subscribe button/dropdown, in ANY language, showing the SUBSCRIBED state (a muted/grey button usually with a BELL icon and/or a dropdown chevron, e.g. English \"Subscribed\", Arabic \"تم الاشتراك\", Russian \"Вы подписаны\", Hindi \"सदस्यता ली\", Spanish \"Suscrito\", Indonesian \"Berlangganan\", etc.), or this channel shown in a Subscriptions list. If the image looks like a YouTube subscribe proof, choose this.\n- \"other\" = a normal, on-topic image: PUBG / GameLoop gameplay clips or screenshots, FPS counters, in-game or emulator settings, error/bug screenshots, the optimizer app UI, or anything gaming-related that is NOT a subscription proof. Use this for anything ambiguous, low-quality, or gaming-adjacent.\n- \"spam\" = CLEARLY off-topic abuse with NO relation to PUBG / GameLoop / gaming / the channel: memes, celebrity or influencer pictures (e.g. MrBeast), advertisements, promotions for other products, or unrelated images posted to flood the channel.\n\nRules:\n- Be CONSERVATIVE about \"spam\": it will be DELETED, so false positives are costly. Set spam_confidence >= 0.9 ONLY when the image is unmistakably off-topic abuse. If you are unsure between \"spam\" and \"other\", choose \"other\" with a LOW spam_confidence.\n- A real subscription proof must NEVER be labeled \"spam\".\n- If the image is blank, unreadable, or has no discernible content, use \"other\" (never \"subscription\").\n- For \"subscription\" or \"other\", set spam_confidence low (typically <= 0.2).\n\nRespond with ONLY the compact JSON described above.";

// Second, INDEPENDENT gate before removing (banning) a member. Deliberately biased hard
// toward NOT banning — it only says yes when the image is unmistakable off-topic abuse
// with zero chance of being legit. This is what "100% confirmation" means in practice.
const CONFIRM_BAN_PROMPT =
  "You are deciding whether to BAN (permanently remove) a user from a PUBG Mobile / GameLoop gaming Discord for the IMAGE they posted in #general. A ban is severe, so confirm ONLY if you are 100% CERTAIN this image is deliberate off-topic spam/abuse — a meme, a celebrity/influencer photo (e.g. MrBeast), an advertisement, a scam, or unrelated flooding — with ZERO chance it is a legitimate gaming image, a PUBG/GameLoop screenshot, or a YouTube subscription proof. If the image is merely blank, unreadable, corrupt, low-quality, or random noise (NOT a clear meme/celebrity/ad/scam), do NOT confirm — it may be an accidental or broken upload. If there is ANY doubt at all, do NOT confirm. Respond with ONLY compact JSON, no markdown: {\"ban\": true|false, \"certain\": true|false, \"reason\": \"<=12 words\"}";

let AIHELP_KNOWLEDGE = "";
try {
  AIHELP_KNOWLEDGE = fs.readFileSync(path.join(__dirname, "ai-help-knowledge.md"), "utf8");
} catch (e) {
  AIHELP_KNOWLEDGE = "(knowledge file missing)";
}
const AIHELP_SYSTEM =
  "You are the official GameLoop Optimizer support assistant in the #ai-help Discord channel — friendly, expert, and helpful. You help users of GameLoop Optimizer (a free Windows tool by Jeral Gaming that boosts PUBG Mobile FPS on the GameLoop emulator).\n\n" +
  "STYLE: Be genuinely, REALLY helpful — like an expert who wants them to win. Give accurate, specific, actionable guidance: exact settings/values, the steps in the right order, and brief WHY. Use the KNOWLEDGE's specifics when they match the user's PC/problem (e.g. the per-GPU recipe for their card, the exact fix steps for their error) — and if knowing their GPU/CPU would let you give an exact recipe, ask for it. Cover the important points thoroughly but tightly: no filler, no greeting, no restating the question, no pep-talk. Aim for ~700-1400 characters; go longer only when the topic genuinely needs it. Clear markdown: bold key terms, a short header, bullets; light emoji ok.\n\n" +
  "LAYOUT: Compact — single line breaks only. NEVER put blank lines between bullets or sections (no big gaps). Each bullet on its own line, one after another. Do NOT use markdown TABLES (Discord does not render them — they show as ugly raw pipes); use short bullets like 'Setting — value' instead.\n\n" +
  "LINKS: Most answers need NO link at all. Only when it genuinely helps (e.g. they ask where to download or buy) add the website ONCE, at the very END, as a short note, written EXACTLY like this WITH the spaces: https://www. gameloopoptimizer .com/ . Refer to YouTube (Jeral Gaming) and Discord channels (like #get-key) BY NAME instead of pasting raw links. NEVER post the owner's personal Discord link or any discord.com/users link, and never use markdown [text](url) syntax.\n\n" +
  "PROMOTION: Fully answer and help FIRST — never sell inside the answer. Any selling is at most ONE short, soft one-line mention placed on its OWN line at the very END, right after a separator line of exactly ten dashes '----------'. Format:\n<your full helpful answer>\n----------\nGameLoop Optimizer automates a lot of this — a Pro key unlocks the full app.\nRules for that line: keep it ONE line, soft, generic, honest (never invent feature benefits, e.g. don't call the Save Editor a troubleshooting tool). Skip the selling line entirely for tiny/trivial answers. Do NOT push the free 'subscribe on YouTube + #get-key' route unless the user EXPLICITLY asks how to get a free key. If they ask price, answer plainly (Pro $1.99/mo or $5/3mo).\n\n" +
  "ACCURACY: Only state product facts explicitly in the KNOWLEDGE. NEVER invent, guess, or embellish what a GameLoop Optimizer feature does, what it's for, or its benefits — if the KNOWLEDGE doesn't say it, don't say it (just name the feature plainly or leave it out). You MAY use general, well-known PC / GameLoop / PUBG optimization knowledge for settings and fixes, but never fabricate specifics about THIS app.\n\n" +
  "ANTI-HALLUCINATION (critical — the owner's #1 complaint is that you make things up):\n" +
  "- Ground EVERY claim about GameLoop Optimizer (features, pricing, what it does, safety) strictly in the KNOWLEDGE. If the KNOWLEDGE doesn't state it, do not say it — name the feature plainly or leave it out.\n" +
  "- NEVER invent version numbers, FPS/benchmark figures, percentages, or process counts for THIS app. Do not promise a specific FPS gain; say results vary by PC.\n" +
  "- NEVER invent app features, benefits, or what a feature is 'for'. Only describe features listed in the KNOWLEDGE.\n" +
  "- For GameLoop/PUBG/Windows settings and error fixes you MAY use well-known general PC-gaming knowledge, but only give concrete values/steps when you're genuinely confident they're correct and current. Prefer the exact settings in the KNOWLEDGE.\n" +
  "- If you are not certain, say 'I'm not 100% sure' and give your best general guidance or point them to the owner in the Discord server — never fill a gap with a confident guess.\n" +
  "- Do not state exact registry keys, services, internal engine details, or anything about how the app is built; if asked, say it's proprietary and pivot to helping them.\n" +
  "- When a fact depends on the user's exact hardware, GameLoop version, or PUBG build, say so and ask for it rather than guessing a specific number.\n" +
  "- Never present emulator/PUBG settings as guarantees ('this gives you 120 FPS') — frame them as recommended settings to try, since real FPS is CPU/emulator-bound.\n\n" +
  "YOU MAY SHARE: app features, pricing, how to get a key, best GameLoop engine + in-game PUBG settings + Windows/network optimization, and fixes for common GameLoop errors — from the KNOWLEDGE below plus general public PC/gaming know-how.\n\n" +
  "HARD GUARDRAILS (never break): NEVER reveal or discuss how OUR app is built or coded, its internal engine/architecture, the EXACT tweaks/registry keys/services IT changes, our backend/server/database, the license/activation internals, any API keys/secrets, or ANYTHING that could help someone build a competing or similar tool or help a competitor. If asked, politely say it's proprietary and pivot to helping them use the app or optimize their game. Don't invent product facts beyond the KNOWLEDGE. Stay on topic (GameLoop Optimizer / PUBG Mobile / GameLoop / PC gaming performance). For anything you can't resolve, suggest they reach out to the owner in the GameLoop Optimizer Discord server — but NEVER paste any personal Discord user link.\n\n" +
  "KNOWLEDGE:\n" +
  AIHELP_KNOWLEDGE;

const AIHELP_MAX_TOKENS = Number(process.env.AIHELP_MAX_TOKENS || "700");

// One Ollama Cloud chat attempt for a specific model. Caps the reply length: keeps
// answers tight (the persona asks for ~700-1400 chars) AND fast — an uncapped
// gpt-oss:120b can take ~35s on a long table; capped it lands in ~10s (the typing
// keep-alive covers it). Throws on HTTP error OR empty reply so the caller rotates on.
async function ollamaChatOnce(model, question) {
  const r = await fetch(OLLAMA_CLOUD_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${OLLAMA_CLOUD_API_KEY}` },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: AIHELP_SYSTEM },
        { role: "user", content: question },
      ],
      stream: false,
      options: { temperature: 0.35, num_predict: AIHELP_MAX_TOKENS },
    }),
  });
  if (!r.ok) throw new Error(`ollama-cloud ${model} ${r.status}: ${(await r.text()).slice(0, 90)}`);
  const d = await r.json();
  const t = (d.message?.content || "").trim();
  if (!t) throw new Error(`ollama-cloud ${model} empty reply`);
  return t;
}

// One OpenRouter chat attempt (OpenAI-compatible) — the cross-provider fallback.
async function openrouterChatOnce(model, question) {
  const r = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${OPENROUTER_API_KEY}` },
    body: JSON.stringify({
      model,
      temperature: 0.35,
      max_tokens: AIHELP_MAX_TOKENS,
      messages: [
        { role: "system", content: AIHELP_SYSTEM },
        { role: "user", content: question },
      ],
    }),
  });
  if (!r.ok) throw new Error(`openrouter ${model} ${r.status}: ${(await r.text()).slice(0, 90)}`);
  const d = await r.json();
  const t = (d.choices?.[0]?.message?.content || "").trim();
  if (!t) throw new Error(`openrouter ${model} empty reply`);
  return t;
}

// #ai-help chat with FULL redundancy: rotate every live Ollama model, then every
// OpenRouter model, returning the first good reply. Only throws if EVERY provider
// AND model failed — so a single model retirement or provider outage can't take
// #ai-help down (the failure we hit when gemma3:27b was retired).
async function askAiHelp(question) {
  const q = question.slice(0, 1500);
  const errs = [];
  for (const model of OLLAMA_CHAT_MODELS) {
    try {
      return await ollamaChatOnce(model, q);
    } catch (e) {
      errs.push(String(e.message).slice(0, 70));
      log(`  ai-help: ${String(e.message).slice(0, 90)} — trying next model`);
    }
  }
  if (OPENROUTER_API_KEY) {
    for (const model of OPENROUTER_CHAT_MODELS) {
      try {
        return await openrouterChatOnce(model, q);
      } catch (e) {
        errs.push(String(e.message).slice(0, 70));
        log(`  ai-help: ${String(e.message).slice(0, 90)} — trying next model`);
      }
    }
  }
  throw new Error(`all chat providers failed — ${errs.join(" | ")}`);
}

// Tidy the model's reply for Discord: strip markdown link syntax to bare URLs and
// collapse blank-line gaps so the message stays compact (no big vertical gaps).
function tidyAnswer(t) {
  let s = String(t || "").replace(/\r/g, "");
  // Never expose a personal Discord link — strip it with any surrounding brackets/space.
  s = s.replace(/[ \t]*(?:\(|<)?\s*https?:\/\/discord\.com\/users\/\d+\/?\s*(?:\)|>)?/gi, "");
  // Markdown [label](url) -> label only, EXCEPT keep the website as a bare URL (spaced later).
  s = s.replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, (_m, label, url) =>
    /gameloopoptimizer\.com/i.test(url) ? "https://www.gameloopoptimizer.com/" : label);
  // Prose spacing cleanup BEFORE we inject intentionally-spaced URLs.
  s = s
    .replace(/[ \t]+$/gm, "")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/[ \t]+([.,;:!?])/g, "$1");  // no space before punctuation
  // Rewrite remaining raw URLs into non-clickable plain text (preserving trailing punctuation).
  s = s.replace(/<?\bhttps?:\/\/[^\s<>)]+>?/gi, (m) => {
    let url = m.replace(/^<|>$/g, "");
    let trail = "";
    const tm = url.match(/[.,;:!?]+$/);
    if (tm) { trail = tm[0]; url = url.slice(0, -trail.length); }
    let out;
    if (/discord\.com\/users\//i.test(url)) out = "";                  // safety net (already stripped)
    else if (/gameloopoptimizer\.com/i.test(url)) out = "https://www. gameloopoptimizer .com/"; // owner's spaced form
    else out = url.replace(/^(https?:\/\/)([^\/\s]+)/i, (mm, pre, host) => pre + host.replace(/\./g, " . "));
    return out + trail;
  });
  // Force ANY website variant (however the model spaced/garbled it) to the exact clean form.
  s = s.replace(/(?:https?:\/\/)?(?:w{2,3}[\s.\/]*)?gameloopoptimizer[\s.\/]*com\/?/gi,
    "https://www. gameloopoptimizer .com/");
  // Final tidy: kill empty wrappers + collapse blank-line gaps (keep the injected URL spaces).
  s = s
    .replace(/\(\s*\)/g, "")
    .replace(/<\s*>/g, "")
    .replace(/[ \t]+$/gm, "")
    .replace(/(?:[ \t]*\n){2,}/g, "\n")   // collapse blank lines -> single newline
    .replace(/\n[ \t]*[-*]\s*\n/g, "\n"); // drop empty bullet lines
  return s.trim();
}

// Split a long reply into <=max-char chunks on line boundaries (Discord's limit is 2000).
function splitForDiscord(text, max = 1900) {
  if (text.length <= max) return [text];
  const parts = [];
  let cur = "";
  for (const block of text.split("\n")) {
    if (block.length > max) {
      if (cur) { parts.push(cur); cur = ""; }
      for (let i = 0; i < block.length; i += max) parts.push(block.slice(i, i + max));
    } else if ((cur + "\n" + block).length > max) {
      parts.push(cur);
      cur = block;
    } else {
      cur = cur ? cur + "\n" + block : block;
    }
  }
  if (cur) parts.push(cur);
  return parts;
}

async function handleAiHelp(msg) {
  const question = (msg.content || "").trim();
  if (!question) return;
  if (!OLLAMA_CLOUD_API_KEY) {
    log("ai-help: OLLAMA_CLOUD_API_KEY not set — cannot answer");
    return;
  }
  log(`ai-help: Q from ${msg.author.tag}: ${question.slice(0, 70)}`);
  // Keep the "typing…" indicator alive for the whole ~10s generation (a single
  // sendTyping only lasts ~10s in Discord, so we re-ping every 8s until the answer
  // is ready). Prevents the channel looking dead while the model thinks.
  let typing = true;
  (async () => {
    while (typing) {
      try { await msg.channel.sendTyping(); } catch {}
      await sleep(8000);
    }
  })();
  let answer;
  try {
    answer = await askAiHelp(question);
  } catch (e) {
    typing = false;
    log(`  ai-help error: ${e.message}`);
    try { await msg.reply("Sorry — I hit a hiccup 😅 Please try again in a moment, or contact the owner <https://discord.com/users/524878568845737985> for help."); } catch {}
    return;
  }
  typing = false;
  if (!answer) {
    try { await msg.reply("Hmm, I didn't quite catch that — could you rephrase your question? 🎮"); } catch {}
    return;
  }
  answer = tidyAnswer(answer);
  const chunks = splitForDiscord(answer);
  for (let i = 0; i < chunks.length; i++) {
    try {
      if (i === 0) await msg.reply(chunks[i]);
      else await msg.channel.send(chunks[i]);
    } catch (e) {
      log(`  ai-help send failed: ${e.message}`);
      break;
    }
  }
  log(`  ai-help answered (${answer.length} chars in ${chunks.length} msg)`);
}

const STATE_FILE = path.join(__dirname, "bot-state.json");
function loadState() {
  let s = {};
  try {
    s = JSON.parse(fs.readFileSync(STATE_FILE, "utf8"));
  } catch {
    s = {};
  }
  return { processed: s.processed || {}, granted: s.granted || {}, flagged: s.flagged || {} };
}
function saveState(s) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(s, null, 2));
}
const state = loadState();

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const log = (...m) => console.log(new Date().toISOString().slice(11, 19), ...m);

// ---- messages -------------------------------------------------------------
// Support line appended to every key DM — points users to the owner/developer.
const SUPPORT_LINE =
  "Any problem or question? Contact the owner & developer **umarabdullahmansoori** here: https://discord.com/users/524878568845737985";

function keyMessage(key) {
  return [
    "Hey! Thanks so much for subscribing! 🎮",
    "",
    "Here's your GameLoop Optimizer key:",
    `**${key}**`,
    "",
    "Grab the app at https://www.gameloopoptimizer.com and paste the key into it to unlock. Enjoy!",
    "",
    SUPPORT_LINE,
  ].join("\n");
}
function alreadyMessage(key) {
  return [
    "Hey! Looks like you've already got your GameLoop Optimizer key 🙂",
    "",
    "Here it is again, just in case:",
    `**${key}**`,
    "",
    "One key per subscriber — enjoy! 🎮",
    "",
    SUPPORT_LINE,
  ].join("\n");
}
function invalidMessage() {
  return [
    "Hey! Thanks for your interest in GameLoop Optimizer 🙂",
    "",
    "I couldn't verify a subscription to **Jeral Gaming** in that screenshot. Please make sure it clearly shows you're **subscribed** (the grey \"Subscribed\" button on the channel), then post it again in #get-key and I'll sort you right out! 🎮",
  ].join("\n");
}

// ---- grant endpoint -------------------------------------------------------
async function downloadImage(url) {
  const img = await fetch(url);
  if (!img.ok) throw new Error("image fetch " + img.status);
  const mime = img.headers.get("content-type") || "image/png";
  const base64 = Buffer.from(await img.arrayBuffer()).toString("base64");
  return { base64, mime };
}

// POST the grant endpoint. Returns {ok, status, data} so the caller can tell a real
// verdict (200 valid:true/false) from an infra error (5xx / all-providers-down).
async function callGrant(body) {
  const r = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ secret: SECRET, ...body }),
  });
  const data = await r.json().catch(() => ({}));
  return { ok: r.ok, status: r.status, data };
}

// Self-hosted vision via local Ollama. Throws if Ollama isn't running (→ caller
// falls through to flag-for-manual).
async function verifyWithOllama(base64) {
  const r = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      prompt: VISION_PROMPT,
      images: [base64],
      stream: false,
      options: { temperature: 0 },
    }),
  });
  if (!r.ok) throw new Error("ollama " + r.status);
  const d = await r.json();
  return parseVerdict(d.response || "");
}

// ---- discord --------------------------------------------------------------
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ],
  partials: [Partials.Channel], // required to open/send DMs
});

function imageAttachment(msg) {
  return [...msg.attachments.values()].find(
    (a) => (a.contentType || "").startsWith("image/") || /\.(png|jpe?g|webp|gif)$/i.test(a.name || "")
  );
}

async function safeDM(userId, content) {
  try {
    const user = await client.users.fetch(userId);
    await user.send(content);
    return true;
  } catch (e) {
    log(`  ⚠ DM to ${userId} failed: ${e.message}`);
    return false;
  }
}

async function react(msg, emoji) {
  try {
    await msg.react(emoji);
  } catch (e) {
    log(`  react ${emoji} failed: ${e.message}`);
  }
}

function msgLink(msg) {
  return `https://discord.com/channels/${GUILD_ID}/${msg.channelId}/${msg.id}`;
}

// Mirror an action to the grant-log channel so the owner has a live feed of what the
// bot DM'd (you can't open the bot's own DM inbox). Best-effort; never blocks a grant.
async function logToChannel(text) {
  if (!GRANT_LOG_CHANNEL || GRANT_LOG_CHANNEL === "0") return;
  try {
    const ch = await client.channels.fetch(GRANT_LOG_CHANNEL);
    await ch.send({ content: text, allowedMentions: { parse: [] } });
  } catch (e) {
    log(`  grant-log post failed: ${e.message}`);
  }
}

// Flag a message for MANUAL review instead of ever telling a real subscriber they
// failed. Reacts + replies once (deduped via state.flagged) so #get-key stays clean.
async function flagManual(msg, why) {
  log(`  🔍 manual: ${why}`);
  if (state.flagged[msg.id]) return;
  state.flagged[msg.id] = { why, at: Date.now() };
  saveState(state);
  await react(msg, "⚠️");
  await logToChannel(`🔍 **${msg.author.tag}** — manual review: ${why} · ${msgLink(msg)}`);
  try {
    await msg.reply(
      "🔍 Thanks! We just need a quick **manual check** on this one — a mod will review your subscription and get your key to you shortly. 🎮"
    );
  } catch (e) {
    log(`  reply failed: ${e.message}`);
  }
}

// Deliver a minted key: DM it + react ✅. If DMs are closed, flag for manual (never
// post a key publicly).
async function deliverKey(msg, dmUserId, keyData, isTest, via) {
  const content = keyData.existing && !isTest ? alreadyMessage(keyData.key) : keyMessage(keyData.key);
  const sent = await safeDM(dmUserId, content);
  if (sent) {
    await react(msg, "✅");
    // Public in-channel confirmation (NO key posted publicly — it's in their DMs).
    try {
      await msg.reply(
        keyData.existing && !isTest
          ? "✅ You already have a key — I've re-sent it to your **DMs**. Check your inbox! 🎮"
          : "✅ Verified! Your **GameLoop Optimizer key** has been sent to your **DMs** — check your inbox to unlock. 🎮"
      );
    } catch (e) {
      log(`  reply failed: ${e.message}`);
    }
    log(`  ✓ ${keyData.key} ${keyData.existing ? "(existing)" : "(new)"} via ${via} → DM sent`);
    await logToChannel(
      `✅ **${msg.author.tag}** → \`${keyData.key}\`${keyData.existing ? " (re-sent)" : ""} · via ${via} · ${msgLink(msg)}`
    );
  } else {
    await flagManual(msg, `verified but DMs closed — key \`${keyData.key}\` needs manual delivery`);
    log(`  ✓ ${keyData.key} but DM blocked → flagged`);
  }
  return sent;
}

// ---- #general spam moderation ---------------------------------------------
// Parse the classifier's JSON verdict. Fails SAFE — anything unparseable becomes
// "other" with 0 confidence, so an odd reply never triggers a deletion.
function parseClassify(text) {
  const m = (text || "").match(/\{[\s\S]*\}/);
  if (!m) return { category: "other", spam_confidence: 0, reason: "no verdict" };
  try {
    const j = JSON.parse(m[0]);
    const category = ["subscription", "spam", "other"].includes(j.category) ? j.category : "other";
    let conf = Number(j.spam_confidence);
    if (!Number.isFinite(conf)) conf = 0;
    conf = Math.max(0, Math.min(1, conf));
    return { category, spam_confidence: conf, reason: String(j.reason || "").slice(0, 80) };
  } catch {
    return { category: "other", spam_confidence: 0, reason: "unparseable verdict" };
  }
}

// Classify a #general image via the multimodal Ollama Cloud model. Throws if the
// provider is unavailable (→ caller leaves the message untouched — fail safe).
async function classifyGeneralImage(base64) {
  const r = await fetch(OLLAMA_CLOUD_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${OLLAMA_CLOUD_API_KEY}` },
    body: JSON.stringify({
      model: SPAM_MODEL,
      messages: [{ role: "user", content: SPAM_PROMPT, images: [base64] }],
      stream: false,
      options: { temperature: 0 },
    }),
  });
  if (!r.ok) throw new Error(`ollama-cloud ${r.status}`);
  const d = await r.json();
  return parseClassify(d.message?.content || "");
}

// Delete a spam image + mirror it to the grant-log for audit. If the bot lacks the
// "Manage Messages" permission the delete fails — we log that loudly so the owner
// can grant it, and never crash.
async function deleteSpam(msg, verdict) {
  try {
    await msg.delete();
    log(`  🗑 deleted spam from ${msg.author.tag} (conf ${verdict.spam_confidence}): ${verdict.reason}`);
    await logToChannel(
      `🗑 **${msg.author.tag}** — spam image deleted in #general (conf ${verdict.spam_confidence}): ${verdict.reason}`
    );
  } catch (e) {
    log(`  ⚠ spam delete failed (missing "Manage Messages"?): ${e.message}`);
    await react(msg, "⚠️");
    await logToChannel(
      `⚠️ **${msg.author.tag}** — spam detected but DELETE FAILED (${e.message}). Give the bot **Manage Messages**. ${msgLink(msg)}`
    );
  }
}

// Second, INDEPENDENT check (strict prompt) asking the model to confirm a ban ONLY if
// it's 100% certain the image is abuse. Returns {ban, certain, reason}; fails SAFE
// (ban:false) on any error/unparseable reply so we never remove a member on a fluke.
async function confirmBanImage(base64) {
  const r = await fetch(OLLAMA_CLOUD_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${OLLAMA_CLOUD_API_KEY}` },
    body: JSON.stringify({
      model: SPAM_MODEL,
      messages: [{ role: "user", content: CONFIRM_BAN_PROMPT, images: [base64] }],
      stream: false,
      options: { temperature: 0 },
    }),
  });
  if (!r.ok) throw new Error(`ollama-cloud ${r.status}`);
  const d = await r.json();
  const m = (d.message?.content || "").match(/\{[\s\S]*\}/);
  if (!m) return { ban: false, certain: false, reason: "no verdict" };
  try {
    const j = JSON.parse(m[0]);
    return { ban: Boolean(j.ban), certain: Boolean(j.certain), reason: String(j.reason || "").slice(0, 80) };
  } catch {
    return { ban: false, certain: false, reason: "unparseable verdict" };
  }
}

// Remove (ban) a member for 100%-confirmed spam, purging their last hour of messages.
// Needs the "Ban Members" permission; on failure it logs loudly + audits (never crashes).
// Every ban is mirrored to the grant-log so the owner sees it and can reverse it.
async function banSpammer(msg, reason) {
  try {
    if (!msg.guild) throw new Error("no guild");
    await msg.guild.members.ban(msg.author.id, {
      reason: `Auto-removed: 100%-confirmed spam — ${reason}`,
      deleteMessageSeconds: 3600,
    });
    log(`  ⛔ removed (banned) ${msg.author.tag} — 100% spam: ${reason}`);
    await logToChannel(`⛔ **${msg.author.tag}** — REMOVED (banned) for 100%-confirmed spam: ${reason}`);
  } catch (e) {
    log(`  ⚠ ban failed (missing "Ban Members"?): ${e.message}`);
    await logToChannel(
      `⚠️ **${msg.author.tag}** — 100% spam but REMOVE FAILED (${e.message}). Give the bot **Ban Members**. ${msgLink(msg)}`
    );
  }
}

// A #general image that was NOT a subscription proof — decide whether it's abusive
// spam worth deleting (and, if 100%-confirmed, removing the member). Conservative:
// deletes only at >= SPAM_THRESHOLD; bans only when a SECOND strict check is 100%
// certain. Anything else (normal image, uncertain, provider down) is left alone, and
// no reply is ever posted (unlike #get-key), so #general stays clean.
async function moderateGeneralImage(msg, base64) {
  if (!GENERAL_MODERATION) return;
  if (!OLLAMA_CLOUD_API_KEY) {
    log("  (general) spam check skipped — OLLAMA_CLOUD_API_KEY not set");
    return;
  }
  let verdict;
  try {
    verdict = await classifyGeneralImage(base64);
  } catch (e) {
    log(`  (general) spam check unavailable (${e.message}) — leaving message`);
    return;
  }
  log(`  (general) classify=${verdict.category} conf=${verdict.spam_confidence} — ${verdict.reason}`);
  if (!(verdict.category === "spam" && verdict.spam_confidence >= SPAM_THRESHOLD)) return;

  await deleteSpam(msg, verdict);

  // Escalation: on a DELETED spam image, run the strict independent confirm and only
  // then remove (ban) the member. Two agreeing gates ≈ "100% confirmation".
  if (!GENERAL_BAN) return;
  let confirm;
  try {
    confirm = await confirmBanImage(base64);
  } catch (e) {
    log(`  (general) ban re-check unavailable (${e.message}) — deleted only, not removing`);
    return;
  }
  if (confirm.ban && confirm.certain) {
    await banSpammer(msg, confirm.reason || verdict.reason);
  } else {
    log(`  (general) ban NOT confirmed (ban=${confirm.ban} certain=${confirm.certain}) — deleted only`);
  }
}

// Core handler for one image-bearing message.
async function handle(msg, kind) {
  if (state.processed[msg.id]) return;
  const att = imageAttachment(msg);
  if (!att) return;

  const isTest = kind === "bottest";
  const isGeneral = kind === "general";
  const dmUserId = isTest ? BOTTEST_DM_USER : msg.author.id;
  const username = isTest ? "abraruleiman" : msg.author.username || String(msg.author.id);

  const chName = isTest ? "bot-test" : isGeneral ? "general" : "get-key";
  log(`→ image from ${msg.author.tag} in #${chName} — verifying…`);
  let image;
  try {
    image = await downloadImage(att.url);
  } catch (e) {
    log(`  ! image download error: ${e.message} — will retry later`);
    return;
  }

  let result;
  try {
    result = await callGrant({ username, imageBase64: image.base64, mimeType: image.mime, dryRun: DRY_RUN });
  } catch (e) {
    log(`  ! network error: ${e.message} — will retry later`);
    return; // leave unprocessed → retried on a later event/restart
  }
  const { ok, status, data } = result;

  // Cloud vision down (all providers failed / endpoint error) → try the SELF-HOSTED
  // Ollama fallback so we can still grant for free. If that's unavailable too, flag
  // for manual and leave UNPROCESSED so a transient outage self-heals on restart.
  if (!ok || data.error) {
    log(`  cloud vision error ${status}: ${String(data.error || "").slice(0, 90)}`);
    // #general: never post a manual-review reply and never delete on an unclear
    // result — a cloud outage must not touch a legit message. Leave it UNPROCESSED
    // so a later attempt can still grant a real proof.
    if (isGeneral) {
      log("  (general) vision unavailable — leaving message untouched");
      return;
    }
    if (OLLAMA_ENABLED && !DRY_RUN) {
      const handled = await tryOllamaFallback(msg, username, dmUserId, isTest, image.base64);
      if (handled) return;
    }
    await flagManual(msg, `vision unavailable (${status})`);
    return;
  }

  // A genuine verdict from a working cloud provider — this message is decided.
  state.processed[msg.id] = { at: Date.now() };
  saveState(state);

  if (DRY_RUN) {
    log(`  ✓ WOULD ${data.valid ? "grant" : "flag"} (${data.provider || "?"}: ${data.reason})`);
    return;
  }
  if (!data.valid) {
    log(`  ⚠ not verified (${data.provider || "?"}: ${data.reason})`);
    // #get-key/#bot-test: every image is a claimed proof, so a non-match is flagged
    // for a human. #general: images are mixed, so instead check if it's abusive spam
    // (and stay silent otherwise — no wrong "manual review" reply on normal chat).
    if (isGeneral) {
      await moderateGeneralImage(msg, image.base64);
      return;
    }
    await flagManual(msg, `not verified: ${data.reason}`);
    return;
  }
  const sent = await deliverKey(msg, dmUserId, data, isTest, data.provider || "?");
  state.granted[username] = { key: data.key, msgId: msg.id, dmUserId, sent, at: Date.now() };
  saveState(state);
}

// Self-hosted last resort: verify locally with Ollama, then mint via the endpoint's
// preVerified path. Returns true if it fully handled the message.
async function tryOllamaFallback(msg, username, dmUserId, isTest, base64) {
  let local;
  try {
    local = await verifyWithOllama(base64);
  } catch (e) {
    log(`  ⓘ ollama fallback unavailable (${e.message})`);
    return false;
  }
  log(`  ⓘ ollama(${OLLAMA_MODEL}): subscribed=${local.subscribed} — ${local.reason}`);
  if (!local.subscribed) {
    state.processed[msg.id] = { at: Date.now() };
    saveState(state);
    await flagManual(msg, `not verified (local: ${local.reason})`);
    return true;
  }
  let mint;
  try {
    mint = await callGrant({ username, preVerified: true, provider: `local:${OLLAMA_MODEL}`, reason: local.reason });
  } catch (e) {
    log(`  ! preVerified mint failed (${e.message})`);
    return false;
  }
  if (!mint.ok || !mint.data.valid || !mint.data.key) {
    log(`  ! preVerified mint bad response: ${JSON.stringify(mint.data).slice(0, 80)}`);
    return false;
  }
  state.processed[msg.id] = { at: Date.now() };
  const sent = await deliverKey(msg, dmUserId, mint.data, isTest, `ollama:${OLLAMA_MODEL}`);
  state.granted[username] = { key: mint.data.key, msgId: msg.id, dmUserId, sent, via: "ollama", at: Date.now() };
  saveState(state);
  return true;
}

// Startup backlog: process the last N image messages we haven't seen yet, so a
// restart never misses anything (and so a fresh deploy serves the current queue).
async function scanBacklog() {
  if (!BACKLOG_LIMIT) return;
  for (const [channelId, kind] of WATCH) {
    try {
      const ch = await client.channels.fetch(channelId);
      const msgs = await ch.messages.fetch({ limit: Math.min(BACKLOG_LIMIT, 100) });
      const ordered = [...msgs.values()].reverse(); // oldest → newest
      log(`backlog #${kind}: ${ordered.length} recent message(s)`);
      for (const m of ordered) {
        if (m.author?.bot) continue;
        if (!imageAttachment(m)) continue;
        if (state.processed[m.id]) continue;
        await handle(m, kind);
        await sleep(2500); // pace backlog calls under the vision free-tier per-minute limit
      }
    } catch (e) {
      log(`backlog #${kind} error: ${e.message}`);
    }
  }
}

// Startup health-check: verify every model #ai-help / #general depend on is still
// LIVE on Ollama Cloud. This is the early-warning system for the exact failure that
// broke #ai-help — a silently RETIRED model (gemma3:27b, 2026-07-15). If one is gone,
// it logs a loud, actionable warning (the rotation still routes around it live).
async function checkAiHelpModels() {
  if (!OLLAMA_CLOUD_API_KEY) {
    log("⚠ OLLAMA_CLOUD_API_KEY not set — #ai-help + #general spam moderation are OFF");
    return;
  }
  try {
    const r = await fetch("https://ollama.com/api/tags", { headers: { Authorization: `Bearer ${OLLAMA_CLOUD_API_KEY}` } });
    if (!r.ok) {
      log(`⚠ model health-check: /api/tags ${r.status} — skipping (rotation still active)`);
      return;
    }
    const d = await r.json();
    const live = new Set((d.models || []).map((m) => m.name));
    const wanted = [...new Set([...OLLAMA_CHAT_MODELS, SPAM_MODEL])];
    const missing = wanted.filter((m) => !live.has(m));
    if (missing.length) {
      log(`🚨 RETIRED/missing Ollama models: ${missing.join(", ")} — rotation skips them, but UPDATE OLLAMA_CHAT_MODELS / SPAM_MODEL (live models: ${d.models?.length || 0}). See runbook.`);
    } else {
      log(`✓ model health-check OK — chat=[${OLLAMA_CHAT_MODELS.join(", ")}] spam=${SPAM_MODEL} all live`);
    }
  } catch (e) {
    log(`⚠ model health-check failed: ${e.message} (rotation still active)`);
  }
}

client.once(Events.ClientReady, async (c) => {
  log(`✅ logged in as ${c.user.tag} · endpoint=${ENDPOINT} · channels=[${[...WATCH.values()].join(", ")}] · dryRun=${DRY_RUN}`);
  await checkAiHelpModels();
  await scanBacklog();
  log("watching for new image posts…");
});

client.on(Events.MessageCreate, async (msg) => {
  try {
    if (msg.author.bot) return;
    // #ai-help AI support agent (text questions, its own channel).
    if (msg.channelId === AIHELP_CHANNEL) {
      await handleAiHelp(msg);
      return;
    }
    // #get-key / #bot-test image verification.
    const kind = WATCH.get(msg.channelId);
    if (!kind) return;
    if (!imageAttachment(msg)) return;
    await handle(msg, kind);
  } catch (e) {
    log("handler error:", e.message);
  }
});

// Tiny HTTP health endpoint — lets the bot run on a PaaS free tier (which expects a
// listening port / health check) and be kept awake by an uptime pinger. Harmless on
// a VM or local. Set PORT via env (most PaaS inject it).
require("http")
  .createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("gameloop get-key bot: alive");
  })
  .listen(process.env.PORT || 8080, () => log(`health endpoint on :${process.env.PORT || 8080}`));

if (!TOKEN) {
  console.error("No bot token. Put it in ./.discord-token or set DISCORD_BOT_TOKEN.");
  process.exit(1);
}
client.login(TOKEN).catch((e) => {
  console.error("login failed:", e.message);
  process.exit(1);
});
