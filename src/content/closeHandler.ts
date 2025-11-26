import { ShowSettings } from './showSettings';
import { isPullRequestPage } from './pageUtils';
import { CLOSE_DETECTION_TIMEOUT_MS, CLOSE_EXISTING_CHECK_DELAY_MS } from './constants';

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
        waitForCloseCompletion(options.onClosed);
      });
      button.setAttribute('data-elden-ring-close-listener', 'true');
    }
  });
};

export const waitForCloseCompletion = (onClosed: () => void): void => {
  let closeHandled = false;
  let checkTimeout: ReturnType<typeof setTimeout> | null = null;
  let cleanupTimeout: ReturnType<typeof setTimeout> | null = null;

  const cleanup = (): void => {
    if (checkTimeout) {
      clearTimeout(checkTimeout);
      checkTimeout = null;
    }
    if (cleanupTimeout) {
      clearTimeout(cleanupTimeout);
      cleanupTimeout = null;
    }
  };

  const isClosedState = (element: Element | null): boolean => {
    if (!element) return false;
    if (!element.matches('.State.State--closed')) {
      return false;
    }
    const text = element.textContent?.toLowerCase().trim() || '';
    return text.includes('closed');
  };

  const handleClose = (observer: MutationObserver): void => {
    if (closeHandled) return;
    closeHandled = true;
    console.log('☠️ Pull request closed!');
    cleanup();
    onClosed();
    observer.disconnect();
  };

  const checkExistingClosedState = (observer: MutationObserver): boolean => {
    const closedElement = document.querySelector('.State.State--closed');
    if (isClosedState(closedElement)) {
      handleClose(observer);
      return true;
    }
    return false;
  };

  const observer = new MutationObserver((mutations) => {
    if (closeHandled) return;

    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType !== Node.ELEMENT_NODE || closeHandled) {
          return;
        }

        const element = node as Element;
        if (isClosedState(element)) {
          handleClose(observer);
          return;
        }

        const closedElement = element.querySelector('.State.State--closed');
        if (isClosedState(closedElement)) {
          handleClose(observer);
        }
      });
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  if (checkExistingClosedState(observer)) {
    return;
  }

  checkTimeout = setTimeout(() => {
    if (!closeHandled) {
      checkExistingClosedState(observer);
    }
  }, CLOSE_EXISTING_CHECK_DELAY_MS);

  cleanupTimeout = setTimeout(() => {
    if (!closeHandled) {
      cleanup();
      observer.disconnect();
      console.log('⏰ Close detection timeout');
    }
  }, CLOSE_DETECTION_TIMEOUT_MS);
};
