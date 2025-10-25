# Storybook

Visual component library for CustomVenom UI components.

## Quick Start

```bash
npm run storybook
```

Opens Storybook at `http://localhost:6006`

## Available Components

- **TrustRibbon**: Trust information ribbon with version and freshness indicators
- **PageFrame**: Unified background styling per section
- **ReasonChips**: Boundary-enforced projection reason chips
- **SideNav**: Desktop sidebar navigation
- **MobileDock**: Mobile bottom navigation
- **ProLock**: Pro feature gating component

## Building Static Storybook

```bash
npm run build-storybook
```

Output: `storybook-static/`

## Adding New Stories

Create a story file in `stories/` directory:

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { YourComponent } from '../src/components/YourComponent';

const meta: Meta<typeof YourComponent> = {
  title: 'Components/YourComponent',
  component: YourComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof YourComponent>;

export const Default: Story = {
  args: {
    // Your props
  },
};
```

## Tips

- Use the `Controls` panel to interactively test props
- Use the `Actions` panel to view event handlers
- Stories are automatically documented with `autodocs` tag
