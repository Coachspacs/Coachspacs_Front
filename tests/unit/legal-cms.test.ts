import { describe, it, expect } from 'vitest';
import {
  stripLeadingNumber,
  formatLegalDate,
  convertBulletTextToHtml,
  sanitizeLegalHtml,
  validateLegalEmail,
} from '@/components/cms/legal/legalUtils';

describe('Legal CMS Utilities', () => {
  describe('stripLeadingNumber', () => {
    it('should strip leading numbers in English and Arabic', () => {
      expect(stripLeadingNumber('1. Introduction')).toBe('Introduction');
      expect(stripLeadingNumber('12. Privacy Policy & Data')).toBe('Privacy Policy & Data');
      expect(stripLeadingNumber('1 - Terms of Use')).toBe('Terms of Use');
      expect(stripLeadingNumber('1) Overview')).toBe('Overview');
      expect(stripLeadingNumber('١. المقدمة والشروط')).toBe('المقدمة والشروط');
      expect(stripLeadingNumber('١٢ - جمع البيانات')).toBe('جمع البيانات');
    });

    it('should leave non-numbered titles intact', () => {
      expect(stripLeadingNumber('Introduction to Services')).toBe('Introduction to Services');
      expect(stripLeadingNumber('شروط الاستخدام العامة')).toBe('شروط الاستخدام العامة');
      expect(stripLeadingNumber('')).toBe('');
    });
  });

  describe('formatLegalDate', () => {
    it('should format ISO date strings into consistent English and Arabic representations', () => {
      const formatted = formatLegalDate('2026-10-03');
      expect(formatted.en).toContain('October 3, 2026');
      expect(formatted.ar).toContain('أكتوبر');
      expect(formatted.ar).toContain('2026');
      expect(formatted.iso).toBe('2026-10-03');
    });
  });

  describe('convertBulletTextToHtml', () => {
    it('should convert bullet points into an unordered HTML list', () => {
      const input = 'Here are our terms:\n• First item\n• Second item with details\n• Third item';
      const output = convertBulletTextToHtml(input);
      expect(output).toContain('<ul>');
      expect(output).toContain('<li>First item</li>');
      expect(output).toContain('<li>Second item with details</li>');
      expect(output).toContain('<li>Third item</li>');
      expect(output).toContain('</ul>');
    });

    it('should return already formatted HTML untouched', () => {
      const htmlInput = '<p>Regular paragraph</p><ul><li>List</li></ul>';
      expect(convertBulletTextToHtml(htmlInput)).toBe(htmlInput);
    });
  });

  describe('sanitizeLegalHtml', () => {
    it('should strip unsafe script tags and malicious attributes', () => {
      const unsafe = '<p>Safe text</p><script>alert("hack")</script><img src="x" onerror="alert(1)" />';
      const sanitized = sanitizeLegalHtml(unsafe);
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).not.toContain('onerror');
      expect(sanitized).toContain('Safe text');
    });

    it('should preserve safe formatting tags', () => {
      const safe = '<p><strong>Bold</strong> and <em>italic</em> with a <a href="https://coachspace.org">link</a></p>';
      const sanitized = sanitizeLegalHtml(safe);
      expect(sanitized).toContain('<strong>Bold</strong>');
      expect(sanitized).toContain('<em>italic</em>');
      expect(sanitized).toContain('href="https://coachspace.org"');
    });
  });

  describe('validateLegalEmail', () => {
    it('should validate email format correctly', () => {
      expect(validateLegalEmail('support@coachspace.org').isValid).toBe(true);
      expect(validateLegalEmail('legal@coachspace.com').isValid).toBe(true);
      expect(validateLegalEmail('not-an-email').isValid).toBe(false);
      expect(validateLegalEmail('').isValid).toBe(false);
    });

    it('should identify branded vs generic domains', () => {
      const gmailResult = validateLegalEmail('support@gmail.com');
      expect(gmailResult.isValid).toBe(true);
      expect(gmailResult.isBranded).toBe(false);

      const brandedResult = validateLegalEmail('support@coachspace.org');
      expect(brandedResult.isValid).toBe(true);
      expect(brandedResult.isBranded).toBe(true);
    });
  });
});
