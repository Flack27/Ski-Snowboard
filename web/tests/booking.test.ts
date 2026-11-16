import { test } from "node:test";
import assert from "node:assert/strict";
import { isDuplicateSlotError, parseBookingRequest } from "@/lib/booking";
import { slugify } from "@/lib/slug";
import { formatDateNl } from "@/lib/dates";

// Services as the owner named them in the admin (Nov 2026), slugged the way the site does.
const SERVICES = ["Basisbeurt", "Grote beurt", "Premium beurt", "Performance beurt"].map(
  (name) => ({ name, slug: slugify(name) }),
);

const valid = {
  name: "Sanne",
  email: "sanne@example.nl",
  service: "grote-beurt",
  date: "2026-12-05",
  time_slot: "10:30",
};

test("slugify turns admin-typed slugs into URL-safe ones", () => {
  assert.equal(slugify("Grote beurt"), "grote-beurt");
  assert.equal(slugify("Skiën & boards"), "skien-boards");
  assert.equal(slugify("  --Basis--  "), "basis");
});

// Regression: services renamed in the admin made every booking fail with
// "Vul alle verplichte velden in." because the route checked a hardcoded list.
test("accepts a service that exists in the admin, whatever it is called", () => {
  const r = parseBookingRequest(valid, SERVICES);
  assert.ok(r.ok);
  assert.equal(r.value.service.name, "Grote beurt");
});

test("an unknown service gets its own message, not 'fill in all fields'", () => {
  const r = parseBookingRequest({ ...valid, service: "waxen-slijpen" }, SERVICES);
  assert.deepEqual(r, { ok: false, error: "Kies een geldige dienst." });
});

test("missing required fields", () => {
  for (const key of ["name", "email", "date", "time_slot"]) {
    const r = parseBookingRequest({ ...valid, [key]: "  " }, SERVICES);
    assert.deepEqual(r, { ok: false, error: "Vul alle verplichte velden in." }, key);
  }
});

test("rejects a malformed e-mail address or date", () => {
  assert.deepEqual(parseBookingRequest({ ...valid, email: "sanne@" }, SERVICES), {
    ok: false,
    error: "Vul een geldig e-mailadres in.",
  });
  assert.deepEqual(parseBookingRequest({ ...valid, date: "5-12-2026" }, SERVICES), {
    ok: false,
    error: "Ongeldige datum.",
  });
});

test("only a unique-index clash on the slot counts as 'slot taken'", () => {
  const notUnique = { code: "validation_not_unique", message: "Value must be unique." };
  assert.equal(isDuplicateSlotError({ response: { data: { date: notUnique } } }), true);
  assert.equal(isDuplicateSlotError({ response: { data: { time_slot: notUnique } } }), true);
  // A bad field value (e.g. the old select rejecting a service) is a real error.
  const invalid = { code: "validation_invalid_value", message: "Invalid value." };
  assert.equal(isDuplicateSlotError({ response: { data: { service: invalid } } }), false);
  assert.equal(isDuplicateSlotError(new Error("network down")), false);
});

test("booking dates show as a Dutch calendar day, not ISO", () => {
  assert.equal(formatDateNl("2026-11-17"), "dinsdag 17 november");
  assert.equal(formatDateNl("2026-01-04"), "zondag 4 januari");
  assert.equal(formatDateNl("not-a-date"), "not-a-date");
});
