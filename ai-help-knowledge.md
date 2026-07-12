# GameLoop Optimizer — help knowledge base (for the #ai-help AI)

The ONLY source of product facts the AI may use. 100% public / user-facing. Contains NOTHING
about how our app is built internally (no registry keys, services, engine code, backend, or
license internals). Be accurate, detailed, and genuinely helpful.

═══════════════════════════════════════════════════════════════════════════════
## 1) ABOUT
- **Name:** GameLoop Optimizer · Tagline: "Stop the Stutter. Start Winning." · by **Jeral Gaming**.
- **What:** a free Windows app that optimizes your PC so **PUBG Mobile on the GameLoop emulator**
  runs with higher, steadier FPS, less stutter, and lower ping jitter.
- **Typical results:** trims 130+ background Windows processes to ~55, cuts ping jitter ~20 ms,
  improves FPS stability ~23% (varies by PC).
- **Why it works:** GameLoop/PUBG Mobile PC is **CPU- and emulator-bound** (every Android
  instruction is translated to x86 live; the dGPU often idles). Biggest wins = freeing CPU/RAM,
  calming background apps, smoothing frame delivery.
- **Requirements:** Windows 10 / 11. **Download:** https://www.gameloopoptimizer.com

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
- **Won't get you banned:** it only tunes **Windows and GameLoop's own settings** — it never
  touches PUBG's game files, network packets, or memory. Not a cheat/hack/aimbot.
- **Anti-cheat is protected:** anti-cheat, networking, audio, login, and core security are
  excluded from any process reduction — the game still launches and connects normally.
- **Reversible:** changes are backed up first and restore in one click; Safe/Aggressive restore
  without a reboot, Max may need a reboot to fully restore.
- **Three levels:** Safe (conservative), Aggressive (bigger gain), Max (tournament-ready).
  **Low-end PCs usually see the biggest gains.**

═══════════════════════════════════════════════════════════════════════════════
## 4) GAMELOOP ENGINE SETTINGS — what each does (Settings → Engine, gear top-right)
**Any engine change needs a FULL emulator restart (close + relaunch) to take effect.**
- **Virtualization (Intel VT-x / AMD SVM): MUST be ON** (BIOS) — required for the Android VM.
- **Render mode:** **Smart** = best default for most modern GPUs. **OpenGL+** = better for
  older/integrated GPUs and the #1 fix for black/pink/flicker/blank screens. (Some GameLoop
  versions label these DirectX+/OpenGL+ — try both, keep the steadier one.)
- **Resolution:** render size. Higher = sharper but heavier. 1280×720 (low-end) → 1920×1080 →
  2560×1440 (high-end).
- **Frame rate cap:** 30 / 60 / High(90) / Extreme(120). Must be raised in the engine BEFORE
  PUBG will expose 90/120 in-game.
- **Anti-Aliasing (AA):** smooths edges, costs bandwidth. **Off on ≤4 GB VRAM and all
  integrated GPUs; On only on 6 GB+ discrete cards.**
- **Memory (RAM to the VM):** 4 GB safe default (3 GB if the PC only has 8 GB total).
- **CPU cores:** **leave 2 cores free for Windows** (cores to assign = physical core count − 2,
  e.g. 4-core→2, 6-core→4, 8-core→6). Giving it ALL cores causes stutter/instability (Windows
  has no spare cycles for the VM).
- **DPI:** UI/text scaling; raise with higher resolutions to keep text crisp.

═══════════════════════════════════════════════════════════════════════════════
## 5) RECOMMENDED SETTINGS BY HARDWARE TIER
| Tier | Resolution | FPS | Render | AA | Typical FPS |
|---|---|---|---|---|---|
| Very low-end (dual-core, weak iGPU) | 1280×720 | 30 | OpenGL+ | Off | 20–30 |
| Low-end iGPU (UHD/Vega mobile) | 1280×720 | 40–60 | OpenGL+/Smart | Off | 25–45 |
| Strong iGPU / entry dGPU | 1600×900 | 60 | Smart | Off | 45–70 |
| Mid-range dGPU (4 GB) | 1920×1080 | 60 | Smart | Off | 50–75 |
| Upper-mid dGPU (6 GB) | 1920×1080 | 90 | Smart | On | 80–100 |
| High-end dGPU (8–12 GB) | 2560×1440 | 120 | Smart | On | 120+ (emulator-capped) |

