// src/utils/format.ts
export const round = (v: number | null | undefined, d = 2) => {
if (typeof v !== 'number' || Number.isNaN(v)) return '-';
const p = Math.pow(10, d);
return Math.round(v * p) / p;
};

export const pad = (n: number, w = 2) => String(n).padStart(w, '0');

export const timeLabel = (t: number) => {
const d = new Date(t);
return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.${String(d.getMilliseconds()).padStart(3, '0')}`;
};