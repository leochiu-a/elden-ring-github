import { ShowSettings } from './showSettings';
import { isPullRequestPage } from './pageUtils';

export interface CreationSuccessOptions {
  showSettings: ShowSettings;
  onCreated: () => void;
}

export interface CreationButtonOptions {
  showSettings: ShowSettings;
}

export const checkForPRCreationSuccess = (options: CreationSuccessOptions): void => {
  if (!isPullRequestPage()) return;

  chrome.storage.local.get<{ prCreationTriggered?: boolean; prCreationTime?: number }>(
    ['prCreationTriggered', 'prCreationTime'],
    (result) => {
      if (result.prCreationTriggered && result.prCreationTime) {
        const timeDiff = Date.now() - result.prCreationTime;
        if (timeDiff < 30000 && options.showSettings.isEnabled('created')) {
          console.log('✅ PR creation detected via storage flag, showing banner');
          options.onCreated();
          chrome.storage.local.remove(['prCreationTriggered', 'prCreationTime']);
        } else if (timeDiff < 30000 && !options.showSettings.isEnabled('created')) {
          console.log('🚫 PR creation detected but disabled in settings');
          chrome.storage.local.remove(['prCreationTriggered', 'prCreationTime']);
        }
      }
    },
  );
};

export const detectPRCreationButtons = (options: CreationButtonOptions): void => {
  const currentUrl = window.location.href;
  const isComparePage = /\/compare/.test(currentUrl);
  if (!isComparePage) {
    return;
  }

  const createButton = document.querySelector('.hx_create-pr-button');
  if (createButton && !createButton.hasAttribute('data-elden-ring-listener')) {
    createButton.addEventListener('click', () => {
      console.log('🎯 Create pull request button clicked');
      if (options.showSettings.isEnabled('created')) {
        console.log('📝 Setting PR creation flag in storage');
        chrome.storage.local.set({
          prCreationTriggered: true,
          prCreationTime: Date.now(),
        });
      } else {
        console.log('🚫 PR creation banner disabled in settings');
      }
    });
    createButton.setAttribute('data-elden-ring-listener', 'true');
  }
};
