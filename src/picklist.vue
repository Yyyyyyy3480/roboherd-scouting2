import { generatePicklist } from "@/analytics/picklist"

const scoutingData = JSON.parse(localStorage.getItem("matchData"))

const picklist = generatePicklist(scoutingData)

console.log(picklist)
