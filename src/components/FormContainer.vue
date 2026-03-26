<template>
  <div>
    <p v-if="!config.name" style="color: red;">No Configuration Specified.</p>

    <FormTeamSelectionPage
      v-if="config.data && !config.data.skipTeamSelection"
      ref="pageList"
      :ref_for="true"
    />

    <FormPage
      v-for="(page, i) in config.data?.pages ?? []"
      :key="i"
      ref="pageList"
      :title="page.name"
    >
      <FormWidget
        v-for="(widget, j) in page.widgets"
        :key="j"
        :id="`${i}-${j}`"
        :data="widget"
        ref="widgetList"
      />
    </FormPage>

    <FormDownloadPage ref="pageList" :ref_for="true" />
    <FormNavMenu :pages="pageList" />
  </div>
</template>

<script setup lang="ts">
import { ref, $ref, $computed, watchEffect, onMounted } from "vue";
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

const pageList = $ref(new Array<InstanceType<typeof FormPage>>());
const widgetList = $ref(new Array<InstanceType<typeof FormWidget>>());

// Read query parameters from URL
onMounted(async () => {
  const queryConfig = route.query.config as string;
  const queryEvent = route.query.event as string;
  const queryScout = route.query.scout as string;

  if (!queryConfig) return; // Will show "No Configuration Specified"

  // Set config name
  config.name = queryConfig;

  // Optional: store event and scout name somewhere if needed
  // e.g., config.currentEvent = queryEvent;

  try {
    // Fetch JSON configuration file
    const fetchResult = await fetch(`${import.meta.env.BASE_URL}assets/config-${config.name}.json`);
    if (!fetchResult.ok)
      throw new Error(`Failed to fetch config-${config.name}.json: HTTP ${fetchResult.status}`);

    config.data = await fetchResult.json();

    // Validate config
    const validationErrors = config.validateSchema();
    if (validationErrors.length > 0) throw validationErrors;

    // Reset widgets array
    widgets.values = [];
  } catch (e) {
    console.error("Error loading config:", e);
  }
});

// Watch for validation triggers
watchEffect(() => {
  if (validation.triggerPages.length === 0) return;

  validation.failedPage = -1;

  for (const i of validation.triggerPages) {
    const index = i - (config.data?.skipTeamSelection ? 0 : 1);
    const failed = widgetList
      .filter((e) => e.id.startsWith(index.toString()))
      .map((e) => e.validate())
      .includes(false);
    if (failed) {
      validation.failedPage = i;
      break;
    }
  }

  validation.triggerPages = [];
});
</script>
