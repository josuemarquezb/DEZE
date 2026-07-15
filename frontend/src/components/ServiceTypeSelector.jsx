// components/ServiceTypeSelector.jsx — multi-select checkboxes for ServiceType values.

import { SERVICE_TYPES, SERVICE_TYPE_LABELS } from '../constants/serviceTypes.js';

/**
 * @param {string[]} value - currently selected service types
 * @param {(next: string[]) => void} onChange
 */
function ServiceTypeSelector({ value = [], onChange }) {
  const toggle = (type) => {
    if (value.includes(type)) {
      onChange(value.filter((t) => t !== type));
    } else {
      onChange([...value, type]);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {SERVICE_TYPES.map((type) => {
        const checked = value.includes(type);
        return (
          <label
            key={type}
            className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
              checked
                ? 'border-accent bg-accent/10 text-white'
                : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700'
            }`}
          >
            <input
              type="checkbox"
              className="accent-accent"
              checked={checked}
              onChange={() => toggle(type)}
            />
            {SERVICE_TYPE_LABELS[type]}
          </label>
        );
      })}
    </div>
  );
}

export default ServiceTypeSelector;