**Key principle:** it's CPU/emulator-bound, not GPU-bound. On mid/high-end GPUs the ceiling is
the emulator's translation layer + your CPU single-thread speed. Cards from RTX 2060 / RX 5700
XT up are effectively overkill and won't be fully used.

═══════════════════════════════════════════════════════════════════════════════
## 6) PER-GPU / PER-CPU RECIPES (Resolution · DPI · FPS · Render · AA · expected in-game FPS)
### NVIDIA desktop
- GTX 1630 4GB → 1600×900 · 220 · 60 · Smart · Off · 45–60
- GTX 1050 Ti 4GB → 1600×900 · 220 · 60 · Smart · Off · 50–65
- GTX 1650 4GB → 1920×1080 · 240 · 60 · Smart (OpenGL+ fallback) · Off · 55–70
- GTX 1650 Super → 1920×1080 · 240 · 60 · Smart · Off · 55–75
- GTX 1060 3/6GB → 1920×1080 · 240 · 60 · Smart · Off (On on 6GB) · 60–80
- GTX 1070 8GB → 1920×1080 · 260 · 90 · Smart · On · 80–100
- GTX 1080 8GB → 2560×1440 · 300 · 90 · Smart · On · 85–110
- GTX 1660 Super/Ti 6GB → 1920×1080 · 260 · 90 · Smart · On · 80–100
- RTX 2060 6GB → 1920×1080 · 280 · 120 · Smart · On · 100–130
- RTX 2070 / Super / 2080 → 2560×1440 · 300–320 · 120 · Smart · On · 110–130+
- RTX 3050 6/8GB → 1920×1080 · 260 · 90 · Smart · On · 85–110
- RTX 3060 6/12GB → 2560×1440 · 320 · 120 · Smart · On · 100–120 @1440p (144+@1080p)
- RTX 3060 Ti / 3070 / 3080 → 2560×1440 · 320 · 120 · Smart · On · 120+
- RTX 4060 / 4060 Ti / 4070 / 4070 Super → 2560×1440 · 320 · 120 · Smart · On · 120+ (144+@1080p)

### NVIDIA laptop
- MX350/MX450 2GB → 1600×900 · 200 · 60 · Smart (OpenGL+ fallback) · Off · 35–60
- MX550 2GB → 1920×1080 · 220 · 60 · Smart · Off · 45–60
- GTX 1650 laptop 4GB → 1920×1080 · 240 · 60 · Smart (OpenGL+ fallback) · Off · 50–65
- GTX 1660 Ti laptop 6GB → 1920×1080 · 260 · 90 · Smart · On · 75–95
- RTX 2050 / 3050 laptop 4GB → 1920×1080 · 240 · 60 · Smart · Off · 50–75
- RTX 3060 laptop 6GB → 1920×1080 · 280 · 90 · Smart · On · 80–100
- RTX 4050 laptop 6GB → 1920×1080 · 280 · 90 · Smart · On · 85–110
- RTX 4060 laptop 8GB → 2560×1440 · 320 · 120 · Smart · On · 100–130

### AMD desktop
- RX 570 / 580 / 5500 XT 4-8GB → 1920×1080 · 240 · 60 · Smart · Off · 50–75
- RX 6500 XT 4GB → 1920×1080 · 240 · 90 · Smart · Off · 75–95
- RX 6600 8GB → 1920×1080 · 280 · 120 · Smart · On · 100–130
- RX 5700 XT / 6650 XT 8GB → 1920–2560 · 280–300 · 120 · Smart · On · 100–130
- RX 6700 XT 12GB → 2560×1440 · 320 · 120 · Smart · On · 120+
- *AMD note:* prefer Smart over forcing OpenGL+; keep Adrenalin driver current (old builds had OpenGL regressions).

