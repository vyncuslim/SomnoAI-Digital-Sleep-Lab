export type Language = 'en' | 'zh';

export const getTranslation = (lang: Language, namespace: string) => {
  // Placeholder for translation logic
  return {
    backToHub: 'Back to Hub',
    verified: 'Verified',
    author: 'Author',
    published: 'Published',
    readTime: 'Read Time'
  };
};
