import { ShowSettings } from './showSettings';
import { isPullRequestPage } from './pageUtils';

export interface CloseSuccessOptions {
  showSettings: ShowSettings;
  onClosed: () => void;
}

export interface CloseButtonOptions {
  showSettings: ShowSettings;
}

const CLOSE_FLAG_KEYS: Array<'prCloseTriggered' | 'prCloseTime'> = [
  'prCloseTriggered',
  'prCloseTime',
];
const CLOSE_FLAG_TTL_MS = 30000;
const CLOSED_STATE_SELECTOR = '[data-component="StateLabel"][data-status="pullClosed"]';

// The banner fires only once BOTH conditions hold: the user clicked our close
// button (intent flag), and the PR header actually shows the closed state. The
// flag alone isn't enough — otherwise a plain refresh within the TTL re-shows
// the banner. We consume the flag the moment we fire, so refreshing a
// already-closed PR never re-triggers. Runs on load and on DOM changes so it
// catches both a full reload and an in-place/Turbo close update.
export const checkForPRCloseSuccess = (options: CloseSuccessOptions): void => {
  if (!isPullRequestPage()) return;

  chrome.storage.local.get<{ prCloseTriggered?: boolean; prCloseTime?: number }>(
    CLOSE_FLAG_KEYS,
    (result) => {
      if (!result.prCloseTriggered || !result.prCloseTime) return;

      if (Date.now() - result.prCloseTime >= CLOSE_FLAG_TTL_MS) {
        chrome.storage.local.remove(CLOSE_FLAG_KEYS);
        return;
      }

      // Wait until the PR is genuinely closed; re-checked on the next DOM change.
      if (!document.querySelector(CLOSED_STATE_SELECTOR)) {
        return;
      }

      // Consume the flag first so a subsequent refresh can never re-trigger.
      chrome.storage.local.remove(CLOSE_FLAG_KEYS);

      if (options.showSettings.isEnabled('closed')) {
        console.log('☠️ PR close confirmed, showing banner');
        options.onClosed();
      } else {
        console.log('🚫 PR close detected but disabled in settings');
      }
    },
  );
};

export const detectCloseButtons = (options: CloseButtonOptions): void => {
  if (!isPullRequestPage()) {
    return;
  }

  // `name="comment_and_close"` is the stable form field for the close action;
  // the visible label toggles between "Close pull request" and "Close with
  // comment" depending on whether a comment is typed, so don't match on text.
  const closeButton = document.querySelector('button[name="comment_and_close"]');
  if (closeButton && !closeButton.hasAttribute('data-elden-ring-close-listener')) {
    closeButton.addEventListener('click', () => {
      console.log('🛑 Close pull request button clicked');
      if (options.showSettings.isEnabled('closed')) {
        console.log('📝 Setting PR close flag in storage');
        chrome.storage.local.set({
          prCloseTriggered: true,
          prCloseTime: Date.now(),
        });
      } else {
        console.log('🚫 PR close banner disabled in settings');
      }
    });
    closeButton.setAttribute('data-elden-ring-close-listener', 'true');
  }
};
