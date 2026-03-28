

## Fix Social Media Preview Card

**Problem**: The `og:image` and `twitter:image` meta tags point to a temporary Google Cloud Storage URL with an expiration date. Social media crawlers can't fetch the image once expired (or may be blocked). Additionally, the URL must