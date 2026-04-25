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
  const defaultSeo = {
    title: 'Doug Williamson — Notes on software, systems, and design',
    description:
      'Long-form writing by Doug Williamson on software engineering, distributed systems, and the craft of building software products.',
    keywords: ['software engineering', 'distributed systems', 'angular', 'typescript', 'firebase'],
    ogImage: 'https://placehold.co/1200x630/0C2340/ffffff?text=Doug+Williamson',
    canonicalUrl: 'https://dougwilliamson.online',
    noIndex: false,
  };
  const socialLinks = [
    { platform: 'github', url: 'https://github.com/doug-williamson', label: 'GitHub' },
    { platform: 'linkedin', url: 'https://www.linkedin.com/in/douglasmwilliamson/', label: 'LinkedIn' },
    { platform: 'bluesky', url: 'https://bsky.app/profile/dougwilliamson.online', label: 'Bluesky' },
    { platform: 'email', url: 'mailto:hello@dougwilliamson.online', label: 'Email' },
  ];

  await setDoc(doc(db, 'tenants', SITE_ID, 'site-config', SITE_ID), {
    id: SITE_ID,
    siteName: 'Doug Williamson',
    siteUrl: 'http://localhost:4200',
    description: 'Personal blog of Doug Williamson — software engineering notes and essays.',
    logo: 'https://placehold.co/256x256/0C2340/ffffff?text=DW',
    favicon: '/favicon.ico',
    defaultAuthorId: 'doug',
    defaultSeo,
    themePackId: null,
    profile: {
      displayName: 'Doug Williamson',
      photoUrl: 'https://placehold.co/400x400/0C2340/ffffff?text=DW',
      photoUrlDark: 'https://placehold.co/400x400/00843D/ffffff?text=DW',
      photoAlt: 'Portrait of Doug Williamson',
      socialLinks,
    },
    nav: [
      { label: 'Home', url: '/' },
      { label: 'Blog', url: '/posts' },
      { label: 'About', url: '/about' },
      { label: 'Links', url: '/links' },
    ],
    pages: {
      home: {
        enabled: true,
        heroHeadline: 'Writing about software, systems, and the craft',
        heroSubheadline:
          'Long-form essays, field notes, and the occasional deep dive on how modern software gets built.',
        ctaLabel: 'Read the latest posts',
        ctaUrl: '/posts',
        showRecentPosts: true,
        seo: {
          title: 'Doug Williamson — Software engineering essays and field notes',
          description:
            'Essays, notes, and deep dives on software engineering, distributed systems, and product craft.',
          ogImage: defaultSeo.ogImage,
          canonicalUrl: 'https://dougwilliamson.online/',
          noIndex: false,
        },
      },
      blog: {
        enabled: true,
        seo: {
          title: 'All posts — Doug Williamson',
          description: 'Every post on dougwilliamson.online, newest first.',
          ogImage: defaultSeo.ogImage,
          canonicalUrl: 'https://dougwilliamson.online/posts',
          noIndex: false,
        },
      },
      about: {
        enabled: true,
        headline: 'Hi, I\u2019m Doug.',
        subheadline: 'Software engineer, writer, and long-time builder of small useful things.',
        bio:
          'I\u2019m a software engineer based in the UK. I\u2019ve spent the last decade building product-facing systems at a mix of startups and larger platforms — mostly in TypeScript, Angular, Go, and whatever the problem demands.\n\nThis site is where I write down what I learn. Expect long-form essays on distributed systems, the grit of day-to-day engineering, and the occasional opinion about developer tools.\n\nOutside of work you\u2019ll usually find me running, reading, or tinkering on side projects that never quite ship.',
        socialLinks,
        seo: {
          title: 'About — Doug Williamson',
          description: 'Who I am, what I work on, and why this site exists.',
          ogImage: defaultSeo.ogImage,
          canonicalUrl: 'https://dougwilliamson.online/about',
          noIndex: false,
        },
      },
      links: {
        enabled: true,
        title: 'Find me elsewhere',
        headline: 'Find me elsewhere',
        bio: 'A short list of the other places I show up online.',
        links: [
          { id: 'github', label: 'GitHub', url: 'https://github.com/doug-williamson', platform: 'github', icon: 'code', highlighted: true, order: 1 },
          { id: 'linkedin', label: 'LinkedIn', url: 'https://www.linkedin.com/in/douglasmwilliamson/', platform: 'linkedin', icon: 'work', highlighted: false, order: 2 },
          { id: 'bluesky', label: 'Bluesky', url: 'https://bsky.app/profile/dougwilliamson.online', platform: 'bluesky', icon: 'cloud', highlighted: false, order: 3 },
          { id: 'rss', label: 'RSS feed', url: 'https://dougwilliamson.online/rss.xml', icon: 'rss_feed', highlighted: false, order: 4 },
          { id: 'email', label: 'Email me', url: 'mailto:hello@dougwilliamson.online', platform: 'email', icon: 'mail', highlighted: true, order: 5 },
        ],
        seo: {
          title: 'Links — Doug Williamson',
          description: 'Where to find me on GitHub, LinkedIn, Bluesky, and by email.',
          ogImage: defaultSeo.ogImage,
          canonicalUrl: 'https://dougwilliamson.online/links',
          noIndex: false,
        },
      },
    },
    onboardingComplete: true,
    setupComplete: true,
    updatedAt: Timestamp.now(),
  });

  console.log(`Seeded Firestore: tenants/${SITE_ID}/site-config/${SITE_ID}`);

  await seedAuthor(db, Timestamp, socialLinks);
  const seriesIds = await seedSeries(db, Timestamp);
  await seedPosts(db, Timestamp, seriesIds);
}

