export function createCSVRow(row: string[]) {
  return row.join(",") + "\n";
}
export function createArrFromCSVLine(line: string) {
  return line.split(",");
}
export function createObjFromCSVLine<T extends readonly string[]>(
  line: string,
  header: [...T]
) {
  return createArrFromCSVLine(line).reduce((prev, curr, i) => {
    prev[header[i]] = curr;
    return prev;
  }, {} as { [Key in T[number]]: string });
}
