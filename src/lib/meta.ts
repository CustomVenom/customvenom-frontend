/**
 * Meta utilities
 * SEO and Open Graph helpers
 */

export interface MetaConfig {
  title: string;
  description: string;
  ogImage?: string;
  ogType?: string;
}

export function generateMetaTags(config: MetaConfig): string {
  const tags = [
    `<title>${config.title}</title>`,
    `<meta name="description" content="${config.description}" />`,
    `<meta property="og:title" content="${config.title}" />`,
    `<meta property="og:description" content="${config.description}" />`,
    `<meta property="og:type" content="${config.ogType || 'website'}" />`,
  ];

  if (config.ogImage) {
    tags.push(`<meta property="og:image" content="${config.ogImage}" />`);
  }

  return tags.join('\n');
}

export function getDefaultMeta(pageName: string): MetaConfig {
  return {
    title: `${pageName} — Custom Venom`,
    description: 'Fantasy Football Decision Support powered by explainable AI',
    ogType: 'website',
  };
}
