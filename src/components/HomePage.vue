<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";

// State
const eventKey = ref("");
const scoutName = ref("");

// Load saved values
onMounted(() => {
  eventKey.value = localStorage.getItem("eventKey") || "2026miket";
  scoutName.value = localStorage.getItem("scoutName") || "";
});

// Persist values
watch(eventKey, (val) => {
  localStorage.setItem("eventKey", val);
});

watch(scoutName, (val) => {
  localStorage.setItem("scoutName", val);
});

// Trimmed values
const trimmedEventKey = computed(() => eventKey.value.trim());
const trimmedScoutName = computed(() => scoutName.value.trim());

// Disable button if empty
const isFormDisabled = computed(() => {
  return !trimmedEventKey.value || !trimmedScoutName.value;
});

// Base URL (fixes GitHub Pages path issues)
const base = import.meta.env.BASE_URL;
</script>

<template>
  <div class="home-page">
    <h1>Roboherd Scouting</h1>

    <!-- Inputs -->
    <div class="input-group">
      <label>
        Event Key:
        <input v-model="eventKey" type="text" placeholder="Enter event key" autofocus />
      </label>

      <label>
        Scout Name:
        <input v-model="scoutName" type="text" placeholder="Enter your name" />
      </label>
    </div>

    <!-- Buttons -->
    <div class="button-group">
      <router-link
        :to="{
          path: '/form',
          query: {
            config: `${base}assets/config-matches.json`,
            event: trimmedEventKey,
            scout: trimmedScoutName
          }
        }"
      >
        <button :disabled="isFormDisabled">
          Open Scouting Form
        </button>
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
.home-page {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  text-align: center;
  font-family: Arial, sans-serif;
  margin-bottom: 30px;
}

.input-group {
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

input[type="text"] {
  margin-left: 10px;
  padding: 5px 8px;
  border-radius: 4px;
  border: 1px solid #ccc;
  width: 200px;
}

.button-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
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

button:disabled {
  background-color: #888;
  cursor: not-allowed;
}
</style>
