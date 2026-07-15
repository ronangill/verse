import { describe, it, expect } from 'vitest';
import {
  formatRuntime,
  formatDate,
  formatYear,
  formatRating,
  formatPercentage,
  formatFileSize,
  timeToSeconds,
  formatTime,
  joinArray,
  pluralize,
  truncate,
  formatEpisodeNumber,
  slugify,
} from './format';

describe('formatRuntime', () => {
  it('formats runtime with hours and minutes', () => {
    expect(formatRuntime(8100)).toBe('2h 15m'); // 135 minutes in seconds
  });

  it('formats runtime with only hours', () => {
    expect(formatRuntime(7200)).toBe('2h'); // 120 minutes in seconds
  });

  it('formats runtime with only minutes', () => {
    expect(formatRuntime(2700)).toBe('45m'); // 45 minutes in seconds
  });

  it('handles zero runtime', () => {
    expect(formatRuntime(0)).toBe('');
  });

  it('handles undefined runtime', () => {
    expect(formatRuntime()).toBe('');
  });

  it('handles negative runtime', () => {
    expect(formatRuntime(-10)).toBe('');
  });
});

describe('formatDate', () => {
  it('formats valid date string', () => {
    const result = formatDate('2024-01-15T12:00:00Z');
    expect(result).toMatch(/Jan (14|15), 2024/); // Timezone-safe
  });

  it('handles undefined date', () => {
    expect(formatDate()).toBe('');
  });

  it('handles invalid date string', () => {
    expect(formatDate('not-a-date')).toBe('');
  });

  it('handles empty string', () => {
    expect(formatDate('')).toBe('');
  });
});

describe('formatYear', () => {
  it('formats year from date string', () => {
    expect(formatYear('2024-01-15')).toBe('2024');
  });

  it('returns year number as string', () => {
    expect(formatYear(2024)).toBe('2024');
  });

  it('handles undefined', () => {
    expect(formatYear()).toBe('');
  });

  it('handles invalid date string', () => {
    expect(formatYear('not-a-date')).toBe('');
  });
});

describe('formatRating', () => {
  it('formats rating with default decimals', () => {
    expect(formatRating(8.5)).toBe('8.5');
  });

  it('formats rating with custom decimals', () => {
    expect(formatRating(8.567, 2)).toBe('8.57');
  });

  it('handles undefined rating', () => {
    expect(formatRating()).toBe('');
  });

  it('handles zero rating', () => {
    expect(formatRating(0)).toBe('0.0');
  });
});

describe('formatPercentage', () => {
  it('formats percentage', () => {
    expect(formatPercentage(75.5)).toBe('76%');
  });

  it('formats zero percentage', () => {
    expect(formatPercentage(0)).toBe('0%');
  });

  it('handles undefined', () => {
    expect(formatPercentage()).toBe('');
  });

  it('rounds to nearest integer', () => {
    expect(formatPercentage(75.4)).toBe('75%');
    expect(formatPercentage(75.6)).toBe('76%');
  });
});

describe('formatFileSize', () => {
  it('formats bytes', () => {
    expect(formatFileSize(500)).toBe('500.0 B');
  });

  it('formats kilobytes', () => {
    expect(formatFileSize(1536)).toBe('1.5 KB');
  });

  it('formats megabytes', () => {
    expect(formatFileSize(1572864)).toBe('1.5 MB');
  });

  it('formats gigabytes', () => {
    expect(formatFileSize(1610612736)).toBe('1.5 GB');
  });

  it('handles undefined', () => {
    expect(formatFileSize()).toBe('');
  });

  it('handles zero', () => {
    expect(formatFileSize(0)).toBe('');
  });
});

describe('timeToSeconds', () => {
  it('converts time object to seconds', () => {
    expect(timeToSeconds({ hours: 1, minutes: 30, seconds: 45 })).toBe(5445);
  });

  it('handles zero values', () => {
    expect(timeToSeconds({ hours: 0, minutes: 0, seconds: 30 })).toBe(30);
  });

  it('handles undefined', () => {
    expect(timeToSeconds()).toBe(0);
  });

  it('ignores milliseconds', () => {
    expect(timeToSeconds({ hours: 1, minutes: 0, seconds: 0, milliseconds: 500 })).toBe(3600);
  });
});

