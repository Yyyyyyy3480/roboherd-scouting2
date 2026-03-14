<script setup lang="ts">
import { ref } from "vue";

const eventKey = ref("2026miket");  // example default
const scoutName = ref("");
</script>

<template>
  <div class="home-page" style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <h1>Roboherd Scouting</h1>

    <!-- Event and Scout Inputs -->
    <div style="margin-bottom: 20px;">
      <label>
        Event Key:
        <input v-model="eventKey" type="text" placeholder="Enter event key" />
      </label>
      <br /><br />
      <label>
        Scout Name:
        <input v-model="scoutName" type="text" placeholder="Enter your name" />
      </label>
    </div>

    <!-- Navigation Buttons -->
    <div class="button-group" style="display: flex; flex-direction: column; gap: 10px;">
      <router-link
        :to="`/form?config=loadconfig-matches.json&event=${eventKey}&scout=${scoutName}`"
      >
        <button>Open Scouting Form</button>
      </router-link>

      <router-link to="/inspector">
        <button>Inspector View</button>
      </router-link>

      <router-link to="/tps-exporter">
        <button>TPS Exporter</button>
      </router-link>

      <router-link to="/picklist">
        <button>Alliance Picklist</button>
      </router-link>
    </div>
  </div>
</template>

<style scoped>
h1 {
  text-align: center;
  font-family: Arial, sans-serif;
  margin-bottom: 30px;
}

input[type="text"] {
  margin-left: 10px;
  padding: 5px 8px;
  border-radius: 4px;
  border: 1px solid #ccc;
  width: 200px;
}

button {
  padding: 10px;
  background-color: #292929;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  width: 100%;
  font-size: 16px;
}

button:hover {
  background-color: #444;
}
</style>
