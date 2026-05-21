import { BudgetPageShell } from "./_components/budget-page-shell";
import { BudgetQuerySelect } from "./_components/budget-query-select";
import {
  buildOfficeTrendRows,
  buildOfficeTrendSelectGroups,
  buildYearRows,
  getLatestBudgetSelection,
  officeTrendLabelForValue,
  resolveOfficeTrendValue,
  type BudgetSearchParams,
} from "./_lib/budget-view-model";

type TotalChartRow = {
  total: number;
};

type ChartScale = {
  divisor: number;
  max: number;
  suffix: "B" | "M";
  unitLabel: "Billions" | "Millions";
};

type OfficeTrendRow = ReturnType<typeof buildOfficeTrendRows>[number];
type YearRow = ReturnType<typeof buildYearRows>[number];

function trimNumber(value: number, digits = 1) {
  return value.toFixed(digits).replace(/\.0$/, "");
}

function formatBillions(value: number, digits = 1) {
  return `${trimNumber(value / 1_000_000_000, digits)}B`;
}

function formatPesoBillions(value: number, digits = 2) {
  return `₱${trimNumber(value / 1_000_000_000, digits)}B`;
}

function formatPercent(value: number) {
  return `${value >= 0 ? "+" : ""}${trimNumber(value, 1)}%`;
}

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function chartMaxFor(rows: TotalChartRow[]) {
  const maxBillions = Math.max(
    ...rows.map((row) => row.total / 1_000_000_000),
    0,
  );

  if (maxBillions <= 1) return 1;
  if (maxBillions <= 5) return 5;
  if (maxBillions <= 20) return 20;
  if (maxBillions <= 50) return 50;
  if (maxBillions <= 120) return 120;

  return Math.ceil(maxBillions / 50) * 50;
}

function millionChartMaxFor(maxMillions: number) {
  if (maxMillions <= 100) return 100;
  if (maxMillions <= 250) return 250;
  if (maxMillions <= 500) return 500;
  if (maxMillions <= 1000) return 1000;

  return Math.ceil(maxMillions / 500) * 500;
}

function chartScaleFor(rows: TotalChartRow[]): ChartScale {
  const maxAmount = Math.max(...rows.map((row) => row.total), 0);

  if (maxAmount > 0 && maxAmount < 1_000_000_000) {
    return {
      divisor: 1_000_000,
      max: millionChartMaxFor(maxAmount / 1_000_000),
      suffix: "M",
      unitLabel: "Millions",
    };
  }

  return {
    divisor: 1_000_000_000,
    max: chartMaxFor(rows),
    suffix: "B",
    unitLabel: "Billions",
  };
}

function formatScaledAmount(value: number, scale: ChartScale) {
  const scaledValue = value / scale.divisor;
  const digits = scale.suffix === "M" && scaledValue >= 10 ? 0 : 1;

  return `${trimNumber(scaledValue, value === 0 ? 0 : digits)}${scale.suffix}`;
}

function formatScaledTick(value: number, scale: ChartScale) {
  if (scale.suffix === "B") return `${value.toFixed(1)}B`;

  const digits = value < 10 && value > 0 ? 1 : 0;
  return `${trimNumber(value, digits)}M`;
}

export default async function BudgetOverviewPage({
  searchParams,
}: {
  searchParams: BudgetSearchParams;
}) {
  const params = await searchParams;
  const latestSelection = getLatestBudgetSelection();
  const yearRows = buildYearRows();
  const trendGroups = buildOfficeTrendSelectGroups();
  const selectedTrend = resolveOfficeTrendValue(firstParam(params.trend));
  const trendRows = buildOfficeTrendRows(selectedTrend);
  const trendLabel = officeTrendLabelForValue(selectedTrend);
  const latestYear = yearRows[yearRows.length - 1];
  const previousYear = yearRows[yearRows.length - 2];
  const earliestYear = yearRows[0];
  const peakYear = [...yearRows].sort((a, b) => b.total - a.total)[0];
  const latestGrowth =
    previousYear && previousYear.total > 0
      ? ((latestYear.total - previousYear.total) / previousYear.total) * 100
      : 0;
  const sevenYearGrowth =
    earliestYear.total > 0
      ? ((latestYear.total - earliestYear.total) / earliestYear.total) * 100
      : 0;

  return (
    <BudgetPageShell activeItem="Overview">
      <div className="mt-8 pb-16 sm:pb-24">
        <section className="grid border-y border-[var(--ink)] sm:grid-cols-2 lg:grid-cols-4">
          <OverviewMetric
            label={`FY ${latestYear.year} appropriation`}
            value={formatPesoBillions(latestYear.total)}
            detail={`${formatPercent(latestGrowth)} vs. ${previousYear?.year ?? "prior year"}`}
            tone="positive"
          />
          <OverviewMetric
            label="7-year growth"
            value={formatPercent(sevenYearGrowth)}
            detail={`${formatPesoBillions(earliestYear.total, 2)} -> ${formatPesoBillions(latestYear.total, 2)}`}
          />
          <OverviewMetric
            label="Peak year"
            value={`FY ${peakYear.year}`}
            detail={formatPesoBillions(peakYear.total, 2)}
          />
          <OverviewMetric
            label="Reporting units"
            value={latestSelection.budget.agencies.length}
            detail="Ministries, Offices and Agencies"
          />
        </section>

        <AnnualAppropriationChart rows={yearRows} />

        <OfficeAppropriationTrendChart
          rows={trendRows}
          selectGroups={trendGroups}
          selectedValue={selectedTrend}
          selectedLabel={trendLabel}
        />
      </div>
    </BudgetPageShell>
  );
}

