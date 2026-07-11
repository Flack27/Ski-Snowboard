/// <reference path="../pb_data/types.d.ts" />
//
// On any change to content collections, ping the Next.js site so ISR pages
// revalidate immediately (product/price/service edits appear without a redeploy).
//
// NOTE: each hook callback runs in its own isolated runtime, so it can't call
// functions defined at the top of this file — the logic is inlined in each one.
//
// Needs two env vars on the PocketBase container:
//   REVALIDATE_URL     e.g. http://web:3000/api/revalidate   (internal docker URL)
//   REVALIDATE_SECRET  same value as the Next app's REVALIDATE_SECRET

const WATCHED = ["products", "services", "settings", "time_slots", "blocked_dates"];

onRecordAfterCreateRequest((e) => {
  const base = $os.getenv("REVALIDATE_URL");
  const secret = $os.getenv("REVALIDATE_SECRET");
  if (!base || !secret) return;
  try {
    $http.send({ url: base + "?secret=" + encodeURIComponent(secret), method: "POST", timeout: 5 });
  } catch (err) {
    console.log("[revalidate] " + err);
  }
}, ...WATCHED);

onRecordAfterUpdateRequest((e) => {
  const base = $os.getenv("REVALIDATE_URL");
  const secret = $os.getenv("REVALIDATE_SECRET");
  if (!base || !secret) return;
  try {
    $http.send({ url: base + "?secret=" + encodeURIComponent(secret), method: "POST", timeout: 5 });
  } catch (err) {
    console.log("[revalidate] " + err);
  }
}, ...WATCHED);

onRecordAfterDeleteRequest((e) => {
  const base = $os.getenv("REVALIDATE_URL");
  const secret = $os.getenv("REVALIDATE_SECRET");
  if (!base || !secret) return;
  try {
    $http.send({ url: base + "?secret=" + encodeURIComponent(secret), method: "POST", timeout: 5 });
  } catch (err) {
    console.log("[revalidate] " + err);
  }
}, ...WATCHED);
