import React, { useEffect, useId, useRef } from "react";
export default function FormField({ label, required, children, ...props }) {
  const id = useId();
  return (
    <div className="form-group">
      <label className="form-label" htmlFor={id}>
        {label} {required && <span className="required">*</span>}
      </label>
      {children ? (
        React.cloneElement(children, {
          id,
          required,
          className: "form-control",
        })
      ) : (
        <input
          id={id}
          required={required}
          className="form-control"
          {...props}
        />
      )}
    </div>
  );
}
export function FormNotice({ children }) {
  const ref = useRef(null);
  useEffect(() => {
    ref.current?.focus();
  }, [children]);
  return (
    <div ref={ref} className="form-notice" role="alert" tabIndex={-1}>
      {children}
    </div>
  );
}
