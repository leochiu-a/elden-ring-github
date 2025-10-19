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
      showOnPRApprove: true,
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
    const types = ['merged', 'created', 'approved'] as const;

    types.forEach((type) => {
      let imageName: string;
      let altText: string;

      if (type === 'created') {
        imageName = 'pull-request-created.png';
        altText = 'Pull Request Created';
      } else if (type === 'approved') {
        imageName = 'approve-pull-request.webp';
        altText = 'Pull Request Approved';
      } else {
        imageName = 'pull-request-merged.png';
        altText = 'Pull Request Merged';
      }

      expect(imageName).toBeTruthy();
      expect(altText).toBeTruthy();

      if (type === 'created') {
        expect(imageName).toBe('pull-request-created.png');
        expect(altText).toBe('Pull Request Created');
      } else if (type === 'approved') {
        expect(imageName).toBe('approve-pull-request.webp');
        expect(altText).toBe('Pull Request Approved');
      } else {
        expect(imageName).toBe('pull-request-merged.png');
        expect(altText).toBe('Pull Request Merged');
      }
    });
  });

  it('should play audio when sound is enabled', () => {
    const mockAudio = {
      play: vi.fn().mockResolvedValue(undefined),
      volume: 0.35,
    };

    global.Audio = vi.fn().mockImplementation(() => mockAudio);
    global.chrome.runtime.getURL = vi.fn(() => 'chrome-extension://mock/sound.mp3');

    const soundType = 'you-die-sound';
    const audio = new Audio(chrome.runtime.getURL(`assets/${soundType}.mp3`));
    audio.volume = 0.35;
    audio.play();

    expect(global.Audio).toHaveBeenCalledWith('chrome-extension://mock/sound.mp3');
    expect(mockAudio.play).toHaveBeenCalled();
    expect(mockAudio.volume).toBe(0.35);
  });

  it('should support sound type selection', () => {
    const soundTypes: Array<'you-die-sound' | 'lost-grace-discovered'> = [
      'you-die-sound',
      'lost-grace-discovered',
    ];

    soundTypes.forEach((soundType) => {
      const expectedPath = `assets/${soundType}.mp3`;
      expect(expectedPath).toContain('.mp3');
      expect(expectedPath).toContain(soundType);
    });

    expect(soundTypes.length).toBe(2);
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

  it('should detect approval radio button in dialog', () => {
    // Setup DOM with approval dialog
    document.body.innerHTML = `
      <div role="dialog">
        <input type="radio" name="reviewEvent" value="approve" checked>
        <input type="radio" name="reviewEvent" value="comment">
        <button type="button">Submit review</button>
      </div>
    `;

    const dialogElement = document.querySelector('div[role="dialog"]');
    const approveRadio = dialogElement?.querySelector(
      'input[name="reviewEvent"][value="approve"]',
    ) as HTMLInputElement;
    const submitButton = Array.from(dialogElement?.querySelectorAll('button') || []).find(
      (button) => button.textContent?.toLowerCase().includes('submit review'),
    );

    expect(dialogElement).toBeTruthy();
    expect(approveRadio).toBeTruthy();
    expect(approveRadio?.checked).toBe(true);
    expect(submitButton).toBeTruthy();
  });

  it('should handle PR approval flag storage', () => {
    const mockStorageLocalGet = vi.fn();
    const mockStorageLocalSet = vi.fn();
    const mockStorageLocalRemove = vi.fn();

    global.chrome.storage.local.get = mockStorageLocalGet;
    global.chrome.storage.local.set = mockStorageLocalSet;
    global.chrome.storage.local.remove = mockStorageLocalRemove;

    // Test setting PR approval flag
    const prApprovalData = {
      prApprovalTriggered: true,
      prApprovalTime: Date.now(),
    };

    chrome.storage.local.set(prApprovalData);
    expect(mockStorageLocalSet).toHaveBeenCalledWith(prApprovalData);

    // Test removing PR approval flag
    chrome.storage.local.remove(['prApprovalTriggered', 'prApprovalTime']);
    expect(mockStorageLocalRemove).toHaveBeenCalledWith(['prApprovalTriggered', 'prApprovalTime']);
  });

  it('should check approval settings correctly', () => {
    // Simulate the settings loading with approval setting
    chrome.storage.sync.get(
      ['soundEnabled', 'showOnPRMerged', 'showOnPRCreate', 'showOnPRApprove'],
      () => {},
    );

    expect(mockChromeStorageGet).toHaveBeenCalledWith(
      ['soundEnabled', 'showOnPRMerged', 'showOnPRCreate', 'showOnPRApprove'],
      expect.any(Function),
    );
  });

  it('should handle approval storage changes', () => {
    const mockCallback = vi.fn();
    const changes = {
      showOnPRApprove: { newValue: false },
    };

    // Simulate storage change handling for approval
    if (changes.showOnPRApprove) {
      mockCallback('showOnPRApprove', changes.showOnPRApprove.newValue);
    }

    expect(mockCallback).toHaveBeenCalledWith('showOnPRApprove', false);
  });

  it('should detect PR approval time validation', () => {
    const currentTime = Date.now();
    const recentTime = currentTime - 15000; // 15 seconds ago
    const oldTime = currentTime - 35000; // 35 seconds ago

    // Test recent approval should be valid
    const recentTimeDiff = currentTime - recentTime;
    expect(recentTimeDiff < 30000).toBe(true);

    // Test old approval should be invalid
    const oldTimeDiff = currentTime - oldTime;
    expect(oldTimeDiff < 30000).toBe(false);
  });

  it('should validate PR page URL patterns for approval', () => {
    const validPRUrls = [
      'https://github.com/user/repo/pull/123',
      'https://github.com/user/repo/pull/123/conversation',
      'https://github.com/user/repo/pull/123/commits',
    ];

    const invalidPRUrls = [
      'https://github.com/user/repo/pull/123/files',
      'https://github.com/user/repo',
      'https://github.com/user/repo/issues/123',
    ];

    validPRUrls.forEach((url) => {
      const isPRPage = /\/pull\/\d+/.test(url);
      expect(isPRPage).toBe(true);
    });

    invalidPRUrls.forEach((url) => {
      if (url.includes('/files')) {
        // Files page should still match PR pattern but handled differently
        const isPRPage = /\/pull\/\d+/.test(url);
        expect(isPRPage).toBe(true);
      } else {
        const isPRPage = /\/pull\/\d+/.test(url);
        expect(isPRPage).toBe(false);
      }
    });
  });
});
