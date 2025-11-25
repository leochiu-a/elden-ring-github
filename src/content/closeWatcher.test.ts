import { describe, it, expect, vi, beforeEach } from 'vitest';
import { waitForCloseComplete } from './closeWatcher';

describe('waitForCloseComplete', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('should trigger callback immediately if closed state already exists', () => {
    document.body.innerHTML = `
      <span class="State State--closed">Closed</span>
    `;

    const onClose = vi.fn();
    waitForCloseComplete(onClose);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should trigger callback when closed state is added later', async () => {
    const onClose = vi.fn();
    waitForCloseComplete(onClose);

    const closedElement = document.createElement('span');
    closedElement.className = 'State State--closed';
    closedElement.textContent = 'Closed';
    document.body.appendChild(closedElement);

    await new Promise((resolve) => setTimeout(resolve, 150));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
