import { ShowSettings } from './showSettings';
import { isPullRequestPage } from './pageUtils';
import { MERGE_POLL_INTERVAL_MS, MERGE_DETECTION_TIMEOUT_MS } from './constants';

export interface MergeHandlerOptions {
  showSettings: ShowSettings;
  onMerged: () => void;
}

export const detectMergeButtons = (options: MergeHandlerOptions): void => {
  if (!isPullRequestPage()) {
    return;
  }

  const mergePrContainer = document.querySelector('[data-testid="mergebox-border-container"]');
  if (!mergePrContainer) {
    return;
  }

  const specificMergeTexts = [
    'confirm merge',
    'confirm squash and merge',
    'confirm rebase and merge',
  ];

  const buttons = mergePrContainer.querySelectorAll(
    'button[data-component="Button"][data-variant="primary"]',
  );
  buttons.forEach((button) => {
    if (button.hasAttribute('data-elden-ring-listener')) {
      return;
    }

    const buttonText = button.textContent?.toLowerCase().trim() || '';
    if (!specificMergeTexts.some((text) => buttonText.includes(text))) {
      return;
    }

    button.addEventListener('click', () => {
      console.log('🎯 Merge button clicked:', buttonText);
      waitForMergeComplete(options);
    });
    button.setAttribute('data-elden-ring-listener', 'true');
  });
};

const MERGED_STATE_SELECTOR = '[data-component="StateLabel"][data-status="pullMerged"]';

let activeMergePollId: ReturnType<typeof setInterval> | null = null;

const waitForMergeComplete = (options: MergeHandlerOptions): void => {
  const { showSettings, onMerged } = options;

  if (activeMergePollId !== null) {
    clearInterval(activeMergePollId);
  }

  const stopPolling = (): void => {
    clearInterval(intervalId);
    clearTimeout(timeoutId);
    activeMergePollId = null;
  };

  const intervalId = setInterval(() => {
    if (!document.querySelector(MERGED_STATE_SELECTOR)) {
      return;
    }
    stopPolling();
    console.log('✅ Merge completed successfully!');
    if (showSettings.isEnabled('merged')) {
      onMerged();
    } else {
      console.log('🚫 PR merge banner disabled in settings');
    }
  }, MERGE_POLL_INTERVAL_MS);

  const timeoutId = setTimeout(() => {
    stopPolling();
    console.log('⏰ Merge detection timeout');
  }, MERGE_DETECTION_TIMEOUT_MS);

  activeMergePollId = intervalId;
};
