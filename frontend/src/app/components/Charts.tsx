export function PieChart({ data, label }: { data: Array<{ name: string; value: number; color: string }>; label: string }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const visibleData = total > 0 ? data.filter((item) => item.value > 0) : [];

  // Calculate slices
  const slices = visibleData.map((item, index) => {
    let startAngle = 0;
    for (let i = 0; i < index; i++) {
      startAngle += (visibleData[i].value / total) * 360;
    }
    const sliceAngle = (item.value / total) * 360;
    const endAngle = startAngle + sliceAngle;
    return { ...item, startAngle, endAngle, sliceAngle };
  });

  return (
    <div className="flex flex-col items-center gap-4">
      <svg width="200" height="200" viewBox="0 0 200 200" className="drop-shadow-lg">
        {total === 0 && (
          <circle cx="100" cy="100" r="70" fill="#1a1a24" stroke="#7a7890" strokeWidth="1" opacity="0.7" />
        )}
        {slices.map((slice) => {
          if (slice.sliceAngle >= 359.99) {
            return <circle key={slice.name} cx="100" cy="100" r="70" fill={slice.color} stroke="#0a0a0f" strokeWidth="2" />;
          }

          const startRad = (slice.startAngle * Math.PI) / 180;
          const endRad = (slice.endAngle * Math.PI) / 180;

          const x1 = 100 + 70 * Math.cos(startRad);
          const y1 = 100 + 70 * Math.sin(startRad);
          const x2 = 100 + 70 * Math.cos(endRad);
          const y2 = 100 + 70 * Math.sin(endRad);

          const largeArc = slice.endAngle - slice.startAngle > 180 ? 1 : 0;

          const pathData = [
            `M 100 100`,
            `L ${x1} ${y1}`,
            `A 70 70 0 ${largeArc} 1 ${x2} ${y2}`,
            `Z`,
          ].join(" ");

          return (
            <path key={slice.name} d={pathData} fill={slice.color} stroke="#0a0a0f" strokeWidth="2" />
          );
        })}
      </svg>

      <div className="space-y-2 w-full">
        <h4 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 600, color: "#f0ede8", textAlign: "center" }}>
          {label}
        </h4>
        <div className="space-y-1.5">
          {data.map((item) => (
            <div key={item.name} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span style={{ color: "#7a7890" }}>{item.name}</span>
              </div>
              <span style={{ color: "#c9a84c", fontWeight: 600 }}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function BarChart({
  data,
  label,
  valueFormatter = (v) => `$${v}`,
}: {
  data: Array<{ name: string; value: number }>;
  label: string;
  valueFormatter?: (value: number) => string;
}) {
  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const barHeight = 32;
  const chartWidth = 380;
  const labelWidth = 98;
  const valueWidth = 72;
  const barAreaWidth = chartWidth - labelWidth - valueWidth - 28;
  const totalHeight = Math.max(data.length * barHeight + 18, 120);

  return (
    <div className="space-y-4 w-full overflow-x-auto">
      <h4 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 600, color: "#f0ede8" }}>
        {label}
      </h4>
      <svg width="100%" height={totalHeight} viewBox={`0 0 ${chartWidth} ${totalHeight}`} preserveAspectRatio="xMidYMid meet" className="drop-shadow">
        {data.map((item, index) => {
          const yPos = index * barHeight + 8;
          const barWidth = (item.value / maxValue) * barAreaWidth;

          return (
            <g key={item.name}>
              <text x="8" y={yPos + 15} fontSize="11" fill="#7a7890" fontFamily="Outfit" fontWeight="600">
                {item.name.length > 15 ? `${item.name.substring(0, 14)}...` : item.name}
              </text>
              <rect
                x={labelWidth}
                y={yPos}
                width={barAreaWidth}
                height="18"
                fill="#1a1a24"
                rx="3"
                opacity="0.9"
              />
              <rect
                x={labelWidth}
                y={yPos}
                width={Math.max(barWidth, 2)}
                height="18"
                fill="url(#gradient)"
                rx="3"
              />
              <text
                x={chartWidth - 8}
                y={yPos + 14}
                fontSize="11"
                fill="#c9a84c"
                fontFamily="JetBrains Mono"
                fontWeight="600"
                textAnchor="end"
              >
                {valueFormatter(item.value)}
              </text>
            </g>
          );
        })}
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: "#c9a84c", stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: "#d4b860", stopOpacity: 1 }} />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

export function LineChart({
  data,
  label,
  valueFormatter = (v) => `$${v}`,
  yStep = 500,
}: {
  data: Array<{ name: string; value: number }>;
  label: string;
  valueFormatter?: (value: number) => string;
  yStep?: number;
}) {
  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const axisMax = Math.max(yStep, Math.ceil(maxValue / yStep) * yStep);
  const chartWidth = 340;
  const chartHeight = 170;
  const padding = { top: 18, right: 18, bottom: 32, left: 56 };
  const plotWidth = chartWidth - padding.left - padding.right;
  const plotHeight = chartHeight - padding.top - padding.bottom;
  const tickCount = axisMax / yStep;
  const ticks = Array.from({ length: tickCount + 1 }, (_, i) => axisMax - i * yStep);

  const points = data.map((item, index) => {
    const x = (index / (data.length - 1 || 1)) * plotWidth + padding.left;
    const y = padding.top + plotHeight - (item.value / axisMax) * plotHeight;
    return { x, y, ...item };
  });

  const pathD = points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");

  return (
    <div className="space-y-3 w-full overflow-x-auto">
      <h4 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 600, color: "#f0ede8" }}>
        {label}
      </h4>
      <svg width="100%" height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="xMidYMid meet" className="drop-shadow">
        {ticks.map((tick) => {
          const y = padding.top + ((axisMax - tick) / axisMax) * plotHeight;
          return (
            <g key={`tick-${tick}`}>
              <line
                x1={padding.left}
                y1={y}
                x2={chartWidth - padding.right}
                y2={y}
                stroke="#c9a84c"
                strokeWidth="0.5"
                opacity="0.15"
              />
              <text
                x={padding.left - 8}
                y={y + 3}
                fontSize="9"
                fill="#7a7890"
                fontFamily="JetBrains Mono"
                textAnchor="end"
              >
                {valueFormatter(tick)}
              </text>
            </g>
          );
        })}

        {/* Axis */}
        <line x1={padding.left} y1={padding.top} x2={padding.left} y2={chartHeight - padding.bottom} stroke="#7a7890" strokeWidth="1" />
        <line x1={padding.left} y1={chartHeight - padding.bottom} x2={chartWidth - padding.right} y2={chartHeight - padding.bottom} stroke="#7a7890" strokeWidth="1" />

        {/* Line */}
        <path d={pathD} fill="none" stroke="url(#lineGradient)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

        {/* Points */}
        {points.map((point, index) => (
          <g key={`point-${index}`}>
            <circle cx={point.x} cy={point.y} r="3" fill="#c9a84c" stroke="#0a0a0f" strokeWidth="1.5" />
            <text
              x={point.x}
              y={chartHeight - padding.bottom + 16}
              fontSize="10"
              fill="#7a7890"
              fontFamily="Outfit"
              textAnchor="middle"
            >
              {point.name}
            </text>
          </g>
        ))}

        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: "#c9a84c", stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: "#d4b860", stopOpacity: 1 }} />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
