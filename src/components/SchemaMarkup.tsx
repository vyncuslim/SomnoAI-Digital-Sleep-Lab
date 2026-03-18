import React from 'react';
import { Helmet } from 'react-helmet-async';

interface ArticleSchemaProps {
  type?: 'Article' | 'NewsArticle';
  headline: string;
  datePublished: string;
  authorName: string;
  imageUrl: string;
}

export const SchemaMarkup: React.FC<{ article?: ArticleSchemaProps }> = ({ article }) => {
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "SomnoAI Digital Sleep Lab",
    "url": "https://sleepsomno.com",
    "logo": "https://sleepsomno.com/logo_512.png",
    "sameAs": [
      "https://www.linkedin.com/company/digital-sleep-lab",
      "https://www.instagram.com/digitalsleeplab/",
      "https://www.tiktok.com/@digitalsleeplab",
      "https://www.facebook.com/profile.php?id=61587027632695",
      "https://www.youtube.com/channel/UCu0V4CzeSIdagRVrHL116Og"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "email": "contact@sleepsomno.com",
      "contactType": "customer support"
    },
    "founder": {
      "@type": "Person",
      "name": "Vyncus Lim",
      "url": "https://www.linkedin.com/in/vyncuslim-lim-761300375"
    }
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "SomnoAI Digital Sleep Lab",
    "url": "https://sleepsomno.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://sleepsomno.com/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  const articleSchema = article ? {
    "@context": "https://schema.org",
    "@type": article.type || "Article",
    "headline": article.headline,
    "datePublished": article.datePublished,
    "author": {
      "@type": "Person",
      "name": article.authorName
    },
    "publisher": {
      "@type": "Organization",
      "name": "SomnoAI Digital Sleep Lab",
      "logo": {
        "@type": "ImageObject",
        "url": "https://sleepsomno.com/logo_512.png"
      }
    },
    "image": article.imageUrl
  } : null;

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schemaData)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(websiteSchema)}
      </script>
      {articleSchema && (
        <script type="application/ld+json">
          {JSON.stringify(articleSchema)}
        </script>
      )}
    </Helmet>
  );
};
