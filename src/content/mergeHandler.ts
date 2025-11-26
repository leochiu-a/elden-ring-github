import { ShowSettings } from './showSettings';
import { isPullRequestPage } from './pageUtils';

export interface MergeHandlerOptions {
  showSettings: ShowSettings;
  onMerged: () => void;
}

export const detectMergeButtons = (options: MergeHandlerOptions): void => {
  if (!isPullRequestPage()) {
    return;
  }

  const mergePrContainer = document.querySelector('.merge-pr');
  if (!mergePrContainer) {
    return;
  }

  const buttons = mergePrContainer.querySelectorAll('button');
  buttons.forEach((button) => {
    const buttonText = button.textContent?.toLowerCase().trim() || '';
    const specificMergeTexts = [
      'confirm merge',
      'confirm squash and merge',
      'confirm rebase and merge',
    ];

    if (
      specificMergeTexts.some((text) => buttonText.includes(text)) &&
      !button.hasAttribute('data-elden-ring-listener')
    ) {
      button.addEventListener('click', () => {
        console.log('🎯 Merge button clicked:', buttonText);
        waitForMergeComplete(options);
      });
      button.setAttribute('data-elden-ring-listener', 'true');
    }
  });
};

const waitForMergeComplete = (options: MergeHandlerOptions): void => {
  const { showSettings, onMerged } = options;

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as Element;
          if (
            element.querySelector('.State.State--merged') ||
            element.matches('.State.State--merged')
          ) {
            console.log('✅ Merge completed successfully!');
            if (showSettings.isEnabled('merged')) {
              onMerged();
            } else {
              console.log('🚫 PR merge banner disabled in settings');
            }
            observer.disconnect();
          }
        }
      });
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  setTimeout(() => {
    const mergedElement = document.querySelector('.State.State--merged');
    if (mergedElement) {
      console.log('✅ Merge state already present!');
      if (showSettings.isEnabled('merged')) {
        onMerged();
      } else {
        console.log('🚫 PR merge banner disabled in settings');
      }
      observer.disconnect();
    }
  }, 100);

  setTimeout(() => {
    observer.disconnect();
    console.log('⏰ Merge detection timeout');
  }, 10000);
};
