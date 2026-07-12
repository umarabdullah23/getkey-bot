# GameLoop Optimizer — help knowledge base (for the #ai-help AI)

This is the ONLY source of product facts the AI may use. It is 100% public / user-facing.
It contains NOTHING about how our app is built internally. Be ultra-detailed and helpful.

═══════════════════════════════════════════════════════════════════════════════
## 1) ABOUT THE APP
- **Name:** GameLoop Optimizer · Tagline: "Stop the Stutter. Start Winning." · by **Jeral Gaming**.
- **What it is:** a free Windows app that optimizes your PC so **PUBG Mobile on the
  GameLoop emulator** runs with higher, more stable FPS, less stutter, and lower ping jitter.
- **Typical results:** trims 130+ background Windows processes to ~55, cuts ping jitter by
  ~20 ms, and improves FPS stability by ~23%. (Varies by PC.)
- **Why it works for GameLoop:** GameLoop/PUBG Mobile PC is **CPU- and emulation-bound**
  (the dGPU often idles). The biggest wins come from freeing CPU + RAM, calming background
  apps, and smoothing frame delivery — which the app automates and tunes for you.
- **Download:** https://www.gameloopoptimizer.com (the download is always free). Windows only.
- **Community:** Discord https://discord.gg/4dYbYGM7wh · YouTube https://www.youtube.com/@jeralgaming853

═══════════════════════════════════════════════════════════════════════════════
## 2) PRICING (current)
- **Subscriber — $0, FREE for life.** Includes SAFE + AGGRESSIVE process reduction forever,
  and your **first 15 days unlock FULL access free** (Process Reduce MAX + the full
  Run-All-Safe set + Run-All-Aggressive). After 15 days it stays free on the SAFE +
  AGGRESSIVE baseline. **How to get it:** subscribe to **Jeral Gaming on YouTube**
  (@jeralgaming853), then post a screenshot of your subscription in **#get-key** — the bot
  verifies it and DMs you a **lifetime key** automatically.
- **Pro — $1.99 / month** (launch price, was $4.99). Full power billed monthly.
- **Pro — $5 / 3 months** (launch price, was $11.99 — about **$1.67/mo**, best value).
- **Pro unlocks (permanently):** the full **Process Reduce ladder** (incl. MAX), hardware-aware
  tweaks, the **Save Editor**, and everything unlocked forever.
- Pricing/checkout: on the website. For questions, contact the owner (section 8).

═══════════════════════════════════════════════════════════════════════════════
## 3) WHAT THE APP DOES (features)
- **One-click optimize** — applies a safe bundle of tweaks instantly.
- **Process/Service reduction** (SAFE / AGGRESSIVE / MAX) — quiets background apps that steal
  CPU/RAM during a session. WiFi, sound, and login stay protected; temp modes fully restore on reboot.
- **Runtime Boost** — priority + timer/scheduling tweaks for smoother frame pacing while you play.
- **ADB tweaks** — in-emulator tweaks (disable animations, disable Facebook, HW overlays, bg
  process limit) for extra FPS.
- **Hardware-aware** — adapts to your CPU/GPU/RAM. Save Editor (Pro). Everything guided + reversible.

═══════════════════════════════════════════════════════════════════════════════
## 4) BEST GAMELOOP ENGINE SETTINGS (Settings → Engine) — detailed
- **Virtualization (VT / AMD-V / SVM): MUST be ON.** GameLoop's engine relies on it; without
  it you get low FPS or "engine failed to start." Enable it in BIOS (section 6).
- **Rendering:** try **DirectX+** first (best on most modern GPUs). On **older GPUs, OpenGL+**
  can be smoother — test both and keep whichever gives higher, steadier FPS.
- **Memory (RAM):** set as high as your PC allows. Rough guide: 8 GB RAM → ~4096 MB; 16 GB+ →
  ~8192 MB. Don't allocate so much that Windows starves.
- **Processor (CPU cores):** set to Maximum / all available cores for PUBG.
- **Anti-aliasing: OFF** (big FPS win in the engine).
- **Resolution:** low-end PCs → **SD 720p**; only go 1080p on a strong GPU (higher res = more
  CPU/GPU load = fewer FPS).
- **Frame rate:** set the highest your PC holds steadily — **90 or 120 FPS** if supported, else
  a stable **60 FPS**.
- **Shadow quality: Low or Off.** DPI/scaling default. Restart GameLoop after changing engine settings.

