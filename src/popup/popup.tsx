import { render } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import type { BannerType } from '../content/banner';
import { DEFAULT_CAPTIONS } from '../types/captions';
import { SOUND_TYPES, type SoundType } from '../types/sounds';
import { useSettings, type PopupSettings } from './useSettings';

type TabId = 'events' | 'appearance' | 'about';

const TABS: Array<{ id: TabId; label: string }> = [
  { id: 'events', label: 'Events' },
  { id: 'appearance', label: 'Style' },
  { id: 'about', label: 'About' },
];

interface EventConfig {
  type: BannerType;
  label: string;
  flag: keyof PopupSettings;
  captionKey: keyof PopupSettings;
}

const EVENTS: EventConfig[] = [
  { type: 'merged', label: 'PR Merged', flag: 'showOnPRMerged', captionKey: 'captionMerged' },
  { type: 'created', label: 'PR Created', flag: 'showOnPRCreate', captionKey: 'captionCreated' },
  {
    type: 'approved',
    label: 'PR Approved',
    flag: 'showOnPRApprove',
    captionKey: 'captionApproved',
  },
  { type: 'closed', label: 'PR Closed', flag: 'showOnPRClose', captionKey: 'captionClosed' },
];

const SOUND_LABELS: Record<SoundType, string> = {
  'you-die-sound': 'You Died',
  'lost-grace-discovered': 'Lost Grace Discovered',
  'flask-of-crimson-tears': 'Flask of Crimson Tears',
  'new-item': 'New Item Fanfare',
};

const DURATIONS = [
  { value: 3000, label: '3 seconds' },
  { value: 5000, label: '5 seconds' },
  { value: 7000, label: '7 seconds' },
  { value: 10000, label: '10 seconds' },
];

const TEST_BANNER_MESSAGE = { type: 'ELDEN_RING_TEST_BANNER' };

const triggerTestBanner = (): void => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tabId = tabs[0]?.id;
    if (tabId === undefined) return;

    chrome.tabs.sendMessage(tabId, TEST_BANNER_MESSAGE, () => {
      if (!chrome.runtime.lastError) return;

      // No receiver yet: inject the content-script loader, then retry.
      chrome.scripting.insertCSS({ target: { tabId }, files: ['content/styles.css'] });
      chrome.scripting.executeScript({ target: { tabId }, files: ['content-loader.js'] }, () => {
        if (chrome.runtime.lastError) return;
        chrome.tabs.sendMessage(tabId, TEST_BANNER_MESSAGE, () => void chrome.runtime.lastError);
      });
    });
  });
};

const Header = () => (
  <div class="header">
    <div class="title">Elden Ring</div>
    <div class="subtitle">GitHub Merger</div>
  </div>
);

const TabBar = ({ active, onSelect }: { active: TabId; onSelect: (id: TabId) => void }) => (
  <div class="tab-bar" role="tablist">
    {TABS.map((tab) => (
      <button
        key={tab.id}
        class={`tab ${active === tab.id ? 'tab-active' : ''}`}
        role="tab"
        aria-selected={active === tab.id}
        onClick={() => onSelect(tab.id)}
      >
        {tab.label}
      </button>
    ))}
  </div>
);

const Toggle = ({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}) => (
  <label class="setting-label">
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange((e.target as HTMLInputElement).checked)}
    />
    {label}
  </label>
);

const EventsTab = ({
  settings,
  update,
}: {
  settings: PopupSettings;
  update: (patch: Partial<PopupSettings>) => void;
}) => (
  <div class="tab-panel">
    <p class="hint">
      Toggle each event and customize its banner text. Leave text empty to use the default.
    </p>
    {EVENTS.map((event) => {
      const enabled = settings[event.flag] as boolean;
      const caption = settings[event.captionKey] as string;
      return (
        <div class="event-card" key={event.type}>
          <Toggle
            checked={enabled}
            label={event.label}
            onChange={(checked) => update({ [event.flag]: checked })}
          />
          <div class="caption-row">
            <input
              type="text"
              class="text-input"
              value={caption}
              maxLength={40}
              placeholder={DEFAULT_CAPTIONS[event.type]}
              disabled={!enabled}
              onInput={(e) => update({ [event.captionKey]: (e.target as HTMLInputElement).value })}
            />
            {caption && (
              <button
                class="reset-btn"
                title="Reset to default"
                onClick={() => update({ [event.captionKey]: '' })}
              >
                Reset
              </button>
            )}
          </div>
        </div>
      );
    })}
  </div>
);

