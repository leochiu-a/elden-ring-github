import { detectMergeButtons } from './mergeHandler';
import { checkForPRCreationSuccess, detectPRCreationButtons } from './createHandler';
import { checkForPRApprovalSuccess, detectPRApprovalButtons } from './approveHandler';
import { checkForPRCloseSuccess, detectCloseButtons } from './closeHandler';
import { ShowSettings } from './showSettings';

export interface GitHubFeature {
  initialize(): void;
  onDomChange(): void;
}

interface MergeFeatureOptions {
  showSettings: ShowSettings;
  onMerged: () => void;
}

export class MergeFeature implements GitHubFeature {
  constructor(private options: MergeFeatureOptions) {}

  private runDetection(): void {
    detectMergeButtons({
      showSettings: this.options.showSettings,
      onMerged: this.options.onMerged,
    });
  }

  initialize(): void {
    this.runDetection();
  }

  onDomChange(): void {
    this.runDetection();
  }
}

interface CreationFeatureOptions {
  showSettings: ShowSettings;
  onCreated: () => void;
}

export class CreationFeature implements GitHubFeature {
  constructor(private options: CreationFeatureOptions) {}

  initialize(): void {
    checkForPRCreationSuccess({
      showSettings: this.options.showSettings,
      onCreated: this.options.onCreated,
    });
    detectPRCreationButtons({
      showSettings: this.options.showSettings,
    });
  }

  onDomChange(): void {
    detectPRCreationButtons({
      showSettings: this.options.showSettings,
    });
  }
}

interface ApprovalFeatureOptions {
  showSettings: ShowSettings;
  onApproved: () => void;
}

export class ApprovalFeature implements GitHubFeature {
  constructor(private options: ApprovalFeatureOptions) {}

  initialize(): void {
    checkForPRApprovalSuccess({
      showSettings: this.options.showSettings,
      onApproved: this.options.onApproved,
    });
    detectPRApprovalButtons({
      showSettings: this.options.showSettings,
    });
  }

  onDomChange(): void {
    detectPRApprovalButtons({
      showSettings: this.options.showSettings,
    });
  }
}

interface CloseFeatureOptions {
  showSettings: ShowSettings;
  onCloseCelebration: () => void;
}

export class CloseFeature implements GitHubFeature {
  constructor(private options: CloseFeatureOptions) {}

  initialize(): void {
    checkForPRCloseSuccess({
      showSettings: this.options.showSettings,
      onClosed: this.options.onCloseCelebration,
    });
    detectCloseButtons({
      showSettings: this.options.showSettings,
    });
  }

  onDomChange(): void {
    checkForPRCloseSuccess({
      showSettings: this.options.showSettings,
      onClosed: this.options.onCloseCelebration,
    });
    detectCloseButtons({
      showSettings: this.options.showSettings,
    });
  }
}
