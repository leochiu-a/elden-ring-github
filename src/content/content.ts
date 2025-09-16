class EldenRingMerger {
  private bannerShown: boolean = false;
  private soundEnabled: boolean = true;
  private showOnPRMerged: boolean = true;
  private showOnPRCreate: boolean = true;
  private soundUrl: string;

  constructor() {
    this.soundUrl = chrome.runtime.getURL('assets/elden_ring_sound.mp3');
    this.loadSettings();
    this.init();
  }

  private loadSettings(): void {
    chrome.storage.sync.get(
      ['soundEnabled', 'showOnPRMerged', 'showOnPRCreate'],
      (result: { soundEnabled?: boolean; showOnPRMerged?: boolean; showOnPRCreate?: boolean }) => {
        this.soundEnabled = result.soundEnabled !== false; // default true
        this.showOnPRMerged = result.showOnPRMerged !== false; // default true
        this.showOnPRCreate = result.showOnPRCreate !== false; // default true
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

    // Detect merge button clicks
    this.detectMergeButtons();

    // Detect PR creation button clicks
    this.detectPRCreationButtons();

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

  public showEldenRingBanner(type: 'merged' | 'created' = 'merged'): void {
    if (this.bannerShown) return;
    this.bannerShown = true;

    // Only show image banner
    this.showImageBanner(type);
  }

  private showImageBanner(type: 'merged' | 'created' = 'merged'): boolean {
    try {
      const banner = document.createElement('div');
      banner.id = 'elden-ring-banner';
      const imageName = type === 'created' ? 'pull-request-created.png' : 'pull-request-merged.png';
      const altText = type === 'created' ? 'Pull Request Created' : 'Pull Request Merged';
      const imgPath = chrome.runtime.getURL(`assets/${imageName}`);
      banner.innerHTML = `<img src="${imgPath}" alt="${altText}">`;
      document.body.appendChild(banner);

      // Play sound effect
      if (this.soundEnabled) {
        const audio = new Audio(this.soundUrl);
        audio.volume = 0.35;
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
