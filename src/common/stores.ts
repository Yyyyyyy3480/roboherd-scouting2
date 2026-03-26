// src/common/stores.ts
import Ajv from "ajv";
import { ConfigSchema, Widget } from "@/config";
import { defineStore } from "pinia";
import { isFailed, TBAData } from "./tba";
import { Ref } from "vue";
import { useStorage } from "@vueuse/core";
import validate from "./validate";

interface WidgetValue {
  readonly name: string;
  readonly value: Ref;
}

export interface SavedData {
  header: string[];
  values: string[][];
}

// ⚡ Config store
export const useConfigStore = defineStore("config", () => {
  const name = $ref("matches"); // default config name
  const data = $ref({} as ConfigSchema);

  const ajv = new Ajv({ allErrors: true });
  const validateSchema = () => validate(ajv, data);

  return $$({ name, data, validateSchema });
});

// ⚡ Widgets store
export const useWidgetsStore = defineStore("widgets", () => {
  const values = $ref(new Array<WidgetValue>());
  const savedData = $ref(useStorage("widgetsSavedData", new Map<string, SavedData>()));
  const lastWidgetRowEnd = $ref(1);
  const config = useConfigStore();

  const downloadLink = $computed(() => {
    const data = savedData.get(config.name);
    return data ? makeDownloadLink(data) : null;
  });

  function getWidgetsAsCSV(): SavedData {
    const stringify = (value: unknown) => Array.isArray(value) ? value.join(" ") : String(value);
    const header = values.map(i => i.name).concat("ScoutedTime");
    const record = values.map(i => stringify(i.value)).concat(new Date().toString());
    return { header, values: [record] };
  }

  function toCSVString(data: SavedData, excludeHeaders?: boolean): string {
    const escape = (s: string[]) => s.map(i => `"${i.replaceAll('"', '""')}"`).join();
    const header = escape(data.header);
    const records = data.values.map(escape);
    return excludeHeaders ? records.join("\n") : [header, ...records].join("\n");
  }

  function makeDownloadLink(data: SavedData): string {
    return URL.createObjectURL(new Blob([toCSVString(data)], { type: "text/csv" }));
  }

  function addWidgetValue(key: string | Widget, value: Ref) {
    let name: string | null = null;
    if (typeof key === "string") {
      name = key;
    } else if (key.name !== undefined) {
      name = (key.prefix ? `${key.prefix}-${key.name}` : key.name).replaceAll(/\s/g, "");
    } else {
      return -1;
    }
    return values.push({ name, value }) - 1;
  }

  function save() {
    const csv = getWidgetsAsCSV();
    const entry = savedData.get(config.name);
    if (!entry) savedData.set(config.name, csv);
    else {
      entry.header = csv.header;
      entry.values.push(csv.values[0]);
    }
  }

  return $$({
    values, savedData, lastWidgetRowEnd, downloadLink, getWidgetsAsCSV,
    toCSVString, makeDownloadLink, addWidgetValue, save
  });
});

// ⚡ Validation store
export const useValidationStore = defineStore("validation", () => {
  const triggerPages = $ref(new Array<number>());
  const failedPage = $ref(-1);
  return $$({ triggerPages, failedPage });
});

// ⚡ TBA store
export const useTBAStore = defineStore("tba", () => {
  let eventCode = $ref(useStorage("tbaEventCode", ""));
  const savedData = $ref(useStorage("tbaSavedData", new Map<string, object>()));

  async function load(code: string, name: string): Promise<TBAData> {
    if (!code) {
      const localData = savedData.get(name);
      return { code: eventCode, data: await Promise.resolve(localData ?? {}) };
    }

    const res = await fetch(`https://www.thebluealliance.com/api/v3/event/${code}/${name}/simple`, {
      headers: { "X-TBA-Auth-Key": import.meta.env.VITE_TBA_API_KEY }
    });
    const data = await res.json();
    if (!isFailed(data)) {
      savedData.set(name, data);
      eventCode = code;
    }
    return { code, data };
  }

  return $$({ eventCode, savedData, load });
});
