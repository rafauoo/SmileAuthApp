/* istanbul ignore file */
export default interface ChartData {
  labels: string[];
  datasets: { data: number[] }[] | any;
}
