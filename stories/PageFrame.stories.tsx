import type { Meta, StoryObj } from '@storybook/react';
import { PageFrame } from '../src/components/PageFrame';

const meta: Meta<typeof PageFrame> = {
  title: 'Components/PageFrame',
  component: PageFrame,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof PageFrame>;

export const Projections: Story = {
  args: {
    section: 'projections',
    children: <div className="p-8">Projections content</div>,
  },
};

export const Tools: Story = {
  args: {
    section: 'tools',
    children: <div className="p-8">Tools content</div>,
  },
};

export const League: Story = {
  args: {
    section: 'league',
    children: <div className="p-8">League content</div>,
  },
};

export const Settings: Story = {
  args: {
    section: 'settings',
    children: <div className="p-8">Settings content</div>,
  },
};

