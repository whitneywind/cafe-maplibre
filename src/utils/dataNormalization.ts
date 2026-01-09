export const normalizeStringArray = (
  data: any, 
  toHumanReadable: boolean = false
): string[] => {
    if (!data) return [];

    let arr: string[] = [];

    // normalize input to a standard array
    if (Array.isArray(data)) {
        arr = data;
    } else if (typeof data === 'string') {
        // Remove Postgres/JSON wrapping: {}, [], or whitespace
        const cleanStr = data.replace(/^[{[]|[}\]]$/g, '').trim();
        
        // Split by comma only if string isn't empty
        arr = cleanStr ? cleanStr.split(',') : [];
    }

  // Filter out empties and apply your formatting logic
  return arr
    .filter(item => !!item)
    .map(item => {
      const cleaned = item.trim().replace(/^['"]+|['"]+$/g, '');
      return toHumanReadable ? cleaned.replace(/_/g, " ") : cleaned;
    });
};