import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { google } from 'googleapis';

admin.initializeApp();
const db = admin.firestore();

interface SheetRegistrationRow {
  email: string;
  displayName: string;
  churchId: string;
  groupName?: string;
}

interface SheetResourceRow {
  trackId: string;
  bookId: number;
  chapter: number;
  type: string;
  url: string;
  title: string;
  locale: string;
}

interface SheetVoucherRow {
  code: string;
  churchId: string;
  trackId: string;
  redeemed: string;
  redeemedBy?: string;
}

/**
 * HTTP endpoint: import Google Sheets rows into Firestore.
 * Sheets tabs: registrations | resources | vouchers
 * Set env: SHEETS_ID, GOOGLE_SERVICE_ACCOUNT (JSON)
 */
export const importFromSheets = functions.https.onRequest(async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).send('POST only');
    return;
  }
  const secret = process.env.IMPORT_SECRET;
  if (secret && req.headers['x-import-secret'] !== secret) {
    res.status(401).send('Unauthorized');
    return;
  }

  const sheetsId = process.env.SHEETS_ID;
  if (!sheetsId) {
    res.status(500).send('SHEETS_ID not configured');
    return;
  }

  const auth = new google.auth.GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
  const sheets = google.sheets({ version: 'v4', auth });

  const tab = (req.body?.tab as string) || 'registrations';
  const range = `${tab}!A2:Z`;

  const response = await sheets.spreadsheets.values.get({ spreadsheetId: sheetsId, range });
  const rows = response.data.values || [];
  let imported = 0;

  if (tab === 'registrations') {
    for (const row of rows) {
      const [email, displayName, churchId, groupName] = row;
      if (!email || !churchId) continue;
      const ref = db.collection('pendingRegistrations').doc(email.replace(/[@.]/g, '_'));
      await ref.set({
        email,
        displayName: displayName || email,
        churchId,
        groupName: groupName || '',
        importedAt: admin.firestore.FieldValue.serverTimestamp(),
      } satisfies SheetRegistrationRow & { importedAt: unknown });
      imported++;
    }
  } else if (tab === 'resources') {
    const batch = db.batch();
    for (const row of rows) {
      const [trackId, bookId, chapter, type, url, title, locale] = row;
      if (!url) continue;
      const id = `${trackId}_${bookId}_${chapter}_${locale}`;
      batch.set(db.collection('contentResources').doc(id), {
        trackId,
        bookId: parseInt(bookId, 10),
        chapter: parseInt(chapter, 10),
        type,
        url,
        title,
        locale,
      } satisfies SheetResourceRow);
      imported++;
    }
    await batch.commit();
  } else if (tab === 'vouchers') {
    for (const row of rows) {
      const [code, churchId, trackId, redeemed, redeemedBy] = row;
      if (!code) continue;
      await db.collection('vouchers').doc(code).set({
        code,
        churchId,
        trackId,
        redeemed: redeemed === 'TRUE',
        redeemedBy: redeemedBy || null,
      } satisfies SheetVoucherRow);
      imported++;
    }
  }

  res.json({ ok: true, tab, imported });
});

const TRACK_UNIT_TOTALS: Record<string, number> = {
  ot_front: 436,
  ot_back: 493,
  nt: 260,
};

/** Issue certificate record when user completes all three tracks */
export const onProgressWrite = functions.firestore
  .document('users/{userId}/progress/{progressId}')
  .onWrite(async (change, context) => {
    const userId = context.params.userId;
    const after = change.after.data();
    if (!after || after.status !== 'completed') return;

    for (const [trackId, required] of Object.entries(TRACK_UNIT_TOTALS)) {
      const snap = await db
        .collection('users')
        .doc(userId)
        .collection('progress')
        .where('trackId', '==', trackId)
        .where('status', '==', 'completed')
        .count()
        .get();
      if (snap.data().count < required) return;
    }

    const userDoc = await db.collection('users').doc(userId).get();
    const displayName = (userDoc.data()?.displayName as string) || 'Reader';
    const html = `<!DOCTYPE html><html><body style="font-family:serif;text-align:center;padding:48px">
<h1>聖經三跑道讀經完成證書</h1>
<p>茲證明 ${displayName} 已完成舊約前部、舊約後部與新約讀經跑道。</p>
</body></html>`;

    const bucket = admin.storage().bucket();
    const filePath = `certificates/${userId}/all_tracks.html`;
    await bucket.file(filePath).save(html, { contentType: 'text/html' });

    await db.collection('users').doc(userId).collection('rewards').doc('certificate_all_tracks').set({
      type: 'certificate',
      issuedAt: admin.firestore.FieldValue.serverTimestamp(),
      title: '三跑道讀經完成證書',
      storagePath: filePath,
    });
  });

/** FCM reminder — callable from pastor dashboard cron */
export const sendReadingReminder = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Login required');
  const { token, title, body } = data as { token: string; title: string; body: string };
  await admin.messaging().send({
    token,
    notification: { title: title || '今日讀經', body: body || '記得打開 App 讀經喔' },
  });
  return { ok: true };
});
