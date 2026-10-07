import { BrandConfig, TemplateStyle } from '../types';

export function buildCompleteEmailHtml(
  bodyHtml: string,
  brand: BrandConfig,
  recipientName: string = '',
  dateStr: string = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
): string {
  const {
    companyName,
    tagline,
    logoUrl,
    logoSize,
    logoAlign,
    primaryColor,
    templateStyle,
    signature,
  } = brand;

  const logoWidthPx = logoSize === 'small' ? 90 : logoSize === 'large' ? 180 : 130;
  const logoAlignStyle =
    logoAlign === 'center' ? 'text-align: center; margin: 0 auto;' :
    logoAlign === 'right' ? 'text-align: right; margin-left: auto;' :
    'text-align: left; margin-right: auto;';

  const logoImgHtml = logoUrl
    ? `<img src="${logoUrl}" alt="${companyName || 'Company'}" width="${logoWidthPx}" style="max-width: 100%; height: auto; display: inline-block; vertical-align: middle; border: 0;" />`
    : companyName
    ? `<div style="display: inline-block; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 20px; font-weight: 700; color: ${primaryColor}; letter-spacing: -0.02em;">${companyName}</div>`
    : '';

  // Signature Block
  const signatureHtml = signature.senderName ? `
    <table cellpadding="0" cellspacing="0" border="0" style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e2e8f0; width: 100%; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <tr>
        <td style="vertical-align: top;">
          <div style="font-size: 15px; font-weight: 700; color: #1e293b;">${signature.senderName}</div>
          ${signature.jobTitle ? `<div style="font-size: 13px; color: #64748b; font-weight: 500; margin-top: 2px;">${signature.jobTitle}${signature.department ? ` &bull; ${signature.department}` : ''}</div>` : ''}
          ${signature.company ? `<div style="font-size: 13px; color: ${primaryColor}; font-weight: 600; margin-top: 2px;">${signature.company}</div>` : ''}
          <div style="font-size: 12px; color: #64748b; margin-top: 8px; line-height: 1.6;">
            ${signature.phone ? `<span>Phone: <a href="tel:${signature.phone}" style="color: #64748b; text-decoration: none;">${signature.phone}</a></span><br/>` : ''}
            ${signature.website ? `<span>Web: <a href="${signature.website.startsWith('http') ? signature.website : 'https://' + signature.website}" style="color: ${primaryColor}; text-decoration: underline;">${signature.website}</a></span>` : ''}
          </div>
        </td>
      </tr>
    </table>
  ` : '';

  // Legal / Confidentiality Disclaimer
  const disclaimerHtml = signature.includeDisclaimer && signature.disclaimerText ? `
    <div style="margin-top: 28px; padding-top: 16px; border-top: 1px dashed #e2e8f0; font-size: 11px; color: #94a3b8; line-height: 1.5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <strong>Confidentiality Notice:</strong> ${signature.disclaimerText}
    </div>
  ` : '';

  // Template variants
  if (templateStyle === 'modern') {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${companyName}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8fafc; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 14px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
          <!-- Top Accent Bar -->
          <tr>
            <td style="height: 6px; background-color: ${primaryColor};"></td>
          </tr>
          <!-- Header with Logo -->
          <tr>
            <td style="padding: 28px 36px 20px 36px; ${logoAlignStyle}">
              ${logoImgHtml}
              ${tagline ? `<div style="font-size: 12px; color: #94a3b8; margin-top: 4px; font-weight: 500;">${tagline}</div>` : ''}
            </td>
          </tr>
          <!-- Email Body Content -->
          <tr>
            <td style="padding: 12px 36px 32px 36px; font-size: 15px; line-height: 1.7; color: #334155;">
              ${bodyHtml}
              ${signatureHtml}
              ${disclaimerHtml}
            </td>
          </tr>
        </table>
        <!-- Simple Footer -->
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%; margin-top: 16px;">
          <tr>
            <td align="center" style="font-size: 12px; color: #94a3b8; font-family: sans-serif;">
              &copy; ${new Date().getFullYear()} ${companyName || 'All Rights Reserved'}.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  }

  if (templateStyle === 'minimalist') {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; padding: 24px 16px;">
    <tr>
      <td align="center">
        <table width="580" cellpadding="0" cellspacing="0" border="0" style="max-width: 580px; width: 100%; text-align: left;">
          <!-- Discreet Minimal Logo -->
          <tr>
            <td style="padding-bottom: 24px; ${logoAlignStyle} border-bottom: 1px solid #f1f5f9;">
              ${logoImgHtml}
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding-top: 24px; font-size: 15px; line-height: 1.75; color: #1e293b;">
              ${bodyHtml}
              ${signatureHtml}
              ${disclaimerHtml}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  }

  if (templateStyle === 'letter') {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: Georgia, 'Times New Roman', serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f1f5f9; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table width="640" cellpadding="0" cellspacing="0" border="0" style="max-width: 640px; width: 100%; background-color: #ffffff; padding: 48px; border: 1px solid #cbd5e1; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          <!-- Corporate Letterhead Header -->
          <tr>
            <td style="border-bottom: 2px solid ${primaryColor}; padding-bottom: 20px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="vertical-align: middle; ${logoAlignStyle}">
                    ${logoImgHtml}
                    ${tagline ? `<div style="font-family: sans-serif; font-size: 12px; color: #64748b; margin-top: 4px;">${tagline}</div>` : ''}
                  </td>
                  <td style="text-align: right; vertical-align: middle; font-family: sans-serif; font-size: 12px; color: #64748b; line-height: 1.4;">
                    <strong>${companyName}</strong><br/>
                    ${dateStr}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Recipient Greeting Block -->
          ${recipientName ? `
          <tr>
            <td style="padding-top: 24px; font-family: sans-serif; font-size: 13px; color: #475569;">
              To: <strong>${recipientName}</strong>
            </td>
          </tr>` : ''}
          <!-- Formal Body -->
          <tr>
            <td style="padding-top: 24px; font-size: 16px; line-height: 1.8; color: #1e293b;">
              ${bodyHtml}
              ${signatureHtml}
              ${disclaimerHtml}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  }

  // Default: 'executive'
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${companyName}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f1f5f9; padding: 36px 12px;">
    <tr>
      <td align="center">
        <table width="620" cellpadding="0" cellspacing="0" border="0" style="max-width: 620px; width: 100%; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.08); border: 1px solid #e2e8f0;">
          <!-- Top Executive Banner -->
          <tr>
            <td style="background-color: ${primaryColor}; padding: 24px 36px; text-align: left;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="${logoAlignStyle} vertical-align: middle;">
                    ${logoUrl ? `<img src="${logoUrl}" alt="${companyName || 'Company'}" width="${logoWidthPx}" style="max-width: 100%; height: auto; display: inline-block; background-color: #ffffff; padding: 6px 10px; border-radius: 6px;" />` : `<span style="font-size: 22px; font-weight: 700; color: #ffffff; letter-spacing: -0.02em;">${companyName || 'Executive Dispatch'}</span>`}
                  </td>
                  ${tagline ? `
                  <td style="text-align: right; vertical-align: middle; color: rgba(255,255,255,0.85); font-size: 12px; font-weight: 500;">
                    ${tagline}
                  </td>` : ''}
                </tr>
              </table>
            </td>
          </tr>
          <!-- Email Content -->
          <tr>
            <td style="padding: 32px 36px; font-size: 15px; line-height: 1.72; color: #1e293b;">
              ${bodyHtml}
              ${signatureHtml}
              ${disclaimerHtml}
            </td>
          </tr>
          <!-- Clean Base Bar -->
          <tr>
            <td style="background-color: #f8fafc; padding: 16px 36px; border-top: 1px solid #f1f5f9; text-align: center; font-size: 11px; color: #94a3b8;">
              Sent on behalf of ${companyName || 'Our Organization'} &bull; Confidential Business Communication
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
