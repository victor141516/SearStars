<template>
  <div class="flex flex-col items-center">
    <div
      class="pt-6 md:pt-12 pb-6 px-2 w-full bg-pink-600 sticky top-0 z-10"
      :class="{ 'shadow-xl': stars.length > 0 }"
    >
      <div
        class="sm:w-10/12 md:w-8/12 xl:w-6/12 2xl:w-4/12 w-full flex flex-col mx-auto"
      >
        <a href="/" class="self-center" @click.prevent="$router.push('/')">
          <div class="bg-white py-1 px-4 rounded-sm shadow-md">
            <h1 class="text-3xl text-gray-800">Search an user GitHub stars</h1>
          </div>
        </a>
        <div class="mt-8 flex-1 flex flex-wrap">
          <form
            method="get"
            :action="`/${username}`"
            class="flex-1 self-start flex mt-2"
            @submit.prevent="$router.push(`/${username}`)"
          >
            <input
              v-model="username"
              type="text"
              class="text-gray-800 focus:bg-gray-200 outline-none rounded-md shadow-sm py-2 px-4"
              placeholder="Username"
            />
            <button
              type="submit"
              class="font-bold text-gray-800 focus:outline-none ml-8 p-2 rounded-md shadow-sm bg-pink-300 hover:bg-pink-500 active:bg-pink-800 active:text-white w-20"
            >
              Get
            </button>
          </form>
          <div v-if="stars.length > 0" class="mt-2">
            <input
              v-model="inputSearchText"
              type="text"
              class="text-gray-800 focus:bg-gray-200 outline-none rounded-md shadow-sm py-2 px-4"
              placeholder="Search"
              @input="updateSearchUrl"
            />
          </div>
        </div>
      </div>
    </div>
    <div
      class="sm:w-10/12 md:w-8/12 xl:w-6/12 2xl:w-4/12 w-full h-full px-2 py-4"
    >
      <div
        v-if="rateLimitError"
        class="text-3xl text-center bg-white py-4 px-2 rounded shadow"
      >
        <p class="sticky">
          You checked a few users and GitHub API limited your access 😔
        </p>
        <p>
          Try again {{ rateLimitTime }}. Or
          <a :href="`https://github.com/${username}?tab=stars`">click here</a>
          to check it on the (worse) GitHub page
        </p>
      </div>
      <div v-else-if="stars.length > 0">
        <div class="mt-8 mx-auto pr-1" style="width: 95%">
          <StarItem
            v-for="star in filteredItems"
            :key="`${star.owner}/${star.project}`"
            :project-data="star"
            class="my-4"
          />
        </div>
      </div>
      <div
        v-else-if="loading"
        class="absolute inset-0 h-screen flex items-center justify-center"
      >
        <Loader />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { DateTime } from 'luxon'
import { defineComponent } from 'vue'
import {
  NavigationGuardNext,
  RouteLocationNormalized,
  useRouter,
} from 'vue-router'

import Loader from './components/Loader.vue'
import StarItem from './components/StarItem.vue'
import { IRawGitHubResponse, IStarItem } from './interfaces'

class GitHubRateLimitError {
  constructor(public timeout: number) {}
}

const _fetch = (...args: Parameters<typeof fetch>) =>
  fetch(...args).then((r) => {
    if (r.status === 403)
      throw new GitHubRateLimitError(
        Number.parseInt(r.headers.get('X-Ratelimit-Reset')!)
      )
    return r
  })

async function* getStars(username: string): AsyncGenerator<IStarItem> {
  const { firstPage, pages } = (await _fetch(
    `https://api.github.com/users/${username}/starred`
  ).then((r) => ({
    firstPage: r.json(),
    pages: Number.parseInt(
      r.headers
        .get('link')
        ?.split('rel="next"')[1]
        .split('rel="last"')[0]
        .split('?page=')[1]
        .split('>')[0] ?? '0'
    ),
  }))) as { firstPage: Promise<IRawGitHubResponse[]>; pages: number }

  const translate = (i: IRawGitHubResponse): IStarItem => {
    const owner = i.owner.login
    const project = i.name
    const description = i.description
    const language = i.language ?? 'Other'
    const stars = i.stargazers_count
    const forks = i.forks_count
    const updatedDate = DateTime.fromISO(i.updated_at)

    return {
      owner,
      project,
      description,
      language,
      stars,
      forks,
      updatedDate,
    }
  }

  for (const item of await firstPage) {
    yield translate(item)
  }

  const requests = new Array(pages)
    .fill(null)
    .map((_, i) =>
      _fetch(
        `https://api.github.com/users/${username}/starred?page=${i + 1}`
      ).then((r) => r.json() as Promise<IRawGitHubResponse[]>)
    )

  const raws = (await Promise.all(requests)).flat()
  for (const i of raws) {
    yield translate(i)
  }
}

export default defineComponent({
  name: 'App',
  components: { Loader, StarItem },
  data() {
    return {
      username: '',
      inputSearchText: '',
      internalSearchText: '',
      stars: [] as IStarItem[],
      loading: false,
      rateLimitError: false,
      rateLimitTime: '',
    }
  },
  computed: {
    filteredItems(): IStarItem[] {
      let filtered = [] as IStarItem[]
      if (this.internalSearchText === '') filtered = this.stars
      else {
        filtered = this.stars.filter((i) => {
          return (
            i.owner
              ?.toLowerCase()
              .includes(this.internalSearchText.toLowerCase()) ||
            i.project
              ?.toLowerCase()
              .includes(this.internalSearchText.toLowerCase()) ||
            i.description
              ?.toLowerCase()
              .includes(this.internalSearchText.toLowerCase()) ||
            i.language
              ?.toLowerCase()
              .includes(this.internalSearchText.toLowerCase())
          )
        })
      }

      return filtered.filter(
        (el, index, all) =>
          all.findIndex(
            (ell) => ell.owner === el.owner && ell.project === el.project
          ) === index
      )
    },
  },
  mounted() {
    const onRouteChange = async (
      to: RouteLocationNormalized,
      _: unknown,
      next: NavigationGuardNext
    ) => {
      if (to.query.s) {
        this.internalSearchText = to.query.s as string
      } else {
        this.internalSearchText = ''
      }
      this.inputSearchText = this.internalSearchText
      const username = Array.isArray(to.params.username)
        ? to.params.username[0]
        : to.params.username
      next()
      if (username) {
        this.username = username
        const stars = []
        this.loading = true
        try {
          this.rateLimitError = false
          for await (const star of getStars(username)) {
            stars.push(star)
          }
        } catch (e) {
          if (e instanceof GitHubRateLimitError) {
            this.rateLimitError = true
            this.rateLimitTime = DateTime.fromSeconds(e.timeout).toRelative()!
          } else {
            throw e
          }
        }
        this.loading = false
        this.stars = stars
      } else {
        this.username = ''
        this.stars = []
      }
    }

    const router = useRouter()
    onRouteChange(router.currentRoute.value, null, () => {})
    router.beforeEach(onRouteChange)
  },
  methods: {
    updateSearchUrl() {
      this.$router.push({
        path: this.$route.path,
        query: { s: this.inputSearchText },
      })
    },
  },
})
</script>