const AppearanceTab = ({
  settings,
  update,
}: {
  settings: PopupSettings;
  update: (patch: Partial<PopupSettings>) => void;
}) => (
  <div class="tab-panel">
    <div class="setting-item">
      <label class="setting-label" for="duration">
        Banner Duration
      </label>
      <select
        id="duration"
        class="select"
        value={String(settings.duration)}
        onChange={(e) => update({ duration: parseInt((e.target as HTMLSelectElement).value, 10) })}
      >
        {DURATIONS.map((d) => (
          <option key={d.value} value={String(d.value)}>
            {d.label}
          </option>
        ))}
      </select>
    </div>

    <div class="setting-item">
      <Toggle
        checked={settings.soundEnabled}
        label="Play sound effect"
        onChange={(checked) => update({ soundEnabled: checked })}
      />
    </div>

    <div class="setting-item">
      <label class="setting-label setting-label-column" for="soundVolume">
        Sound Volume
        <input
          id="soundVolume"
          type="range"
          min={0}
          max={100}
          step={5}
          value={Math.round(settings.soundVolume * 100)}
          disabled={!settings.soundEnabled}
          onInput={(e) =>
            update({ soundVolume: parseInt((e.target as HTMLInputElement).value, 10) / 100 })
          }
        />
      </label>
    </div>

    <div class="setting-item">
      <label class="setting-label" for="soundType">
        Sound Type
      </label>
      <select
        id="soundType"
        class="select"
        value={settings.soundType}
        disabled={!settings.soundEnabled}
        onChange={(e) => update({ soundType: (e.target as HTMLSelectElement).value as SoundType })}
      >
        {SOUND_TYPES.map((type) => (
          <option key={type} value={type}>
            {SOUND_LABELS[type]}
          </option>
        ))}
      </select>
    </div>

    <button class="test-btn primary" onClick={triggerTestBanner}>
      Test Banner
    </button>
  </div>
);

const AboutTab = ({ isGitHub }: { isGitHub: boolean | null }) => (
  <div class="tab-panel">
    <div class="status">
      <div class="status-item">
        <span class="status-label">Extension</span>
        <span class="status-value active">Active</span>
      </div>
      <div class="status-item">
        <span class="status-label">Page</span>
        <span class={`status-value ${isGitHub ? 'active' : 'inactive'}`}>
          {isGitHub === null ? '…' : isGitHub ? 'GitHub' : 'Not GitHub'}
        </span>
      </div>
    </div>

    <div class="info-text">
      1. Go to any GitHub pull request
      <br />
      2. Click "Merge", "Create", "Approve" or "Close"
      <br />
      3. Enjoy the epic banner!
    </div>

    <div class="footer">
      <div class="version">v{chrome.runtime.getManifest().version}</div>
    </div>
  </div>
);

const App = () => {
  const { settings, update } = useSettings();
  const [tab, setTab] = useState<TabId>('events');
  const [isGitHub, setIsGitHub] = useState<boolean | null>(null);

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const url = tabs[0]?.url ?? '';
      setIsGitHub(url.includes('github.com'));
    });
  }, []);

  return (
    <div class="popup-container">
      <Header />
      <TabBar active={tab} onSelect={setTab} />
      {tab === 'events' && <EventsTab settings={settings} update={update} />}
      {tab === 'appearance' && <AppearanceTab settings={settings} update={update} />}
      {tab === 'about' && <AboutTab isGitHub={isGitHub} />}
    </div>
  );
};

const root = document.getElementById('app');
if (root) {
  render(<App />, root);
}
