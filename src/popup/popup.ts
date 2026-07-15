import type { EldenRingSettings } from '../types/settings';

document.addEventListener('DOMContentLoaded', (): void => {
  const testMergeBtn = document.getElementById('testMerge') as HTMLButtonElement;
  const showOnPRMergedCheckbox = document.getElementById('showOnPRMerged') as HTMLInputElement;
  const soundEnabledCheckbox = document.getElementById('soundEnabled') as HTMLInputElement;
  const showOnPRCreateCheckbox = document.getElementById('showOnPRCreate') as HTMLInputElement;
  const showOnPRApproveCheckbox = document.getElementById('showOnPRApprove') as HTMLInputElement;
  const showOnPRCloseCheckbox = document.getElementById('showOnPRClose') as HTMLInputElement;
  const soundVolumeInput = document.getElementById('soundVolume') as HTMLInputElement;
  const soundTypeSelect = document.getElementById('soundType') as HTMLSelectElement;
  const durationSelect = document.getElementById('duration') as HTMLSelectElement;
  const pageStatusElement = document.getElementById('pageStatus') as HTMLSpanElement;

  // Check current page
  checkCurrentPage();

  // Load settings
  loadSettings();

  // Event listeners
  testMergeBtn?.addEventListener('click', showTestBanner);
  showOnPRMergedCheckbox?.addEventListener('change', saveSettings);
  soundEnabledCheckbox?.addEventListener('change', saveSettings);
  showOnPRCreateCheckbox?.addEventListener('change', saveSettings);
  showOnPRApproveCheckbox?.addEventListener('change', saveSettings);
  showOnPRCloseCheckbox?.addEventListener('change', saveSettings);
  soundVolumeInput?.addEventListener('change', saveSettings);
  soundTypeSelect?.addEventListener('change', saveSettings);
  durationSelect?.addEventListener('change', saveSettings);

  function checkCurrentPage(): void {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs: chrome.tabs.Tab[]) => {
      const currentTab = tabs[0];
      if (currentTab && pageStatusElement) {
        const url = currentTab.url;
        if (url && url.includes('github.com')) {
          pageStatusElement.textContent = 'GitHub';
          pageStatusElement.className = 'status-value active';
        } else {
          pageStatusElement.textContent = 'Not GitHub';
          pageStatusElement.className = 'status-value inactive';
        }
      }
    });
  }

  function showTestBanner() {
    const soundVolume = soundVolumeInput ? parseInt(soundVolumeInput.value, 10) / 100 : 1;
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const currentTab = tabs[0];
      if (currentTab) {
        // Inject the banner directly into the current tab
        chrome.scripting.executeScript({
          target: { tabId: currentTab.id! },
          func: createAndShowBanner,
          args: [soundVolume],
        });
      }
    });
  }

  function loadSettings() {
    chrome.storage.sync.get(
      [
        'showOnPRMerged',
        'soundEnabled',
        'showOnPRCreate',
        'showOnPRApprove',
        'soundType',
        'soundVolume',
        'duration',
        'showOnPRClose',
      ],
      function (result) {
        showOnPRMergedCheckbox.checked = result.showOnPRMerged !== false; // default true
        soundEnabledCheckbox.checked = result.soundEnabled !== false; // default true
        showOnPRCreateCheckbox.checked = result.showOnPRCreate !== false; // default true
        showOnPRApproveCheckbox.checked = result.showOnPRApprove !== false; // default true
        showOnPRCloseCheckbox.checked = result.showOnPRClose !== false; // default true
        soundTypeSelect.value = result.soundType || 'you-die-sound'; // default you-die-sound
        soundVolumeInput.value = String(
          typeof result.soundVolume === 'number' ? Math.round(result.soundVolume * 100) : 100,
        ); // default 100%
        durationSelect.value = result.duration || '5000'; // default 5 seconds
      },
    );
  }

  function saveSettings() {
    const settings = {
      showOnPRMerged: showOnPRMergedCheckbox.checked,
      soundEnabled: soundEnabledCheckbox.checked,
      showOnPRCreate: showOnPRCreateCheckbox.checked,
      showOnPRApprove: showOnPRApproveCheckbox.checked,
      showOnPRClose: showOnPRCloseCheckbox.checked,
      soundType: soundTypeSelect.value,
      soundVolume: parseInt(soundVolumeInput.value, 10) / 100,
      duration: parseInt(durationSelect.value),
    };

    chrome.storage.sync.set(settings, function () {
      console.log('Settings saved:', settings);
    });

    // Update content script with new settings
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const currentTab = tabs[0];
      if (currentTab) {
        chrome.scripting.executeScript({
          target: { tabId: currentTab.id! },
          func: updateExtensionSettings,
          args: [settings as EldenRingSettings],
        });
      }
    });
  }
});

