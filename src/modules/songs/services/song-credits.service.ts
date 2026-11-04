import { SongCreditsModel } from '#modules/songs/models'
import { ArtistMapModel } from '#modules/artists/models'
import type { z } from 'zod'

type Artist = z.infer<typeof ArtistMapModel>
type SongCredits = z.infer<typeof SongCreditsModel>

const normalizeRole = (role: string): string =>
  role.normalize('NFKC').toLocaleLowerCase().replace(/[_-]+/g, ' ').trim()

const ROLE_ALIASES: Record<keyof SongCredits, string[]> = {
  singers: ['singer', 'vocals', 'vocalist'],
  musicDirectors: ['music', 'music director', 'music directors'],
  lyricists: ['lyricist', 'lyrics', 'lyric writers'],
  composers: ['composer', 'composers'],
  cast: ['starring', 'star', 'actor', 'actress', 'cast'],
  directors: ['director', 'directors'],
  producers: ['producer', 'producers']
}

/** Groups provider role-tagged artists into predictable song credits. */
export const extractSongCredits = (artists: Artist[]): SongCredits => {
  const credits = Object.fromEntries(
    Object.keys(ROLE_ALIASES).map(key => [key, []])
  ) as unknown as SongCredits

  for (const artist of artists) {
    const role = normalizeRole(artist.role)
    for (const [creditKey, aliases] of Object.entries(ROLE_ALIASES) as Array<[keyof SongCredits, string[]]>) {
      if (aliases.includes(role) && !credits[creditKey].some(item => item.id === artist.id)) {
        credits[creditKey].push(artist)
      }
    }
  }

  return credits
}
