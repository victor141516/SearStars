import { DateTime } from 'luxon'

export interface IStarItem {
    owner: string
    project: string
    description: string
    language: string
    stars: number
    forks: number
    updatedDate: DateTime
}

export interface IRawGitHubResponse {
    owner: {
        login: string
    }
    name: string
    description: string
    language: string
    /* eslint-disable camelcase */
    stargazers_count: number
    forks_count: number
    updated_at: string
    /* eslint-enable camelcase */
}
