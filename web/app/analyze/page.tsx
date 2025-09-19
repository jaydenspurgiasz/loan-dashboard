"use client"

import { useState, useEffect } from 'react'
import { getCSV } from '@/lib/idb'
import { getCurrentKey } from '@/lib/idb'
import { Stats, calcStats, isStats } from '@/lib/stats'
import Charts from '@/components/Charts'

type ChartProps = {
  vintagePDProp: Array<{month: number, PD: number}>;
  loanDistProp: Array<{risk: number, total: number}>;
}

export default function Analyze() {
  const emptyVintage = Array.from({ length: 12 }, (_, i) => ({ month: i + 1, PD: 0 }));
  const emptyLoanDist = Array.from({ length: 10 }, (_, i) => ({ risk: i + 1, total: 0 }));

  const [stats, setStats] = useState<Stats>({snapshot: {EAD: 0, EL: 0, ELR: 0}, vintagePD: emptyVintage, loanDist: emptyLoanDist});
  const [LGD, setLGD] = useState(0.45);
  const [file, setFile] = useState<File | null>(null);
  const [chartData, setChartData] = useState<ChartProps>({ vintagePDProp: emptyVintage, loanDistProp: emptyLoanDist });

  useEffect(() => {
    async function fetchFile() {
      const key = await getCurrentKey();
      if (!key) {
        console.error("No current key found");
      } else {
        const csv = await getCSV(key);
        setFile(csv);
      }
    }
    fetchFile();
  }, [])
  useEffect(() => {
    const fetchStats = async () => {
      if (file) {
        const s = await calcStats(file, LGD);
        if (!isStats(s)) {
          console.error("Invalid stats:", s);
          return;
        }
        setStats(s);
      }
    }
    fetchStats();
  }, [LGD, file])
  useEffect(() => {
    setChartData({
      vintagePDProp: stats.vintagePD.map((obj , index) => ({
        month: obj.month,
        PD: obj.PD ?? 0
      })).slice(0, 12),
      loanDistProp: stats.loanDist.map((obj, index) => ({
        risk: obj.risk * 10,
        total: obj.total
      })).slice(0, 10)
    });
  }, [stats])

  return (
    <div>
      <input type="number" value={LGD} onChange={(e) => setLGD(Number(e.target.value))} />
      <div>EAD: {stats.snapshot.EAD}, EL: {stats.snapshot.EL}, ELR: {stats.snapshot.ELR}</div>
      <div>
        <Charts 
          vintagePDProp={chartData.vintagePDProp} 
          loanDistProp={chartData.loanDistProp} 
        />
      </div>
    </div>
  )
}
