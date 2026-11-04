import type { SongModel } from '#modules/songs/models'
import type { z } from 'zod'

type Song = z.infer<typeof SongModel>

const normalizeKeyPart = (value: string): string =>
  value.normalize('NFKC').toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim()

const getFingerprint = (song: Song): string | null => {
  const title = normalizeKeyPart(song.name)
  const language = normalizeKeyPart(song.language)
  const albumId = song.album.id?.trim()
  const artistIds = song.artists.primary.map(artist => artist.id.trim()).filter(Boolean).sort()

  // Without a provider album ID, fuzzy matching is too risky: preserve the
  // result rather than accidentally merging remixes, covers, or re-releases.
  if (!title || !language || !albumId || artistIds.length === 0 || song.duration === null) {
    return null
  }

  return [title, language, albumId, artistIds.join(',')].join('|')
}

/**
 * Removes duplicate provider IDs and highly confident same-release duplicates.
 * Different album IDs and language variants are always retained.
 */
export const deduplicateSongs = (songs: Song[]): Song[] => {
  const seenIds = new Set<string>()
  const fingerprints = new Map<string, number[]>()
  const unique: Song[] = []

  for (const song of songs) {
    if (seenIds.has(song.id)) continue

    const fingerprint = getFingerprint(song)
    if (fingerprint) {
      const durations = fingerprints.get(fingerprint) ?? []
      if (durations.some(duration => Math.abs(duration - (song.duration as number)) <= 2)) {
        continue
      }
      durations.push(song.duration as number)
      fingerprints.set(fingerprint, durations)
    }

    seenIds.add(song.id)
    unique.push(song)
  }

  return unique
}
