import { ShowSettings } from './showSettings';
import { isPullRequestPage } from './pageUtils';

export interface ApprovalSuccessOptions {
  showSettings: ShowSettings;
  onApproved: () => void;
}

export interface ApprovalButtonOptions {
  showSettings: ShowSettings;
}

export const checkForPRApprovalSuccess = (options: ApprovalSuccessOptions): void => {
  if (!isPullRequestPage()) return;

  chrome.storage.local.get<{ prApprovalTriggered?: boolean; prApprovalTime?: number }>(
    ['prApprovalTriggered', 'prApprovalTime'],
    (result) => {
      if (result.prApprovalTriggered && result.prApprovalTime) {
        const timeDiff = Date.now() - result.prApprovalTime;
        if (timeDiff < 30000 && options.showSettings.isEnabled('approved')) {
          console.log('✅ PR approval detected via storage flag, showing banner');
          options.onApproved();
          chrome.storage.local.remove(['prApprovalTriggered', 'prApprovalTime']);
        } else if (timeDiff < 30000 && !options.showSettings.isEnabled('approved')) {
          console.log('🚫 PR approval detected but disabled in settings');
          chrome.storage.local.remove(['prApprovalTriggered', 'prApprovalTime']);
        }
      }
    },
  );
};

export const detectPRApprovalButtons = (options: ApprovalButtonOptions): void => {
  if (!isPullRequestPage()) {
    return;
  }

  const dialogElement = document.querySelector('div[role="dialog"]');
  if (dialogElement) {
    const buttons = Array.from(dialogElement.querySelectorAll('button'));
    const submitButton = buttons.find((button) =>
      button.textContent?.toLowerCase().includes('submit review'),
    );

    if (submitButton && !submitButton.hasAttribute('data-elden-ring-approval-listener')) {
      submitButton.addEventListener('click', () => {
        const approveRadio = dialogElement.querySelector(
          'input[name="reviewEvent"][value="approve"]',
        ) as HTMLInputElement;

        if (approveRadio && approveRadio.checked) {
          if (options.showSettings.isEnabled('approved')) {
            console.log('🎯 Submit review with approval selected');
            chrome.storage.local.set({
              prApprovalTriggered: true,
              prApprovalTime: Date.now(),
            });
          } else {
            console.log('🚫 PR approval banner disabled in settings');
          }
        }
      });
      submitButton.setAttribute('data-elden-ring-approval-listener', 'true');
    }
  }

  const approveRadios = document.querySelectorAll('input[name="reviewEvent"][value="approve"]');
  approveRadios.forEach((radio) => {
    if (!radio.hasAttribute('data-elden-ring-approval-listener')) {
      radio.addEventListener('change', () => {
        if ((radio as HTMLInputElement).checked) {
          console.log('🎯 Approve option selected');
        }
      });
      radio.setAttribute('data-elden-ring-approval-listener', 'true');
    }
  });
};
