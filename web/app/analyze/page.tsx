"use client"

import { useState, useEffect } from 'react'
import { getCSV } from '@/lib/idb'
import { getCurrentKey } from '@/lib/idb'
import { Stats, calcStats, isStats } from '@/lib/stats'
import Charts from '@/components/Charts'
import Container from '@/components/Container'
import Card from '@/components/Card'
import { FilePreview, getPreview } from '@/lib/fileParse'
import CSVPreview from '@/components/CSVPreview'

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
  const [preview, setPreview] = useState<FilePreview>({ head: [], tail: [], metadata: {} as any });

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
    const fetchPreview = async () => {
      if (file) {
        const p = await getPreview(file);
        if (!p) {
          console.error("Failed to get preview");
          return;
        }
        setPreview(p);
      }
    }
    fetchPreview();
  }, [file])
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
    <Container>
      <div className="grid gap-4 md:grid-cols-5">
        <Card title="Inputs" className="col-span-1">
          <label className="text-sm">LGD (%)</label>
          <input
            type="number"
            value={LGD}
            onChange={(e) => setLGD(Number(e.target.value))}
            className="mt-2 w-full rounded-xl border px-3 py-2 bg-white dark:bg-neutral-900"
          />
        </Card>
        <Card title="Snapshot" className="col-span-4">
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="rounded-xl border p-3">
              <div className="text-xs text-neutral-500">EAD</div>
              <div className="mt-1 font-semibold truncate" title={String(stats.snapshot.EAD)}>{stats.snapshot.EAD}</div>
            </div>
            <div className="rounded-xl border p-3">
              <div className="text-xs text-neutral-500">EL</div>
              <div className="mt-1 font-semibold truncate" title={String(stats.snapshot.EL)}>{stats.snapshot.EL}</div>
            </div>
            <div className="rounded-xl border p-3">
              <div className="text-xs text-neutral-500">ELR</div>
              <div className="mt-1 font-semibold truncate" title={String(stats.snapshot.ELR)}>{stats.snapshot.ELR}</div>
            </div>
          </div>
        </Card>
       </div>

      <div className="mt-6">
        <Charts vintagePDProp={chartData.vintagePDProp} loanDistProp={chartData.loanDistProp} />
      </div>

      <CSVPreview FilePreviewProps={preview} />
    </Container>
  )
}
