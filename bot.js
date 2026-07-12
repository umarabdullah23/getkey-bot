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

const CH = { getkey: "1520501551951773716", bottest: "1525793934272499742" };
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

const active = (process.env.BOT_CHANNELS || "getkey,bottest").split(",").map((s) => s.trim());
const WATCH = new Map(); // channelId -> "getkey" | "bottest"
if (active.includes("getkey")) WATCH.set(CH.getkey, "getkey");
if (active.includes("bottest")) WATCH.set(CH.bottest, "bottest");

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
const VISION_PROMPT =
  'A user submitted this screenshot to prove they SUBSCRIBED to the YouTube channel "Jeral Gaming". ' +
  'Do a LIGHT check. Does it plausibly show they are subscribed (a grey "Subscribed" button, often with a bell, ' +
  "or the channel name / a subscribe confirmation)? Be lenient but reject an obviously-unrelated image. " +
  'Respond with ONLY compact JSON, no markdown: {"subscribed": true|false, "reason": "<=12 words"}';
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

// Core handler for one image-bearing message.
async function handle(msg, kind) {
  if (state.processed[msg.id]) return;
  const att = imageAttachment(msg);
  if (!att) return;

  const isTest = kind === "bottest";
  const dmUserId = isTest ? BOTTEST_DM_USER : msg.author.id;
  const username = isTest ? "abraruleiman" : msg.author.username || String(msg.author.id);

  log(`→ image from ${msg.author.tag} in #${isTest ? "bot-test" : "get-key"} — verifying…`);
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

client.once(Events.ClientReady, async (c) => {
  log(`✅ logged in as ${c.user.tag} · endpoint=${ENDPOINT} · channels=[${[...WATCH.values()].join(", ")}] · dryRun=${DRY_RUN}`);
  await scanBacklog();
  log("watching for new image posts…");
});

client.on(Events.MessageCreate, async (msg) => {
  try {
    const kind = WATCH.get(msg.channelId);
    if (!kind) return;
    if (msg.author.bot) return;
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
