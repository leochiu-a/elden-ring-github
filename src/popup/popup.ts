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

  const TEST_BANNER_MESSAGE = { type: 'ELDEN_RING_TEST_BANNER' };

  function showTestBanner() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const tabId = tabs[0]?.id;
      if (tabId === undefined) return;

      // Ask the content script to render the banner via its normal code path
      // (banner.ts/eldenBanner.ts) instead of duplicating that logic here.
      chrome.tabs.sendMessage(tabId, TEST_BANNER_MESSAGE, () => {
        if (!chrome.runtime.lastError) return;

        // No receiver yet (tab opened before this build, or content script not
        // injected on this page). Inject the current content script, then retry.
        chrome.scripting.insertCSS({ target: { tabId }, files: ['content/styles.css'] });
        chrome.scripting.executeScript({ target: { tabId }, files: ['content.js'] }, () => {
          if (chrome.runtime.lastError) {
            console.log('Failed to inject content script:', chrome.runtime.lastError.message);
            return;
          }
          chrome.tabs.sendMessage(tabId, TEST_BANNER_MESSAGE, () => {
            if (chrome.runtime.lastError) {
              console.log('Failed to trigger test banner:', chrome.runtime.lastError.message);
            }
          });
        });
      });
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

// Function to be injected into the content script via chrome.scripting.executeScript.
// Must be fully self-contained: only this function's own source is serialized,
// so it cannot reference imports or other module-level helpers.
function updateExtensionSettings(settings: EldenRingSettings): void {
  // Update the extension's settings in the content script
  if (window.eldenRingMergerSettings) {
    window.eldenRingMergerSettings = { ...window.eldenRingMergerSettings, ...settings };
  } else {
    window.eldenRingMergerSettings = settings;
  }

  console.log('Extension settings updated:', settings);
}
