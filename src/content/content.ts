class EldenRingMerger {
  private bannerShown: boolean = false;
  private soundEnabled: boolean = true;
  private soundUrl: string;

  constructor() {
    this.soundUrl = chrome.runtime.getURL('assets/elden_ring_sound.mp3');
    this.loadSettings();
    this.init();
  }

  private loadSettings(): void {
    chrome.storage.sync.get(['soundEnabled'], (result: { soundEnabled?: boolean }) => {
      this.soundEnabled = result.soundEnabled !== false; // default true
    });

    // Listen for settings changes
    chrome.storage.onChanged.addListener(
      (changes: { [key: string]: chrome.storage.StorageChange }) => {
        if (changes.soundEnabled) {
          this.soundEnabled = changes.soundEnabled.newValue;
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
    // Detect merge button clicks
    this.detectMergeButtons();

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
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
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
            if (element.querySelector('.State.State--merged') || element.matches('.State.State--merged')) {
              console.log('✅ Merge completed successfully!');
              this.showEldenRingBanner();
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
        this.showEldenRingBanner();
        observer.disconnect();
      }
    }, 100);

    // Timeout after 10 seconds to avoid indefinite waiting
    setTimeout(() => {
      observer.disconnect();
      console.log('⏰ Merge detection timeout');
    }, 10000);
  }

  public showEldenRingBanner(): void {
    if (this.bannerShown) return;
    this.bannerShown = true;

    // Only show image banner
    this.showImageBanner();
  }

  private showImageBanner(): boolean {
    try {
      const banner = document.createElement('div');
      banner.id = 'elden-ring-banner';
      const imgPath = chrome.runtime.getURL('assets/pull-request-merged.png');
      banner.innerHTML = `<img src="${imgPath}" alt="Pull Request Merged">`;
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
