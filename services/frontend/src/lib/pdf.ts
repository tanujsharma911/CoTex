export const generatePDF = (pdfBuffer: Uint8Array): string | null => {
  if (!pdfBuffer) {
    return null;
  }

  const arrayBuffer = new Uint8Array(pdfBuffer).buffer;
  const blob = new Blob([arrayBuffer], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);

  return url;
};

export const downloadFile = (url: string, filename: string) => {
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