function OverviewMetric({
  label,
  value,
  detail,
  tone,
}: {
  label: string;
  value: string | number;
  detail: string;
  tone?: "positive";
}) {
  return (
    <div className="border-b border-r border-[var(--rule)] p-6 last:border-r-0 sm:[&:nth-child(2n)]:border-r-0 lg:border-b-0 lg:[&:nth-child(2n)]:border-r lg:[&:nth-child(4n)]:border-r-0">
      <p className="inline-block bg-[var(--accent-deep)] px-1 pl-2 font-mono text-[9px] font-medium uppercase tracking-[0.28em] text-white">
        {label}
      </p>
      <p className="num mt-5 text-4xl font-semibold uppercase leading-none">
        {value}
      </p>
      <p
        className={`mt-3 font-mono text-[11px] font-medium uppercase tracking-[0.12em] ${
          tone === "positive" ? "text-[var(--positive)]" : "text-[var(--ink-3)]"
        }`}
      >
        {detail}
      </p>
    </div>
  );
}

function AnnualAppropriationChart({ rows }: { rows: YearRow[] }) {
  const chartMax = chartMaxFor(rows);
  const width = 1120;
  const height = 330;
  const left = 66;
  const right = 28;
  const top = 58;
  const bottom = 44;
  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;
  const barWidth = 70;
  const bandWidth = plotWidth / rows.length;
  const ticks = [chartMax, chartMax * 0.75, chartMax * 0.5, chartMax * 0.25, 0];
  const points = rows.map((row, index) => {
    const x = left + bandWidth * (index + 0.5);
    const value = row.total / 1_000_000_000;
    const y = top + ((chartMax - value) / chartMax) * plotHeight;

    return { ...row, x, y, value };
  });

  return (
    <section className="mt-6 border border-[var(--ink)] bg-[var(--paper)] px-12 py-10">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="num text-xl font-extrabold uppercase tracking-normal">
          BARMM total appropriation, FY {rows[0]?.year} -{" "}
          {rows[rows.length - 1]?.year}
        </h2>
        <p className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--ink-3)]">
          Source: General Appropriations Act of the Bangsamoro · ₱ Billions
        </p>
      </div>

      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label={`BARMM total appropriation from fiscal year ${rows[0]?.year} to fiscal year ${rows[rows.length - 1]?.year}`}
          className="h-auto min-w-[860px] max-w-none"
        >
          {ticks.map((tick) => {
            const y = top + ((chartMax - tick) / chartMax) * plotHeight;

            return (
              <g key={tick}>
                <line
                  x1={left}
                  x2={width - right}
                  y1={y}
                  y2={y}
                  stroke="var(--rule-soft)"
                  strokeWidth="1"
                />
                <text
                  x={left - 10}
                  y={y + 5}
                  textAnchor="end"
                  fill="var(--ink-3)"
                  fontFamily="var(--font-body)"
                  fontSize="10"
                  fontWeight="500"
                >
                  {tick.toFixed(1)}B
                </text>
              </g>
            );
          })}

          {points.map((point) => {
            const barTop = point.y;

            return (
              <rect
                key={`bar-${point.year}`}
                x={point.x - barWidth / 2}
                y={barTop}
                width={barWidth}
                height={top + plotHeight - barTop}
                fill="var(--accent-soft)"
                opacity="0.82"
              />
            );
          })}

          <polyline
            points={points.map((point) => `${point.x},${point.y}`).join(" ")}
            fill="none"
            stroke="var(--accent-deep)"
            strokeWidth="3"
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {points.map((point) => (
            <g key={point.year}>
              <circle
                cx={point.x}
                cy={point.y}
                r="6"
                fill="var(--accent-deep)"
              />
              <text
                x={point.x}
                y={point.y - 16}
                textAnchor="middle"
                fill="var(--ink)"
                fontFamily="var(--font-number)"
                fontSize="13"
                fontWeight="800"
              >
                {formatBillions(point.total, 1)}
              </text>
              <text
                x={point.x}
                y={height - 14}
                textAnchor="middle"
                fill="var(--ink-3)"
                fontFamily="var(--font-body)"
                fontSize="11"
                fontWeight="500"
              >
                {point.year}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </section>
  );
}

function OfficeAppropriationTrendChart({
  rows,
  selectGroups,
  selectedValue,
  selectedLabel,
}: {
  rows: OfficeTrendRow[];
  selectGroups: ReturnType<typeof buildOfficeTrendSelectGroups>;
  selectedValue: string;
  selectedLabel: string;
}) {
  const chartScale = chartScaleFor(rows);
  const chartMax = chartScale.max;
  const width = 1120;
  const height = 330;
  const left = 66;
  const right = 28;
  const top = 58;
  const bottom = 44;
  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;
  const barWidth = 70;
  const bandWidth = plotWidth / rows.length;
  const ticks = [chartMax, chartMax * 0.75, chartMax * 0.5, chartMax * 0.25, 0];
  const points = rows.map((row, index) => {
    const x = left + bandWidth * (index + 0.5);
    const value = row.total / chartScale.divisor;
    const y = top + ((chartMax - value) / chartMax) * plotHeight;

    return { ...row, x, y, value };
  });

  return (
    <section className="mt-6 border border-[var(--ink)] bg-[var(--paper)] px-12 py-10">
      <div className="flex flex-wrap items-center justify-between gap-5">
        <div className="w-full max-w-xl">
          <BudgetQuerySelect
            id="overview-trend-select"
            name="trend"
            label="Compare office or category budget trend"
            value={selectedValue}
            groups={selectGroups}
          />
        </div>
        <p className="pt-2 text-right font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--ink-3)]">
          Source: General Appropriations Act of the Bangsamoro · ₱{" "}
          {chartScale.unitLabel}
        </p>
      </div>

      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label={`${selectedLabel} appropriation from fiscal year ${rows[0]?.year} to fiscal year ${rows[rows.length - 1]?.year}`}
          className="h-auto min-w-[860px] max-w-none"
        >
          {ticks.map((tick) => {
            const y = top + ((chartMax - tick) / chartMax) * plotHeight;

            return (
              <g key={tick}>
                <line
                  x1={left}
                  x2={width - right}
                  y1={y}
                  y2={y}
                  stroke="var(--rule-soft)"
                  strokeWidth="1"
                />
                <text
                  x={left - 10}
                  y={y + 5}
                  textAnchor="end"
                  fill="var(--ink-3)"
                  fontFamily="var(--font-body)"
                  fontSize="10"
                  fontWeight="500"
                >
                  {formatScaledTick(tick, chartScale)}
                </text>
              </g>
            );
          })}

          {points.map((point) => {
            const barTop = point.y;

            return (
              <rect
                key={`bar-${point.year}`}
                x={point.x - barWidth / 2}
                y={barTop}
                width={barWidth}
                height={top + plotHeight - barTop}
                fill="var(--accent-soft)"
                opacity="0.82"
              />
            );
          })}

          <polyline
            points={points.map((point) => `${point.x},${point.y}`).join(" ")}
            fill="none"
            stroke="var(--accent-deep)"
            strokeWidth="3"
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {points.map((point) => (
            <g key={point.year}>
              <circle
                cx={point.x}
                cy={point.y}
                r="6"
                fill="var(--accent-deep)"
              />
              <text
                x={point.x}
                y={point.y - 16}
                textAnchor="middle"
                fill="var(--ink)"
                fontFamily="var(--font-number)"
                fontSize="13"
                fontWeight="800"
              >
                {formatScaledAmount(point.total, chartScale)}
              </text>
              <text
                x={point.x}
                y={height - 14}
                textAnchor="middle"
                fill="var(--ink-3)"
                fontFamily="var(--font-body)"
                fontSize="11"
                fontWeight="500"
              >
                {point.year}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </section>
  );
}
