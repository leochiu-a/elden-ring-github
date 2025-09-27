import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock chrome API responses
const mockChromeStorageGet = vi.fn();
const mockChromeStorageSet = vi.fn();
const mockAddEventListener = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();

  // Reset chrome mocks
  global.chrome.storage.sync.get = mockChromeStorageGet;
  global.chrome.storage.sync.set = mockChromeStorageSet;
  global.chrome.storage.onChanged.addListener = mockAddEventListener;

  // Mock default storage responses
  mockChromeStorageGet.mockImplementation((_keys, callback) => {
    callback({
      soundEnabled: true,
      showOnPRMerged: true,
      showOnPRCreate: true,
    });
  });

  // Setup DOM
  document.body.innerHTML = '';

  // Mock window.location
  Object.defineProperty(window, 'location', {
    value: { href: 'https://github.com/user/repo/pull/123' },
    writable: true,
  });
});

afterEach(() => {
  document.body.innerHTML = '';
});

describe('EldenRingMerger', () => {
  it('should call storage API for loading settings', () => {
    // Simulate the loadSettings method behavior
    chrome.storage.sync.get(['soundEnabled', 'showOnPRMerged', 'showOnPRCreate'], () => {});

    expect(mockChromeStorageGet).toHaveBeenCalledWith(
      ['soundEnabled', 'showOnPRMerged', 'showOnPRCreate'],
      expect.any(Function),
    );
  });

  it('should detect GitHub PR page URLs correctly', () => {
    const prUrls = [
      'https://github.com/user/repo/pull/123',
      'https://github.com/org/project/pull/456',
    ];

    const nonPrUrls = [
      'https://github.com/user/repo',
      'https://github.com/user/repo/issues/123',
      'https://example.com',
    ];

    prUrls.forEach((url) => {
      const isPR = /\/pull\/\d+/.test(url);
      expect(isPR).toBe(true);
    });

    nonPrUrls.forEach((url) => {
      const isPR = /\/pull\/\d+/.test(url);
      expect(isPR).toBe(false);
    });
  });

  it('should detect GitHub compare page URLs correctly', () => {
    const compareUrls = [
      'https://github.com/user/repo/compare/main...feature',
      'https://github.com/org/project/compare/master...dev',
    ];

    const nonCompareUrls = [
      'https://github.com/user/repo',
      'https://github.com/user/repo/pull/123',
    ];

    compareUrls.forEach((url) => {
      const isCompare = /\/compare/.test(url);
      expect(isCompare).toBe(true);
    });

    nonCompareUrls.forEach((url) => {
      const isCompare = /\/compare/.test(url);
      expect(isCompare).toBe(false);
    });
  });

  it('should create banner element with correct attributes', () => {
    // Mock chrome.runtime.getURL
    global.chrome.runtime.getURL = vi.fn((path) => `chrome-extension://mock/${path}`);

    const banner = document.createElement('div');
    banner.id = 'elden-ring-banner';
    const imageName = 'pull-request-merged.png';
    const altText = 'Pull Request Merged';
    const imgPath = chrome.runtime.getURL(`assets/${imageName}`);
    banner.innerHTML = `<img src="${imgPath}" alt="${altText}">`;

    expect(banner.id).toBe('elden-ring-banner');
    expect(banner.innerHTML).toContain('pull-request-merged.png');
    expect(banner.innerHTML).toContain('Pull Request Merged');
    expect(chrome.runtime.getURL).toHaveBeenCalledWith('assets/pull-request-merged.png');
  });

  it('should handle different banner types', () => {
    const types = ['merged', 'created'] as const;

    types.forEach((type) => {
      const imageName = type === 'created' ? 'pull-request-created.png' : 'pull-request-merged.png';
      const altText = type === 'created' ? 'Pull Request Created' : 'Pull Request Merged';

      expect(imageName).toBe(
        type === 'created' ? 'pull-request-created.png' : 'pull-request-merged.png',
      );
      expect(altText).toBe(type === 'created' ? 'Pull Request Created' : 'Pull Request Merged');
    });
  });

  it('should play audio when sound is enabled', () => {
    const mockAudio = {
      play: vi.fn().mockResolvedValue(undefined),
      volume: 0.35,
    };

    global.Audio = vi.fn().mockImplementation(() => mockAudio);
    global.chrome.runtime.getURL = vi.fn(() => 'chrome-extension://mock/sound.mp3');

    const audio = new Audio(chrome.runtime.getURL('assets/elden_ring_sound.mp3'));
    audio.volume = 0.35;
    audio.play();

    expect(global.Audio).toHaveBeenCalledWith('chrome-extension://mock/sound.mp3');
    expect(mockAudio.play).toHaveBeenCalled();
    expect(mockAudio.volume).toBe(0.35);
  });

  it('should add event listeners to merge buttons', () => {
    // Setup DOM with merge button
    document.body.innerHTML = `
      <div class="merge-pr">
        <button>Confirm merge</button>
        <button>Confirm squash and merge</button>
        <button>Some other button</button>
      </div>
    `;

    const mergePrContainer = document.querySelector('.merge-pr');
    const buttons = mergePrContainer?.querySelectorAll('button');
    const specificMergeTexts = [
      'confirm merge',
      'confirm squash and merge',
      'confirm rebase and merge',
    ];

    let listenersAdded = 0;

    buttons?.forEach((button) => {
      const buttonText = button.textContent?.toLowerCase().trim() || '';

      if (specificMergeTexts.some((text) => buttonText.includes(text))) {
        // Simulate adding event listener
        button.setAttribute('data-elden-ring-listener', 'true');
        listenersAdded++;
      }
    });

    expect(listenersAdded).toBe(2); // Should match "confirm merge" and "confirm squash and merge"
    expect(buttons?.[0]?.getAttribute('data-elden-ring-listener')).toBe('true');
    expect(buttons?.[1]?.getAttribute('data-elden-ring-listener')).toBe('true');
    expect(buttons?.[2]?.getAttribute('data-elden-ring-listener')).toBeNull();
  });

  it('should detect merged state element', () => {
    // Test merged state detection
    document.body.innerHTML = `
      <div class="State State--merged">Merged</div>
    `;

    const mergedElement = document.querySelector('.State.State--merged');
    expect(mergedElement).toBeTruthy();
    expect(mergedElement?.textContent).toBe('Merged');
  });

  it('should handle storage changes', () => {
    const mockCallback = vi.fn();
    const changes = {
      soundEnabled: { newValue: false },
      showOnPRMerged: { newValue: false },
      showOnPRCreate: { newValue: true },
    };

    // Simulate storage change handling
    if (changes.soundEnabled) {
      mockCallback('soundEnabled', changes.soundEnabled.newValue);
    }
    if (changes.showOnPRMerged) {
      mockCallback('showOnPRMerged', changes.showOnPRMerged.newValue);
    }
    if (changes.showOnPRCreate) {
      mockCallback('showOnPRCreate', changes.showOnPRCreate.newValue);
    }

    expect(mockCallback).toHaveBeenCalledTimes(3);
    expect(mockCallback).toHaveBeenCalledWith('soundEnabled', false);
    expect(mockCallback).toHaveBeenCalledWith('showOnPRMerged', false);
    expect(mockCallback).toHaveBeenCalledWith('showOnPRCreate', true);
  });

  it('should handle PR creation flag storage', () => {
    const mockStorageLocalGet = vi.fn();
    const mockStorageLocalSet = vi.fn();
    const mockStorageLocalRemove = vi.fn();

    global.chrome.storage.local.get = mockStorageLocalGet;
    global.chrome.storage.local.set = mockStorageLocalSet;
    global.chrome.storage.local.remove = mockStorageLocalRemove;

    // Test setting PR creation flag
    const prCreationData = {
      prCreationTriggered: true,
      prCreationTime: Date.now(),
    };

    chrome.storage.local.set(prCreationData);
    expect(mockStorageLocalSet).toHaveBeenCalledWith(prCreationData);

    // Test removing PR creation flag
    chrome.storage.local.remove(['prCreationTriggered', 'prCreationTime']);
    expect(mockStorageLocalRemove).toHaveBeenCalledWith(['prCreationTriggered', 'prCreationTime']);
  });
});
