<template>
  <div id="form-container">
    <Suspense v-if="configPath">
      <template #default>
        <FormContainer />
      </template>
      <template #fallback>Loading form...</template>
    </Suspense>
    <p v-else>No Configuration Specified</p>
  </div>
</template>

<script setup lang="ts">
import FormContainer from "@/components/FormContainer.vue";
import { useConfigStore } from "@/common/stores";
import { useRoute } from "vue-router";

const route = useRoute();
const configPath = route.query.config?.toString();

const config = useConfigStore();
config.name = configPath ?? "";
</script>
