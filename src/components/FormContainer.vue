<template>
  <FormTeamSelectionPage
    ref="pageList"
    v-if="!config.data.skipTeamSelection"
  />
  <FormPage
    v-for="[i, page] of config.data.pages.entries()"
    :key="i"
    :title="page.name"
    ref="pageList"
  >
    <FormWidget
      v-for="[j, widget] of page.widgets.entries()"
      :key="j"
      :id="`${i}-${j}`"
      :data="widget"
      ref="widgetList"
    />
  </FormPage>
  <FormDownloadPage ref="pageList" />
  <FormNavMenu :pages="pageList" />
</template>

<script setup lang="ts">
import { ref, watchEffect } from "vue";
import FormDownloadPage from "./FormDownloadPage.vue";
import FormNavMenu from "./FormNavMenu.vue";
import FormPage from "./FormPage.vue";
import FormTeamSelectionPage from "./FormTeamSelectionPage.vue";
import FormWidget from "./FormWidget.vue";
import { useConfigStore, useWidgetsStore, useValidationStore } from "@/common/stores";

const config = useConfigStore();
const widgets = useWidgetsStore();
const validation = useValidationStore();

const pageList = ref<Array<InstanceType<typeof FormPage>>>([]);
const widgetList = ref<Array<InstanceType<typeof FormWidget>>>([]);

// ✅ Fetch the JSON configuration
const fetchConfig = async () => {
  try {
    const url = `${import.meta.env.BASE_URL}assets/config-matches.json`;
    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`Failed to fetch config: ${res.status} ${res.statusText}`);
    }

    config.data = await res.json();

    // Validate config against schema
    const schemaErrors = config.validateSchema();
    if (schemaErrors.length > 0) throw schemaErrors;

    // Reset widget values
    widgets.values = [];

  } catch (err) {
    console.error("Error loading config:", err);
    config.data = { pages: [] }; // fallback to empty
  }
};

await fetchConfig();

// ✅ Watch for validation triggers
watchEffect(() => {
  if (validation.triggerPages.length === 0) return;

  validation.failedPage = -1;

  for (const i of validation.triggerPages) {
    const index = i - (config.data.skipTeamSelection ? 0 : 1);
    const failed = widgetList.value
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
