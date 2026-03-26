<template>
  <div id="form-container">
    <Suspense v-if="config.data">
      <template #default>
        <FormContainer />
      </template>
      <template #fallback>Loading form...</template>
    </Suspense>
    <p v-else-if="error">{{ error }}</p>
    <p v-else>Loading configuration...</p>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue";
import FormContainer from "@/components/FormContainer.vue";
import { useConfigStore } from "@/common/stores";
import { useRoute } from "vue-router";

const route = useRoute();
const config = useConfigStore();
const error = ref("");

// Make the query param reactive
const configPath = computed(() => route.query.config?.toString() || "");

// Watch the reactive query
watch(
  configPath,
  async (newPath) => {
    if (!newPath) {
      error.value = "No configuration specified";
      config.data = null;
      return;
    }

    try {
      const res = await fetch(newPath);
      if (!res.ok) throw new Error(`Failed to fetch config: ${res.status}`);

      const json = await res.json();
      config.data = json;          // store JSON in Pinia
      config.name = newPath.split("/").pop()?.replace(".json", "") || "unknown";
      error.value = "";
      console.log("Config loaded:", json);
    } catch (err) {
      console.error("JSON configuration fetch failed:", err);
      error.value = "Failed to load configuration (check filename/path)";
      config.data = null;
    }
  },
  { immediate: true }
);
</script>

<style scoped>
#form-container {
  display: grid;
  height: 100vh;
  gap: 40px;
  grid-template-rows: 1fr auto;
  justify-items: center;
}
</style>
