import React from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Tracing } from 'trace_events';
import Card from './Card';

type ChartProps = {
  vintagePDProp: Array<{month: number, PD: number}>;
  loanDistProp: Array<{risk: number, total: number}>;
}

function ChartFrame({
  title,
  children,
}: {
  title: string;
  children: React.ReactElement;
}) {
  return (
    <div className="rounded-xl border p-3 mb-4">
      <div className="mb-2 text-sm font-medium">{title}</div>
      <div className="flex justify-center">
        <div className="w-full max-w-[900px] px-4">
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              {children}
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function Charts({vintagePDProp, loanDistProp}: ChartProps) {
  const [vintagePD, setVintagePD] = React.useState(vintagePDProp);
  const [loanDist, setLoanDist] = React.useState(loanDistProp);

  React.useEffect(() => {
    setVintagePD(vintagePDProp);
  }, [vintagePDProp]);

  React.useEffect(() => {
    setLoanDist(loanDistProp);
  }, [loanDistProp]);

return (
    <div className="min-w-0">
      <div className="md:grid-cols-2 grid gap-3">
        <div className="col-span-1">
      <ChartFrame title="Vintage PD (Months)">
        <BarChart
          data={vintagePD}
          margin={{ top: 12, right: 20, bottom: 12, left: 20 }}
          barCategoryGap="18%"
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="month"
            interval={0}
            tickFormatter={(value) => `M${value}`}
            tickMargin={6}
            padding={{ left: 12, right: 12 }}
          />
          <YAxis tickMargin={6} width={56} />
          <Tooltip />
          <Bar dataKey="PD" />
        </BarChart>
      </ChartFrame>
      </div>

      <div className="col-span-1">
      <ChartFrame title="Loan Distribution by Risk">
        <AreaChart
          data={loanDist}
          margin={{ top: 12, right: 20, bottom: 12, left: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="risk"
            interval={0}
            tickMargin={6}
            padding={{ left: 12, right: 12 }}
          />
          <YAxis
            tickMargin={6}
            width={64}
            tickFormatter={(value) => value.toLocaleString()}
          />
          <Tooltip  formatter={(value: any) => [Number(value).toLocaleString(), "total"]} />
          <Area type="monotone" dataKey="total" />
        </AreaChart>
      </ChartFrame>
        </div>
      </div>
    </div>
  );
}

export default Charts;