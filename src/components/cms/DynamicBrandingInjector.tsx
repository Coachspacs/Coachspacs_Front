import React from 'react';
import { CmsServerService } from '@/services/cms/cmsServerService';

export async function DynamicBrandingInjector() {
  const branding = await CmsServerService.getPublishedBranding();
  const { colors, buttonRadius } = branding;

  const cssString = `
    :root {
      ${colors.primaryMain ? `--color-primary-main: ${colors.primaryMain};` : ''}
      ${colors.primaryDark ? `--color-primary-dark: ${colors.primaryDark};` : ''}
      ${colors.primaryLight ? `--color-primary-light: ${colors.primaryLight};` : ''}
      ${colors.secondaryLight ? `--color-secondary-light: ${colors.secondaryLight};` : ''}
      ${colors.accentMint ? `--color-accent-mint: ${colors.accentMint};` : ''}
      ${buttonRadius ? `--button-radius-custom: ${buttonRadius};` : ''}
    }
  `;

  return (
    <style
      id="cms-dynamic-branding"
      dangerouslySetInnerHTML={{ __html: cssString }}
    />
  );
}
