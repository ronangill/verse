import { useMemo } from 'react';
import type { KodiMovie } from '@/api/types/video';
import { usePersistedFilters } from '@/hooks/usePersistedFilters';

export interface MovieFilters {
  search: string;
  genre?: string;
  year?: string;
  tag?: string;
  watched?: boolean;
  sortBy: 'title' | 'year' | 'rating' | 'dateadded';
  sortOrder: 'asc' | 'desc';
}

export function useMovieFilters(movies: KodiMovie[], kodiTotal?: number) {
  const [filters, setFilters] = usePersistedFilters<MovieFilters>('movies', {
    search: '',
    watched: false,
    sortBy: 'title',
    sortOrder: 'asc',
  });

  // Get unique genres
  const genres = useMemo(() => {
    const genreSet = new Set<string>();
    movies.forEach((movie) => {
      movie.genre?.forEach((g) => genreSet.add(g));
    });
    return Array.from(genreSet).sort();
  }, [movies]);

  // Get unique years
  const years = useMemo(() => {
    const yearSet = new Set<string>();
    movies.forEach((movie) => {
      const year = movie.year?.toString() || movie.premiered?.substring(0, 4);
      if (year) yearSet.add(year);
    });
    return Array.from(yearSet).sort((a, b) => parseInt(b) - parseInt(a));
  }, [movies]);

  // Get unique tags
  const tags = useMemo(() => {
    const tagSet = new Set<string>();
    movies.forEach((movie) => {
      movie.tag?.forEach((t) => tagSet.add(t));
    });
    return Array.from(tagSet).sort();
  }, [movies]);

  // Filter and sort movies
  const filteredMovies = useMemo(() => {
    let result = [...movies];

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (movie) =>
          movie.title.toLowerCase().includes(searchLower) ||
          movie.originaltitle?.toLowerCase().includes(searchLower) ||
          movie.plot?.toLowerCase().includes(searchLower)
      );
    }

    // Apply genre filter
    if (filters.genre) {
      const genre = filters.genre;
      result = result.filter((movie) => movie.genre?.includes(genre));
    }

    // Apply year filter
    if (filters.year) {
      result = result.filter((movie) => {
        const year = movie.year?.toString() || movie.premiered?.substring(0, 4);
        return year === filters.year;
      });
    }

    // Apply tag filter
    if (filters.tag) {
      const tag = filters.tag;
      result = result.filter((movie) => movie.tag?.includes(tag));
    }

    // Apply watched filter
    if (filters.watched !== undefined) {
      result = result.filter((movie) => {
        const isWatched = (movie.playcount ?? 0) > 0;
        return filters.watched ? isWatched : !isWatched;
      });
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;

      switch (filters.sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'year':
          comparison = (a.year || 0) - (b.year || 0);
          break;
        case 'rating':
          comparison = (a.rating || 0) - (b.rating || 0);
          break;
        case 'dateadded':
          comparison = (a.dateadded || '').localeCompare(b.dateadded || '');
          break;
      }

      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [movies, filters]);

  return {
    filters,
    setFilters,
    filteredMovies,
    genres,
    years,
    tags,
    totalCount: kodiTotal ?? movies.length,
    filteredCount: filteredMovies.length,
  };
}
