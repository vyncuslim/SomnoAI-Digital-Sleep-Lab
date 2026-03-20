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
    "logo": "/logo_512.png",
    "sameAs": [
      "https://www.crunchbase.com/organization/somnoai-digital-sleep-lab",
      "https://www.linkedin.com/company/somnoai-digital-sleep-lab",
      "https://www.instagram.com/sleepsomno/",
      "https://www.tiktok.com/@somnoaidigitalsleeplab",
      "https://www.facebook.com/profile.php?id=61587027632695",
      "https://www.youtube.com/channel/UCu0V4CzeSIdagRVrHL116Og",
      "https://discord.gg/McrBeJXG8",
      "https://t.me/somnoaidigitalsleeplab",
      "https://whatsapp.com/channel/0029Vb6lxT11SWt4YLKSVG39",
      "https://github.com/vyncuslim/SomnoAI-Digital-Sleep-Lab"
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
        "url": "/logo_512.png"
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
