# Project Context

This is a migration project from Jekyll to Astro for georgialexandrov.github.io.

## Migration Goals

- **Framework Migration**: Converting from Jekyll to Astro
- **UI Preservation**: Maintain the exact same UI/design as the current Jekyll site
- **CSS Migration**: Convert from plain CSS to Tailwind CSS
- **Content Migration**: Migrate existing markdown content to Astro

## Architecture Preferences

- Simple, clean architecture following domain-driven design principles
- Minimal complexity and clear separation of concerns

## Development Commands

- Build: `npm run build`
- Dev: `npm run dev`
- Preview: `npm run preview`

## Migration Status

✅ **COMPLETED** - Jekyll to Astro migration finished successfully!

### What was migrated:
- ✅ Astro project setup with TypeScript and Tailwind CSS
- ✅ Main layout component with sidebar navigation
- ✅ All static pages (work-experience, education, technologies)  
- ✅ Blog functionality with content collections
- ✅ All 4 blog posts migrated
- ✅ Asset organization (images, icons)
- ✅ Google Fonts integration
- ✅ Responsive design with mobile navigation
- ✅ Code syntax highlighting
- ✅ Exact UI/design preservation
- ✅ Jekyll files cleanup

### Architecture:
- **Layouts**: `src/layouts/` - Layout.astro, BlogLayout.astro, PostLayout.astro
- **Components**: `src/components/` - Sidebar.astro
- **Content**: `src/content/blog/` - Markdown blog posts with frontmatter
- **Pages**: `src/pages/` - Static routes and dynamic blog routes
- **Styles**: `src/styles/global.css` - Tailwind + custom CSS hybrid
- **Assets**: `public/assets/` - Images and icons