describe('formatTime', () => {
  it('formats time with hours', () => {
    expect(formatTime(3665)).toBe('1:01:05');
  });

  it('formats time without hours', () => {
    expect(formatTime(125)).toBe('2:05');
  });

  it('handles zero', () => {
    expect(formatTime(0)).toBe('0:00');
  });

  it('handles undefined', () => {
    expect(formatTime()).toBe('0:00');
  });

  it('pads minutes and seconds', () => {
    expect(formatTime(65)).toBe('1:05');
  });
});

describe('joinArray', () => {
  it('joins array with default separator', () => {
    expect(joinArray(['a', 'b', 'c'])).toBe('a, b, c');
  });

  it('joins array with custom separator', () => {
    expect(joinArray(['a', 'b', 'c'], ' | ')).toBe('a | b | c');
  });

  it('handles empty array', () => {
    expect(joinArray([])).toBe('');
  });

  it('handles undefined', () => {
    expect(joinArray()).toBe('');
  });

  it('handles single item', () => {
    expect(joinArray(['a'])).toBe('a');
  });
});

describe('pluralize', () => {
  it('returns singular for count of 1', () => {
    expect(pluralize(1, 'item')).toBe('1 item');
  });

  it('returns plural for count of 0', () => {
    expect(pluralize(0, 'item')).toBe('0 items');
  });

  it('returns plural for count greater than 1', () => {
    expect(pluralize(5, 'item')).toBe('5 items');
  });

  it('uses custom plural form', () => {
    expect(pluralize(2, 'person', 'people')).toBe('2 people');
  });

  it('handles irregular plurals', () => {
    expect(pluralize(3, 'child', 'children')).toBe('3 children');
  });
});

describe('truncate', () => {
  it('truncates long text', () => {
    const text = 'This is a very long text that needs to be truncated';
    expect(truncate(text, 20)).toBe('This is a very lo...');
  });

  it('does not truncate short text', () => {
    const text = 'Short text';
    expect(truncate(text, 20)).toBe('Short text');
  });

  it('handles custom ellipsis', () => {
    const text = 'This is a very long text';
    expect(truncate(text, 20, '…')).toBe('This is a very long…');
  });

  it('handles undefined text', () => {
    expect(truncate()).toBe('');
  });

  it('uses default max length', () => {
    const text = 'x'.repeat(150);
    const result = truncate(text);
    expect(result.length).toBe(100);
  });
});

describe('formatEpisodeNumber', () => {
  it('formats episode number with padding', () => {
    expect(formatEpisodeNumber(1, 5)).toBe('S01E05');
  });

  it('formats double-digit season and episode', () => {
    expect(formatEpisodeNumber(12, 25)).toBe('S12E25');
  });

  it('pads single digits with zero', () => {
    expect(formatEpisodeNumber(2, 3)).toBe('S02E03');
  });

  it('handles season 0 (specials)', () => {
    expect(formatEpisodeNumber(0, 1)).toBe('S00E01');
  });
});

describe('slugify', () => {
  it('matches the user-confirmed Sonarr example', () => {
    expect(slugify('Daredevil: Born Again')).toBe('daredevil-born-again');
  });

  it('replaces internal punctuation with dashes (M.I.A. case)', () => {
    expect(slugify('M.I.A.')).toBe('m-i-a');
  });

  it('expands "&" to "and" with spaces around it (TVDB convention)', () => {
    expect(slugify('Tom & Jerry')).toBe('tom-and-jerry');
    expect(slugify('Tom&Jerry')).toBe('tom-and-jerry');
  });

  it("handles & combined with apostrophe (Georgie & Mandy's case)", () => {
    expect(slugify("Georgie & Mandy's First Marriage")).toBe('georgie-and-mandys-first-marriage');
  });

  it('strips diacritics', () => {
    expect(slugify('Pokémon')).toBe('pokemon');
  });

  it('drops apostrophes without leaving gaps', () => {
    expect(slugify("It's a Wonderful Life")).toBe('its-a-wonderful-life');
  });

  it('collapses runs of separators into a single dash', () => {
    expect(slugify('  Hello   --  World  ')).toBe('hello-world');
  });

  it('returns empty string for undefined input', () => {
    expect(slugify(undefined)).toBe('');
  });

  it('returns empty string for empty input', () => {
    expect(slugify('')).toBe('');
  });

  it('handles a title with only punctuation gracefully', () => {
    expect(slugify('!!!')).toBe('');
  });
});
