import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { detectMergeButtons } from './mergeHandler';
import { ShowSettings } from './showSettings';

describe('mergeHandler', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    document.body.innerHTML = `
      <div data-testid="mergebox-border-container">
        <button data-component="Button" data-variant="primary">Confirm merge</button>
      </div>
    `;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const setLocation = (href: string): void => {
    Object.defineProperty(window, 'location', { value: { href }, writable: true });
  };

  const createShowSettings = (): ShowSettings =>
    new ShowSettings(
      {
        soundEnabled: true,
        soundType: 'you-die-sound',
        showOnPRMerged: true,
        showOnPRCreate: true,
        showOnPRApprove: true,
        showOnPRClose: true,
      },
      { autoInit: false },
    );

  it('should trigger onMerged when merged state appears', () => {
    setLocation('https://github.com/user/repo/pull/1');
    const onMerged = vi.fn();
    const showSettings = createShowSettings();
    detectMergeButtons({
      showSettings,
      onMerged,
    });

    const button = document.querySelector('button');
    button?.dispatchEvent(new Event('click'));

    const mergedElement = document.createElement('span');
    mergedElement.setAttribute('data-component', 'StateLabel');
    mergedElement.setAttribute('data-status', 'pullMerged');
    document.body.appendChild(mergedElement);

    vi.advanceTimersByTime(300);

    expect(onMerged).toHaveBeenCalled();
  });

  it('should not trigger onMerged if merged state never appears before timeout', () => {
    setLocation('https://github.com/user/repo/pull/1');
    const onMerged = vi.fn();
    const showSettings = createShowSettings();
    detectMergeButtons({
      showSettings,
      onMerged,
    });

    const button = document.querySelector('button');
    button?.dispatchEvent(new Event('click'));

    vi.advanceTimersByTime(15000);

    expect(onMerged).not.toHaveBeenCalled();
  });

  it('should not attach a listener to the initial "Merge pull request" opener button', () => {
    setLocation('https://github.com/user/repo/pull/1');
    document.body.innerHTML = `
      <div data-testid="mergebox-border-container">
        <button data-component="Button" data-variant="primary">Merge pull request</button>
      </div>
    `;
    const onMerged = vi.fn();
    const showSettings = createShowSettings();
    detectMergeButtons({
      showSettings,
      onMerged,
    });

    const button = document.querySelector('button');
    button?.dispatchEvent(new Event('click'));

    vi.advanceTimersByTime(15000);

    expect(onMerged).not.toHaveBeenCalled();
    expect(button?.hasAttribute('data-elden-ring-listener')).toBe(false);
  });

  it('should not attach listeners if not on PR page', () => {
    setLocation('https://github.com/user/repo');
    const onMerged = vi.fn();
    const showSettings = createShowSettings();
    detectMergeButtons({
      showSettings,
      onMerged,
    });

    const button = document.querySelector('button');
    button?.dispatchEvent(new Event('click'));

    vi.advanceTimersByTime(300);

    expect(onMerged).not.toHaveBeenCalled();
  });
});
