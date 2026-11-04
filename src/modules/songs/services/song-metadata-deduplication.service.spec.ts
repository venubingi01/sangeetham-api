import { describe, expect, it } from 'vitest'
import { deduplicateSongs } from './song-deduplication.service'
import { normalizeSongMetadata } from './song-metadata.service'
import type { z } from 'zod'
import { SongModel } from '#modules/songs/models'

type Song = z.infer<typeof SongModel>

const createSong = (overrides: Partial<Song> = {}): Song => ({
  id: 'song-1',
  name: 'Rock &amp; Roll',
  type: 'song',
  year: '2024',
  releaseDate: null,
  duration: 210,
  label: null,
  explicitContent: false,
  playCount: 100,
  language: 'Telugu',
  hasLyrics: false,
  lyricsId: null,
  url: 'https://example.com/song-1',
  copyright: null,
  album: { id: 'album-1', name: 'Album &quot;One&quot;', url: null },
  artists: {
    primary: [{ id: 'artist-1', name: 'Singer &amp; Co', role: 'singer', type: 'artist', image: [], url: '' }],
    featured: [],
    all: []
  },
  image: [],
  downloadUrl: [],
  ...overrides
})

describe('song metadata and deduplication', () => {
  it('decodes HTML entities without changing the SongModel shape', () => {
    const normalized = normalizeSongMetadata(createSong())
    expect(normalized.name).toBe('Rock & Roll')
    expect(normalized.album.name).toBe('Album "One"')
    expect(normalized.artists.primary[0].name).toBe('Singer & Co')
    expect(() => SongModel.parse(normalized)).not.toThrow()
  })

  it('removes exact IDs and conservative same-album duplicates', () => {
    const first = createSong()
    const exactIdDuplicate = createSong({ name: 'Different title' })
    const sameRecording = createSong({ id: 'song-2', name: 'Rock and Roll' })
    const otherAlbum = createSong({ id: 'song-3', album: { id: 'album-2', name: 'Reissue', url: null } })
    const otherLanguage = createSong({ id: 'song-4', language: 'Hindi' })

    expect(deduplicateSongs([first, exactIdDuplicate, sameRecording, otherAlbum, otherLanguage]).map(song => song.id))
      .toEqual(['song-1', 'song-3', 'song-4'])
  })

  it('keeps similarly named songs when album identity is missing', () => {
    const first = createSong({ album: { id: null, name: 'Album', url: null } })
    const second = createSong({ id: 'song-2', album: { id: null, name: 'Album', url: null } })
    expect(deduplicateSongs([first, second])).toHaveLength(2)
  })
})