async function seedAuthor(db, Timestamp, socialLinks) {
  const { doc, setDoc } = await import('firebase/firestore');
  const now = Timestamp.now();
  await setDoc(doc(db, 'tenants', SITE_ID, 'authors', 'doug'), {
    id: 'doug',
    displayName: 'Doug Williamson',
    bio: 'Software engineer writing about the systems he builds and breaks.',
    photoUrl: 'https://placehold.co/400x400/0C2340/ffffff?text=DW',
    photoUrlDark: 'https://placehold.co/400x400/00843D/ffffff?text=DW',
    email: 'hello@dougwilliamson.online',
    socialLinks,
    createdAt: now,
    updatedAt: now,
  });
  console.log(`Seeded Firestore: tenants/${SITE_ID}/authors/doug`);
}

async function seedSeries(db, Timestamp) {
  const { doc, setDoc } = await import('firebase/firestore');
  const now = Timestamp.now();
  const series = [
    {
      id: 'distributed-systems-foundations',
      slug: 'distributed-systems-foundations',
      name: 'Distributed Systems Foundations',
      title: 'Distributed Systems Foundations',
      description: 'A ground-up tour of the ideas that underpin every distributed system you\u2019ll ever build or operate.',
      postCount: 3,
      isActive: true,
    },
    {
      id: 'angular-in-anger',
      slug: 'angular-in-anger',
      name: 'Angular in Anger',
      title: 'Angular in Anger',
      description: 'Hard-won lessons from shipping large Angular applications at scale.',
      postCount: 2,
      isActive: true,
    },
  ];
  for (const s of series) {
    await setDoc(doc(db, 'tenants', SITE_ID, 'series', s.id), {
      ...s,
      tenantId: SITE_ID,
      createdAt: now,
      updatedAt: now,
    });
    console.log(`Seeded Firestore: tenants/${SITE_ID}/series/${s.id}`);
  }
  return series.map((s) => s.id);
}

function makeSeo(title, description, slug) {
  return {
    title,
    description,
    keywords: ['software engineering', 'angular', 'typescript'],
    ogImage: `https://placehold.co/1200x630/0C2340/ffffff?text=${encodeURIComponent(title)}`,
    canonicalUrl: `https://dougwilliamson.online/posts/${slug}`,
    noIndex: false,
  };
}

