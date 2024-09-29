export function getFormatDate(timestamp: string) {
  const d = new Date(Number(timestamp));

  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0"); // Months are zero-based
  const year = d.getFullYear();

  return `${day}/${month}/${year}`;
}
