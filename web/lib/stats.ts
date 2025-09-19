import { parseCSV } from "./fileParse";

// Useful stats
type Row = {
    loan_amnt: number;
    loan_risk: number;
    issue_month: number;
}

const rawToRow = (row: Record<string, any>): Row => ({
    loan_amnt: Number(row["loan_amnt"]),
    loan_risk: parseFloat(row["loan_risk"]),
    issue_month: Number(row["issue_month"]),
});

export type Stats = {
    snapshot: {EAD: number, EL: number, ELR: number};
    vintagePD: Array<{month: number, PD: number}>;
    loanDist: Array<{risk: number, total: number}>;
}

export function isStats(s: any): s is Stats {
  return (
    s !== null &&
    typeof s === 'object' &&
    'snapshot' in s &&
    'vintagePD' in s &&
    'loanDist' in s &&
    typeof s.snapshot === 'object' &&
    'EAD' in s.snapshot &&
    'EL' in s.snapshot &&
    'ELR' in s.snapshot &&
    Array.isArray(s.vintagePD) &&
    Array.isArray(s.loanDist)
  );
}

export const calcStats = async (blob: Blob, LGD: number = 0.45): Promise<Stats> => {
    try {
        const csv: Record<string, any>[] = await parseCSV(blob) || [];
        const data: Row[] = csv.map(rawToRow);

        const EAD = data.reduce((tot, row) => tot + row.loan_amnt, 0); // Exposure at Default
        const EL = data.reduce((tot, row) => tot + row.loan_amnt * row.loan_risk * LGD, 0); // Expected Loss
        const ELR = EL / EAD; // Expected Loss Rate

        let vintagePDArr = Array(12).fill(0);
        let vintagePDCount = Array(12).fill(0);
        for (const row of data) {
            vintagePDArr[row.issue_month] += row.loan_risk;
            vintagePDCount[row.issue_month] += 1;
        }
        for (let i = 0; i < 12; i++) {
            vintagePDArr[i] = vintagePDArr[i] / (vintagePDCount[i] || 1);
        }

        let loanDistArr = Array(10).fill(0);
        for (const row of data) {
            const i = Math.min(Math.floor(row.loan_risk * 10), 9);
            loanDistArr[i] += row.loan_amnt;
        }

        // Convert
        const vintagePD = vintagePDArr.map((pd, index) => ({
            month: index + 1,
            PD: pd ?? 0
        }))
        const loanDist = loanDistArr.map((amnt, index) => ({
            risk: index,
            total: amnt ?? 0
        }))
        
        return {
            snapshot: { EAD, EL, ELR },
            vintagePD: vintagePD,
            loanDist: loanDist
        };
    } catch (e) {
        console.error("Error calculating stats:", e);
        return {snapshot: {EAD: 0, EL: 0, ELR: 0}, vintagePD: Array(12).fill([0, 0]), loanDist: Array(10).fill([0, 0])};
    }
}