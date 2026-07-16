# Sonicfonia

<img src="https://img.shields.io/github/v/release/sujit-waghmare/sonicfonia?color=blue&style=flat" /><br><img src="https://img.shields.io/badge/Obsidian-v0.15.0+-purple?style=flat" /><br><img src="https://img.shields.io/badge/License-All_Rights_Reserved-red?style=flat" /><br><img src="https://img.shields.io/github/release-date/sujit-waghmare/sonicfonia?style=flat" /><br><img src="https://img.shields.io/badge/Mobile%20Friendly-Yes-brightgreen?style=flat" />

Play YouTube audio for your notes, driven entirely by frontmatter properties. Supports single videos, playlists, shuffle, and repeat.

## What it does

Sonicfonia watches the active note. When you open or switch to a note with a `YouTube Url` property, it plays that audio in a hidden 1px iframe — no download, no video shown, just background audio tied to what you're reading.

## Installation

### From Community Plugins (recommended, once published)

1. `Settings → Community plugins → Browse`
2. Search for **Sonicfonia**
3. Install, then enable it

### Manual install

1. Download `main.js`, `manifest.json`, `styles.css` from the [latest release](https://github.com/waghmare-sujit/sonicfonia/releases/latest)
2. Create a folder named `sonicfonia` inside `YourVault/.obsidian/plugins/`
3. Put the three files in it
4. `Settings → Community plugins → Turn off Restricted mode`
5. Enable **Sonicfonia** in the installed plugins list

## Settings

Go to `Settings → Sonicfonia`:

| Setting | Description |
|---|---|
| **YouTube Data API key** | Required for playlist support. Leave blank if you only use single videos. |
| **Enable Sonicfonia by default** | Controls playback for notes with no `Sonicfonia` property. |
| **Primary link (fallback)** | A video or playlist URL played when a note has no `YouTube Url`. Good for a global background track. |
| **Shuffle playlist** | Randomizes playlist track order. |
| **Limit repeat count** | On repeats a fixed number of times; off loops forever. |
| **Default repeat count** | 1–10, only shown when repeat limiting is on. |

## Usage

### Single video

```yaml
---
YouTube Url: https://www.youtube.com/watch?v=jfKfPfyJRdk
Sonicfonia: true
Repeat: true
---
```

Open the note and audio starts automatically. Status bar shows `Sonicfonia: playing`.

### Playlist

```yaml
---
YouTube Url: https://www.youtube.com/playlist?list=PLxxxxxxxxxxxxxxxxxxxxxx
Sonicfonia: true
Repeat: true
---
```

Requires a YouTube Data API key (see below). Status bar shows queue position, e.g. `Sonicfonia: playing [3/42]`.

Both a bare playlist URL and `watch?v=...&list=...` work.

### Frontmatter reference

| Property | Values | Behavior |
|---|---|---|
| `YouTube Url` | video or playlist link | Falls back to **Primary link** setting if missing |
| `Sonicfonia` | `true` / `false` | Per-note on/off switch; falls back to the default setting if missing |
| `Repeat` | `true` / `false` | `true` loops (video, or whole playlist); defaults to `true` if missing |

## Commands

Available via the command palette (`Ctrl/Cmd+P`), and bindable to hotkeys:

- Play audio for current note
- Stop audio
- Toggle play / stop
- Next track
- Previous track

## Getting a YouTube API key

Only needed for playlists. Free, no billing required for normal use.

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. `APIs & Services → Library` → enable **YouTube Data API v3**
4. `APIs & Services → Credentials → Create Credentials → API Key`
5. Paste the key into `Settings → Sonicfonia → YouTube Data API key`

Optional: restrict the key to the YouTube Data API v3 in Cloud Console for extra safety.

## FAQ
<details>
<summary><strong>Does it download anything?</strong></summary>


No. It plays a hidden YouTube iframe; audio streams directly from YouTube.
</details>
<details>
<summary><strong>Does it work on mobile?</strong></summary>


Yes, same iframe approach, needs an internet connection.
</details>
<details>
<summary><strong>Can I use a private playlist?</strong></summary>


No, only public or unlisted playlists. The API doesn't support OAuth-gated private playlists here.
</details>
<details>
<summary><strong>A video won't play.</strong></summary>


Some videos disable third-party embedding. Try a different source.
</details>
<details>
<summary><strong>Different notes, different songs?</strong></summary>


Yes. Each note's YouTube Url overrides the global fallback.
</details>

## Troubleshooting
<details>
<summary><strong>No audio on note open</strong></summary>


Check Sonicfonia: true in frontmatter or the default setting, and that YouTube Url is valid.
</details>
<details>
<summary><strong>Playlist won't load</strong></summary>


Confirm the API key is set and the playlist is public.
</details>
<details>
<summary><strong>Old track keeps playing</strong></summary>


Switch notes and back, or run Sonicfonia: Stop audio then play again.
</details>

## License

See [LICENSE](./LICENSE). Free to use and modify for personal use; redistribution for sale is not permitted.

## Support
Building and maintaining these tools takes significant time and energy. Your tips keep the caffeine flowing and helps me stay focused on delivering high-quality, reliable products for the community. 

<p align="left">
  <a href="https://paypal.me/waghmaresujit">
    <img src="https://img.shields.io/badge/PayPal-00457C?style=for-the-badge&logo=paypal&logoColor=white" height="36" />
  </a>
  <a href="https://ko-fi.com/sujitwaghmare">
    <img src="https://img.shields.io/badge/Ko--fi-F16061?style=for-the-badge&logo=ko-fi&logoColor=white" height="36" />
  </a>
  <img src="https://img.shields.io/badge/UPI_(_Scan_Below_)-122E31?style=for-the-badge&logo=upi&logoColor=white" height="36" />
</p>

<details>
<summary><b>Donate via UPI (QR Code)</b></summary>
<br>
<p align="left">
<img src="https://img.shields.io/badge/exotic.sus@axl-122E31?style=for-the-badge&logo=upi&logoColor=white" />
</p>
<img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=exotic.sus@axl&pn=Sujit%20Rajabhau%20Waghmare&cu=INR" alt="UPI QR Code" />
</details>

## Author

[Sujit Waghmare](https://github.com/waghmare-sujit)
