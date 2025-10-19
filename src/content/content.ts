class EldenRingMerger {
  private bannerShown: boolean = false;
  private soundEnabled: boolean = true;
  private showOnPRMerged: boolean = true;
  private showOnPRCreate: boolean = true;
  private showOnPRApprove: boolean = true;
  private soundType: 'you-die-sound' | 'lost-grace-discovered' = 'you-die-sound';
  private soundUrl: string;

  constructor() {
    this.soundUrl = this.getSoundUrl();
    this.loadSettings();
    this.init();
  }

  private getSoundUrl(): string {
    return chrome.runtime.getURL(`assets/${this.soundType}.mp3`);
  }

  private updateSoundUrl(): void {
    this.soundUrl = this.getSoundUrl();
  }

  private loadSettings(): void {
    chrome.storage.sync.get(
      ['soundEnabled', 'showOnPRMerged', 'showOnPRCreate', 'showOnPRApprove', 'soundType'],
      (result: {
        soundEnabled?: boolean;
        showOnPRMerged?: boolean;
        showOnPRCreate?: boolean;
        showOnPRApprove?: boolean;
        soundType?: 'you-die-sound' | 'lost-grace-discovered';
      }) => {
        this.soundEnabled = result.soundEnabled !== false; // default true
        this.showOnPRMerged = result.showOnPRMerged !== false; // default true
        this.showOnPRCreate = result.showOnPRCreate !== false; // default true
        this.showOnPRApprove = result.showOnPRApprove !== false; // default true
        this.soundType = result.soundType || 'you-die-sound'; // default you-die-sound
        this.updateSoundUrl();
      },
    );

    // Listen for settings changes
    chrome.storage.onChanged.addListener(
      (changes: { [key: string]: chrome.storage.StorageChange }) => {
        if (changes.soundEnabled) {
          this.soundEnabled = changes.soundEnabled.newValue;
        }
        if (changes.showOnPRMerged) {
          this.showOnPRMerged = changes.showOnPRMerged.newValue;
        }
        if (changes.showOnPRCreate) {
          this.showOnPRCreate = changes.showOnPRCreate.newValue;
        }
        if (changes.showOnPRApprove) {
          this.showOnPRApprove = changes.showOnPRApprove.newValue;
        }
        if (changes.soundType) {
          this.soundType = changes.soundType.newValue;
          this.updateSoundUrl();
        }
      },
    );
  }

  private init(): void {
    // Wait for page to load
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setupMergeDetection());
    } else {
      this.setupMergeDetection();
    }
  }

  private setupMergeDetection(): void {
    // Check if we just created a PR and should show banner
    this.checkForPRCreationSuccess();

    // Check if we just approved a PR and should show banner
    this.checkForPRApprovalSuccess();

    // Detect merge button clicks
    this.detectMergeButtons();

    // Detect PR creation button clicks
    this.detectPRCreationButtons();

    // Detect PR approval button clicks
    this.detectPRApprovalButtons();

    // Observe DOM changes for dynamically loaded content
    this.observeDOMChanges();
  }

  private detectMergeButtons(): void {
    // First check if we're on a PR page
    const currentUrl = window.location.href;
    const isPRPage = /\/pull\/\d+/.test(currentUrl);
    if (!isPRPage) {
      return;
    }

    // Look for buttons with merge text in .merge-pr container
    const mergePrContainer = document.querySelector('.merge-pr');
    if (mergePrContainer) {
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
            this.waitForMergeComplete();
          });
          button.setAttribute('data-elden-ring-listener', 'true');
        }
      });
    }
  }

  private observeDOMChanges(): void {
    // Observe for GitHub's dynamic content loading
    const observer = new MutationObserver(() => {
      this.detectMergeButtons();
      this.detectPRCreationButtons();
      this.detectPRApprovalButtons();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  private checkForPRCreationSuccess(): void {
    // Check if we're on a PR page and if creation was recently triggered
    const currentUrl = window.location.href;
    const isPRPage = /\/pull\/\d+/.test(currentUrl);

    if (!isPRPage) return;

    chrome.storage.local.get(['prCreationTriggered', 'prCreationTime'], (result) => {
      if (result.prCreationTriggered && result.prCreationTime) {
        const timeDiff = Date.now() - result.prCreationTime;
        // If the PR was created within the last 30 seconds and the setting is enabled, show banner
        if (timeDiff < 30000 && this.showOnPRCreate) {
          console.log('✅ PR creation detected via storage flag, showing banner');
          this.showEldenRingBanner('created');

          // Clear the flag so we don't show banner again
          chrome.storage.local.remove(['prCreationTriggered', 'prCreationTime']);
        } else if (timeDiff < 30000 && !this.showOnPRCreate) {
          console.log('🚫 PR creation detected but disabled in settings');
          // Still clear the flag even if disabled
          chrome.storage.local.remove(['prCreationTriggered', 'prCreationTime']);
        }
      }
    });
  }

  private checkForPRApprovalSuccess(): void {
    // Check if we're on a PR page and if approval was recently triggered
    const currentUrl = window.location.href;
    const isPRPage = /\/pull\/\d+/.test(currentUrl);

    if (!isPRPage) return;

    chrome.storage.local.get(['prApprovalTriggered', 'prApprovalTime'], (result) => {
      if (result.prApprovalTriggered && result.prApprovalTime) {
        const timeDiff = Date.now() - result.prApprovalTime;
        // If the PR was approved within the last 30 seconds and the setting is enabled, show banner
        if (timeDiff < 30000 && this.showOnPRApprove) {
          console.log('✅ PR approval detected via storage flag, showing banner');
          this.showEldenRingBanner('approved');

          // Clear the flag so we don't show banner again
          chrome.storage.local.remove(['prApprovalTriggered', 'prApprovalTime']);
        } else if (timeDiff < 30000 && !this.showOnPRApprove) {
          console.log('🚫 PR approval detected but disabled in settings');
          // Still clear the flag even if disabled
          chrome.storage.local.remove(['prApprovalTriggered', 'prApprovalTime']);
        }
      }
    });
  }

  private detectPRCreationButtons(): void {
    // Check if we're on a compare page
    const currentUrl = window.location.href;
    const isComparePage = /\/compare/.test(currentUrl);
    if (!isComparePage) {
      return;
    }

    // Look for "Create pull request" button using GitHub's specific selector
    const createButton = document.querySelector('.hx_create-pr-button');
    if (createButton && !createButton.hasAttribute('data-elden-ring-listener')) {
      createButton.addEventListener('click', () => {
        console.log('🎯 Create pull request button clicked');
        // Only set the flag if the feature is enabled
        if (this.showOnPRCreate) {
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
  }

  private detectPRApprovalButtons(): void {
    // Check if we're on a PR page (including files view)
    const currentUrl = window.location.href;
    const isPRPage = /\/pull\/\d+/.test(currentUrl);
    if (!isPRPage) {
      return;
    }

    // Look for "Submit review" buttons within dialog
    const dialogElement = document.querySelector('div[role="dialog"]');
    if (dialogElement) {
      const buttons = Array.from(dialogElement.querySelectorAll('button'));
      const submitButton = buttons.find((button) =>
        button.textContent?.toLowerCase().includes('submit review'),
      );

      if (submitButton && !submitButton.hasAttribute('data-elden-ring-approval-listener')) {
        submitButton.addEventListener('click', () => {
          // Check if approve radio button is selected within the same dialog at click time
          const approveRadio = dialogElement.querySelector(
            'input[name="reviewEvent"][value="approve"]',
          ) as HTMLInputElement;

          if (approveRadio && approveRadio.checked) {
            if (this.showOnPRApprove) {
              console.log('🎯 Submit review with approval selected');
              // Store approval flag for when we navigate back to PR page
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

    // Also look for the approve radio button directly
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
  }

  private waitForMergeComplete(): void {
    // Watch for the merged state to appear
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            // Check for merge success indicator
            if (
              element.querySelector('.State.State--merged') ||
              element.matches('.State.State--merged')
            ) {
              console.log('✅ Merge completed successfully!');
              if (this.showOnPRMerged) {
                this.showEldenRingBanner();
              } else {
                console.log('🚫 PR merge banner disabled in settings');
              }
              observer.disconnect(); // Stop observing once we find the merged state
            }
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Also check if the merged state already exists (in case we missed it)
    setTimeout(() => {
      const mergedElement = document.querySelector('.State.State--merged');
      if (mergedElement) {
        console.log('✅ Merge state already present!');
        if (this.showOnPRMerged) {
          this.showEldenRingBanner();
        } else {
          console.log('🚫 PR merge banner disabled in settings');
        }
        observer.disconnect();
      }
    }, 100);

    // Timeout after 10 seconds to avoid indefinite waiting
    setTimeout(() => {
      observer.disconnect();
      console.log('⏰ Merge detection timeout');
    }, 10000);
  }

  public showEldenRingBanner(type: 'merged' | 'created' | 'approved' = 'merged'): void {
    if (this.bannerShown) return;
    this.bannerShown = true;

    // Only show image banner
    this.showImageBanner(type);
  }

  private showImageBanner(type: 'merged' | 'created' | 'approved' = 'merged'): boolean {
    try {
      const banner = document.createElement('div');
      banner.id = 'elden-ring-banner';
      let imageName: string;
      let altText: string;

      if (type === 'created') {
        imageName = 'pull-request-created.png';
        altText = 'Pull Request Created';
      } else if (type === 'approved') {
        imageName = 'approve-pull-request.png';
        altText = 'Pull Request Approved';
      } else {
        imageName = 'pull-request-merged.png';
        altText = 'Pull Request Merged';
      }

      const imgPath = chrome.runtime.getURL(`assets/${imageName}`);
      banner.innerHTML = `<img src="${imgPath}" alt="${altText}">`;
      document.body.appendChild(banner);

      // Play sound effect
      if (this.soundEnabled) {
        const audio = new Audio(this.soundUrl);
        audio.volume = 1.0;
        audio.play().catch((err) => console.log('Sound playback failed:', err));
      }

      setTimeout(() => banner.classList.add('show'), 50);
      setTimeout(() => {
        banner.classList.remove('show');
        setTimeout(() => {
          if (banner.parentNode) {
            banner.remove();
          }
          this.bannerShown = false;
        }, 500);
      }, 3000);

      return true;
    } catch (error) {
      console.log('Image banner failed, using text banner:', error);
      return false;
    }
  }
}

// Initialize the extension
new EldenRingMerger();
