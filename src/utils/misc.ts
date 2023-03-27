export const downloadFile = (content: string, filename: string, type: string) => {
  const link = document.createElement('a');
  const file = new Blob([content], { type });
  link.href = URL.createObjectURL(file);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
};
