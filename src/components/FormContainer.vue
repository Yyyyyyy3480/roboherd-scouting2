<template>
  <!-- Team selection page -->
  <FormTeamSelectionPage v-if="!config.data.skipTeamSelection" ref="teamSelectionPage" />

  <!-- Loop through pages -->
  <template v-for="(page, i) in config.data.pages" :key="i">
    <FormPage :title="page.name" :ref="el => pageList[i] = el">
      <FormWidget
        v-for="(widget, j) in page.widgets"
        :key="j"
        :id="`${i}-${j}`"
        :data="widget"
        :ref="el => widgetList.push(el)"
      />
    </FormPage>
  </template>

  <!-- Download page -->
  <FormDownloadPage ref="downloadPage" />

  <!-- Navigation menu -->
  <FormNavMenu :pages="pageList" />
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";
import FormDownloadPage from "./FormDownloadPage.vue";
import FormNavMenu from "./FormNavMenu.vue";
import FormPage from "./FormPage.vue";
import FormTeamSelectionPage from "./FormTeamSelectionPage.vue";
import FormWidget from "./FormWidget.vue";
import { useConfigStore, useWidgetsStore, useValidationStore } from "@/common/stores";
import { watchEffect } from "vue";

const config = useConfigStore();
const widgets = useWidgetsStore();
const validation = useValidationStore();

const pageList = $ref<Array<InstanceType<typeof FormPage>>>([]);
const widgetList = $ref<Array<InstanceType<typeof FormWidget>>>([]);

const route = useRoute();
const configFile = route.query.config as string ?? "assets/config-matches.json";
const configUrl = `${import.meta.env.BASE_URL}${configFile}`;

const fetchResult = await fetch(configUrl);
if (!fetchResult.ok) {
  throw new Error(`JSON configuration fetch failed: HTTP ${fetchResult.status} (${fetchResult.statusText})`);
}

config.data = await fetchResult.json();

// Validate config against schema
const t = config.validateSchema();
if (t.length > 0) throw t;

// Reset widget values
widgets.values = [];

watchEffect(() => {
  if (validation.triggerPages.length === 0) return;
  validation.failedPage = -1;

  for (const i of validation.triggerPages) {
    const index = i - (config.data.skipTeamSelection ? 0 : 1);
    const failed = widgetList
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
