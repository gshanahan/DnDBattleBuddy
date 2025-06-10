import React from "react";

const CONDITIONS = [
  "Blinded",
  "Charmed",
  "Deafened",
  "Frightened",
  "Grappled",
  "Incapacitated",
  "Invisible",
  "Paralyzed",
  "Petrified",
  "Poisoned",
  "Prone",
  "Restrained",
  "Stunned",
  "Unconscious",
];

export default function ConditionDropdown({ selected, onChange }) {
  return (
    <select
      className="border rounded px-2 py-1"
      value={selected}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">Select condition</option>
      {CONDITIONS.map((cond) => (
        <option key={cond} value={cond}>{cond}</option>
      ))}
    </select>
  );
}