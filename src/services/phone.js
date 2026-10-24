import {
  getCountries,
  getCountryCallingCode,
  parsePhoneNumberFromString,
} from "libphonenumber-js/max";
const names = new Intl.DisplayNames(["en"], { type: "region" });
export const phoneCountries = getCountries()
  .map((country) => ({
    country,
    name: names.of(country),
    code: getCountryCallingCode(country),
  }))
  .sort((a, b) => a.name.localeCompare(b.name, "en"));
export function normalizePhone(value, country) {
  if (!value?.trim()) return "";
  const parsed = parsePhoneNumberFromString(value.trim(), {
    defaultCountry: country,
    extract: false,
  });
  if (!parsed?.isValid() || parsed.ext) return null;
  // Some territories share both their calling code and mobile numbering plan.
  // Compare calling codes rather than rejecting those valid shared numbers.
  if (parsed.countryCallingCode !== getCountryCallingCode(country)) return null;
  return parsed.number;
}
