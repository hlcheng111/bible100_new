import {
  Bar,
  BarChart,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  dimensionBars0to50,
  meanOfAnsweredDimensionScores0to50,
} from "../scoring";

type Props = {
  answers: Record<string, number>;
  height: number;
  /** 簡短 X 軸標籤（看板用） */
  compactLabels?: boolean;
  className?: string;
};

export function DimensionBarChart({
  answers,
  height,
  compactLabels = false,
  className = "",
}: Props) {
  const rows = dimensionBars0to50(answers);
  const avg = meanOfAnsweredDimensionScores0to50(rows);
  const chartData = rows.map((r) => ({
    ...r,
    label: compactLabels ? r.name.slice(0, 2) : r.name,
  }));

  return (
    <div className={className}>
      <div className="mb-1 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
        <span>
          柱高＝該維度已填題之 0–50 參考分（Likert 均值換算）；未填為灰柱。
        </span>
        {avg !== null && (
          <span className="font-semibold text-rose-600">
            紅虛線＝已填維度平均 {avg}（高於線＝優於平均）
          </span>
        )}
      </div>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={chartData}
          margin={{ top: 6, right: 6, left: 0, bottom: compactLabels ? 8 : 52 }}
        >
          <XAxis
            dataKey="label"
            tick={{ fill: "#475569", fontSize: compactLabels ? 9 : 10 }}
            interval={0}
            angle={compactLabels ? 0 : -32}
            textAnchor={compactLabels ? "middle" : "end"}
            height={compactLabels ? 28 : 50}
          />
          <YAxis
            domain={[0, 50]}
            tick={{ fill: "#64748b", fontSize: 10 }}
            width={32}
          />
          <Tooltip
            contentStyle={{
              background: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: 8,
              fontSize: 12,
            }}
            formatter={(value: number, _name: string, item: { payload?: { hasData?: boolean } }) => {
              const ok = item?.payload?.hasData;
              if (!ok) return ["尚未作答", ""];
              return [value, "參考分 (0–50)"];
            }}
          />
          {avg !== null && (
            <ReferenceLine
              y={avg}
              stroke="#ef4444"
              strokeWidth={2}
              strokeDasharray="5 5"
              label={{
                value: "平均",
                position: "insideTopRight",
                fill: "#ef4444",
                fontSize: 10,
              }}
            />
          )}
          <Bar dataKey="score" radius={[4, 4, 0, 0]} maxBarSize={28}>
            {chartData.map((entry, i) => (
              <Cell
                key={i}
                fill={
                  !entry.hasData
                    ? "#cbd5e1"
                    : entry.score < 30
                      ? "#ef4444"
                      : "#4f46e5"
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
