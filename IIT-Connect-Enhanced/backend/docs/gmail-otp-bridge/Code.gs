/**
 * IIT Connect free OTP mail bridge (Google Apps Script).
 *
 * Deploy as a Web app:
 *   Execute as: Me
 *   Who has access: Anyone
 * Then set the deployed /exec URL as GMAIL_SCRIPT_URL on Render.
 * Set GMAIL_SCRIPT_SECRET on Render and in Script Properties (OTP_BRIDGE_SECRET).
 *
 * Gmail sends from the Google account that owns this script. No custom domain
 * or paid mail API is required. Gmail's daily sending quota still applies.
 */
function doPost(e) {
  const props = PropertiesService.getScriptProperties();
  const expected = props.getProperty('OTP_BRIDGE_SECRET');
  let body;

  try {
    body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
  } catch (_) {
    return json({ success: false, error: 'Invalid JSON' });
  }

  if (!expected || !body.secret || body.secret !== expected) {
    return json({ success: false, error: 'Unauthorized' });
  }

  const to = String(body.to || '').trim();
  const subject = String(body.subject || 'IIT Connect verification code').slice(0, 180);
  const text = String(body.text || '');
  const html = String(body.html || '');

  if (!to || !text) {
    return json({ success: false, error: 'Recipient and text are required' });
  }

  try {
    GmailApp.sendEmail(to, subject, text, {
      htmlBody: html || undefined,
      name: 'IIT Connect'
    });
    return json({ success: true });
  } catch (err) {
    console.error('OTP email send failed: ' + String(err));
    return json({ success: false, error: 'Gmail send failed' });
  }
}

function json(value) {
  return ContentService
    .createTextOutput(JSON.stringify(value))
    .setMimeType(ContentService.MimeType.JSON);
}
