export const truncateHex = (hex: string, prefixLength: number = 4, suffixLength: number = 4) => {
  if (hex.length <= prefixLength + suffixLength) {
    return hex;
  }
  const start = hex.substring(0, prefixLength);
  const end = hex.substring(hex.length - suffixLength);
  return `${start}...${end}`;
}

export const copyToClipboard = (text: string): void => {
  navigator.clipboard.writeText(text)
    .then(() => console.log(`Copied to clipboard: ${text}`))
    .catch(err => console.error("Failed to copy:", err));
};
