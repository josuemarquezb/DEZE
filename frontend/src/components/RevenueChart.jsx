// components/RevenueChart.jsx — stacked bar chart of monthly revenue
// (job revenue + subscription revenue), inline SVG, no charting library.
// Colors reuse the app's existing accent palette (tailwind.config.js) rather
// than introducing new hues, so it stays visually consistent with buttons/badges
// elsewhere in the app.

import { useState } from 'react';

const JOB_COLOR = '#00E5A0'; // accent (DEFAULT)
const SUBSCRIPTION_COLOR = '#7C3AED'; // accent-purple
const CHART_HEIGHT = 200;
const BAR_MAX_WIDTH = 40;
const SEGMENT_GAP = 2; // surface gap between stacked segments

const formatCurrency = (n) => `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

const formatMonthLabel = (key) => {
  const [year, month] = key.split('-').map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString(undefined, { month: 'short' });
};

/** @param {{ month: string, jobRevenue: number, subscriptionRevenue: number, total: number }[]} data */
function RevenueChart({ data = [] }) {
  const [hoverIndex, setHoverIndex] = useState(null);

  if (!data.length) {
    return <p className="text-sm text-zinc-500">No revenue data yet.</p>;
  }

  const maxTotal = Math.max(...data.map((d) => d.total), 1);
  const plotWidth = data.length * 80;
  const barWidth = Math.min(BAR_MAX_WIDTH, 80 - 32);

  const scale = (value) => (value / maxTotal) * (CHART_HEIGHT - 24);

  return (
    <div>
      <div className="mb-3 flex items-center gap-4 text-xs text-zinc-400">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: JOB_COLOR }} />
          Job revenue
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: SUBSCRIPTION_COLOR }} />
          Subscription revenue
        </span>
      </div>

      <div className="overflow-x-auto">
        <svg width={plotWidth} height={CHART_HEIGHT + 30} className="overflow-visible">
          {/* gridlines */}
          {[0, 0.5, 1].map((f) => (
            <line
              key={f}
              x1={0}
              x2={plotWidth}
              y1={CHART_HEIGHT - 6 - f * (CHART_HEIGHT - 24)}
              y2={CHART_HEIGHT - 6 - f * (CHART_HEIGHT - 24)}
              stroke="#27272a"
              strokeWidth={1}
            />
          ))}

          {data.map((d, i) => {
            const x = i * 80 + (80 - barWidth) / 2;
            const jobHeight = scale(d.jobRevenue);
            const subHeight = scale(d.subscriptionRevenue);
            const baseline = CHART_HEIGHT - 6;
            const subY = baseline - subHeight;
            const jobY = subY - SEGMENT_GAP - jobHeight;
            const isHovered = hoverIndex === i;

            return (
              <g
                key={d.month}
                onMouseEnter={() => setHoverIndex(i)}
                onMouseLeave={() => setHoverIndex(null)}
                className="cursor-pointer"
              >
                {/* wider invisible hit target */}
                <rect x={i * 80} y={0} width={80} height={CHART_HEIGHT} fill="transparent" />

                {/* subscription segment (bottom) */}
                {subHeight > 0 && (
                  <rect
                    x={x}
                    y={subY}
                    width={barWidth}
                    height={subHeight}
                    rx={jobHeight > 0 ? 0 : 4}
                    fill={SUBSCRIPTION_COLOR}
                    opacity={isHovered ? 1 : 0.85}
                  />
                )}
                {/* job revenue segment (top, rounded cap) */}
                {jobHeight > 0 && (
                  <path
                    d={roundedTopRectPath(x, jobY, barWidth, jobHeight, 4)}
                    fill={JOB_COLOR}
                    opacity={isHovered ? 1 : 0.85}
                  />
                )}

                {/* total value on top of the bar */}
                <text
                  x={x + barWidth / 2}
                  y={jobY - 6}
                  textAnchor="middle"
                  className="fill-zinc-300 text-[10px]"
                >
                  {isHovered ? formatCurrency(d.total) : ''}
                </text>

                {/* month label */}
                <text x={x + barWidth / 2} y={CHART_HEIGHT + 16} textAnchor="middle" className="fill-zinc-500 text-xs">
                  {formatMonthLabel(d.month)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {hoverIndex !== null && (
        <div className="mt-2 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-zinc-300">
          <p className="font-medium text-white">{formatMonthLabel(data[hoverIndex].month)}</p>
          <p>Job revenue: {formatCurrency(data[hoverIndex].jobRevenue)}</p>
          <p>Subscription revenue: {formatCurrency(data[hoverIndex].subscriptionRevenue)}</p>
          <p className="text-zinc-500">Total: {formatCurrency(data[hoverIndex].total)}</p>
        </div>
      )}
    </div>
  );
}

/** SVG path for a rectangle with only its top corners rounded (rendered stacked on top of another segment). */
function roundedTopRectPath(x, y, width, height, radius) {
  const r = Math.min(radius, height, width / 2);
  return `
    M ${x} ${y + height}
    L ${x} ${y + r}
    Q ${x} ${y} ${x + r} ${y}
    L ${x + width - r} ${y}
    Q ${x + width} ${y} ${x + width} ${y + r}
    L ${x + width} ${y + height}
    Z
  `;
}

export default RevenueChart;
