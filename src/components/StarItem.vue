<template>
    <div class="border border-gray-200 bg-gray-200 rounded-lg shadow-lg">
        <div class="px-4 pb-2 pt-1 border border-l-0 border-t-0 border-r-0 border-gray-400">
            <a
                :href="`https://github.com/${projectData.owner}/${projectData.project}`"
                class="hover:underline text-blue-600 text-3xl"
            >
                <h2 class="flex flex-wrap">
                    <span>{{ projectData.owner }}</span>
                    <span class="mx-2">/</span>
                    <span class="font-bold">{{ projectData.project }}</span>
                </h2>
            </a>
        </div>
        <div class="p-4 mt-2 text-gray-600">
            <p>{{ projectData.description }}</p>
            <div class="mt-5 flex flex-wrap md:w-10/12 md:mx-auto">
                <div class="px-2 flex-1 flex items-center justify-start">
                    <span :class="languageColor" class="w-4 h-4 rounded-full"></span>
                    <span class="ml-1">{{ projectData.language }}</span>
                </div>
                <div class="px-2 flex-1 flex items-center justify-start">
                    <span>⭐</span>
                    <span class="ml-1">{{ projectData.stars.toLocaleString() }}</span>
                </div>
                <div class="px-2 flex-1 flex items-center justify-start">
                    <span>🍴</span>
                    <span class="ml-1">{{ projectData.forks }}</span>
                </div>
                <div class="px-2 flex-1 flex items-center justify-start whitespace-no-wrap">
                    <span>Updated {{ updatedStr }}</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { DateTime } from 'luxon'

export default defineComponent({
    name: 'StarItem',
    props: {
        projectData: {
            type: Object,
            required: true,
        },
    },
    computed: {
        languageColor(): string {
            const code = (this.projectData.language as string)
                .split('')
                .map((c) => c.charCodeAt(0))
                .reduce((n, sum) => sum + n, 0)
            const colors = ['gray', 'red', 'orange', 'yellow', 'green', 'teal', 'blue', 'indigo', 'purple', 'pink']
            const numbers = ['300', '500', '800']
            const color = colors[code % colors.length]
            const number = numbers[code % numbers.length]
            return `bg-${color}-${number}`
        },
        updatedStr(): string {
            const diff = DateTime.utc().diff(this.projectData.updatedDate as DateTime)
            const hours = diff.shiftTo('hours').hours
            const days = diff.shiftTo('days').days
            const months = diff.shiftTo('months').months
            const years = diff.shiftTo('years').years

            if (hours < 1) return 'recently'
            else if (days < 1) return `${Math.round(hours)} ${Math.round(hours) === 1 ? 'hour' : 'hours'} ago`
            else if (months < 1) return `${Math.round(days)} ${Math.round(days) === 1 ? 'day' : 'days'} ago`
            else if (years < 1) return `${Math.round(months)} ${Math.round(months) === 1 ? 'month' : 'months'} ago`
            else return `${years} years ago`
        },
    },
})
</script>
