<script setup>
import { ref, onMounted } from "vue"
import { generatePicklist } from "@/analytics/picklist"

// reactive array to hold picklist
const picklist = ref([])

// function to load picklist from scouting data
function loadPicklist() {
  const scoutingData = JSON.parse(localStorage.getItem("matchData")) || []
  picklist.value = generatePicklist(scoutingData)
}

// run once when component mounts
onMounted(loadPicklist)
</script>

<template>
  <div class="picklist-container" style="padding: 20px;">
    <h1>Alliance Picklist</h1>

    <!-- Refresh button -->
    <button @click="loadPicklist" style="margin-bottom: 15px;">
      Refresh Picklist
    </button>

    <!-- Picklist table -->
    <table border="1" cellpadding="8" cellspacing="0" style="width: 100%; text-align: left;">
      <thead>
        <tr>
          <th>Rank</th>
          <th>Team</th>
          <th>Score</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(team,index) in picklist" :key="team.team">
          <td>{{ index + 1 }}</td>
          <td>{{ team.team }}</td>
          <td>{{ team.score.toFixed(1) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.picklist-container {
  max-width: 600px;
  margin: 0 auto;
  font-family: Arial, sans-serif;
}

button {
  padding: 8px 16px;
  cursor: pointer;
  background-color: #292929;
  color: #fff;
  border: none;
  border-radius: 4px;
}

button:hover {
  background-color: #444;
}

table th {
  background-color: #292929;
  color: #fff;
}
</style>
