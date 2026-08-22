export type FrameOption = {
  label: string;
  src: string;
  filename: string;
};

export type CampaignId = 'ipd' | 'guru-puja';

type CampaignAccent = {
  text: string;
  borderHover: string;
  range: string;
  confirm: string;
};

type Campaign = {
  id: CampaignId;
  name: string;
  documentTitle: string;
  description: string;
  accent: CampaignAccent;
  frames: readonly [FrameOption, ...FrameOption[]];
};

const DEFAULT_CAMPAIGN_ID: CampaignId = 'ipd';

const UMANG_ACCENT: CampaignAccent = {
  text: 'text-umang-cyan',
  borderHover: 'hover:border-umang-cyan',
  range: 'accent-umang-cyan',
  confirm: 'bg-umang-cyan hover:bg-cyan-600',
};

const PEACE_ACCENT: CampaignAccent = {
  text: 'text-peace-navy',
  borderHover: 'hover:border-peace-navy',
  range: 'accent-peace-navy',
  confirm: 'bg-peace-navy hover:bg-blue-800',
};

export const CAMPAIGNS: Record<CampaignId, Campaign> = {
  ipd: {
    id: 'ipd',
    name: 'International Peace Day',
    documentTitle: 'Umang · International Peace Day',
    description: 'Create an International Peace Day DP from your photo',
    accent: PEACE_ACCENT,
    frames: [
      {
        label: 'International Peace Day',
        src: '/frame-ypf-ipd.png',
        filename: 'umang-ipd-dp.png',
      },
    ],
  },
  'guru-puja': {
    id: 'guru-puja',
    name: 'Guru Puja',
    documentTitle: 'Umang · Guru Puja',
    description: 'Create a Guru Puja DP from your photo',
    accent: UMANG_ACCENT,
    frames: [
      {
        label: 'Peace & Humanity',
        src: '/frame-hnp.png',
        filename: 'umang-dp-hnp.png',
      },
      {
        label: 'Joy',
        src: '/frame-joy.png',
        filename: 'umang-dp-joy.png',
      },
      {
        label: 'Clarity',
        src: '/frame-clarity.png',
        filename: 'umang-dp-clarity.png',
      },
      {
        label: 'Heartfulness',
        src: '/frame-heartfulness.png',
        filename: 'umang-dp-heartfulness.png',
      },
    ],
  },
};

export function parseCampaignId(search: string): CampaignId {
  return new URLSearchParams(search).get('campaign') === 'guru-puja'
    ? 'guru-puja'
    : DEFAULT_CAMPAIGN_ID;
}

export function applyCampaignToUrl(url: URL, id: CampaignId): void {
  if (id === DEFAULT_CAMPAIGN_ID) {
    url.searchParams.delete('campaign');
    return;
  }

  url.searchParams.set('campaign', id);
}
