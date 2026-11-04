import { Endpoints } from '#common/constants'
import { useFetch } from '#common/helpers'
import { createSongPayload } from '#modules/songs/helpers'
import { deduplicateSongs, normalizeSongMetadata } from '#modules/songs/services'
import type { IUseCase } from '#common/types'
import type { SearchSongAPIResponseModel, SearchSongModel } from '#modules/search/models'
import type { z } from 'zod'

export interface SearchSongsArgs {
  query: string
  page: number
  limit: number
}

export class SearchSongsUseCase implements IUseCase<SearchSongsArgs, z.infer<typeof SearchSongModel>> {
  constructor() {}

  async execute({ query, limit, page }: SearchSongsArgs): Promise<z.infer<typeof SearchSongModel>> {
    const { data } = await useFetch<z.infer<typeof SearchSongAPIResponseModel>>({
      endpoint: Endpoints.search.songs,
      params: {
        q: query,
        p: page,
        n: limit
      }
    })

    const normalizedSongs = data.results?.map(createSongPayload).map(normalizeSongMetadata) || []

    return {
      // Keep provider pagination metadata unchanged. Deduplication applies only
      // to this fetched page, not to the full upstream catalogue.
      total: data.total,
      start: data.start,
      results: deduplicateSongs(normalizedSongs).slice(0, limit)
    }
  }
}
