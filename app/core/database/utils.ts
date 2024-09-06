export function createCSVRow(row: string[]): string {
  const normalize = row.map((e) => {
    if (/[,\"\n\r]/.test(e)) {
      e = e.replace(/"/g, '""');
      return `"${e}"`;
    }
    return e;
  });

  return normalize.join(",") + "\n";
}

export function createCSVRowFromObject<T extends readonly string[]>(
  obj: { [key in T[number]]: string },
  header: [...T]
): string {
  const row = header.map((key) => {
    const field = obj[key];
    return field.trim();
  });

  return createCSVRow(row).trim();
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

export function createArrFromCSVLine(line: string): string[] {
  const result: string[] = [];
  let currentField = "";
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (insideQuotes && i < line.length - 1 && line[i + 1] === '"') {
        currentField += '"';
        i++;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === "," && !insideQuotes) {
      result.push(currentField);
      currentField = "";
    } else {
      currentField += char;
    }
  }

  result.push(currentField);

  return result;
}
