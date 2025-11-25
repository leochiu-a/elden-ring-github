import { ShowSettings } from './showSettings';
import { isPullRequestPage } from './pageUtils';
import { waitForCloseComplete } from './closeWatcher';

export interface CloseHandlerOptions {
  showSettings: ShowSettings;
  onClosed: () => void;
}

export const detectCloseButtons = (options: CloseHandlerOptions): void => {
  if (!isPullRequestPage() || !options.showSettings.isEnabled('closed')) {
    return;
  }

  const closeButtonContainer = document.querySelector('#partial-new-comment-form-actions');
  if (!closeButtonContainer) {
    return;
  }

  const closeButtons = closeButtonContainer.querySelectorAll('button');
  closeButtons.forEach((button) => {
    const buttonText = button.textContent?.toLowerCase().trim() || '';
    if (
      buttonText.includes('close pull request') &&
      !button.hasAttribute('data-elden-ring-close-listener')
    ) {
      button.addEventListener('click', () => {
        console.log('🛑 Close pull request button clicked');
        waitForCloseComplete(() => options.onClosed());
      });
      button.setAttribute('data-elden-ring-close-listener', 'true');
    }
  });
};
