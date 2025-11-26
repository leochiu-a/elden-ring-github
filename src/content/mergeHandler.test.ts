import { describe, it, expect, vi, beforeEach } from 'vitest';
import { detectMergeButtons } from './mergeHandler';
import { ShowSettings } from './showSettings';

describe('mergeHandler', () => {
  let observerCallback: ((mutations: MutationRecord[]) => void) | null = null;

  beforeEach(() => {
    document.body.innerHTML = `
      <div class="merge-pr">
        <button>Confirm merge</button>
      </div>
    `;

    observerCallback = null;

    class MockMutationObserver {
      constructor(cb: (mutations: MutationRecord[]) => void) {
        observerCallback = cb;
      }
      observe() {}
      disconnect() {}
    }

    (globalThis as any).MutationObserver = MockMutationObserver;
  });

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
    Object.defineProperty(window, 'location', {
      value: { href: 'https://github.com/user/repo/pull/1' },
      writable: true,
    });
    const onMerged = vi.fn();
    const showSettings = createShowSettings();
    detectMergeButtons({
      showSettings,
      onMerged,
    });

    const button = document.querySelector('button');
    button?.dispatchEvent(new Event('click'));

    const mergedElement = document.createElement('div');
    mergedElement.className = 'State State--merged';

    observerCallback?.([
      {
        addedNodes: [mergedElement],
      } as unknown as MutationRecord,
    ]);

    expect(onMerged).toHaveBeenCalled();
  });

  it('should not attach listeners if not on PR page', () => {
    Object.defineProperty(window, 'location', {
      value: { href: 'https://github.com/user/repo' },
      writable: true,
    });
    const onMerged = vi.fn();
    const showSettings = createShowSettings();
    detectMergeButtons({
      showSettings,
      onMerged,
    });

    const button = document.querySelector('button');
    button?.dispatchEvent(new Event('click'));

    expect(onMerged).not.toHaveBeenCalled();
  });
});