### Integrated GPUs / APUs
- Intel UHD 600 (Celeron N4020) → 1280×720 · 160 · 30 · OpenGL+ · Off · 20–30
- Intel UHD 620 → 1280×720 · 160 · 40 · OpenGL+ · Off · 25–40
- Intel UHD 630 / 770 → 1280×720 · 180 · 60 · OpenGL+ · Off · 30–50
- Intel Iris Xe / Xe G4 → 1280×720–1600×900 · 180–200 · 60 · Smart · Off · 35–60
- Intel Arc A370M / A750 → 1920×1080 · 240–260 · 60–90 · Smart · Off/On · 50–110
- AMD Vega 3 → 1280×720 · 160 · 30 · OpenGL+ · Off · 20–30
- AMD Vega 7/8 (5600G/5700G) → 1280×720–1600×900 · 180–200 · 60 · Smart · Off · 40–70
- Radeon 680M/780M (RDNA2/3) → 1600×900–1920×1080 · 220–240 · 60 · Smart · Off · 50–75

### CPU-led (FPS scales with paired GPU)
- i5-10400 → 1920×1080 · 260 · 90 · Smart · On · 80–110
- i7-9750H → 1920×1080 · 260 · 90 · Smart · On · 75–100
- Ryzen 5 4600H → 1920×1080 · 260 · 90 · Smart · On · 70–100
- Ryzen 7 5800H → 1920×1080 · 280 · 120 · Smart · On · 90–130

═══════════════════════════════════════════════════════════════════════════════
## 7) CROSS-CUTTING HARDWARE RULES
- **Integrated GPUs need dual-channel RAM** — a single stick roughly HALVES FPS. Use 2 matched sticks.
- **RAM speed is the biggest lever for APUs** — DDR4-3200/3600+, DDR5, LPDDR5X can add 20–40% iGPU FPS.
- **BIOS iGPU memory (UMA buffer):** set to 2 GB where the option exists (default often 512 MB).
- **Laptops:** run on **AC power** (battery can halve FPS), **High Performance** plan, cooler pad,
  lift for airflow — **thermal throttle is the #1 laptop enemy** (a cooler pad can recover 8–12 FPS).
- **Confirm the dGPU is actually in use** (Task Manager while gaming) — laptops sometimes fall back to the iGPU.
- **Update GPU drivers from the vendor site** (NVIDIA/AMD/Intel), not Windows Update.
- **Intel Arc:** use a recent driver (2023+ OpenGL big improvements); enable ResizableBAR on 12th-gen+.
- **Lock FPS to your monitor refresh**; **close Chrome/Discord/media players** before launching (esp. on iGPUs).

═══════════════════════════════════════════════════════════════════════════════
## 8) BEST IN-GAME PUBG MOBILE SETTINGS (PUBG → Settings → Graphics)
- **Max/stable FPS:** Graphics = **Smooth**, Frame Rate = **Extreme** (higher tiers cap FPS lower).
- **90/120 FPS only appear on the Smooth preset** (higher-quality tiers max at 60).
- **Unlock 90 FPS:** engine Frame Rate High/Extreme + res ≥720p → restart → in-game Graphics=Smooth
  → update PUBG to latest.
- **Unlock 120 FPS:** engine Frame Rate Extreme(120) + res ≥720p → restart → Graphics=Smooth →
  fully update PUBG; on some profiles Style=Colorful/Classic helps expose it.
- **Weak hardware / crashes:** Graphics=Smooth, Frame Rate=Medium, disable HDR.
- **Style=Colorful** uses smaller textures (loads faster; helps on slow disks).
- **Graphics panel greyed out?** return fully to lobby (a match/loading locks it), relaunch; Repair PUBG if stuck.

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