// Functions to be injected into the content script.
// Must be fully self-contained: chrome.scripting.executeScript serializes only
// this function's own source, so it cannot reference imports or other module-level
// helpers (e.g. eldenBanner.ts) — the canvas drawing logic is inlined below.
function createAndShowBanner(initialSoundVolume: number = 1): boolean {
  // Remove existing banner if any
  const existingBanner = document.querySelector('#elden-ring-banner, .elden-ring-merge-banner');
  if (existingBanner) {
    existingBanner.remove();
  }

  function generateTestBannerDataUrl(caption: string): string {
    const CANVAS_WIDTH = 1920;
    const CANVAS_HEIGHT = 1080;
    const FONT_FAMILY = "'Agmena Pro', Georgia, 'Times New Roman', serif";
    const TEXT_COLOR = 'rgb(220, 175, 45)';
    const SHEEN_COLOR = 'rgb(255, 208, 66)';
    const SHADOW_SIZE = 0.7;
    const SHADOW_OPACITY = 0.65;
    const SHADOW_OFFSET = -0.006;
    const SHADOW_SOFTNESS = 1.05;
    const FONT_SIZE = 88;
    const FONT_WEIGHT = 300;
    const SHEEN_OPACITY = 0.18;
    const SHEEN_SIZE = 1.11;

    const canvas = document.createElement('canvas');
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return '';
    }

    const scale = canvas.height / 1080;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2 + SHADOW_OFFSET * canvas.height;

    // Shadow bar
    ctx.save();
    ctx.filter = `blur(${SHADOW_SOFTNESS * 12 * scale}px)`;
    const barHeight = canvas.height * SHADOW_SIZE * 0.15;
    const gradient = ctx.createLinearGradient(
      0,
      centerY - barHeight / 2,
      0,
      centerY + barHeight / 2,
    );
    gradient.addColorStop(0, `rgba(20, 20, 20, 0)`);
    gradient.addColorStop(0.5, `rgba(20, 20, 20, ${SHADOW_OPACITY})`);
    gradient.addColorStop(1, `rgba(20, 20, 20, 0)`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, centerY - barHeight / 2, canvas.width, barHeight);
    ctx.restore();

    const applyFontSliders = () => {
      const fontSize = FONT_SIZE * scale;
      ctx.font = `${FONT_WEIGHT} ${fontSize}px ${FONT_FAMILY}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
    };

    // Main text
    ctx.save();
    applyFontSliders();
    ctx.fillStyle = TEXT_COLOR;
    ctx.fillText(caption, centerX, centerY);
    ctx.restore();

    // Additive sheen pass
    ctx.save();
    applyFontSliders();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = SHEEN_OPACITY;
    ctx.fillStyle = SHEEN_COLOR;
    ctx.translate(centerX, centerY);
    ctx.scale(SHEEN_SIZE, 1 + (SHEEN_SIZE - 1) / 2);
    ctx.fillText(caption, 0, 0);
    ctx.restore();

    return canvas.toDataURL('image/png');
  }

  // Try to create image banner first
  try {
    const banner = document.createElement('div');
    banner.id = 'elden-ring-banner';
    const dataUrl = generateTestBannerDataUrl('PULL REQUEST APPROVED');
    banner.innerHTML = `<img src="${dataUrl}" alt="Pull Request Approved">`;
    document.body.appendChild(banner);

    // Play sound effect if enabled
    chrome.storage.sync.get(['soundEnabled', 'soundType'], function (soundResult) {
      if (soundResult.soundEnabled !== false) {
        const soundType = soundResult.soundType || 'you-die-sound';
        const audio = new Audio(chrome.runtime.getURL(`assets/${soundType}.mp3`));
        audio.volume = Math.min(1, Math.max(0, initialSoundVolume));
        audio.play().catch((err) => console.log('Sound playback failed:', err));
      }
    });

    setTimeout(() => banner.classList.add('show'), 50);

    // Auto-hide after duration
    chrome.storage.sync.get(['duration'], function (result) {
      const duration = result.duration || 5000;
      setTimeout(() => {
        if (banner && banner.parentNode) {
          banner.classList.remove('show');
          setTimeout(() => {
            if (banner.parentNode) {
              banner.remove();
            }
          }, 500);
        }
      }, duration);
    });

    return true;
  } catch (error) {
    console.error('Image banner failed, creating fallback text banner', error);

    // Create fallback text banner
    const banner = document.createElement('div');
    banner.className = 'elden-ring-merge-banner';
    banner.innerHTML = `
            <div class="elden-ring-banner-content">
                <div class="elden-ring-text">
                    <h1>MERGE ACCOMPLISHED</h1>
                    <p>Test banner activated from extension popup</p>
                </div>
                <div class="elden-ring-close" onclick="this.parentElement.parentElement.remove()">×</div>
            </div>
        `;

    document.body.appendChild(banner);

    // Play sound effect if enabled
    chrome.storage.sync.get(['soundEnabled', 'soundType'], function (soundResult) {
      if (soundResult.soundEnabled !== false) {
        const soundType = soundResult.soundType || 'you-die-sound';
        const audio = new Audio(chrome.runtime.getURL(`assets/${soundType}.mp3`));
        audio.volume = Math.min(1, Math.max(0, initialSoundVolume));
        audio.play().catch((err) => console.log('Sound playback failed:', err));
      }
    });

    setTimeout(() => banner.classList.add('show'), 50);

    // Auto-hide after duration
    chrome.storage.sync.get(['duration'], function (result) {
      const duration = result.duration || 5000;
      setTimeout(() => {
        if (banner && banner.parentNode) {
          banner.classList.remove('show');
          setTimeout(() => {
            if (banner.parentNode) {
              banner.remove();
            }
          }, 500);
        }
      }, duration);
    });

    return true;
  }
}

function updateExtensionSettings(settings: EldenRingSettings): void {
  // Update the extension's settings in the content script
  if (window.eldenRingMergerSettings) {
    window.eldenRingMergerSettings = { ...window.eldenRingMergerSettings, ...settings };
  } else {
    window.eldenRingMergerSettings = settings;
  }

  console.log('Extension settings updated:', settings);
}