async function seedPosts(db, Timestamp, seriesIds) {
  const { doc, setDoc } = await import('firebase/firestore');
  const DAY = 24 * 60 * 60 * 1000;
  const now = Date.now();
  const ts = (ms) => Timestamp.fromMillis(ms);
  const [dsSeriesId, angSeriesId] = seriesIds;

  /**
   * Ten posts: 6 published (2 in each series + 2 standalone), 2 drafts,
   * 2 scheduled. Dates stagger backward/forward from "now" so feeds have
   * meaningful ordering.
   */
  const posts = [
    // Published — Distributed Systems series
    {
      id: 'ds-1-why-consensus-is-hard',
      slug: 'why-consensus-is-hard',
      title: 'Why consensus is hard',
      subtitle: 'A gentle walk through the FLP impossibility result and what it means in practice.',
      status: 'published',
      tags: ['distributed-systems', 'consensus', 'theory'],
      seriesId: dsSeriesId,
      seriesOrder: 1,
      publishedAt: now - 60 * DAY,
      readingTimeMinutes: 9,
    },
    {
      id: 'ds-2-leader-election-in-the-real-world',
      slug: 'leader-election-in-the-real-world',
      title: 'Leader election in the real world',
      subtitle: 'Raft, lease renewals, and why your clocks lie to you.',
      status: 'published',
      tags: ['distributed-systems', 'raft', 'consensus'],
      seriesId: dsSeriesId,
      seriesOrder: 2,
      publishedAt: now - 45 * DAY,
      readingTimeMinutes: 12,
    },
    {
      id: 'ds-3-idempotency-and-exactly-once',
      slug: 'idempotency-and-exactly-once',
      title: 'Idempotency, and the lie of exactly-once',
      subtitle: 'Why "exactly once" almost always means "effectively once, with receipts".',
      status: 'published',
      tags: ['distributed-systems', 'messaging', 'reliability'],
      seriesId: dsSeriesId,
      seriesOrder: 3,
      publishedAt: now - 30 * DAY,
      readingTimeMinutes: 10,
    },
    // Published — Angular series
    {
      id: 'ng-1-standalone-components',
      slug: 'standalone-components-a-year-later',
      title: 'Standalone components, a year later',
      subtitle: 'What actually changed once NgModules stopped being the default.',
      status: 'published',
      tags: ['angular', 'architecture'],
      seriesId: angSeriesId,
      seriesOrder: 1,
      publishedAt: now - 21 * DAY,
      readingTimeMinutes: 7,
    },
    {
      id: 'ng-2-signals-and-zoneless',
      slug: 'signals-and-the-road-to-zoneless',
      title: 'Signals and the road to zoneless',
      subtitle: 'A migration diary from a large Angular codebase.',
      status: 'published',
      tags: ['angular', 'signals', 'performance'],
      seriesId: angSeriesId,
      seriesOrder: 2,
      publishedAt: now - 10 * DAY,
      readingTimeMinutes: 11,
    },
    // Published — standalone
    {
      id: 'std-1-small-tools',
      slug: 'in-praise-of-small-tools',
      title: 'In praise of small tools',
      subtitle: 'The quiet productivity of scripts you wrote for yourself.',
      status: 'published',
      tags: ['productivity', 'tooling'],
      publishedAt: now - 4 * DAY,
      readingTimeMinutes: 5,
    },
    {
      id: 'std-2-writing-as-debugging',
      slug: 'writing-as-debugging',
      title: 'Writing as debugging',
      subtitle: 'The best way to understand your system is to explain it to someone who isn\u2019t there.',
      status: 'published',
      tags: ['writing', 'engineering-practice'],
      publishedAt: now - 1 * DAY,
      readingTimeMinutes: 6,
    },
    // Drafts
    {
      id: 'draft-1-cold-start-latency',
      slug: 'chasing-cold-start-latency',
      title: 'Chasing cold-start latency',
      subtitle: 'Draft — notes from a week of flame graphs.',
      status: 'draft',
      tags: ['performance', 'profiling'],
      publishedAt: 0,
      readingTimeMinutes: 8,
    },
    {
      id: 'draft-2-event-sourcing-regret',
      slug: 'event-sourcing-regret',
      title: 'Event sourcing, and when I regretted it',
      subtitle: 'Draft — an honest retrospective.',
      status: 'draft',
      tags: ['architecture', 'event-sourcing'],
      publishedAt: 0,
      readingTimeMinutes: 13,
    },
    // Scheduled
    {
      id: 'sch-1-ssr-for-angular',
      slug: 'ssr-for-angular-in-2026',
      title: 'SSR for Angular in 2026',
      subtitle: 'What the current story actually looks like, end to end.',
      status: 'scheduled',
      tags: ['angular', 'ssr'],
      publishedAt: 0,
      scheduledPublishAt: now + 3 * DAY,
      readingTimeMinutes: 9,
    },
    {
      id: 'sch-2-firebase-app-hosting',
      slug: 'firebase-app-hosting-field-notes',
      title: 'Firebase App Hosting: field notes',
      subtitle: 'Six months of running a real app on App Hosting.',
      status: 'scheduled',
      tags: ['firebase', 'hosting', 'devops'],
      publishedAt: 0,
      scheduledPublishAt: now + 10 * DAY,
      readingTimeMinutes: 8,
    },
  ];

  const body = (title) =>
    `# ${title}\n\nThis is seeded content for the emulator. It exists so the blog has realistic-looking posts to render during local development.\n\n## A subheading\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.\n\n- A bullet\n- Another bullet\n- A third bullet for good measure\n\n## Another subheading\n\n> A blockquote, because every seed post deserves one.\n\n\`\`\`ts\nexport function hello(name: string): string {\n  return \`hello, \${name}\`;\n}\n\`\`\`\n\nAnd a closing paragraph to give the reader somewhere to land.\n`;

  for (const p of posts) {
    const createdAt = p.publishedAt > 0 ? p.publishedAt - DAY : now - DAY;
    const payload = {
      id: p.id,
      slug: p.slug,
      title: p.title,
      subtitle: p.subtitle,
      status: p.status,
      content: body(p.title),
      excerpt: p.subtitle,
      thumbnailUrl: `https://placehold.co/1200x600/0C2340/ffffff?text=${encodeURIComponent(p.title)}`,
      thumbnailAlt: `Cover image for ${p.title}`,
      tags: p.tags,
      authorId: 'doug',
      readingTimeMinutes: p.readingTimeMinutes,
      embeddedMedia: {},
      seo: makeSeo(p.title, p.subtitle, p.slug),
      publishedAt: ts(p.publishedAt || 0),
      createdAt: ts(createdAt),
      updatedAt: ts(now),
    };
    if (p.seriesId) {
      payload.seriesId = p.seriesId;
      payload.seriesOrder = p.seriesOrder;
    }
    if (p.scheduledPublishAt) {
      payload.scheduledPublishAt = ts(p.scheduledPublishAt);
    }
    await setDoc(doc(db, 'tenants', SITE_ID, 'posts', p.id), payload);
    console.log(`Seeded Firestore: tenants/${SITE_ID}/posts/${p.id} [${p.status}]`);
  }
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
