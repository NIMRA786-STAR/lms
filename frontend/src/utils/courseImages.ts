import type { Course } from '../types';

// ═══════════════════════════════════════════════════════════════════
// Course Images — Unsplash only (hotlinking-friendly, no 403 errors)
// Unsplash explicitly allows hotlinking for developers.
// ═══════════════════════════════════════════════════════════════════

const COURSE_IMAGES: Record<string, string[]> = {
  Programming: [
    'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&q=80&auto=format&fit=crop',
  ],
  Python: [
    'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800&q=80&auto=format&fit=crop',
  ],
  Design: [
    'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=800&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&q=80&auto=format&fit=crop',
  ],
  Business: [
    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80&auto=format&fit=crop',
  ],
  Marketing: [
    'https://images.unsplash.com/photo-1533750349088-cd871a92f312?w=800&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1557838923-2985c318be48?w=800&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80&auto=format&fit=crop',
  ],
  SEO: [
    'https://images.unsplash.com/photo-1571171637578-41bc2dd41cd2?w=800&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=800&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1562577309-4932fdd64cd1?w=800&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&q=80&auto=format&fit=crop',
  ],
  'Data Science': [
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80&auto=format&fit=crop',
  ],
  DevOps: [
    'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=800&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?w=800&q=80&auto=format&fit=crop',
  ],
  Cybersecurity: [
    'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=800&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&q=80&auto=format&fit=crop',
  ],
  Other: [
    'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=800&q=80&auto=format&fit=crop',
  ],
};

// ═══════════════════════════════════════════════════════════════════
// Category colors for SVG gradient fallback
// ═══════════════════════════════════════════════════════════════════

const CATEGORY_COLORS: Record<string, [string, string]> = {
  Programming: ['#667eea', '#764ba2'],
  Python: ['#306998', '#FFD43B'],        // Python brand blue + yellow
  Design: ['#f093fb', '#f5576c'],
  Business: ['#4facfe', '#00f2fe'],
  Marketing: ['#43e97b', '#38f9d7'],
  SEO: ['#FF8008', '#FFC837'],           // Orange gradient (search/SEO)
  'Data Science': ['#fa709a', '#fee140'],
  DevOps: ['#0F2027', '#2C5364'],        // Dark tech blue (AWS/DevOps)
  Cybersecurity: ['#000000', '#434343'], // Black/dark (security theme)
  Other: ['#a8edea', '#fed6e3'],
};

// ═══════════════════════════════════════════════════════════════════
// SVG gradient fallback
// ═══════════════════════════════════════════════════════════════════

const getGradientFallback = (course?: Partial<Course>): string => {
  const category = course?.category || 'Other';
  const colors = CATEGORY_COLORS[category] || CATEGORY_COLORS.Other;
  const letter = (course?.title || '?').charAt(0).toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="400"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${colors[0]}"/><stop offset="100%" stop-color="${colors[1]}"/></linearGradient></defs><rect width="800" height="400" fill="url(#g)"/><text x="400" y="240" font-family="Arial, sans-serif" font-size="180" font-weight="bold" fill="white" text-anchor="middle" opacity="0.85">${letter}</text></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

// ═══════════════════════════════════════════════════════════════════
// Main resolver
// ═══════════════════════════════════════════════════════════════════

export const getCourseImage = (course?: Partial<Course>): string => {
  // Custom thumbnail first
  if (
    course?.thumbnail &&
    typeof course.thumbnail === 'string' &&
    course.thumbnail.startsWith('http') &&
    !course.thumbnail.includes('placeholder') &&
    !course.thumbnail.includes('pixabay')
  ) {
    return course.thumbnail;
  }

  // Unsplash category image
  const category = course?.category || 'Other';
  const pool = COURSE_IMAGES[category] || COURSE_IMAGES.Other;
  const seed = (course?._id || course?.title || 'x')
    .split('')
    .reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return pool[seed % pool.length];
};

export const getFallbackImage = (course?: Partial<Course>): string =>
  getGradientFallback(course);

// ═══════════════════════════════════════════════════════════════════
// Export list of supported categories (for filter dropdowns)
// ═══════════════════════════════════════════════════════════════════

export const COURSE_CATEGORIES = Object.keys(COURSE_IMAGES);