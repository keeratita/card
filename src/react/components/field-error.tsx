import React from 'react';

export interface FieldErrorTextProps {
  /** Element id; the associated input references it via aria-describedby. */
  id: string;
  message?: string | null;
}

/**
 * Inline validation message for a form row. Renders nothing when there is
 * no error; when present it announces itself via role="alert" (rows must
 * set aria-invalid + aria-describedby on the input to associate it).
 */
export function FieldErrorText({ id, message }: Readonly<FieldErrorTextProps>) {
  if (!message) return null;
  return (
    <span id={id} className="field-error" role="alert">
      {message}
    </span>
  );
}
