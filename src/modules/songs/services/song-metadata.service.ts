import type { SongModel } from '#modules/songs/models'
import type { z } from 'zod'

type Song = z.infer<typeof SongModel>

const HTML_ENTITIES: Record<string, string> = {
  amp: '&',
  apos: "'",
  quot: '"',
  lt: '<',
  gt: '>',
  nbsp: ' '
}

/**
 * Decodes the small set of HTML entities commonly returned in JioSaavn
 * metadata. Numeric entities are handled as well; this does not depend on
 * browser APIs, so it also works in Bun/Workers.
 */
export const decodeMetadataText = (value: string): string =>
  value.replace(/&(#x[\da-f]+|#\d+|amp|apos|quot|lt|gt|nbsp);/gi, (entity, code: string) => {
    if (code.startsWith('#x') || code.startsWith('#X')) {
      const point = Number.parseInt(code.slice(2), 16)
      return Number.isFinite(point) ? String.fromCodePoint(point) : entity
    }

    if (code.startsWith('#')) {
      const point = Number.parseInt(code.slice(1), 10)
      return Number.isFinite(point) ? String.fromCodePoint(point) : entity
    }

    return HTML_ENTITIES[code.toLowerCase()] ?? entity
  }).trim()

const normalizeArtist = (artist: Song['artists']['primary'][number]): Song['artists']['primary'][number] => ({
  ...artist,
  name: decodeMetadataText(artist.name),
  role: decodeMetadataText(artist.role)
})

/**
 * Cleans metadata while preserving the existing SongModel response contract.
 * It deliberately does not infer genre, mood, activity, or user preferences.
 */
export const normalizeSongMetadata = (song: Song): Song => ({
  ...song,
  name: decodeMetadataText(song.name),
  language: decodeMetadataText(song.language),
  year: song.year ? decodeMetadataText(song.year) : null,
  label: song.label ? decodeMetadataText(song.label) : null,
  duration: Number.isFinite(song.duration) && (song.duration ?? 0) > 0 ? song.duration : null,
  playCount: Number.isFinite(song.playCount) && (song.playCount ?? -1) >= 0 ? song.playCount : null,
  album: {
    ...song.album,
    name: song.album.name ? decodeMetadataText(song.album.name) : null
  },
  artists: {
    primary: song.artists.primary.map(normalizeArtist),
    featured: song.artists.featured.map(normalizeArtist),
    all: song.artists.all.map(normalizeArtist)
  }
})
