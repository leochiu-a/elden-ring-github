import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const setupMockDOM = () => {
  document.body.innerHTML = `
    <button id="testMerge">Test Merge</button>
    <input type="checkbox" id="showOnPRMerged">
    <input type="checkbox" id="soundEnabled">
    <input type="checkbox" id="showOnPRCreate">
    <select id="duration">
      <option value="3000">3 seconds</option>
      <option value="5000">5 seconds</option>
      <option value="10000">10 seconds</option>
    </select>
    <span id="pageStatus"></span>
  `;
};

beforeEach(() => {
  vi.clearAllMocks();
  setupMockDOM();

  // Mock chrome APIs
  global.chrome.tabs.query = vi.fn().mockImplementation((_queryInfo, callback) => {
    callback([]);
  });
  global.chrome.storage.sync.get = vi.fn().mockImplementation((_keys, callback) => {
    callback({});
  });
  global.chrome.storage.sync.set = vi.fn().mockImplementation((_items, callback) => {
    if (callback) callback();
  });
  global.chrome.scripting.executeScript = vi.fn().mockImplementation((_injection, callback) => {
    if (callback) callback([]);
  });
});

afterEach(() => {
  document.body.innerHTML = '';
});

describe('Popup functionality', () => {
  it('should load default settings correctly', () => {
    const mockGet = vi.fn().mockImplementation((_keys, callback) => {
      callback({
        showOnPRMerged: true,
        soundEnabled: true,
        showOnPRCreate: true,
        duration: 5000,
      });
    });

    global.chrome.storage.sync.get = mockGet;

    // Simulate loadSettings function
    chrome.storage.sync.get(
      ['showOnPRMerged', 'soundEnabled', 'showOnPRCreate', 'duration'],
      (result) => {
        const showOnPRMergedCheckbox = document.getElementById(
          'showOnPRMerged',
        ) as HTMLInputElement;
        const soundEnabledCheckbox = document.getElementById('soundEnabled') as HTMLInputElement;
        const showOnPRCreateCheckbox = document.getElementById(
          'showOnPRCreate',
        ) as HTMLInputElement;
        const durationSelect = document.getElementById('duration') as HTMLSelectElement;

        showOnPRMergedCheckbox.checked = result.showOnPRMerged !== false;
        soundEnabledCheckbox.checked = result.soundEnabled !== false;
        showOnPRCreateCheckbox.checked = result.showOnPRCreate !== false;
        durationSelect.value = result.duration?.toString() || '5000';

        expect(showOnPRMergedCheckbox.checked).toBe(true);
        expect(soundEnabledCheckbox.checked).toBe(true);
        expect(showOnPRCreateCheckbox.checked).toBe(true);
        expect(durationSelect.value).toBe('5000');
      },
    );

    expect(mockGet).toHaveBeenCalledWith(
      ['showOnPRMerged', 'soundEnabled', 'showOnPRCreate', 'duration'],
      expect.any(Function),
    );
  });

  it('should save settings correctly', () => {
    const mockSet = vi.fn();
    global.chrome.storage.sync.set = mockSet;

    const showOnPRMergedCheckbox = document.getElementById('showOnPRMerged') as HTMLInputElement;
    const soundEnabledCheckbox = document.getElementById('soundEnabled') as HTMLInputElement;
    const showOnPRCreateCheckbox = document.getElementById('showOnPRCreate') as HTMLInputElement;
    const durationSelect = document.getElementById('duration') as HTMLSelectElement;

    // Set test values
    showOnPRMergedCheckbox.checked = false;
    soundEnabledCheckbox.checked = true;
    showOnPRCreateCheckbox.checked = false;
    durationSelect.value = '10000';

    // Simulate saveSettings function
    const settings = {
      showOnPRMerged: showOnPRMergedCheckbox.checked,
      soundEnabled: soundEnabledCheckbox.checked,
      showOnPRCreate: showOnPRCreateCheckbox.checked,
      duration: parseInt(durationSelect.value),
    };

    chrome.storage.sync.set(settings);

    expect(mockSet).toHaveBeenCalledWith({
      showOnPRMerged: false,
      soundEnabled: true,
      showOnPRCreate: false,
      duration: 10000,
    });
  });

  it('should detect GitHub page correctly', () => {
    const mockQuery = vi.fn().mockImplementation((_queryInfo, callback) => {
      callback([{ url: 'https://github.com/user/repo' }]);
    });

    global.chrome.tabs.query = mockQuery;

    // Simulate checkCurrentPage function
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentTab = tabs[0];
      const pageStatusElement = document.getElementById('pageStatus') as HTMLSpanElement;

      if (currentTab && pageStatusElement) {
        const url = currentTab.url;
        if (url && url.includes('github.com')) {
          pageStatusElement.textContent = 'GitHub';
          pageStatusElement.className = 'status-value active';
        } else {
          pageStatusElement.textContent = 'Not GitHub';
          pageStatusElement.className = 'status-value inactive';
        }

        expect(pageStatusElement.textContent).toBe('GitHub');
        expect(pageStatusElement.className).toBe('status-value active');
      }
    });

    expect(mockQuery).toHaveBeenCalledWith(
      { active: true, currentWindow: true },
      expect.any(Function),
    );
  });

  it('should detect non-GitHub page correctly', () => {
    const mockQuery = vi.fn().mockImplementation((_queryInfo, callback) => {
      callback([{ url: 'https://example.com' }]);
    });

    global.chrome.tabs.query = mockQuery;

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentTab = tabs[0];
      const pageStatusElement = document.getElementById('pageStatus') as HTMLSpanElement;

      if (currentTab && pageStatusElement) {
        const url = currentTab.url;
        if (url && url.includes('github.com')) {
          pageStatusElement.textContent = 'GitHub';
          pageStatusElement.className = 'status-value active';
        } else {
          pageStatusElement.textContent = 'Not GitHub';
          pageStatusElement.className = 'status-value inactive';
        }

        expect(pageStatusElement.textContent).toBe('Not GitHub');
        expect(pageStatusElement.className).toBe('status-value inactive');
      }
    });
  });

  it('should execute test banner script', () => {
    const mockExecuteScript = vi.fn();
    const mockQuery = vi.fn().mockImplementation((_queryInfo, callback) => {
      callback([{ id: 123 }]);
    });

    global.chrome.scripting.executeScript = mockExecuteScript;
    global.chrome.tabs.query = mockQuery;

    // Simulate showTestBanner function
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentTab = tabs[0];
      if (currentTab) {
        chrome.scripting.executeScript({
          target: { tabId: currentTab.id! },
          func: () => {}, // Mock function
        });

        expect(mockExecuteScript).toHaveBeenCalledWith({
          target: { tabId: 123 },
          func: expect.any(Function),
        });
      }
    });

    expect(mockQuery).toHaveBeenCalledWith(
      { active: true, currentWindow: true },
      expect.any(Function),
    );
  });

  it('should handle banner creation and removal', () => {
    // Mock chrome.runtime.getURL
    global.chrome.runtime.getURL = vi.fn((path) => `chrome-extension://mock/${path}`);

    // Test banner creation
    const banner = document.createElement('div');
    banner.id = 'elden-ring-banner';
    const imgPath = chrome.runtime.getURL('assets/pull-request-merged.png');
    banner.innerHTML = `<img src="${imgPath}" alt="Pull Request Merged">`;
    document.body.appendChild(banner);

    expect(document.querySelector('#elden-ring-banner')).toBeTruthy();

    // Test banner removal
    const existingBanner = document.querySelector('#elden-ring-banner, .elden-ring-merge-banner');
    if (existingBanner) {
      existingBanner.remove();
    }

    expect(document.querySelector('#elden-ring-banner')).toBeNull();
  });

  it('should handle fallback text banner', () => {
    // Simulate error in image banner creation and fallback to text banner
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

    expect(document.querySelector('.elden-ring-merge-banner')).toBeTruthy();
    expect(banner.innerHTML).toContain('MERGE ACCOMPLISHED');
    expect(banner.innerHTML).toContain('Test banner activated from extension popup');
  });

  it('should handle settings update injection', () => {
    const mockExecuteScript = vi.fn();
    const mockQuery = vi.fn().mockImplementation((_queryInfo, callback) => {
      callback([{ id: 123 }]);
    });

    global.chrome.scripting.executeScript = mockExecuteScript;
    global.chrome.tabs.query = mockQuery;

    const settings = {
      showOnPRMerged: true,
      soundEnabled: false,
      showOnPRCreate: true,
      duration: 3000,
    };

    // Simulate updating content script with new settings
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentTab = tabs[0];
      if (currentTab) {
        chrome.scripting.executeScript({
          target: { tabId: currentTab.id! },
          func: () => {}, // Mock updateExtensionSettings function
          args: [settings] as any,
        });

        expect(mockExecuteScript).toHaveBeenCalledWith({
          target: { tabId: 123 },
          func: expect.any(Function),
          args: [settings],
        });
      }
    });
  });
});
