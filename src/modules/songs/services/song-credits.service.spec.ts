import { describe, expect, it } from 'vitest'
import { extractSongCredits } from './song-credits.service'
import { ArtistMapModel } from '#modules/artists/models'
import type { z } from 'zod'

type Artist = z.infer<typeof ArtistMapModel>

const artist = (id: string, name: string, role: string): Artist => ({
  id,
  name,
  role,
  type: 'artist',
  image: [],
  url: ''
})

describe('extractSongCredits', () => {
  it('groups role-tagged artists into structured credits', () => {
    const credits = extractSongCredits([
      artist('1', 'Singer One', 'singer'),
      artist('2', 'Music Director', 'music'),
      artist('3', 'Lyric Writer', 'lyricist'),
      artist('4', 'Lead Actor', 'starring'),
      artist('5', 'Composer', 'composer'),
      artist('6', 'Film Director', 'director'),
      artist('7', 'Producer', 'producer')
    ])

    expect(credits.singers.map(item => item.name)).toEqual(['Singer One'])
    expect(credits.musicDirectors.map(item => item.name)).toEqual(['Music Director'])
    expect(credits.lyricists.map(item => item.name)).toEqual(['Lyric Writer'])
    expect(credits.cast.map(item => item.name)).toEqual(['Lead Actor'])
    expect(credits.composers.map(item => item.name)).toEqual(['Composer'])
    expect(credits.directors.map(item => item.name)).toEqual(['Film Director'])
    expect(credits.producers.map(item => item.name)).toEqual(['Producer'])
  })

  it('does not duplicate an artist within a credit group', () => {
    const credits = extractSongCredits([
      artist('1', 'Singer One', 'singer'),
      artist('1', 'Singer One', 'singer')
    ])
    expect(credits.singers).toHaveLength(1)
  })

  it('does not invent credits for an unknown provider role', () => {
    const credits = extractSongCredits([artist('1', 'Unknown', 'sound engineer')])
    expect(Object.values(credits).every(group => group.length === 0)).toBe(true)
  })
})
