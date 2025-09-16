import type { EldenRingSettings } from '../types/settings';

document.addEventListener('DOMContentLoaded', (): void => {
  const testMergeBtn = document.getElementById('testMerge') as HTMLButtonElement;
  const autoShowCheckbox = document.getElementById('autoShow') as HTMLInputElement;
  const soundEnabledCheckbox = document.getElementById('soundEnabled') as HTMLInputElement;
  const showOnPRCreateCheckbox = document.getElementById('showOnPRCreate') as HTMLInputElement;
  const durationSelect = document.getElementById('duration') as HTMLSelectElement;
  const pageStatusElement = document.getElementById('pageStatus') as HTMLSpanElement;

  // Check current page
  checkCurrentPage();

  // Load settings
  loadSettings();

  // Event listeners
  testMergeBtn?.addEventListener('click', showTestBanner);
  autoShowCheckbox?.addEventListener('change', saveSettings);
  soundEnabledCheckbox?.addEventListener('change', saveSettings);
  showOnPRCreateCheckbox?.addEventListener('change', saveSettings);
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
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const currentTab = tabs[0];
      if (currentTab) {
        // Inject the banner directly into the current tab
        chrome.scripting.executeScript({
          target: { tabId: currentTab.id! },
          func: createAndShowBanner,
        });
      }
    });
  }

  function loadSettings() {
    chrome.storage.sync.get(
      ['autoShow', 'soundEnabled', 'showOnPRCreate', 'duration'],
      function (result) {
        autoShowCheckbox.checked = result.autoShow !== false; // default true
        soundEnabledCheckbox.checked = result.soundEnabled !== false; // default true
        showOnPRCreateCheckbox.checked = result.showOnPRCreate !== false; // default true
        durationSelect.value = result.duration || '5000'; // default 5 seconds
      },
    );
  }

  function saveSettings() {
    const settings = {
      autoShow: autoShowCheckbox.checked,
      soundEnabled: soundEnabledCheckbox.checked,
      showOnPRCreate: showOnPRCreateCheckbox.checked,
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
          args: [settings],
        });
      }
    });
  }
});

// Functions to be injected into the content script
function createAndShowBanner(): boolean {
  // Remove existing banner if any
  const existingBanner = document.querySelector('#elden-ring-banner, .elden-ring-merge-banner');
  if (existingBanner) {
    existingBanner.remove();
  }

  // Try to create image banner first
  try {
    const banner = document.createElement('div');
    banner.id = 'elden-ring-banner';
    const imgPath = chrome.runtime.getURL('assets/pull-request-merged.png');
    banner.innerHTML = `<img src="${imgPath}" alt="Pull Request Merged">`;
    document.body.appendChild(banner);

    // Play sound effect if enabled
    chrome.storage.sync.get(['soundEnabled'], function (soundResult) {
      if (soundResult.soundEnabled !== false) {
        const audio = new Audio(chrome.runtime.getURL('assets/elden_ring_sound.mp3'));
        audio.volume = 0.35;
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
    chrome.storage.sync.get(['soundEnabled'], function (soundResult) {
      if (soundResult.soundEnabled !== false) {
        const audio = new Audio(chrome.runtime.getURL('assets/elden_ring_sound.mp3'));
        audio.volume = 0.35;
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
