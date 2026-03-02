export const updateMetadata = (title: string, description: string, url: string) => {
  document.title = title;
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.setAttribute('content', description);
  const metaUrl = document.querySelector('meta[property="og:url"]');
  if (metaUrl) metaUrl.setAttribute('content', url);
};
