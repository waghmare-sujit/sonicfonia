---
Made by: Sujit Waghmare
GitHub repo: https://github.com/waghmare-sujit/sonicfonia
Sonicfonia: false
---
# Sonicfonia — Complete Guide

<img src="https://img.shields.io/github/v/release/sujit-waghmare/sonicfonia?color=blue&style=flat" /><br><img src="https://img.shields.io/badge/Obsidian-v0.15.0+-purple?style=flat" /><br><img src="https://img.shields.io/badge/License-All_Rights_Reserved-red?style=flat" /><br><img src="https://img.shields.io/github/release-date/sujit-waghmare/sonicfonia?style=flat" /><br><img src="https://img.shields.io/badge/Mobile%20Friendly-Yes-brightgreen?style=flat" />

> **GitHub:** [waghmare-sujit](https://github.com/waghmare-sujit)
> **Version:** 1.0.0
> **load it within obsidian for better preview**
---

## Table of Contents

- [[#Installation|Installation]]
- [[#Plugin Settings|Plugin Settings]]

---

## Installation

^095eab

### Option A — Community Plugins (once published)

**Step 1** — `Settings → Community plugins → Browse`

**Step 2** — Search **Sonicfonia**

**Step 3** — Install, then toggle it **ON**

### Option B — Manual install

> You only need **3 files**. No build tools, no terminal.

**Step 1** — Download `main.js`, `manifest.json`, `styles.css` from the [latest release](https://github.com/waghmare-sujit/sonicfonia/releases/latest)

**Step 2** — Open your vault folder and navigate to:

```
YourVault/.obsidian/plugins/
```

**Step 3** — Create a new folder named exactly:

```
sonicfonia
```

**Step 4** — Paste the 3 files inside it:

```
YourVault/
└── .obsidian/
    └── plugins/
        └── sonicfonia/
            ├── main.js        ← the plugin logic
            ├── manifest.json  ← plugin identity
            └── styles.css     ← styling
```

**Step 5** — Open Obsidian and go to:

```
Settings → Community Plugins → Turn off Restricted Mode
```

**Step 6** — Find **Sonicfonia** in the installed plugins list and toggle it **ON**.

**Step 7** — You should see `Sonicfonia` appear in the bottom status bar.

> [!warning] If you already had the plugin installed and are updating `main.js`, always **toggle the plugin OFF then ON** after replacing the file. Obsidian caches the old version in memory until you do this.

---

## Plugin Settings

Go to `Settings → Sonicfonia` to configure:

### YouTube API

| Setting | Description |
|---|---|
| **YouTube Data API key** | Required for playlist support. Leave blank if using single videos only. |

### Playback

| Setting | Description |
|---|---|
| **Enable Sonicfonia by default** | If a note has no `Sonicfonia` property, this setting decides whether audio plays or not. |
| **Primary link (fallback)** | A YouTube video or playlist URL that plays when the note has no `YouTube Url` property. Great for background music across all notes. |
| **Shuffle playlist** | When ON, playlist tracks play in random order instead of sequential. |

### Repeat

| Setting | Description |
|---|---|
| **Limit repeat count** | Toggle ON to repeat a fixed number of times. Toggle OFF to loop forever. |
| **Default repeat count** | Slider from 1–10. Only visible when Limit repeat count is ON. |

---

## How to Use — Single Video

### Step 1 — Add properties to your note

Open any note. At the very top, add a frontmatter block like this:

```yaml
---
YouTube Url: https://www.youtube.com/watch?v=jfKfPfyJRdk
Sonicfonia: true
Repeat: true
---
```

### Step 2 — Navigate to the note

The moment you click on the note (or switch to it), Sonicfonia will automatically start playing the audio in the background.

You will see the status bar change to:

```
Sonicfonia: playing
```

### Step 3 — Control playback

| Action | How |
|---|---|
| **Stop** | Click the music ribbon icon on the left sidebar |
| **Play again** | Click the ribbon icon again |
| **Toggle** | Use command palette → `Sonicfonia: Toggle play / stop` |

### How Repeat works for single videos

```yaml
Repeat: true   # loops the video forever (or up to repeat count in settings)
Repeat: false  # plays once and stops
```

> If `Repeat` property is missing from the note, it defaults to `true` (looping).

---

## How to Use — Playlist

### Step 1 — Get a YouTube Playlist URL

Open any YouTube playlist and copy the URL from the browser. It should contain `list=` in it:

```
https://www.youtube.com/playlist?list=PLxxxxxxxxxxxxxxxxxxxxxx
```

You can also copy it from a video that's inside a playlist:

```
https://www.youtube.com/watch?v=jfKfPfyJRdk&list=PLxxxxxxxxxxxxxxxxxxxxxx
```

Both formats work.

### Step 2 — Add it to your note

```yaml
---
YouTube Url: https://www.youtube.com/playlist?list=PLxxxxxxxxxxxxxxxxxxxxxx
Sonicfonia: true
Repeat: true
---
```

### Step 3 — Add your API key in settings

Without an API key, playlists won't load. See [[#Getting a YouTube API Key]] below.

### Step 4 — Navigate to the note

Sonicfonia will:

1. Fetch all video IDs from the playlist via YouTube Data API
2. Shuffle them if shuffle is ON in settings
3. Load them all into a hidden 1px iframe
4. YouTube auto-advances through all tracks natively

The status bar shows your position in the queue:

```
Sonicfonia: playing [3/42]
```

### Navigating tracks manually

Use the command palette (`Ctrl+P` / `Cmd+P`) and search:

```
Sonicfonia: Next track
Sonicfonia: Previous track
```

---

## Frontmatter Properties Reference

Add these inside the `---` frontmatter block at the top of any note.

```yaml
---
YouTube Url: https://www.youtube.com/watch?v=XXXXXXXXXXX
Sonicfonia: true
Repeat: true
---
```

### YouTube Url

```yaml
YouTube Url: https://www.youtube.com/watch?v=XXXXXXXXXXX
# or
YouTube Url: https://youtu.be/XXXXXXXXXXX
# or
YouTube Url: https://www.youtube.com/playlist?list=PLxxxxxxxxxx
# or
YouTube Url: https://www.youtube.com/shorts/XXXXXXXXXXX
```

- Accepts any standard YouTube link format
- Can be a single video or a full playlist
- If missing, the **Primary link** from settings is used as fallback
- If both are missing, Sonicfonia shows a notice and stays silent

### Sonicfonia

```yaml
Sonicfonia: true    # audio is enabled for this note
Sonicfonia: false   # audio is disabled for this note
```

- Acts as an on/off switch per note
- If missing from the note, the plugin setting **Enable Sonicfonia by default** is used
- You can toggle this as a checkbox property in Obsidian's Properties panel

### Repeat

```yaml
Repeat: true    # loop (respects repeat count from settings)
Repeat: false   # play once and stop
```

- If missing, defaults to `true`
- For playlists: `Repeat: true` loops the entire playlist from the beginning after the last track
- You can toggle this as a checkbox property in Obsidian's Properties panel

---

## Getting a YouTube API Key

> Free. Takes about 5 minutes. No billing required for basic usage (10,000 units/day free).

**Step 1** — Go to Google Cloud Console:

```
https://console.cloud.google.com
```

**Step 2** — Create a new project:

```
Click "Select a project" (top left) → New Project → Give it any name → Create
```

**Step 3** — Enable the YouTube Data API v3:

```
Navigation Menu → APIs & Services → Library → Search "YouTube Data API v3" → Enable
```

**Step 4** — Create an API key:

```
APIs & Services → Credentials → Create Credentials → API Key
```

**Step 5** — Copy the key (looks like this):

```
AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

**Step 6** — Paste it in Obsidian:

```
Settings → Sonicfonia → YouTube Data API key → Paste → Done
```

> 💡 Optional: In Google Cloud Console, click **Edit API Key** and restrict it to only the YouTube Data API v3 for security.

---

## Commands & Shortcuts

Access all commands via `Ctrl+P` (Windows/Linux) or `Cmd+P` (Mac):

| Command | What it does |
|---|---|
| `Sonicfonia: Play audio for current note` | Manually trigger playback for the active note |
| `Sonicfonia: Stop audio` | Stop playback and remove the player |
| `Sonicfonia: Toggle play / stop` | Play if stopped, stop if playing |
| `Sonicfonia: Next track` | Skip to next track in playlist queue |
| `Sonicfonia: Previous track` | Go back to previous track in playlist queue |

> 💡 You can bind any of these to a custom hotkey via `Settings → Hotkeys → search "Sonicfonia"`.

---

## Status Bar

The status bar at the bottom of Obsidian shows Sonicfonia's current state:

| Status | Meaning |
|---|---|
| `Sonicfonia` | Idle — nothing playing |
| `Sonicfonia: loading…` | Fetching playlist from YouTube API |
| `Sonicfonia: playing` | Single video playing |
| `Sonicfonia: playing [3/42]` | Playlist playing, currently on track 3 of 42 |
| `Sonicfonia: paused` | Paused |

---

## Troubleshooting

### Audio doesn't start when I open a note

1. Check that `Sonicfonia: true` is in the note's frontmatter
2. Or check that **Enable Sonicfonia by default** is ON in settings
3. Make sure the `YouTube Url` property has a valid URL
4. Toggle the plugin OFF and ON in Community Plugins (clears memory cache)

### Playlist doesn't load

1. Confirm your **YouTube Data API key** is set in settings
2. Make sure the playlist is **public** (not unlisted or private)
3. Open Obsidian's developer console (`Ctrl+Shift+I`) and check for error messages

### It still plays the old song after I changed the URL

Obsidian detects the frontmatter change automatically, but if it doesn't:
- Switch away to another note and come back
- Or use `Sonicfonia: Stop audio` then `Sonicfonia: Play audio for current note`

### Plugin is not appearing in Community Plugins list

Make sure the folder is named exactly `sonicfonia` (all lowercase) and that all 3 files are inside it.

### I updated main.js but it's running the old code

You must toggle the plugin **OFF → ON** after replacing the file. Obsidian keeps the old code in memory until restart or toggle.

---

## FAQ

> [!question] **Q: Does it download the audio or video?**
> No. Sonicfonia plays a hidden 1px YouTube iframe — the audio streams directly from YouTube. Nothing is downloaded or saved.

> [!question] **Q: Will it work on Obsidian mobile?**
The iframe approach works on both desktop and mobile as long as you have an internet connection.

> [!question] **Q: Can I use a private YouTube playlist?**
No. The YouTube Data API only works with public or unlisted playlists. Private playlists require OAuth login which is not supported.

> [!question] **Q: The video has embedding disabled. What now?**
Some YouTube videos disable third-party embedding. There's no workaround — try a different video. Most music and ambient videos allow embedding.

> [!question] **Q: Can I have different songs on different notes?**
Yes. Each note can have its own `YouTube Url` property. Sonicfonia switches the audio automatically as you navigate between notes.

> [!question] **Q: Can I use a playlist URL as the global fallback?**
Yes. Paste a playlist URL into **Primary link** in settings. It will load the playlist for any Sonicfonia-enabled note that has no `YouTube Url` of its own.

> [!question] **Q: Does Sonicfonia work without an API key?**
Yes — for single videos only. The API key is only required when you use a playlist URL.
