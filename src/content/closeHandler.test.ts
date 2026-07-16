import { describe, it, expect, vi, beforeEach } from 'vitest';
import { checkForPRCloseSuccess, detectCloseButtons } from './closeHandler';
import { ShowSettings } from './showSettings';

const createShowSettings = (showOnPRClose = true): ShowSettings =>
  new ShowSettings(
    {
      soundEnabled: true,
      soundType: 'you-die-sound',
      showOnPRMerged: true,
      showOnPRCreate: true,
      showOnPRApprove: true,
      showOnPRClose,
    },
    { autoInit: false },
  );

const setLocation = (href: string): void => {
  Object.defineProperty(window, 'location', { value: { href }, writable: true });
};

describe('detectCloseButtons', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = `
      <button name="comment_and_close" value="1">
        <span class="js-form-action-text" data-default-action-text="Close pull request">Close pull request</span>
      </button>
    `;
    setLocation('https://github.com/user/repo/pull/1');
  });

  it('should flag the close intent in storage when the button is clicked', () => {
    detectCloseButtons({ showSettings: createShowSettings() });

    const button = document.querySelector('button');
    expect(button?.hasAttribute('data-elden-ring-close-listener')).toBe(true);

    button?.dispatchEvent(new Event('click'));

    expect(chrome.storage.local.set).toHaveBeenCalledWith(
      expect.objectContaining({ prCloseTriggered: true }),
    );
  });

  it('should not flag storage when the close banner is disabled', () => {
    detectCloseButtons({ showSettings: createShowSettings(false) });

    document.querySelector('button')?.dispatchEvent(new Event('click'));

    expect(chrome.storage.local.set).not.toHaveBeenCalled();
  });

  it('should not attach a listener when not on a PR page', () => {
    setLocation('https://github.com/user/repo');
    detectCloseButtons({ showSettings: createShowSettings() });

    expect(document.querySelector('button')?.hasAttribute('data-elden-ring-close-listener')).toBe(
      false,
    );
  });
});

describe('checkForPRCloseSuccess', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = '';
    setLocation('https://github.com/user/repo/pull/1');
  });

  const stubStorage = (result: Record<string, unknown>): void => {
    (chrome.storage.local.get as ReturnType<typeof vi.fn>).mockImplementation(
      (_keys: unknown, cb: (r: Record<string, unknown>) => void) => cb(result),
    );
  };

  const addClosedStateLabel = (): void => {
    const label = document.createElement('span');
    label.setAttribute('data-component', 'StateLabel');
    label.setAttribute('data-status', 'pullClosed');
    document.body.appendChild(label);
  };

  it('should fire onClosed and clear the flag when flagged AND the closed state is shown', () => {
    stubStorage({ prCloseTriggered: true, prCloseTime: Date.now() });
    addClosedStateLabel();
    const onClosed = vi.fn();

    checkForPRCloseSuccess({ showSettings: createShowSettings(), onClosed });

    expect(onClosed).toHaveBeenCalledTimes(1);
    expect(chrome.storage.local.remove).toHaveBeenCalledWith(['prCloseTriggered', 'prCloseTime']);
  });

  it('should NOT fire when flagged but the closed state is not yet in the DOM', () => {
    stubStorage({ prCloseTriggered: true, prCloseTime: Date.now() });
    const onClosed = vi.fn();

    checkForPRCloseSuccess({ showSettings: createShowSettings(), onClosed });

    expect(onClosed).not.toHaveBeenCalled();
    // Flag is kept so a later DOM change (once closed) can still fire it.
    expect(chrome.storage.local.remove).not.toHaveBeenCalled();
  });

  it('should NOT fire on a plain refresh of a closed PR with no intent flag', () => {
    stubStorage({});
    addClosedStateLabel();
    const onClosed = vi.fn();

    checkForPRCloseSuccess({ showSettings: createShowSettings(), onClosed });

    expect(onClosed).not.toHaveBeenCalled();
  });

  it('should not fire when the close banner is disabled but should clear the flag', () => {
    stubStorage({ prCloseTriggered: true, prCloseTime: Date.now() });
    addClosedStateLabel();
    const onClosed = vi.fn();

    checkForPRCloseSuccess({ showSettings: createShowSettings(false), onClosed });

    expect(onClosed).not.toHaveBeenCalled();
    expect(chrome.storage.local.remove).toHaveBeenCalledWith(['prCloseTriggered', 'prCloseTime']);
  });

  it('should drop a stale flag older than 30s without firing', () => {
    stubStorage({ prCloseTriggered: true, prCloseTime: Date.now() - 31000 });
    addClosedStateLabel();
    const onClosed = vi.fn();

    checkForPRCloseSuccess({ showSettings: createShowSettings(), onClosed });

    expect(onClosed).not.toHaveBeenCalled();
    expect(chrome.storage.local.remove).toHaveBeenCalledWith(['prCloseTriggered', 'prCloseTime']);
  });
});
