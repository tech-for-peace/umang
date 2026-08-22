export type FrameOption = {
  label: string;
  src: string;
  filename: string;
};

type CampaignId = 'ipd' | 'guru-puja';

type CampaignAccent = {
  text: string;
  borderHover: string;
  range: string;
  confirm: string;
};

type Campaign = {
  name: string;
  accent: CampaignAccent;
  frames: readonly [FrameOption, ...FrameOption[]];
};

const DEFAULT_CAMPAIGN_ID: CampaignId = 'guru-puja';

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
    name: 'International Peace Day',
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
    name: 'Guru Puja',
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

export function parseCampaignId(pathname: string): CampaignId {
  const path = pathname.replace(/\/+$/, '') || '/';
  return path === '/ypf' ? 'ipd' : DEFAULT_CAMPAIGN_ID;
}
