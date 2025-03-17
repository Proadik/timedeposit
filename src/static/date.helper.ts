// TODO: @adil - add handler for incorrect values
export const tsToDate = (ts: number | string) => {
  return new Date(Number(ts)).toLocaleString()
}
