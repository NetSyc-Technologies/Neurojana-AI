import React, { useId } from "react";
import { phoneCountries } from "../services/phone.js";
export default function PhoneInput({
  value,
  onChange,
  country,
  onCountryChange,
  required = false,
}) {
  const id = useId();
  return (
    <div className="form-group phone-field">
      <label className="form-label" htmlFor={id}>
        Phone number{" "}
        {required ? (
          <span className="required">*</span>
        ) : (
          <span className="optional">(optional)</span>
        )}
      </label>
      <div className="phone-input-row">
        <select
          className="form-control country-select"
          value={country}
          onChange={(e) => onCountryChange(e.target.value)}
          aria-label="Phone country and calling code"
          autoComplete="country"
        >
          {phoneCountries.map((item) => (
            <option key={item.country} value={item.country}>
              {item.name} (+{item.code})
            </option>
          ))}
        </select>
        <input
          id={id}
          type="tel"
          className="form-control"
          placeholder="Phone number"
          autoComplete="tel-national"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          maxLength={30}
          aria-describedby={id + "-hint"}
        />
      </div>
      <span id={id + "-hint"} className="form-hint">
        Choose your country, then enter your number.
      </span>
    </div>
  );
}
