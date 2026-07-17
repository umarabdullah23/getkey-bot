# GameLoop Optimizer — help knowledge base (for the #ai-help AI)

The ONLY source of product facts the AI may use. 100% public / user-facing. Contains NOTHING
about how our app is built internally (no registry keys, services, engine code, backend, or
license internals). Be accurate, detailed, and genuinely helpful.

═══════════════════════════════════════════════════════════════════════════════
## 1) ABOUT
- **Name:** GameLoop Optimizer · Tagline: "Stop the Stutter. Start Winning." · by **Jeral Gaming**.
- **What:** a free Windows app that optimizes your PC so **PUBG Mobile on the GameLoop emulator**
  runs with higher, steadier FPS, less stutter, and lower ping jitter.
- **What it does (honestly):** frees CPU and RAM by trimming background Windows processes/services,
  applies safe performance tweaks, and smooths frame delivery. **Gains vary a lot by PC** — don't
  promise a fixed FPS or percentage. **Low-end and cluttered PCs usually benefit the most**;
  an already-clean high-end PC may see a smaller change. Never quote a specific FPS/percentage/
  process-count figure unless the user's own before/after shows it.
- **Why it works:** GameLoop/PUBG Mobile PC is **CPU- and emulator-bound** (every Android
  instruction is translated to x86 live; the dedicated GPU often idles). Biggest wins = freeing
  CPU/RAM, calming background apps, and smoothing frame delivery — NOT GPU driver tweaks.
- **Requirements:** Windows 10 / 11. **Download:** https://www.gameloopoptimizer.com
  (GameLoop Optimizer is a separate tool — the GameLoop emulator itself is Tencent's, from
  gameloop.com.)

═══════════════════════════════════════════════════════════════════════════════
## 2) PRICING
- **Subscriber — $0, free for life** (SAFE + AGGRESSIVE optimization forever; first 15 days
  unlock FULL access free). Unlocked by subscribing to Jeral Gaming on YouTube then posting a
  screenshot in #get-key — but only explain this route if the user explicitly asks for a FREE key.
- **Pro — $1.99 / month** (launch, was $4.99).
- **Pro — $5 / 3 months** (launch, was $11.99 — ~$1.67/mo, best value).
- **Pro unlocks (permanently):** the full optimization ladder incl. MAX, hardware-aware tweaks,
  the Save Editor, everything forever.

═══════════════════════════════════════════════════════════════════════════════
## 3) FEATURES & SAFETY (safe to share)
- **One-click optimize**, **process/service reduction** (Safe / Aggressive / Max), **Runtime
  Boost** (smoother frame pacing), **ADB tweaks** (in-emulator FPS tweaks), **hardware-aware**
  tuning, **Save Editor** (Pro).
