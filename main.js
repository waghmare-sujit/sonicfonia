/*
Sonicfonia — YouTube audio player for Obsidian
Author: Sujit Waghmare
GitHub: github.com/waghmare-sujit
*/

'use strict';

const obsidian = require('obsidian');

// ── Settings ──────────────────────────────────────────────────────────────────

const DEFAULT_SETTINGS = {
	defaultSonicfoniaEnabled: true,
	primaryLink:     '',         // single video or playlist URL fallback
	apiKey:          '',         // YouTube Data API v3 key
	shuffle:         false,      // shuffle playlist
	defaultRepeatEnabled: false,
	defaultRepeatCount:   3,
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function extractVideoId(url) {
	if (!url) return null;
	const patterns = [
		/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
		/^([a-zA-Z0-9_-]{11})$/,
	];
	for (const p of patterns) {
		const m = String(url).match(p);
		if (m) return m[1];
	}
	return null;
}

function extractPlaylistId(url) {
	if (!url) return null;
	const m = String(url).match(/[?&]list=([a-zA-Z0-9_-]+)/);
	return m ? m[1] : null;
}

function isPlaylistUrl(url) {
	return !!extractPlaylistId(url);
}

function shuffleArray(arr) {
	const a = [...arr];
	for (let i = a.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[a[i], a[j]] = [a[j], a[i]];
	}
	return a;
}

function getFrontmatterValue(app, file, key) {
	const cache = app.metadataCache.getFileCache(file);
	if (!cache || !cache.frontmatter) return null;
	const val = cache.frontmatter[key];
	if (val === undefined || val === null) return null;
	return val;
}

// ── YouTube Data API ──────────────────────────────────────────────────────────
// Uses Obsidian's requestUrl() instead of fetch() to avoid CORS issues
// and follow the platform's networking guidelines.

async function fetchPlaylistVideoIds(playlistId, apiKey) {
	if (!apiKey) throw new Error('No YouTube API key set in Sonicfonia settings.');

	let videoIds = [];
	let pageToken = '';

	do {
		const params = new URLSearchParams({
			part:       'contentDetails',
			playlistId: playlistId,
			maxResults: '50',
			key:        apiKey,
		});
		if (pageToken) params.set('pageToken', pageToken);

		let res;
		try {
			res = await obsidian.requestUrl({
				url: `https://www.googleapis.com/youtube/v3/playlistItems?${params}`,
				throw: false,
			});
		} catch (e) {
			throw new Error(`YouTube API request failed: ${e.message}`);
		}

		if (res.status < 200 || res.status >= 300) {
			const msg = res.json?.error?.message || `HTTP ${res.status}`;
			throw new Error(`YouTube API: ${msg}`);
		}

		const data = res.json;
		const ids = (data.items || [])
			.map((i) => i?.contentDetails?.videoId)
			.filter(Boolean);
		videoIds.push(...ids);
		pageToken = data.nextPageToken || '';
	} while (pageToken);

	return videoIds;
}

// ── iframe Player ─────────────────────────────────────────────────────────────
// Plain 1px iframe. YouTube's own embed handles autoplay and audio natively,
// so no extra network calls or postMessage tricks are needed.

function buildIframe(src) {
	removeIframe();
	const iframe = document.createElement('iframe');
	iframe.id     = 'sonicfonia-iframe';
	iframe.width  = '1';
	iframe.height = '1';
	iframe.style.cssText =
		'position:fixed;bottom:0;right:0;width:1px;height:1px;' +
		'border:none;opacity:0.01;pointer-events:none;z-index:-1;';
	iframe.allow = 'autoplay; encrypted-media';
	iframe.setAttribute('allowfullscreen', '');
	iframe.src = src;
	document.body.appendChild(iframe);
	return iframe;
}

function createIframe(videoId, loop) {
	const loopParam = loop ? '1' : '0';
	const src =
		`https://www.youtube.com/embed/${videoId}` +
		`?autoplay=1&loop=${loopParam}&playlist=${videoId}` +
		`&controls=0&rel=0&modestbranding=1&playsinline=1&mute=0`;
	return buildIframe(src);
}

function removeIframe() {
	const el = document.getElementById('sonicfonia-iframe');
	if (el) el.remove();
}

// ── Settings Tab ──────────────────────────────────────────────────────────────

class SonicfoniaSettingTab extends obsidian.PluginSettingTab {
	constructor(app, plugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display() {
		const { containerEl } = this;
		containerEl.empty();

		containerEl.createEl('p', {
			text: 'Plays YouTube audio for your notes. Supports single videos and playlists.',
			cls: 'sonicfonia-desc',
		});

		// ── API ──
		new obsidian.Setting(containerEl).setName('YouTube API').setHeading();

		containerEl.createEl('p', {
			text: 'Required for playlist support. Get a free key from the Google Cloud Console (YouTube Data API v3).',
			cls: 'sonicfonia-desc',
		});

		new obsidian.Setting(containerEl)
			.setName('YouTube Data API key')
			.setDesc('Only needed for playlists. Stored locally in this vault.')
			.addText((t) => {
				t.inputEl.type = 'password';
				t.setPlaceholder('AIza…')
				 .setValue(this.plugin.settings.apiKey)
				 .onChange(async (v) => {
					this.plugin.settings.apiKey = v.trim();
					await this.plugin.saveSettings();
				 });
			});

		// ── Playback ──
		new obsidian.Setting(containerEl).setName('Playback').setHeading();

		new obsidian.Setting(containerEl)
			.setName('Enable Sonicfonia by default')
			.setDesc('When a note has no Sonicfonia property, use this default.')
			.addToggle((t) =>
				t.setValue(this.plugin.settings.defaultSonicfoniaEnabled)
				 .onChange(async (v) => {
					this.plugin.settings.defaultSonicfoniaEnabled = v;
					await this.plugin.saveSettings();
				 })
			);

		new obsidian.Setting(containerEl)
			.setName('Primary link (fallback)')
			.setDesc('Used when the note has no YouTube URL. Can be a single video or a playlist URL.')
			.addText((t) =>
				t.setPlaceholder('https://www.youtube.com/watch?v=… or ?list=…')
				 .setValue(this.plugin.settings.primaryLink)
				 .onChange(async (v) => {
					this.plugin.settings.primaryLink = v.trim();
					await this.plugin.saveSettings();
				 })
			);

		new obsidian.Setting(containerEl)
			.setName('Shuffle playlist')
			.setDesc('When on, playlist tracks are played in random order.')
			.addToggle((t) =>
				t.setValue(this.plugin.settings.shuffle)
				 .onChange(async (v) => {
					this.plugin.settings.shuffle = v;
					await this.plugin.saveSettings();
				 })
			);

		// ── Repeat ──
		new obsidian.Setting(containerEl).setName('Repeat').setHeading();

		new obsidian.Setting(containerEl)
			.setName('Limit repeat count')
			.setDesc('On repeats the set number of times. Off loops forever.')
			.addToggle((t) =>
				t.setValue(this.plugin.settings.defaultRepeatEnabled)
				 .onChange(async (v) => {
					this.plugin.settings.defaultRepeatEnabled = v;
					await this.plugin.saveSettings();
					this.display();
				 })
			);

		if (this.plugin.settings.defaultRepeatEnabled) {
			new obsidian.Setting(containerEl)
				.setName('Default repeat count')
				.setDesc('How many times to repeat (1–10). Applies to single videos. Playlists loop through all tracks.')
				.addSlider((s) =>
					s.setLimits(1, 10, 1)
					 .setValue(this.plugin.settings.defaultRepeatCount)
					 .setDynamicTooltip()
					 .onChange(async (v) => {
						this.plugin.settings.defaultRepeatCount = v;
						await this.plugin.saveSettings();
					 })
				);
		}
	}
}

// ── Main Plugin ───────────────────────────────────────────────────────────────

class SonicfoniaPlugin extends obsidian.Plugin {
	constructor() {
		super(...arguments);
		// Queue state
		this.queue          = [];   // array of videoIds
		this.queueIndex     = 0;
		this.currentVideoId = null;
		this.isPlaying      = false;
		this.repeatEnabled  = true;
		this.repeatCount    = 0;
		this.playCount      = 0;
		this._trackTimer    = null;
	}

	async onload() {
		await this.loadSettings();

		this.statusBarItem = this.addStatusBarItem();
		this.statusBarItem.addClass('sonicfonia-status');
		this.updateStatusBar('idle');

		this.addRibbonIcon('music', 'Sonicfonia: Toggle play/stop', () => {
			this.togglePlayback();
		});

		this.addCommand({
			id: 'play',
			name: 'Play audio for current note',
			callback: () => this.playCurrentNote(),
		});
		this.addCommand({
			id: 'stop',
			name: 'Stop audio',
			callback: () => this.stopAudio(),
		});
		this.addCommand({
			id: 'toggle',
			name: 'Toggle play / stop',
			callback: () => this.togglePlayback(),
		});
		this.addCommand({
			id: 'next-track',
			name: 'Next track',
			callback: () => this.nextTrack(),
		});
		this.addCommand({
			id: 'previous-track',
			name: 'Previous track',
			callback: () => this.prevTrack(),
		});

		this.addSettingTab(new SonicfoniaSettingTab(this.app, this));

		this.registerEvent(
			this.app.workspace.on('active-leaf-change', (leaf) => this.onLeafChange(leaf))
		);
		this.registerEvent(
			this.app.metadataCache.on('changed', (file) => {
				const active = this.app.workspace.getActiveFile();
				if (active && file.path === active.path) this.onActiveFileMetaChanged(file);
			})
		);
	}

	onunload() {
		this.stopAudio();
	}

	// ── Playback ──────────────────────────────────────────────────────────

	async playCurrentNote() {
		const file = this.app.workspace.getActiveFile();
		if (!file) { new obsidian.Notice('Sonicfonia: No active note.'); return; }
		await this.playForFile(file);
	}

	async playForFile(file) {
		// 1. Check Sonicfonia enabled
		const sfRaw = getFrontmatterValue(this.app, file, 'Sonicfonia');
		const sfOn  = sfRaw === null
			? this.settings.defaultSonicfoniaEnabled
			: sfRaw === true || sfRaw === 'true';
		if (!sfOn) { this.stopAudio(); return; }

		// 2. Resolve URL (note property → settings fallback)
		let url = getFrontmatterValue(this.app, file, 'YouTube Url');
		if (!url || String(url).trim() === '') url = this.settings.primaryLink;
		if (!url || String(url).trim() === '') {
			new obsidian.Notice('Sonicfonia: No YouTube URL in note and no primary link set in settings.');
			this.stopAudio();
			return;
		}
		url = String(url).trim();

		// 3. Repeat settings
		const repRaw = getFrontmatterValue(this.app, file, 'Repeat');
		this.repeatEnabled = repRaw === null ? true : repRaw === true || repRaw === 'true';
		this.repeatCount   = this.settings.defaultRepeatEnabled ? this.settings.defaultRepeatCount : 0;
		this.playCount     = 0;

		// 4. Playlist or single video?
		if (isPlaylistUrl(url)) {
			await this.loadPlaylist(url);
		} else {
			const videoId = extractVideoId(url);
			if (!videoId) {
				new obsidian.Notice('Sonicfonia: Could not find a valid YouTube video ID in the URL.');
				return;
			}
			// Don't restart same single video
			if (this.currentVideoId === videoId && this.isPlaying && this.queue.length <= 1) return;
			this.queue      = [videoId];
			this.queueIndex = 0;
			this.playCurrent();
		}
	}

	async loadPlaylist(url) {
		const playlistId = extractPlaylistId(url);
		if (!playlistId) {
			new obsidian.Notice('Sonicfonia: Could not extract playlist ID from URL.');
			return;
		}

		if (!this.settings.apiKey) {
			new obsidian.Notice('Sonicfonia: YouTube API key not set. Go to Settings → Sonicfonia to add it.');
			return;
		}

		this.updateStatusBar('loading');
		new obsidian.Notice('Sonicfonia: Loading playlist…');

		try {
			let ids = await fetchPlaylistVideoIds(playlistId, this.settings.apiKey);
			if (!ids.length) {
				new obsidian.Notice('Sonicfonia: Playlist is empty or private.');
				this.updateStatusBar('idle');
				return;
			}
			if (this.settings.shuffle) ids = shuffleArray(ids);
			this.queue      = ids;
			this.queueIndex = 0;
			this.playCurrent();
			new obsidian.Notice(`Sonicfonia: Loaded ${ids.length} tracks from playlist`);
		} catch (e) {
			new obsidian.Notice(`Sonicfonia: ${e.message}`);
			this.updateStatusBar('idle');
		}
	}

	playCurrent() {
		if (!this.queue.length) return;
		const videoId = this.queue[this.queueIndex];
		if (!videoId) return;

		this.currentVideoId = videoId;
		this.isPlaying      = true;

		// For single video: use native YouTube loop when repeat forever
		const isSingle    = this.queue.length === 1;
		const nativeLoop  = isSingle && this.repeatEnabled && this.repeatCount === 0;

		createIframe(videoId, nativeLoop);
		this.updateStatusBar('playing');

		// For playlists, delegate to YouTube's own embed playlist player.
		// This avoids needing cross-origin postMessage track-end detection.
		if (this.queue.length > 1) {
			this._loadPlaylistInIframe();
		}
	}

	// For playlists: use YouTube's own embed playlist player.
	// This doesn't require track-end detection — YouTube handles it natively.
	_loadPlaylistInIframe() {
		// Build a comma-separated list starting from current index
		const ordered = [
			...this.queue.slice(this.queueIndex),
			...this.queue.slice(0, this.queueIndex),
		];
		const videoId         = ordered[0];
		const playlistVideos  = ordered.join(',');
		const loopParam       = this.repeatEnabled ? '1' : '0';

		const src =
			`https://www.youtube.com/embed/${videoId}` +
			`?autoplay=1` +
			`&loop=${loopParam}` +
			`&playlist=${playlistVideos}` +
			`&controls=0&rel=0&modestbranding=1&playsinline=1&mute=0`;

		buildIframe(src);
	}

	nextTrack() {
		if (!this.queue.length) return;
		this.queueIndex = (this.queueIndex + 1) % this.queue.length;
		this.playCurrent();
		new obsidian.Notice(`Sonicfonia: Track ${this.queueIndex + 1} / ${this.queue.length}`);
	}

	prevTrack() {
		if (!this.queue.length) return;
		this.queueIndex = (this.queueIndex - 1 + this.queue.length) % this.queue.length;
		this.playCurrent();
		new obsidian.Notice(`Sonicfonia: Track ${this.queueIndex + 1} / ${this.queue.length}`);
	}

	stopAudio() {
		removeIframe();
		if (this._trackTimer) { window.clearTimeout(this._trackTimer); this._trackTimer = null; }
		this.currentVideoId = null;
		this.isPlaying      = false;
		this.queue          = [];
		this.queueIndex     = 0;
		this.updateStatusBar('idle');
	}

	togglePlayback() {
		if (this.isPlaying) {
			this.stopAudio();
		} else {
			this.playCurrentNote();
		}
	}

	// ── Events ────────────────────────────────────────────────────────────

	onLeafChange(leaf) {
		if (!leaf) return;
		const view = leaf.view;
		if (view && view.file) {
			this.playForFile(view.file);
		} else {
			this.stopAudio();
		}
	}

	onActiveFileMetaChanged(file) {
		const sfRaw = getFrontmatterValue(this.app, file, 'Sonicfonia');
		const sfOn  = sfRaw === null
			? this.settings.defaultSonicfoniaEnabled
			: sfRaw === true || sfRaw === 'true';
		if (!sfOn) { this.stopAudio(); } else { this.playForFile(file); }
	}

	// ── Status bar ────────────────────────────────────────────────────────

	updateStatusBar(state) {
		const map = {
			idle:    'Sonicfonia',
			loading: 'Sonicfonia: loading…',
			playing: 'Sonicfonia: playing',
			paused:  'Sonicfonia: paused',
		};
		const queueInfo = this.queue.length > 1
			? ` [${this.queueIndex + 1}/${this.queue.length}]`
			: '';
		const base = map[state] || 'Sonicfonia';
		this.statusBarItem.setText(
			state === 'playing' ? base + queueInfo : base
		);
	}

	// ── Settings ──────────────────────────────────────────────────────────

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

module.exports = SonicfoniaPlugin;
