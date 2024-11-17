export interface DataRow {
  id: string;
  uprofit: number;
  units: number;
  hours: number;
  hprofit?: number;
}

export interface ChartData {
  uprofit: number;
  hprofit: number;
}