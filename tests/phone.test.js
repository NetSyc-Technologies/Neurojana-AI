import test from "node:test";
import assert from "node:assert/strict";
import {
  getCountries,
  getCountryCallingCode,
  getExampleNumber,
} from "libphonenumber-js/max";
import examples from "libphonenumber-js/mobile/examples";
import { phoneCountries, normalizePhone } from "../src/services/phone.js";

test("country dropdown includes every supported country and territory once", () => {
  assert.deepEqual(
    new Set(phoneCountries.map((p) => p.country)),
    new Set(getCountries()),
  );
  assert.equal(
    phoneCountries.length,
    new Set(phoneCountries.map((p) => p.country)).size,
  );
  for (const item of phoneCountries) {
    assert.equal(item.code, getCountryCallingCode(item.country));
    assert.ok(item.name);
  }
});
test("shared calling codes and smaller territories remain separately selectable", () => {
  const codes = Object.fromEntries(
    phoneCountries.map((p) => [p.country, p.code]),
  );
  assert.equal(codes.IN, "91");
  assert.equal(codes.US, "1");
  assert.equal(codes.CA, "1");
  assert.equal(codes.GB, "44");
  assert.equal(codes.GG, "44");
  assert.equal(codes.AC, "247");
  assert.equal(codes.TA, "290");
  assert.equal(codes.XK, "383");
});
test("valid library examples normalize to E.164 for every region with an example", () => {
  for (const { country } of phoneCountries) {
    const example = getExampleNumber(country, examples);
    if (example)
      assert.equal(
        normalizePhone(example.formatNational(), country),
        example.number,
        country,
      );
  }
});
test("national trunk prefixes and international input work; invalid and mismatched numbers fail", () => {
  assert.equal(normalizePhone("020 7946 0018", "GB"), "+442079460018");
  assert.equal(normalizePhone("+44 20 7946 0018", "GB"), "+442079460018");
  assert.equal(normalizePhone("+44 20 7946 0018", "IN"), null);
  assert.equal(normalizePhone("123", "IN"), null);
  assert.equal(normalizePhone("Call me on 02079460018", "GB"), null);
  assert.equal(normalizePhone("", "IN"), "");
});
