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
  const customBannerTextInput = document.getElementById('customBannerText') as HTMLInputElement;
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
  customBannerTextInput?.addEventListener('change', saveSettings);

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
    const customBannerText = customBannerTextInput?.value?.trim() || '';
    const soundVolume = soundVolumeInput ? parseInt(soundVolumeInput.value, 10) / 100 : 1;
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const currentTab = tabs[0];
      if (currentTab) {
        // Inject the banner directly into the current tab
        chrome.scripting.executeScript({
          target: { tabId: currentTab.id! },
          func: createAndShowBanner,
          args: [customBannerText, soundVolume],
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
        'customBannerText',
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
        customBannerTextInput.value =
          typeof result.customBannerText === 'string' ? result.customBannerText : '';
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
      customBannerText: customBannerTextInput.value.trim(),
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

// Functions to be injected into the content script
function createAndShowBanner(
  initialCustomText: string = '',
  initialSoundVolume: number = 1,
): boolean {
  // Remove existing banner if any
  const existingBanner = document.querySelector('#elden-ring-banner');
  if (existingBanner) {
    existingBanner.remove();
  }

  try {
    const banner = document.createElement('div');
    banner.id = 'elden-ring-banner';
    Object.assign(banner.style, {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%) scale(0.85)',
      opacity: '0',
      zIndex: '999999',
      transition: 'all 0.5s ease-out',
      pointerEvents: 'none',
      width: '100vw',
      height: '100vh',
    });

    const canvas = document.createElement('canvas');
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    banner.appendChild(canvas);
    document.body.appendChild(banner);
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Canvas 2D context unavailable');
    }

    const requestFrame = (callback: (time: number) => void): number => {
      if (typeof window.requestAnimationFrame === 'function') {
        return window.requestAnimationFrame(callback);
      }
      return window.setTimeout(() => callback(Date.now()), 16);
    };

    const cancelFrame = (frameId: number): void => {
      if (typeof window.cancelAnimationFrame === 'function') {
        window.cancelAnimationFrame(frameId);
        return;
      }
      clearTimeout(frameId);
    };

    let frameId = 0;
    let isRemoved = false;
    const safeText = (initialCustomText || '').trim().slice(0, 48) || 'MERGE ACCOMPLISHED';

    const drawFrame = (timestamp: number): void => {
      if (isRemoved) {
        return;
      }

      const width = window.innerWidth;
      const height = window.innerHeight;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.clearRect(0, 0, width, height);

      const progress = (timestamp % 2000) / 2000;
      const centerX = width / 2;
      const centerY = height / 2;
      const glowSize = Math.min(width, height) * 0.22;

      const gradient = context.createRadialGradient(
        centerX,
        centerY,
        0,
        centerX,
        centerY,
        glowSize,
      );
      gradient.addColorStop(0, 'rgba(212, 175, 55, 0.20)');
      gradient.addColorStop(0.6, 'rgba(35, 28, 16, 0.55)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      context.fillStyle = gradient;
      context.fillRect(0, 0, width, height);

      context.save();
      context.translate(centerX, centerY);
      context.rotate(progress * Math.PI * 2);
      context.lineWidth = 2;
      context.strokeStyle = 'rgba(212, 175, 55, 0.55)';
      context.beginPath();
      context.arc(0, 0, glowSize * 0.75, 0, Math.PI * 1.5);
      context.stroke();
      context.restore();

      const titleFontSize = Math.max(42, Math.min(width * 0.085, 110));
      const subtitleFontSize = Math.max(16, Math.min(width * 0.024, 28));
      context.textAlign = 'center';
      context.textBaseline = 'middle';

      context.font = `700 ${titleFontSize}px "Cinzel", "Times New Roman", serif`;
      context.strokeStyle = 'rgba(20, 12, 2, 0.95)';
      context.lineWidth = 8;
      context.strokeText(safeText, centerX, centerY - subtitleFontSize);
      context.fillStyle = '#f2d87f';
      context.shadowColor = 'rgba(243, 206, 84, 0.85)';
      context.shadowBlur = 24 + Math.sin(progress * Math.PI * 2) * 7;
      context.fillText(safeText, centerX, centerY - subtitleFontSize);

      context.shadowBlur = 0;
      context.font = `500 ${subtitleFontSize}px "Times New Roman", serif`;
      context.fillStyle = 'rgba(232, 215, 160, 0.95)';
      context.fillText(
        'Test banner activated from extension popup',
        centerX,
        centerY + titleFontSize * 0.5,
      );

      frameId = requestFrame(drawFrame);
    };

    // Play sound effect if enabled
    chrome.storage.sync.get(['soundEnabled', 'soundType'], function (soundResult) {
      if (soundResult.soundEnabled !== false) {
        const soundType = soundResult.soundType || 'you-die-sound';
        const audio = new Audio(chrome.runtime.getURL(`assets/${soundType}.mp3`));
        audio.volume = Math.min(1, Math.max(0, initialSoundVolume));
        audio.play().catch((err) => console.log('Sound playback failed:', err));
      }
    });

    frameId = requestFrame(drawFrame);
    setTimeout(() => {
      banner.style.opacity = '1';
      banner.style.transform = 'translate(-50%, -50%) scale(1)';
    }, 50);

    // Auto-hide after duration
    chrome.storage.sync.get(['duration'], function (result) {
      const duration = result.duration || 5000;
      setTimeout(() => {
        if (banner && banner.parentNode) {
          banner.style.opacity = '0';
          banner.style.transform = 'translate(-50%, -50%) scale(0.85)';
          setTimeout(() => {
            isRemoved = true;
            cancelFrame(frameId);
            if (banner.parentNode) {
              banner.remove();
            }
          }, 500);
        }
      }, duration);
    });

    return true;
  } catch (error) {
    console.error('Canvas banner failed', error);
    return false;
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