═══════════════════════════════════════════════════════════════════════════════
## 5) BEST IN-GAME PUBG MOBILE SETTINGS (Graphics menu) — detailed
- **Graphics:** Smooth · **Frame Rate:** Extreme / Ultra / 90 (highest your PC holds).
- **Style:** Classic or Colorful.
- **Anti-Aliasing: Disabled** · **Auto-Adjust Graphics: ON** (lets it hold FPS).
- Turn **OFF** shadows and heavy effects. Lower brightness/effects if you still dip.
- Aim to match the in-game frame-rate cap to what the engine + PC can sustain (steady beats high).

═══════════════════════════════════════════════════════════════════════════════
## 6) WINDOWS / SYSTEM OPTIMIZATION (the free FPS wins the app automates)
- **Close background apps** before playing (browsers, downloads, Discord overlay, RGB apps,
  launchers). This is the single biggest free FPS gain.
- **Install GameLoop on an SSD** (huge boost vs HDD — faster load, less stutter).
- **Power plan: High Performance / Ultimate** (laptops: plug in the charger).
- **Update your GPU driver** (NVIDIA/AMD/Intel) to the latest.
- Background CPU hogs like **Windows Defender real-time scan, SmartScreen, Superfetch/SysMain,
  and heavy startup apps** can cause stutter/FPS drops during a match — the optimizer safely
  quiets these for the session and restores them after.
- Set GameLoop's process priority to High (Runtime Boost does this) and keep the GPU set to the
  discrete card if you have one.
- **BIOS:** enable Virtualization (Intel **VT-x/VT-d**, AMD **SVM**) and XMP/EXPO for RAM speed.

═══════════════════════════════════════════════════════════════════════════════
## 7) NETWORK / PING (smoother online play)
- Prefer **wired Ethernet** over WiFi; if on WiFi, use 5 GHz and sit near the router.
- Close bandwidth hogs (streaming, downloads, other devices) during matches.
- A stable connection beats a fast one — the optimizer reduces ping **jitter** for steadier play.

═══════════════════════════════════════════════════════════════════════════════
## 8) COMMON GAMELOOP PROBLEMS & DETAILED FIXES
- **"TGB engine failed to start" / initialization failed / stuck on launch / black or white
  screen / "VT-x/AMD-V" or "virtualization must be enabled":** almost always **Virtualization
  is OFF**. Fix: reboot → BIOS (Del/F2/F10 at boot) → enable Intel VT-x/VT-d or AMD SVM → save.
  Also: disable Windows **Hyper-V / Virtual Machine Platform / Memory Integrity** if they
  conflict, update GPU driver, run GameLoop as **Administrator**.
- **Low FPS / lag spikes / stutter / FPS drops after an update:** close background apps, raise
  engine Memory/CPU, set high frame-rate + AA off + shadows off, update GPU driver, move to SSD,
  High-Performance power, and run the optimizer. Reinstall GameLoop if a bad update caused it.
- **High CPU usage:** trim background apps + startup, run process reduction, don't over-allocate cores.
- **No sound:** check Windows default playback device, restart GameLoop, update audio drivers.
- **Mouse / keyboard not working, keymapping broken:** reset key mapping to default, restart
  GameLoop, run as Admin, disable conflicting overlays.
- **Crash on startup / mid-match, "aow exe has stopped working", errors 0x80004005 / 1308 /
  0x800704c7:** update GameLoop to latest, update GPU driver, enable virtualization, add GameLoop
  to antivirus exclusions, and clean-reinstall if it persists.
- **Stuck updating (99% / 98%) / installation failed / Tencent installer failed / network error:**
  check internet + DNS (try 8.8.8.8), temporarily disable VPN, run as Admin, retry; clean reinstall fixes most.
- **Anti-cheat not initialized:** update GameLoop, enable virtualization, run as Admin, disable
  conflicting VMs/antivirus.
- **Per-error and per-GPU step-by-step guides:** https://www.gameloopoptimizer.com (Fix + Optimize pages).

═══════════════════════════════════════════════════════════════════════════════
## 9) APP / KEY TROUBLESHOOTING
- **"Invalid or unreachable key":** be online (the app re-checks the key each launch over a
  secure connection). If it persists, it's usually a temporary network/clock issue — try again,
  or contact the owner.
- **Lost key / key not working / want to upgrade to Pro:** contact the owner to sort it.
- **Where do I enter the key:** the activation box appears when you open the app.

═══════════════════════════════════════════════════════════════════════════════
## 10) SUPPORT / CONTACT
For anything you can't resolve, or key/account/Pro issues, tell the user to reach out to the
**owner & developer (umarabdullahmansoori)** in the GameLoop Optimizer Discord server.
Do NOT paste a personal Discord user link in your replies.
