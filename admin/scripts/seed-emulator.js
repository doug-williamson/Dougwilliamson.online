/**
 * Seeds the Firebase Auth emulator with the admin Google user and writes
 * `site-config/default` to the Firestore emulator (for FolioKit blog/admin).
 *
 * Run AFTER `firebase emulators:start` is up.
 * Usage: node scripts/seed-emulator.js
 *
 * Production: deploy `firestore.rules`, then create `site-config/default`
 * via the Admin site-config UI if it does not exist yet.
 */

const AUTH_EMULATOR = 'http://127.0.0.1:9099';
const FIRESTORE_EMULATOR_HOST = '127.0.0.1';
const FIRESTORE_EMULATOR_PORT = 8080;
const PROJECT_ID = 'dougwilliamson-online';

// Must match `siteId` in app.config.ts → provideFolioKit({ siteId: ... }).
// When this is anything other than 'default', FolioKit routes all Firestore
// reads to tenants/{SITE_ID}/... (multi-tenant mode).
const SITE_ID = 'dougwilliamson';

/** Public web config (same project as blog `environment.ts`). */
const FIREBASE_WEB_CONFIG = {
  apiKey: 'AIzaSyDAR62TZbezrBOZ-nld4oz4DaSlZh82o2k',
  authDomain: 'dougwilliamson-online.firebaseapp.com',
  projectId: PROJECT_ID,
};

const ADMIN_USER = {
  email: 'douglasmwilliamson@gmail.com',
  displayName: 'Douglas Williamson',
};

/**
 * Builds a minimal, unsigned JWT that looks like a Google ID token.
 * The Auth emulator decodes the payload without signature verification,
 * so any well-formed JWT with the expected claims is accepted.
 */
function buildFakeGoogleIdToken({ email, displayName }) {
  const encode = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url');
  const header = encode({ alg: 'RS256', typ: 'JWT' });
  const now = Math.floor(Date.now() / 1000);
  const payload = encode({
    iss: 'https://accounts.google.com',
    aud: PROJECT_ID,
    sub: `google-${Buffer.from(email).toString('hex')}`,
    email,
    email_verified: true,
    name: displayName,
    iat: now,
    exp: now + 3600,
  });
  return `${header}.${payload}.fakesignature`;
}

async function clearUsers() {
  const res = await fetch(
    `${AUTH_EMULATOR}/emulator/v1/projects/${PROJECT_ID}/accounts`,
    { method: 'DELETE' },
  );
  if (!res.ok) throw new Error(`Failed to clear users: ${res.status}`);
  console.log('Cleared existing emulator users.');
}

/**
 * Creates a Google-provider user in the Auth emulator via the identitytoolkit
 * signInWithIdp endpoint. The emulator accepts the fake Google ID token and
 * creates (or upserts) the corresponding Firebase user.
 */
async function createGoogleUser({ email, displayName }) {
  const fakeIdToken = buildFakeGoogleIdToken({ email, displayName });
  const res = await fetch(
    `${AUTH_EMULATOR}/identitytoolkit.googleapis.com/v1/accounts:signInWithIdp?key=fake-api-key`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        postBody: `id_token=${fakeIdToken}&providerId=google.com`,
        requestUri: 'http://localhost',
        returnIdpCredential: true,
        returnSecureToken: true,
      }),
    },
  );
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Failed to create Google user ${email}: ${res.status} ${body}`);
  }
  const data = await res.json();
  console.log(`Created Google user: ${email} (uid: ${data.localId})`);
}

async function seedDefaultSiteConfig() {
  const { initializeApp } = await import('firebase/app');
  const { getAuth, connectAuthEmulator, signInWithCredential, GoogleAuthProvider } = await import(
    'firebase/auth',
  );
  const { getFirestore, connectFirestoreEmulator, doc, setDoc, Timestamp } = await import(
    'firebase/firestore',
  );

  const app = initializeApp(FIREBASE_WEB_CONFIG);
  const auth = getAuth(app);
  connectAuthEmulator(auth, AUTH_EMULATOR, { disableWarnings: true });

  const db = getFirestore(app);
  connectFirestoreEmulator(db, FIRESTORE_EMULATOR_HOST, FIRESTORE_EMULATOR_PORT);

  // Sign in using the same fake Google ID token — emulator accepts it without
  // signature verification, mirroring the popup flow in the browser.
  const fakeIdToken = buildFakeGoogleIdToken(ADMIN_USER);
  const credential = GoogleAuthProvider.credential(fakeIdToken);
  const { user } = await signInWithCredential(auth, credential);

  // Tenant document — required so TenantConfigRef.ownerEmail is populated and
  // AuthService.isAdmin() passes via ownerEmail (primary check), not just adminEmail.
  await setDoc(doc(db, 'tenants', SITE_ID), {
    tenantId: SITE_ID,
    subdomain: SITE_ID,
    ownerUid: user.uid,
    ownerEmail: ADMIN_USER.email,
    displayName: 'Doug Williamson',
    customDomain: { domain: null, status: 'none', txtRecord: null, cnameRecord: null, appHostingDomainName: null, errorMessage: null, verifiedAt: null, updatedAt: Timestamp.now() },
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  console.log(`Seeded Firestore: tenants/${SITE_ID}`);

  // Site config — FolioKit resolves to tenants/{SITE_ID}/site-config/{SITE_ID}
  // when siteId is non-default (multi-tenant mode).
  await setDoc(doc(db, 'tenants', SITE_ID, 'site-config', SITE_ID), {
    id: SITE_ID,
    siteName: 'Doug Williamson',
    siteUrl: 'http://localhost:4200',
    nav: [
      { label: 'Home', url: '/' },
      { label: 'Blog', url: '/blog' },
    ],
    pages: {
      home: {
        enabled: true,
        heroHeadline: 'Welcome',
        heroSubheadline: '',
        showRecentPosts: true,
      },
      about: {
        enabled: false,
        headline: '',
        bio: '',
      },
      links: {
        enabled: false,
        links: [],
      },
    },
    setupComplete: true,
    updatedAt: Timestamp.now(),
  });

  console.log(`Seeded Firestore: tenants/${SITE_ID}/site-config/${SITE_ID}`);
}

async function main() {
  await clearUsers();
  await createGoogleUser(ADMIN_USER);
  await seedDefaultSiteConfig();
  console.log('\nEmulator seeded successfully.');
  console.log(`  Google account:  ${ADMIN_USER.email}`);
  console.log(`  Tenant doc:      tenants/${SITE_ID}`);
  console.log(`  Site config:     tenants/${SITE_ID}/site-config/${SITE_ID}`);
  console.log('  Sign in via the Google popup — select this account in the emulator UI.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
