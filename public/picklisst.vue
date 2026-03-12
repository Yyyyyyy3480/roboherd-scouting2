import { generatePicklist } from "@/analytics/picklist"

const scoutingData = JSON.parse(localStorage.getItem("matchData"))

const picklist = generatePicklist(scoutingData)

console.log(picklist)
<script setup>
import { ref, onMounted } from "vue"
import { generatePicklist } from "@/analytics/picklist"

const picklist = ref([])

onMounted(() => {
  const scoutingData = JSON.parse(localStorage.getItem("matchData")) || []
  picklist.value = generatePicklist(scoutingData)
})
</script>

<template>
  <div>
    <h1>Alliance Picklist</h1>

    <table>
      <tr>
        <th>Rank</th>
        <th>Team</th>
        <th>Score</th>
      </tr>

      <tr v-for="(team,index) in picklist" :key="team.team">
        <td>{{ index + 1 }}</td>
        <td>{{ team.team }}</td>
        <td>{{ team.score.toFixed(1) }}</td>
      </tr>

    </table>
  </div>
</template>
