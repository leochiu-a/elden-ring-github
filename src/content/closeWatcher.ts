let closeHandled = false;

const isClosedState = (element: Element | null): boolean => {
  if (!element) return false;
  if (!element.matches('.State.State--closed')) {
    return false;
  }
  const text = element.textContent?.toLowerCase().trim() || '';
  return text.includes('closed');
};

const handleClose = (observer: MutationObserver, onClose: () => void): void => {
  if (closeHandled) return;
  closeHandled = true;
  console.log('☠️ Pull request closed!');
  onClose();
  observer.disconnect();
};

const checkExistingClosedState = (observer: MutationObserver, onClose: () => void): boolean => {
  const closedElement = document.querySelector('.State.State--closed');
  if (isClosedState(closedElement)) {
    handleClose(observer, onClose);
    return true;
  }
  return false;
};

export const waitForCloseComplete = (onClose: () => void, timeoutMs: number = 10000): void => {
  closeHandled = false;

  const observer = new MutationObserver((mutations) => {
    if (closeHandled) return;

    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType !== Node.ELEMENT_NODE || closeHandled) {
          return;
        }

        const element = node as Element;
        if (isClosedState(element)) {
          handleClose(observer, onClose);
          return;
        }

        const closedElement = element.querySelector('.State.State--closed');
        if (isClosedState(closedElement)) {
          handleClose(observer, onClose);
        }
      });
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  if (checkExistingClosedState(observer, onClose)) {
    return;
  }

  setTimeout(() => {
    checkExistingClosedState(observer, onClose);
  }, 100);

  setTimeout(() => {
    observer.disconnect();
    console.log('⏰ Close detection timeout');
  }, timeoutMs);
};
