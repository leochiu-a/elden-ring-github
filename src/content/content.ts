// Elden Ring GitHub Merger Extension
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

    // Detect successful merge via URL or page changes
    this.detectMergeSuccess();
  }

  private detectMergeButtons(): void {
    // Listen for merge button clicks
    document.addEventListener('click', (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      // Check if it's a merge button
      if (this.isMergeButton(target)) {
        this.onMergeInitiated();
      }
    });
  }

  private isMergeButton(element: HTMLElement): boolean {
    // Various selectors for GitHub merge buttons
    const mergeSelectors = [
      '[data-details-container-group="merge"]',
      '.merge-message button[type="submit"]',
      '.js-merge-commit-button',
      '.js-merge-box button[type="submit"]',
      'button[data-disable-with*="merge"]',
      'button[data-disable-with*="Merge"]',
    ];

    return mergeSelectors.some((selector) => {
      return element.matches?.(selector) || element.closest?.(selector);
    });
  }

  private detectMergeSuccess(): void {
    // Watch for successful merge indicators
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            // Check for merge success indicators
            if (this.isSuccessfulMerge(node)) {
              this.showEldenRingBanner();
            }
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  private isSuccessfulMerge(element: Element): boolean {
    // Look for merge success indicators
    const successSelectors = [
      '.merge-status-item.merged',
      '.State--merged',
      '[data-test-selector="pr-timeline-merged-event"]',
      '.timeline-comment-wrapper .merged',
    ];

    const successTexts = ['merged', 'Pull request successfully merged', 'Merged'];

    // Check selectors
    if (
      successSelectors.some(
        (selector) => element.matches(selector) || element.querySelector(selector),
      )
    ) {
      return true;
    }

    // Check text content
    const text = element.textContent?.toLowerCase() || '';
    return successTexts.some((successText) => text.includes(successText.toLowerCase()));
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

  private onMergeInitiated(): void {
    // Show banner after a short delay to allow for merge processing
    setTimeout(() => {
      this.showEldenRingBanner();
    }, 2000);
  }

  public showEldenRingBanner(): void {
    if (this.bannerShown) return;
    this.bannerShown = true;

    // Try to show image banner first, fallback to text banner
    if (this.showImageBanner()) {
      return;
    }

    // Fallback to text banner
    const banner = this.createTextBanner();
    document.body.appendChild(banner);

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

  private createTextBanner(): HTMLDivElement {
    const banner = document.createElement('div');
    banner.className = 'elden-ring-merge-banner';
    banner.innerHTML = `
      <div class="elden-ring-banner-content">
        <div class="elden-ring-text">
          <h1>MERGE ACCOMPLISHED</h1>
          <p>You have merged the pull request</p>
        </div>
        <div class="elden-ring-close" onclick="this.parentElement.parentElement.remove()">×</div>
      </div>
    `;

    return banner;
  }

  private hideBanner(banner: HTMLElement): void {
    if (banner && banner.parentNode) {
      banner.classList.add('fade-out');
      setTimeout(() => {
        if (banner.parentNode) {
          banner.parentNode.removeChild(banner);
        }
        this.bannerShown = false;
      }, 500);
    }
  }
}

// Initialize the extension
new EldenRingMerger();
