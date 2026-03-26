import { useEffect, useMemo, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { useTVShowsInfinite } from '@/api/hooks/useTVShows';
import { TVShowCard } from './TVShowCard';
import { ViewToggle } from '@/components/media/ViewToggle';
import { Skeleton } from '@/components/ui/skeleton';
import { MediaCardSkeletonGrid, MediaListSkeleton } from '@/components/media/MediaCardSkeleton';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/useDebounce';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useViewMode } from '@/hooks/useViewMode';
import { usePersistedFilters } from '@/hooks/usePersistedFilters';
import { useBreadcrumbs } from '@/components/layout/BreadcrumbContext';
import { HeaderActions } from '@/components/layout/HeaderActionsContext';
import { Search, Loader2, ArrowUpDown, Eye, EyeOff, Tv, SlidersHorizontal } from 'lucide-react';
import { getPosterUrl } from '@/lib/image-utils';
import { formatRating, formatYear } from '@/lib/format';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { useColumnVisibility } from '@/hooks/useColumnVisibility';
import { usePersistedToggle } from '@/hooks/usePersistedToggle';
import { ColumnToggle } from '@/components/media/ColumnToggle';
import type { KodiSort, KodiFilter } from '@/api/types/common';

const TV_COLUMNS = [
  { id: 'year', label: 'Year' },
  { id: 'genre', label: 'Genre' },
  { id: 'rating', label: 'Rating' },
  { id: 'seasons', label: 'Seasons' },
  { id: 'episodes', label: 'Episodes' },
  { id: 'status', label: 'Status' },
];

interface TVShowFilters {
  search: string;
  genre: string;
  tag: string;
  watched: string; // 'all' | 'watched' | 'unwatched'
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export function TVShowList() {
  const [filters, setFilters] = usePersistedFilters<TVShowFilters>('tvshows', {
    search: '',
    genre: 'all',
    tag: 'all',
    watched: 'unwatched',
    sortBy: 'title',
    sortOrder: 'asc',
  });

  const [searchInput, setSearchInput] = useState('');
  const searchQuery = useDebounce(searchInput, 300);
  const selectedGenre = filters.genre;
  const selectedTag = filters.tag;
  const selectedWatched = filters.watched;
  const sortBy = filters.sortBy;
  const sortOrder = filters.sortOrder;

  const setSelectedGenre = (v: string) => {
    setFilters((f) => ({ ...f, genre: v }));
  };
  const setSelectedTag = (v: string) => {
    setFilters((f) => ({ ...f, tag: v }));
  };
  const setSelectedWatched = (v: string) => {
    setFilters((f) => ({ ...f, watched: v }));
  };
  const setSortBy = (v: string) => {
    setFilters((f) => ({ ...f, sortBy: v }));
  };
  const setSortOrder = (v: 'asc' | 'desc') => {
    setFilters((f) => ({ ...f, sortOrder: v }));
  };

  const [viewMode, setViewMode] = useViewMode('tvshows', 'list');
  const {
    isVisible,
    toggle: toggleColumn,
    columns: columnDefs,
  } = useColumnVisibility('tvshows', TV_COLUMNS);
  const [showFilters, toggleFilters] = usePersistedToggle('filters-tvshows', false);

  const { setItems } = useBreadcrumbs();

  // Set breadcrumbs
  useEffect(() => {
    setItems([{ label: 'TV Shows' }]);
  }, [setItems]);

  // Build sort object
  const sort: KodiSort = {
    method: sortBy as 'title' | 'year' | 'rating' | 'dateadded',
    order: sortOrder === 'asc' ? 'ascending' : 'descending',
  };

  // Build filter object
  let filter: KodiFilter | undefined;
  const filterRules: KodiFilter[] = [];

  if (searchQuery) {
    filterRules.push({ field: 'title', operator: 'contains', value: searchQuery });
  }
  if (selectedGenre !== 'all') {
    filterRules.push({ field: 'genre', operator: 'contains', value: selectedGenre });
  }
  if (selectedWatched === 'unwatched') {
    filterRules.push({ field: 'playcount', operator: 'is', value: '0' });
  } else if (selectedWatched === 'watched') {
    filterRules.push({ field: 'playcount', operator: 'greaterthan', value: '0' });
  }

  if (filterRules.length === 1) {
    filter = filterRules[0];
  } else if (filterRules.length > 1) {
    filter = { and: filterRules };
  }

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError, error } =
    useTVShowsInfinite({ sort, filter });

  const observerTarget = useInfiniteScroll(fetchNextPage, hasNextPage, isFetchingNextPage);

  // Extract all TV shows from pages
  const tvshows = useMemo(() => data?.pages.flatMap((page) => page.tvshows) ?? [], [data?.pages]);

  // Extract unique genres for filter
  const genres = useMemo(() => {
    const allGenres = new Set<string>();
    tvshows.forEach((show) => {
      show.genre?.forEach((g) => allGenres.add(g));
    });
    return Array.from(allGenres).sort();
  }, [tvshows]);

  // Extract unique tags for filter
  const tags = useMemo(() => {
    const allTags = new Set<string>();
    tvshows.forEach((show) => {
      show.tag?.forEach((t) => allTags.add(t));
    });
    return Array.from(allTags).sort();
  }, [tvshows]);

  // Apply client-side tag filter (watched is handled server-side)
  const filteredTVShows = useMemo(() => {
    if (selectedTag === 'all') return tvshows;
    return tvshows.filter((show) => show.tag?.includes(selectedTag));
  }, [tvshows, selectedTag]);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const totalCount = data?.pages[0]?.total ?? 0;

  if (isLoading) {
    return (
      <div className="container space-y-4 py-6">
        <div className="space-y-4">
          <Skeleton className="h-10 w-full max-w-md" />
          <div className="flex gap-4">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-10 w-48" />
          </div>
        </div>
        {viewMode === 'list' ? <MediaListSkeleton /> : <MediaCardSkeletonGrid count={12} />}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container space-y-4 py-6">
        <ErrorState title="Error loading TV shows" error={error} />
      </div>
    );
  }

  return (
    <div className="container space-y-4 py-6">
      <HeaderActions>
        <div className="bg-muted/50 flex h-8 items-center rounded-md border px-2.5">
          <p className="text-muted-foreground text-xs">
            {selectedTag !== 'all'
              ? `${filteredTVShows.length.toLocaleString()} / ${totalCount.toLocaleString()}`
              : totalCount.toLocaleString()}{' '}
            shows
          </p>
        </div>
        <div
          onClick={toggleFilters}
          className={`flex h-8 cursor-pointer items-center gap-1.5 rounded-md border px-2.5 ${showFilters ? 'bg-primary/10 border-primary text-primary' : 'bg-muted/50 text-muted-foreground'}`}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          <span className="text-xs">Filters</span>
        </div>
        {viewMode === 'list' && (
          <ColumnToggle columns={columnDefs} isVisible={isVisible} toggle={toggleColumn} />
        )}
        <ViewToggle value={viewMode} onChange={setViewMode} className="border" />
      </HeaderActions>

      {/* TV Shows Grid/List */}
      {filteredTVShows.length === 0 &&
      !searchInput &&
      selectedGenre === 'all' &&
      selectedTag === 'all' &&
      selectedWatched === 'all' ? (
        <EmptyState title="No TV shows found" description="Your TV show library is empty." />
      ) : (
        <>
          {viewMode === 'list' ? (
            <div className="bg-muted/50 rounded-md border">
              <Table>
                <TableHeader>
                  {/* Filters Row */}
                  {showFilters && (
                    <TableRow className="hover:bg-transparent">
                      <TableHead colSpan={8} className="h-14">
                        <div className="flex flex-wrap items-center gap-4">
                          <div className="relative">
                            <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
                            <Input
                              type="search"
                              placeholder="Search TV shows..."
                              value={searchInput}
                              onChange={(e) => {
                                setSearchInput(e.target.value);
                              }}
                              className="w-64 pl-8"
                            />
                          </div>

                          <Select value={selectedGenre} onValueChange={setSelectedGenre}>
                            <SelectTrigger className="w-40">
                              <SelectValue placeholder="Genre" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Genres</SelectItem>
                              {genres.map((genre) => (
                                <SelectItem key={genre} value={genre}>
                                  {genre}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          {tags.length > 0 && (
                            <Select value={selectedTag} onValueChange={setSelectedTag}>
                              <SelectTrigger className="w-40">
                                <SelectValue placeholder="Tag" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All Tags</SelectItem>
                                {tags.map((tag) => (
                                  <SelectItem key={tag} value={tag}>
                                    {tag}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}

                          <Select value={selectedWatched} onValueChange={setSelectedWatched}>
                            <SelectTrigger className="w-40">
                              <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Shows</SelectItem>
                              <SelectItem value="unwatched">Unwatched</SelectItem>

                              <SelectItem value="watched">Watched</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </TableHead>
                    </TableRow>
                  )}
                  {/* Column Headers Row */}
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="-ml-3"
                        onClick={() => {
                          handleSort('title');
                        }}
                      >
                        Title
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    {isVisible('year') && (
                      <TableHead>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="-ml-3"
                          onClick={() => {
                            handleSort('year');
                          }}
                        >
                          Year
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                    )}
                    {isVisible('genre') && <TableHead>Genre</TableHead>}
                    {isVisible('rating') && (
                      <TableHead>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="-ml-3"
                          onClick={() => {
                            handleSort('rating');
                          }}
                        >
                          Rating
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                    )}
                    {isVisible('seasons') && <TableHead>Seasons</TableHead>}
                    {isVisible('episodes') && <TableHead>Episodes</TableHead>}
                    {isVisible('status') && <TableHead>Status</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTVShows.map((tvshow) => {
                    const posterUrl = getPosterUrl(tvshow.art);
                    const year = formatYear(tvshow.year ?? tvshow.premiered);
                    const rating = tvshow.rating ? formatRating(tvshow.rating) : null;
                    const genre = tvshow.genre?.[0] ?? '-';
                    const watchedEpisodes = tvshow.watchedepisodes ?? 0;
                    const totalEpisodes = tvshow.episode ?? 0;
                    const isFullyWatched = totalEpisodes > 0 && watchedEpisodes >= totalEpisodes;
                    const isPartiallyWatched = watchedEpisodes > 0 && !isFullyWatched;

                    return (
                      <TableRow key={tvshow.tvshowid}>
                        <TableCell>
                          {posterUrl ? (
                            <img
                              src={posterUrl}
                              alt={tvshow.title}
                              className="aspect-[2/3] w-10 rounded object-cover"
                            />
                          ) : (
                            <div className="bg-muted text-muted-foreground flex aspect-[2/3] w-10 items-center justify-center rounded text-xs">
                              N/A
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Link
                            to="/tv/$tvshowId"
                            params={{ tvshowId: tvshow.tvshowid.toString() }}
                            className="font-medium hover:underline"
                          >
                            {tvshow.title}
                          </Link>
                          {tvshow.studio && tvshow.studio.length > 0 && (
                            <div className="text-muted-foreground text-sm">{tvshow.studio[0]}</div>
                          )}
                        </TableCell>
                        {isVisible('year') && <TableCell>{year ? year : '-'}</TableCell>}
                        {isVisible('genre') && <TableCell>{genre}</TableCell>}
                        {isVisible('rating') && <TableCell>{rating ?? '-'}</TableCell>}
                        {isVisible('seasons') && <TableCell>{tvshow.season ?? '-'}</TableCell>}
                        {isVisible('episodes') && (
                          <TableCell>
                            {watchedEpisodes}/{totalEpisodes}
                          </TableCell>
                        )}
                        {isVisible('status') && (
                          <TableCell>
                            {isFullyWatched ? (
                              <Badge variant="secondary" className="gap-1">
                                <Eye className="h-3 w-3" />
                                Complete
                              </Badge>
                            ) : isPartiallyWatched ? (
                              <Badge variant="outline" className="gap-1">
                                <Tv className="h-3 w-3" />
                                In Progress
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="gap-1">
                                <EyeOff className="h-3 w-3" />
                                New
                              </Badge>
                            )}
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })}
                  {filteredTVShows.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-muted-foreground py-8 text-center">
                        No TV shows found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          ) : (
            <>
              {/* Filters for grid view */}
              {showFilters && (
                <div className="flex flex-wrap items-center gap-4">
                  <div className="relative">
                    <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
                    <Input
                      type="search"
                      placeholder="Search TV shows..."
                      value={searchInput}
                      onChange={(e) => {
                        setSearchInput(e.target.value);
                      }}
                      className="w-64 pl-8"
                    />
                  </div>

                  <Select value={selectedGenre} onValueChange={setSelectedGenre}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Genre" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Genres</SelectItem>
                      {genres.map((genre) => (
                        <SelectItem key={genre} value={genre}>
                          {genre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {tags.length > 0 && (
                    <Select value={selectedTag} onValueChange={setSelectedTag}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Tag" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Tags</SelectItem>
                        {tags.map((tag) => (
                          <SelectItem key={tag} value={tag}>
                            {tag}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  <Select value={selectedWatched} onValueChange={setSelectedWatched}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Shows</SelectItem>
                      <SelectItem value="unwatched">Unwatched</SelectItem>
                      <SelectItem value="inprogress">In Progress</SelectItem>
                      <SelectItem value="watched">Watched</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8">
                {filteredTVShows.map((tvshow) => (
                  <TVShowCard key={tvshow.tvshowid} tvshow={tvshow} />
                ))}
              </div>
            </>
          )}

          {/* Loading indicator */}
          <div ref={observerTarget} className="flex justify-center py-8">
            {isFetchingNextPage && (
              <div className="text-muted-foreground flex items-center space-x-2">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span>Loading more TV shows...</span>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
