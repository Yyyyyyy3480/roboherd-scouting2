<template>
  <div v-if="!config.data || Object.keys(config.data).length === 0">
    No Configuration Specified
  </div>

  <template v-else>
    <FormTeamSelectionPage ref="pageList" v-if="!config.data.skipTeamSelection" />
    <FormPage
      v-for="[i, page] of Object.entries(config.data.pages || [])"
      :key="i"
      :title="page.name"
      ref="pageList"
    >
      <FormWidget
        v-for="[j, widget] of Object.entries(page.widgets || [])"
        :key="j"
        :id="`${i}-${j}`"
        :data="widget"
        ref="widgetList"
      />
    </FormPage>
    <FormDownloadPage ref="pageList" />
    <FormNavMenu :pages="pageList" />
  </template>
</template>

<script setup>
import { ref, watchEffect } from "vue";
import { useRoute } from "vue-router";
import FormDownloadPage from "./FormDownloadPage.vue";
import FormNavMenu from "./FormNavMenu.vue";
import FormPage from "./FormPage.vue";
import FormTeamSelectionPage from "./FormTeamSelectionPage.vue";
import FormWidget from "./FormWidget.vue";
import { useConfigStore, useWidgetsStore, useValidationStore } from "@/common/stores";

const route = useRoute();
const config = useConfigStore();
const widgets = useWidgetsStore();
const validation = useValidationStore();

const pageList = ref([]);
const widgetList = ref([]);

// Set config name from query param
const queryConfig = route.query.config;
if (queryConfig) config.name = queryConfig;

// Fetch JSON config
async function loadConfig() {
  if (!config.name) return;

  try {
    const response = await fetch(`${import.meta.env.BASE_URL}assets/config-${config.name}.json`);

    if (!response.ok) {
      console.error("Failed to fetch config:", response.status, response.statusText);
      return;
    }

    config.data = await response.json();

    const errors = config.validateSchema();
    if (errors.length > 0) console.error("Config validation errors:", errors);

    widgets.values = [];
  } catch (err) {
    console.error("Error loading config:", err);
  }
}

loadConfig();

// Watch for validation triggers
watchEffect(() => {
  if (validation.triggerPages.length === 0) return;

  validation.failedPage = -1;

  for (const i of validation.triggerPages) {
    const index = i - (config.data.skipTeamSelection ? 0 : 1);
    const failed = widgetList.value
      .filter(e => e.id.startsWith(index.toString()))
      .map(e => e.validate())
      .includes(false);
    if (failed) {
      validation.failedPage = i;
      break;
    }
  }

  validation.triggerPages = [];
});
</script>
