export const BLOG_POSTS = [
  {
    id: '1',
    slug: 'sleep-science-101',
    title: 'Understanding Sleep Cycles',
    excerpt: 'A deep dive into REM, Deep, and Light sleep stages and why they matter.',
    content: 'Full content here...',
    date: '2024-03-01',
    category: 'Science',
    author: {
      name: 'Dr. Sleep',
      role: 'Researcher',
      bio: 'Expert in circadian rhythms.'
    },
    tags: ['Science', 'Health'],
    readTime: '5 min'
  },
  {
    id: '2',
    slug: 'ai-in-sleep',
    title: 'How AI Analyzes Your Rest',
    excerpt: 'Exploring the algorithms behind Digital Sleep Lab\'s insights.',
    content: 'Full content here...',
    date: '2024-03-10',
    category: 'Technology',
    author: {
      name: 'Tech Team',
      role: 'Engineering',
      bio: 'Building the future of sleep tech.'
    },
    tags: ['AI', 'Tech'],
    readTime: '7 min'
  }
];

export const RESEARCH_ARTICLES = [
  {
    id: '2',
    slug: 'platform-update-admin-ui-security',
    title: 'Platform Update: Admin UI Enhancements & Security Fixes',
    excerpt: 'Recent updates to the Admin Dashboard, Registry UI, and platform security.',
    content: `We are excited to announce several key updates to the SomnoAI Digital Sleep Lab platform, focusing on administrative capabilities, security, and user experience.

### Admin Dashboard & Security Enhancements
- **Enhanced User Profile Tracking:** We've added tracking for \`failed_login_attempts\` and \`blocked_reason\` to the UserProfile. This allows administrators to better monitor account security and understand why accounts may have been restricted.
- **Strict Role-Based Access Control:** The Database & Auth Explorer within the Admin Dashboard is now strictly limited to users with the \`super_owner\` role. This ensures that sensitive system tables and authentication data are only accessible to the highest level of administrative personnel.

### Registry UI Overhaul
- **Comprehensive Data View:** The Registry table has been completely redesigned to support horizontal scrolling, accommodating a much wider array of user data fields.
- **Detailed User Insights:** Administrators can now view comprehensive details including User ID, Email, Role, Full Name, Block Status, Initialization Status, App Data Presence, Creation Date, Phone, Avatar URL, Login Provider, Last Sign-In, Update Time, Super Owner Status, Stripe Customer ID, Subscription Details, Block Code, Country, Last Login, Paying Status, Blocked Reason, and Failed Login Attempts.
- **Localized Headers:** All headers in the Registry table have been updated to support Chinese localization for our international administrative team.
- **Streamlined Actions:** The action buttons (Block/Unblock) are now pinned to the right side of the table, ensuring they remain accessible even when scrolling through extensive user data.

### Platform Stability & Branding
- **Logo Resolution Fixes:** We've resolved an issue where the platform logo might not load correctly in certain environments. The logo now consistently uses the high-resolution \`logo_512.png\` asset across the application, including the manifest, index, privacy policy, and terms of service pages.

These updates represent our ongoing commitment to providing a secure, robust, and user-friendly platform for both our users and administrative staff.`,
    date: new Date().toISOString().split('T')[0],
    category: 'Platform Update',
    author: {
      name: 'SomnoAI Engineering',
      role: 'Development Team',
      bio: 'The core engineering team behind SomnoAI Digital Sleep Lab.'
    },
    tags: ['Update', 'Security', 'Admin'],
    readTime: '3 min',
    source: 'SomnoAI'
  },
  {
    id: '1',
    slug: 'circadian-rhythms',
    title: 'Circadian Rhythms and Health',
    excerpt: 'The impact of light exposure on your biological clock.',
    content: 'Full content here...',
    date: '2024-02-15',
    category: 'Research',
    author: {
      name: 'Sleep Journal',
      role: 'Source',
      bio: 'Peer-reviewed publication.'
    },
    tags: ['Research', 'Biology'],
    readTime: '10 min',
    source: 'Sleep Journal'
  },
  {
    id: '3',
    slug: 'beta-access-program',
    title: 'SomnoAI Digital Sleep Lab Announces Beta Access Program',
    excerpt: 'Join our exclusive beta program to experience the future of digital sleep analysis.',
    content: 'We are thrilled to announce the launch of our Beta Access Program. Early adopters will get exclusive access to our advanced neural telemetry and sleep pattern analysis tools. Join us in shaping the future of digital sleep health.',
    date: '2024-05-01',
    category: 'Announcement',
    author: {
      name: 'SomnoAI Team',
      role: 'Official',
      bio: 'The official voice of SomnoAI.'
    },
    tags: ['Beta', 'Announcement'],
    readTime: '2 min',
    source: 'SomnoAI'
  },
  {
    id: '4',
    slug: 'research-partnership',
    title: 'New Research Partnership on Circadian Rhythm Analysis',
    excerpt: 'SomnoAI partners with leading sleep research institutes.',
    content: 'SomnoAI Digital Sleep Lab has entered into a strategic partnership with top-tier sleep research institutes to further our understanding of circadian rhythms and their impact on overall health. This collaboration will bring new insights and algorithms to our platform.',
    date: '2024-04-15',
    category: 'Partnership',
    author: {
      name: 'SomnoAI Team',
      role: 'Official',
      bio: 'The official voice of SomnoAI.'
    },
    tags: ['Research', 'Partnership'],
    readTime: '4 min',
    source: 'SomnoAI'
  },
  {
    id: '5',
    slug: 'platform-update-algorithms',
    title: 'Platform Update: Enhanced Pattern Detection Algorithms',
    excerpt: 'Our latest update brings significant improvements to sleep pattern detection.',
    content: 'Our engineering team has rolled out a major update to our core pattern detection algorithms. Users will now experience more accurate sleep stage classification and deeper insights into their nightly rest patterns.',
    date: '2024-03-28',
    category: 'Platform Update',
    author: {
      name: 'SomnoAI Engineering',
      role: 'Development Team',
      bio: 'The core engineering team behind SomnoAI Digital Sleep Lab.'
    },
    tags: ['Update', 'Algorithm'],
    readTime: '3 min',
    source: 'SomnoAI'
  },
  {
    id: '6',
    slug: 'ai-functionality-live',
    title: 'New Feature: AI-Powered Sleep Analysis is Now Live',
    excerpt: 'Experience the next level of sleep health with our new AI-powered analysis features.',
    content: 'We are thrilled to announce that our advanced AI-powered sleep analysis features are now live! Users can now leverage cutting-edge machine learning models to gain deeper, more personalized insights into their sleep patterns and overall health. Log in to your dashboard to explore these new capabilities.',
    date: new Date().toISOString().split('T')[0],
    category: 'Announcement',
    author: {
      name: 'SomnoAI Team',
      role: 'Official',
      bio: 'The official voice of SomnoAI.'
    },
    tags: ['AI', 'Update', 'Feature'],
    readTime: '2 min',
    source: 'SomnoAI'
  },
  {
    id: '7',
    slug: 'meet-the-founder-vyncus-lim',
    title: 'Meet the Founder: Vyncus Lim',
    excerpt: 'Discover the vision and journey of Vyncus Lim, the founder of SomnoAI Digital Sleep Lab.',
    content: 'Vyncus Lim is the founder of SomnoAI Digital Sleep Lab, a technology initiative focused on exploring how artificial intelligence and computational analysis can be used to better understand human sleep patterns. His work centers on the intersection of emerging digital technologies, behavioral data analysis, and sleep science. Driven by a mission to transform raw sleep data into understandable, privacy-focused insights, Vyncus leads the platform\'s research, product direction, and architecture.',
    date: new Date().toISOString().split('T')[0],
    category: 'Announcement',
    author: {
      name: 'SomnoAI Team',
      role: 'Official',
      bio: 'The official voice of SomnoAI.'
    },
    tags: ['Founder', 'Vision', 'Announcement'],
    readTime: '3 min',
    source: 'SomnoAI'
  }
];
