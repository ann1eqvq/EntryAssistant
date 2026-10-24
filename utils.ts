import { EntryLine } from './types';

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-US').format(num);
};

export const parseInputText = (text: string, simpleThousands: boolean): EntryLine[] => {
  const lines = text.split('\n');
  const result: EntryLine[] = [];

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    // Regex to separate text from the number at the end
    // Matches: "Subject Name" + "12345" (ignoring spaces between)
    // Also handles numbers with existing commas like "1,000"
    const match = trimmed.match(/^(.+?)\s*([0-9,.]+)\s*$/);

    if (match) {
      const subject = match[1].trim();
      let amountStr = match[2].replace(/,/g, ''); // Remove commas
      let amount = parseFloat(amountStr);

      if (!isNaN(amount)) {
        if (simpleThousands) {
          amount = amount * 1000;
        }

        result.push({
          id: Math.random().toString(36).substring(2, 9),
          subject,
          amount,
        });
      }
    }
  });

  return result;
};
