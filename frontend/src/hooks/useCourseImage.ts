import { useState, useEffect } from 'react';
import { getCourseImage, getFallbackImage } from '../utils/courseImages';
import type { Course } from '../types';

/**
 * Returns a reliable course image URL.
 * - Tries custom thumbnail
 * - Falls back to Unsplash category image
 * - On load error → SVG gradient fallback
 */
export const useCourseImage = (course?: Partial<Course>) => {
  const [src, setSrc] = useState<string>(() => getCourseImage(course));

  useEffect(() => {
    setSrc(getCourseImage(course));
  }, [course?._id, course?.thumbnail, course?.category, course?.title]);

  const onError = () => {
    const fallback = getFallbackImage(course);
    if (src !== fallback) setSrc(fallback);
  };

  return { src, onError };
};