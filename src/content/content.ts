import { renderBanner, type BannerType } from './banner';
import {
  MergeFeature,
  CreationFeature,
  ApprovalFeature,
  CloseFeature,
  type GitHubFeature,
} from './features';
import { ShowSettings, type SettingsState } from './showSettings';
import type { SoundType } from '../types/settings';

class EldenRingOrchestrator {
  private bannerShown: boolean = false;
  private soundEnabled: boolean = true;
  private soundType: SoundType = 'you-die-sound';
  private soundUrl: string;
  private features: GitHubFeature[] = [];
  private showSettings = new ShowSettings();

  constructor() {
    this.soundUrl = this.getSoundUrl();
    this.showSettings.subscribe((state) => this.applySettings(state));
    this.features = this.createFeatures();
    this.init();
  }

  private getSoundUrl(): string {
    return chrome.runtime.getURL(`assets/${this.soundType}.mp3`);
  }

  private updateSoundUrl(): void {
    this.soundUrl = this.getSoundUrl();
  }

  private applySettings(state: SettingsState): void {
    this.soundEnabled = state.soundEnabled;
    this.soundType = state.soundType;
    this.updateSoundUrl();
  }

  private init(): void {
    // Wait for page to load
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.initializeFeatures());
    } else {
      this.initializeFeatures();
    }
  }

  private initializeFeatures(): void {
    this.features.forEach((feature) => feature.initialize());
    this.observeDOMChanges();
  }

  private observeDOMChanges(): void {
    // Observe for GitHub's dynamic content loading
    const observer = new MutationObserver(() => {
      this.features.forEach((feature) => feature.onDomChange());
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  public showEldenRingBanner(type: BannerType): void {
    if (this.bannerShown) return;
    this.bannerShown = true;

    const defaultSoundUrl =
      type === 'closed' ? chrome.runtime.getURL('assets/you-die-sound.mp3') : this.soundUrl;

    const success = renderBanner({
      type,
      soundUrl: defaultSoundUrl,
      soundEnabled: this.soundEnabled,
      onHide: () => {
        this.bannerShown = false;
      },
    });

    if (!success) {
      this.bannerShown = false;
    }
  }

  private createFeatures(): GitHubFeature[] {
    return [
      new MergeFeature({
        showSettings: this.showSettings,
        onMerged: () => this.showEldenRingBanner('merged'),
      }),
      new CreationFeature({
        showSettings: this.showSettings,
        onCreated: () => this.showEldenRingBanner('created'),
      }),
      new ApprovalFeature({
        showSettings: this.showSettings,
        onApproved: () => this.showEldenRingBanner('approved'),
      }),
      new CloseFeature({
        showSettings: this.showSettings,
        onCloseCelebration: () => this.showEldenRingBanner('closed'),
      }),
    ];
  }
}

// Initialize the extension
new EldenRingOrchestrator();
