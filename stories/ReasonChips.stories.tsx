import type { Meta, StoryObj } from '@storybook/react';

import { ReasonChips } from '../src/components/ReasonChips';
import type { Reason } from '../src/lib/reasonsClamp';

const meta: Meta<typeof ReasonChips> = {
  title: 'Components/ReasonChips',
  component: ReasonChips,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ReasonChips>;

const highConfidenceReasons: Reason[] = [
  { label: 'Favorable matchup', effect: 2.5, confidence: 0.85 },
  { label: 'Injury return', effect: 1.8, confidence: 0.75 },
];

const mixedReasons: Reason[] = [
  { label: 'Favorable matchup', effect: 2.5, confidence: 0.85 },
  { label: 'Tough defense', effect: -1.2, confidence: 0.70 },
];

const lowConfidenceReasons: Reason[] = [
  { label: 'Uncertain factor', effect: 0.5, confidence: 0.45 },
];

export const HighConfidence: Story = {
  args: {
    reasons: highConfidenceReasons,
  },
};

export const MixedPositiveNegative: Story = {
  args: {
    reasons: mixedReasons,
  },
};

export const LowConfidenceFiltered: Story = {
  args: {
    reasons: lowConfidenceReasons,
  },
};

export const Empty: Story = {
  args: {
    reasons: [],
  },
};