- **Not a cheat/hack/aimbot:** it only tunes **Windows and GameLoop's own settings** — it does not
  touch PUBG's game files, network packets, or memory, so it doesn't do the kind of thing that
  gets accounts banned for cheating. (Only describe features that are listed here — never claim
  the app does anything it doesn't.)
- **Anti-cheat is protected:** anti-cheat, networking, audio, login, and core security are
  excluded from any process reduction — the game still launches and connects normally.
- **Reversible:** changes are backed up first and restore in one click; Safe/Aggressive restore
  without a reboot, Max may need a reboot to fully restore.
- **Three levels:** Safe (conservative), Aggressive (bigger gain), Max (most aggressive).
  **Low-end / cluttered PCs usually see the biggest gains; results vary by PC — don't promise a
  specific number.**

═══════════════════════════════════════════════════════════════════════════════
## 4) GAMELOOP ENGINE SETTINGS — what each does (Settings → Engine, gear top-right)
**Any engine change needs a FULL emulator restart (close + relaunch) to take effect.**
- **Virtualization (Intel VT-x / AMD SVM): MUST be ON** (enable in BIOS) — required for the
  Android VM. With it OFF, GameLoop falls back to a slow software layer (several times slower),
  which is the single biggest cause of low FPS.
- **Render mode / rendering:** GameLoop's real options are **Smart (Auto)**, **DirectX+**,
  **OpenGL+**, and plain **DirectX / OpenGL**. There is no universal "best" — it depends on your
  GPU, driver, and GameLoop version, so **try DirectX+ and OpenGL+ and keep whichever is steadier**.
  Rough starting point: **DirectX+ often runs best on NVIDIA**, **OpenGL+ often best on AMD/Intel/
  integrated** — but verify on your own PC. **Smart (Auto)** is a safe default if unsure. Switching
  render mode is also the #1 fix for black/pink/flicker/blank screens.
- **Prioritize dedicated/discrete GPU: ON** if you have a separate NVIDIA/AMD card (especially on
  laptops) — stops GameLoop from rendering on the weaker integrated GPU.
- **Rendering cache / render optimization: ON** where the option exists — reduces hitching.
- **Resolution:** render size. Higher = sharper but heavier. 1280×720 (low-end) → 1600×900 →
  1920×1080 → 2560×1440 (high-end). Lowering resolution is one of the most effective FPS fixes.
- **Frame rate (FPS):** the engine cap — typically **60 / 90 / 120** (some builds show 144, but
  PUBG Mobile itself tops out at 120). You must raise this in the engine FIRST before PUBG will
  offer 90/120 in-game.
- **Anti-Aliasing (AA):** smooths edges but costs performance. **Turn it OFF for max/steadier
  FPS** — recommended off on all integrated GPUs and ≤4 GB cards; only turn it On on a strong
  6 GB+ discrete card if you have FPS headroom to spare.
- **Memory (RAM to the VM):** **never more than half your total RAM.** Use **4096 MB (4 GB) on an
  8 GB PC**, **8192 MB (8 GB) on 16 GB+**. Too much starves Windows and causes stutter.
- **CPU / processor (cores):** more cores can help, but **leave headroom for Windows** — don't
  assign literally every core. A safe rule: 4-core → assign ~2, 6-core → ~4, 8-core → ~6.
  Over-allocating (all cores to the VM) is a common cause of stutter, freezes, and the engine
  restarting. If you're unsure, GameLoop's default core count is fine.
- **DPI:** UI/text scaling only (doesn't change FPS). Match it to your resolution so text stays
  crisp: roughly **240 at 720p, 320 at 1080p, 480 at 1440p**.

═══════════════════════════════════════════════════════════════════════════════
## 5) RECOMMENDED SETTINGS BY HARDWARE TIER
"FPS cap" is the target you SET in the engine, not a promise of measured FPS. Real FPS depends
mostly on your CPU single-thread speed (it's emulator-bound). Use these as starting points and
tune from there.
| Tier | Resolution | FPS cap | Render | AA |
|---|---|---|---|---|
| Very low-end (dual-core, weak iGPU) | 1280×720 | 60 | OpenGL+ | Off |
| Low-end iGPU (UHD/Vega mobile) | 1280×720 | 60 | OpenGL+ / Smart | Off |
| Strong iGPU / entry dGPU | 1600×900 | 60 | Smart / DirectX+ | Off |
| Mid-range dGPU (4 GB) | 1920×1080 | 90 | DirectX+ / Smart | Off |
| Upper-mid dGPU (6 GB) | 1920×1080 | 120 | DirectX+ / Smart | Off (On if headroom) |
| High-end dGPU (8 GB+) | 1920×1080–1440p | 120 | DirectX+ / Smart | Off (On if headroom) |

**Key principle:** it's CPU/emulator-bound, not GPU-bound. On mid/high-end GPUs the ceiling is
the emulator's translation layer + your CPU single-thread speed, so a strong card (RTX 2060 /
RX 5700 XT and up) is often only partly used — a faster CPU matters more than a faster GPU here.
**Don't promise specific FPS from a GPU upgrade.** For high FPS, a 90 Hz+ / 120 Hz+ monitor is
also needed to actually SEE 90/120 FPS.

═══════════════════════════════════════════════════════════════════════════════
## 6) PER-GPU / PER-CPU STARTING RECIPES (Resolution · FPS cap · Render · AA)
These are **starting points**, not FPS guarantees. Set DPI by resolution (§4), and remember the
CPU is usually the real limit. Always tell the user to test both render modes and keep the
steadier one. "FPS cap" is what to set in the engine, not a measured result.
### NVIDIA desktop
- GTX 1050 Ti / 1630 4GB → 1600×900 · 60 · DirectX+ (OpenGL+ fallback) · Off
- GTX 1650 / 1650 Super 4GB → 1920×1080 · 60 · DirectX+ · Off
- GTX 1060 3/6GB → 1920×1080 · 60–90 · DirectX+ · Off
- GTX 1660 Super/Ti 6GB → 1920×1080 · 90 · DirectX+ · Off
- GTX 1070 / 1080 8GB → 1920×1080 · 90 · DirectX+ · Off (On if headroom)
- RTX 2060 / 3050 6-8GB → 1920×1080 · 120 · DirectX+ · Off
- RTX 2070 / 2080 → 1920×1080 · 120 · DirectX+ · Off (On if headroom)
- RTX 3060 6/12GB → 1920×1080 · 120 · DirectX+ · Off (On if headroom)
- RTX 3060 Ti / 3070 / 3080 → 1920×1080–1440p · 120 · DirectX+ · Off (On if headroom)
- RTX 4060 / 4060 Ti / 4070 (+ Super) → 1920×1080–1440p · 120 · DirectX+ · Off (On if headroom)

### NVIDIA laptop (also enable "Prioritize dedicated GPU" + run on AC power)
- MX350 / MX450 / MX550 2GB → 1600×900–1080p · 60 · DirectX+ (OpenGL+ fallback) · Off
- GTX 1650 laptop 4GB → 1920×1080 · 60 · DirectX+ (OpenGL+ fallback) · Off
- GTX 1660 Ti laptop 6GB → 1920×1080 · 90 · DirectX+ · Off
- RTX 2050 / 3050 laptop 4GB → 1920×1080 · 60–90 · DirectX+ · Off
- RTX 3060 / 4050 laptop 6GB → 1920×1080 · 90–120 · DirectX+ · Off
- RTX 4060 laptop 8GB → 1920×1080 · 120 · DirectX+ · Off (On if headroom)

### AMD desktop (prefer OpenGL+; keep Adrenalin driver current)
- RX 570 / 580 / 5500 XT 4-8GB → 1920×1080 · 60–90 · OpenGL+ / Smart · Off
- RX 6500 XT 4GB → 1920×1080 · 90 · OpenGL+ / Smart · Off
- RX 6600 / 6650 XT 8GB → 1920×1080 · 120 · OpenGL+ / Smart · Off
- RX 5700 XT 8GB → 1920×1080 · 120 · OpenGL+ / Smart · Off
- RX 6700 XT 12GB → 1920×1080–1440p · 120 · OpenGL+ / Smart · Off (On if headroom)

### Integrated GPUs / APUs (see §7 — dual-channel RAM + RAM speed matter most here)
- Intel UHD 600 (Celeron N4020) → 1280×720 · 60 · OpenGL+ · Off
- Intel UHD 620 / 630 / 770 → 1280×720 · 60 · OpenGL+ · Off
- Intel Iris Xe → 1280×720–1600×900 · 60 · OpenGL+ / Smart · Off
- Intel Arc A-series → 1920×1080 · 90 · Smart / DirectX+ · Off (use a 2023+ driver)
- AMD Vega 3 → 1280×720 · 60 · OpenGL+ · Off
- AMD Vega 7/8 (5600G/5700G) → 1280×720–1600×900 · 60 · OpenGL+ / Smart · Off
- Radeon 680M/780M (RDNA2/3) → 1600×900–1920×1080 · 90 · OpenGL+ / Smart · Off

### CPU note (the real ceiling)
Because it's CPU-bound, a stronger CPU (higher single-thread speed) does more for FPS than a
stronger GPU. Fast modern CPUs (e.g. i5-12400+, Ryzen 5 5600+) comfortably target 90–120; older
quad-cores (i5-9400, Ryzen 5 2600 and below) are more comfortable at 60. Don't over-promise a
number — set the cap that matches the CPU tier and let the user test.

═══════════════════════════════════════════════════════════════════════════════
## 7) CROSS-CUTTING HARDWARE RULES
- **Integrated GPUs need dual-channel RAM** — a single stick roughly HALVES FPS. Use 2 matched sticks.
- **RAM speed is the biggest lever for APUs** — DDR4-3200/3600+, DDR5, LPDDR5X can add 20–40% iGPU FPS.
- **BIOS iGPU memory (UMA buffer):** set to 2 GB where the option exists (default often 512 MB).
- **Laptops:** run on **AC power** (battery mode can roughly halve FPS), **High Performance** plan,
  cooler pad, lift for airflow — **thermal throttling is the #1 laptop enemy** (cooling can recover
  a meaningful chunk of FPS; the exact amount varies by laptop).
- **Confirm the dGPU is actually in use** (Task Manager while gaming) — laptops sometimes fall back to the iGPU.
- **Update GPU drivers from the vendor site** (NVIDIA/AMD/Intel), not Windows Update.
- **Intel Arc:** use a recent driver (2023+ OpenGL big improvements); enable ResizableBAR on 12th-gen+.
- **Lock FPS to your monitor refresh**; **close Chrome/Discord/media players** before launching (esp. on iGPUs).

═══════════════════════════════════════════════════════════════════════════════
## 8) BEST IN-GAME PUBG MOBILE SETTINGS (PUBG → Settings → Graphics)
- **Graphics preset = Smooth** for max/steadiest FPS. Higher presets (Balanced / HD / HDR / Ultra
  HD) look nicer but LOCK you to lower frame-rate tiers — the highest FPS options only appear on
  **Smooth**.
- **Frame Rate ladder (real names, low → high):** Low → Medium → High → Ultra → **Extreme (≈60)**
  → **Extreme+ (≈90)** → **Ultra Extreme (≈120)**. Pick the highest one your PC holds steadily —
  a locked steady 60 feels better than a stuttery 90.
- **90 FPS = Extreme+** · **120 FPS = Ultra Extreme.** Note: 120 FPS usually applies **in-match
  only**; the lobby often caps at 90. You also need a **90 Hz+ / 120 Hz+ monitor** to actually see
  it.
- **Unlock 90 FPS:** engine FPS set to 90+ → restart emulator → in-game Graphics = Smooth →
  Frame Rate = Extreme+ → make sure PUBG is fully updated.
- **Unlock 120 FPS:** engine FPS set to 120 → restart → Graphics = Smooth → Frame Rate =
  **Ultra Extreme** → PUBG fully updated. If the 90/120 options don't appear, in GameLoop's
  **Model tab** pick a whitelisted high-refresh flagship device (e.g. an ASUS ROG Phone model),
  restart, and re-check — a generic model can hide the higher tiers.
- **Auto-Adjust Graphics: OFF** — leaving it on lets the game drop your frame rate when it thinks
  the "device" is warm, causing dips.
- **Style = Colorful** — higher contrast (easier to spot enemies) and uses lighter textures
  (loads faster on slow disks). Classic/Realistic are fine too; it's preference.
- **Weak hardware / crashing:** Graphics = Smooth, Frame Rate = Medium or High, HDR/Anti-Aliasing
  off.
- **Graphics panel greyed out?** return fully to the lobby (being in a match/loading locks it),
  then change it; relaunch or Repair PUBG if it stays locked.

═══════════════════════════════════════════════════════════════════════════════
## 9) WINDOWS / SYSTEM OPTIMIZATION (user-doable)
- **Power plan → High Performance / Ultimate** (updates sometimes reset it to Balanced).
- **Close background apps** (browsers, Discord + overlay, media, OneDrive/Google Drive sync); in
  Task Manager close anything >5% background CPU.
- **Update GPU/chipset/network/audio drivers** from vendor sites.
- **Run GameLoop as administrator** (fixes input capture, config writes, audio, many launch fails).
- **Enable virtualization** (BIOS: Intel VT-x / AMD SVM) + **Windows Hypervisor Platform** (Windows features).
- **Install GameLoop on an SSD** (huge vs HDD); keep **≥10 GB free** on that drive.
- Pagefile = System managed; keep **system clock/time zone correct** (Tencent CDN rejects skewed time).
- **Pause Windows automatic maintenance + scheduled AV scans** (stops rhythmic stutter); add the
  GameLoop folder to **AV exclusions** (its files are common false positives).
- `sfc /scannow` for corrupt system files; Windows Memory Diagnostic for BSOD/instability; keep Windows updated.

═══════════════════════════════════════════════════════════════════════════════
## 10) NETWORK / PING
- Public DNS **8.8.8.8 / 1.1.1.1**; **disable VPN/proxy/DNS tools** (top cause of network errors,
  login fails, blank Game Center, stuck downloads; PUBG also blocks many VPN nodes).
- **Allow GameLoop through Windows Firewall**; prefer **wired** over WiFi; reboot the router if errors persist.
- A stable connection beats a fast one — the app reduces ping **jitter** for steadier play.

═══════════════════════════════════════════════════════════════════════════════
## 11) COMMON ERRORS / SYMPTOMS → FIXES
**Universal first-aid:** run as admin · update GPU driver (vendor) · in Task Manager end stray
`AndroidEmulator.exe`/`AOW.exe`/`AppMarket.exe` then relaunch · pause 3rd-party AV · disable
VPN/proxy · Game Center → right-click PUBG → **Repair** · switch Render Mode (Smart↔OpenGL+) ·
lower engine Resolution to 720p & Memory to 4 GB · last resort: uninstall + reboot + reinstall latest from the official Tencent site.

**Startup / engine**
- *TGB engine failed to start* — admin; kill stray emulator/AppMarket; toggle VT-x/SVM off→reboot→on; update GPU driver; reinstall (rebuilds virtual disk).
- *Initialization failed* — fully close (tray white-paw); admin; pause AV; fix clock/time zone; reinstall.
- *Stuck on launch screen* — wait 2 min (first post-update boot is slow); check internet; admin; disable VPN; reinstall.
- *Stuck at 0% loading game* — wait 2 min (assets decompressing); close heavy CPU/disk apps; admin; Repair; free ≥10 GB.
- *Emulator not responding* — wait 30 s; kill AndroidEmulator/AOW; reboot; update GPU driver; lower res/memory.
- *Engine keeps restarting* — check Task Manager for a 100% CPU/RAM process; lower CPU cores by 2 & Memory to 4 GB; admin; reinstall (over-allocating cores causes this).
- *AOW.exe stopped working* — reboot; update GPU driver; switch Render Mode; clear GameLoop cache; Repair PUBG.
- *AOW.exe not found* — check AV quarantine & restore (false positive); reinstall; recreate shortcut; add folder to AV exclusions.

**Virtualization**
- *"Virtualization must be enabled" / VT-x / AMD-V not available* — BIOS (Del/F2/F10) → enable Intel VT-x or AMD SVM; enable Windows Hypervisor Platform; **close Docker/WSL2** (they hold the hypervisor); update motherboard BIOS; very old Celeron/Pentium may not support it.

**Install / update**
- *Installation failed / Error 1308 / Tencent installer failed / won't install on Win 11* — reboot; run installer as admin; pause AV **and** Defender real-time; fresh installer from official site; free ≥10 GB; remove leftovers first.
- *Error 0x800704C7* — stable internet; pause AV; admin; disable VPN; fresh installer.
- *Error 0x80004005* — reboot; admin; `sfc /scannow`; fully update Windows; reinstall.
- *Update stuck 99% / PUBG stuck 98%* — wait 2–5 min (final verify slow on HDD); relaunch as admin; pause AV (locks patch files); free ≥10 GB; Repair.
- *PUBG failed to update / can't download PUBG* — check internet, disable VPN; Repair; free ≥10 GB; pause AV; reinstall PUBG if needed.

**Crashes**
- *PUBG crashes on startup* — engine res 720p, Memory 4 GB, Render=Smart, AA Off, restart; Repair; update GPU driver; clean reinstall PUBG.
- *Crashes mid-match* — lower res/memory + AA Off; update GPU driver; close background apps; Repair (usually GPU-memory exhaustion).
- *Clicking Play does nothing* — relaunch as admin; Repair; kill stray processes; pause AV; reinstall PUBG.
- *Crashes on Win 11* — update GPU driver; admin; Render=Smart, res 720p; disable overlays (Discord/GeForce Exp/Afterburner); reinstall.
- *BSOD* — update GPU/chipset/network drivers; Windows Memory Diagnostic; lower res + Render=Smart; Event Viewer→System for the faulting driver (a driver crashes, not GameLoop).

**Display / rendering**
- *Black screen* — switch Render Mode (OpenGL+↔Smart); update GPU driver; admin; kill stray processes; reinstall.
- *White screen* — admin; disable VPN/proxy; switch Render Mode; update GPU driver; reinstall.
- *Pink/purple screen* — switch Render Mode; update GPU driver; clear cache; Graphics=Smooth + HDR off; reinstall last.
- *Textures not loading* — Repair; free ≥5 GB; Graphics=Smooth, Style=Colorful; clear cache; update GPU driver.
- *Flickering/tearing* — switch Render Mode; update GPU driver; V-Sync On for GameLoop in GPU panel; cap FPS to 60; disable overlays.
- *Resolution won't change* — Apply then FULLY restart emulator; check PUBG's in-game res; admin; reinstall to reset config.
- *Fullscreen not working* — admin; set Fullscreen in Settings→Display; disable overlays; update GPU driver; use Borderless Window workaround.

**Performance**
- *FPS drops / lag spikes* — res 720p, Frame Rate 60; close background apps; update GPU driver; High Performance plan; close >5% CPU apps.
- *High CPU / 100%* — CPU cores = physical−2; Graphics=Smooth 60 FPS; close apps; plug in + High Performance; fix cooling (throttle mimics CPU saturation).
- *High/climbing RAM* — Memory 4 GB (3 GB on 8 GB PC) + restart; close RAM-heavy apps; pagefile System managed; restart GameLoop every 1–2 h on long sessions.
- *100% disk* — wait 2–3 min after launch; pause cloud sync + Windows Update; free ≥10 GB; Graphics=Smooth; **move to SSD** if on HDD.
- *Stutters every few seconds* — Task Manager: find a process spiking on the same interval; pause Windows maintenance/AV scans; update GPU driver; test Graphics=Smooth.
- *Low FPS after a GameLoop/PUBG update* — reapply res/frame/render (updates reset them); update GPU driver; clear shader cache; Smooth/Medium then raise; roll back the version if it's a regression.
- *Lag after a Windows update* — reinstall vendor GPU driver (Windows Update may roll it back); recheck High Performance plan + engine settings; clear shader cache.
- *FPS locked at 60* — engine Frame Rate High/Extreme + restart; V-Sync Off for GameLoop; set monitor to native refresh; PUBG Graphics=Smooth + Frame Rate Extreme; update GPU driver.
- *90/120 FPS option missing* — see §8 unlock steps + update PUBG + Repair + update GPU driver.

**Input**
- *Keymapping not working* — Keymapping → Reset to default, re-add binds one by one; admin (global input); disable overlays; update GPU driver.
- *Mouse stuck/invisible* — press Esc/F1 to release then click back in; close overlays; admin (raw input); Keymapping→Reset; try another USB port.
- *Controller not working* — Settings→Gamepad, enable + confirm listed; unplug→reboot→replug; admin; update controller driver; disable Steam Input/DS4Windows/reWASD.

**Audio**
- *No sound* — check Windows Volume Mixer (not muted); admin; set correct default playback device; update audio driver; roll back audio driver if it broke after a Windows update.
- *Mic not working* — Windows Privacy→Microphone: allow desktop apps; admin; set mic as Default Communication Device; PUBG Audio→Voice Input=Microphone; update audio driver.
- *Voice chat not working* — enable Voice Chat + channel Team/All; mic privacy access; Default Communication Device; disable VPN/proxy (voice uses separate UDP); relaunch as admin.

**Anti-cheat / network / account**
- *Anti-cheat not initialized* — relaunch as admin; disable 3rd-party AV **and** Defender real-time; Repair; update GPU driver; reinstall.
- *Network error* — check internet; disable VPN/proxy/DNS tools; public DNS 8.8.8.8/1.1.1.1; allow through firewall; reboot router.
- *Login failed* — internet; disable VPN (blocked nodes); public DNS; allow through firewall; check PUBG server status if a code shows.
- *Account/profile not loading* — wait up to 5 min (busy servers); disable VPN/proxy + restart; public DNS; Repair; check for an outage.
- *Game Center blank* — disable VPN/proxy + relaunch (loads from Tencent CDN); public DNS; admin; allow through firewall; update GameLoop.
- *Stuck on loading screen (no spawn)* — wait the full load once; wired internet; Repair; Graphics=Smooth + Frame Rate Medium; reinstall PUBG if it keeps hanging.

═══════════════════════════════════════════════════════════════════════════════
## 12) SUPPORT
For anything you can't resolve, or key/account/Pro issues, tell the user to reach out to the
**owner & developer (umarabdullahmansoori)** in the GameLoop Optimizer Discord server.
Do NOT paste a personal Discord user link in your replies.
