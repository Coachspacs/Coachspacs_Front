import React from 'react';
import { CmsServerService } from '@/services/cms/cmsServerService';
import { generateBrandingCss } from '@/lib/brandingCss';

function buildGoogleFontsUrl(fonts: string[]): string | null {
  const cleanFonts = Array.from(
    new Set(
      fonts
        .map((f) => f?.trim())
        .filter(Boolean)
        .filter((f) => !['system-ui', 'sans-serif', 'serif', 'monospace'].includes(f.toLowerCase()))
    )
  );

  if (cleanFonts.length === 0) return null;

  const familyParams = cleanFonts
    .map((name) => `family=${encodeURIComponent(name).replace(/%20/g, '+')}:wght@400;500;600;700;800`)
    .join('&');

  return `https://fonts.googleapis.com/css2?${familyParams}&display=swap`;
}

export async function DynamicBrandingInjector() {
  const branding = await CmsServerService.getPublishedBranding();
  const css = generateBrandingCss(branding);

  const fontAr = branding?.fontFamilyAr || 'Cairo';
  const fontEn = branding?.fontFamilyEn || 'Plus Jakarta Sans';
  const customFont = branding?.customGoogleFontName?.trim();

  const neededFonts = [fontAr, fontEn, customFont].filter(Boolean) as string[];
  const googleFontsUrl = buildGoogleFontsUrl(neededFonts);

  const scriptContent = `
(function() {
  function getHueDiff(hex) {
    var cleanHex = (hex || '').replace('#', '');
    var r = 0, g = 0, b = 0;
    if (cleanHex.length === 3) {
      r = parseInt(cleanHex[0] + cleanHex[0], 16) / 255;
      g = parseInt(cleanHex[1] + cleanHex[1], 16) / 255;
      b = parseInt(cleanHex[2] + cleanHex[2], 16) / 255;
    } else if (cleanHex.length >= 6) {
      r = parseInt(cleanHex.substring(0, 2), 16) / 255;
      g = parseInt(cleanHex.substring(2, 4), 16) / 255;
      b = parseInt(cleanHex.substring(4, 6), 16) / 255;
    }
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h = 0;
    if (max !== min) {
      var d = max - min;
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
      h = Math.round(h * 360);
    }
    return (h - 168) + 'deg';
  }

  function loadGoogleFontDynamically(fontName) {
    if (!fontName) return;
    var id = 'dynamic-font-' + fontName.toLowerCase().replace(/\\s+/g, '-');
    if (document.getElementById(id)) return;
    var link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=' + encodeURIComponent(fontName).replace(/%20/g, '+') + ':wght@400;500;600;700;800&display=swap';
    document.head.appendChild(link);
  }

  function applyBranding(data) {
    if (!data) return;
    var root = document.documentElement;

    if (data.colors) {
      var colors = data.colors;
      if (colors.primaryMain) {
        root.style.setProperty('--color-primary-main', colors.primaryMain);
        root.style.setProperty('--brand-hue-rotate', getHueDiff(colors.primaryMain));
      }
      if (colors.primaryDark) root.style.setProperty('--color-primary-dark', colors.primaryDark);
      if (colors.primaryLight) root.style.setProperty('--color-primary-light', colors.primaryLight);
      if (colors.secondaryLight) root.style.setProperty('--color-secondary-light', colors.secondaryLight);
      if (colors.accentMint) root.style.setProperty('--color-accent-mint', colors.accentMint);
    }

    if (data.buttonRadius) root.style.setProperty('--button-radius-custom', data.buttonRadius);

    var customFont = (data.customGoogleFontName || '').trim();
    var fontAr = customFont || data.fontFamilyAr || 'Cairo';
    var fontEn = customFont || data.fontFamilyEn || 'Plus Jakarta Sans';

    if (fontAr) {
      loadGoogleFontDynamically(fontAr);
      root.style.setProperty('--font-custom-ar', "'" + fontAr + "', var(--font-cairo), system-ui, sans-serif");
    }
    if (fontEn) {
      loadGoogleFontDynamically(fontEn);
      root.style.setProperty('--font-custom-en', "'" + fontEn + "', var(--font-jakarta), system-ui, sans-serif");
    }
  }

  function syncFromStorage() {
    try {
      var cached = localStorage.getItem('coachspace_cms_branding');
      if (cached) {
        var parsed = JSON.parse(cached);
        applyBranding(parsed);
      }
    } catch(e) {}
  }

  syncFromStorage();

  window.addEventListener('cms-branding-updated', function(e) {
    if (e && e.detail) {
      applyBranding(e.detail);
    } else {
      syncFromStorage();
    }
  });

  window.addEventListener('storage', function(e) {
    if (e.key === 'coachspace_cms_branding' && e.newValue) {
      try {
        applyBranding(JSON.parse(e.newValue));
      } catch(err) {}
    }
  });
})();
`;

  return (
    <>
      {googleFontsUrl && (
        <>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link rel="stylesheet" href={googleFontsUrl} />
        </>
      )}
      <style
        id="cms-dynamic-branding"
        dangerouslySetInnerHTML={{ __html: css }}
      />
      <script
        id="cms-branding-sync"
        dangerouslySetInnerHTML={{ __html: scriptContent }}
      />
    </>
  );
}

export default DynamicBrandingInjector;
