import React from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Tracing } from 'trace_events';

type ChartProps = {
  vintagePDProp: Array<{month: number, PD: number}>;
  loanDistProp: Array<{risk: number, total: number}>;
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
    <>
      <div>
        <BarChart width={500} height={300} data={vintagePD}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="PD" fill="#8884d8" />
        </BarChart>
      </div>
      <div>
        <AreaChart width={500} height={300} data={loanDist}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="risk" tickFormatter={(val) => `${val}%`} interval={0}/>
          <YAxis />
          <Tooltip />
          <Area type="monotone" dataKey="total" stroke="#8884d8" fill="#8884d8" />
        </AreaChart>
      </div>
    </>
  )
}

export default Charts;