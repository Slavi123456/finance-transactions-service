// "2026-02" -> { from: "2026-02-01", to: "2026-02-28" }
export function monthRange(month: string): {from:string; to: string} {
    const year = Number(month.slice(0,4));
    const monthNumber = Number(month.slice(5,7));
    const lastDay = new Date(year, monthNumber, 0).getDate();
    return { from: `${month}-01`, to: `${month}-${String(lastDay).padStart(2, "0")}` };
}