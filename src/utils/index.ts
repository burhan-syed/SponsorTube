export const textFindIndices = (
  text: string,
  find: string,
  ignoreCase = true
) => {
  const indices: number[] = [];
  if (!find || !text) return indices;
  if (ignoreCase) {
    text = text.toUpperCase();
    find = find.toUpperCase();
  }
  let idx = text.indexOf(find);
  while (idx !== -1) {
    indices.push(idx);
    idx = text.indexOf(find, idx + 1);
  }
  return indices;
};

export const secondsToHMS = (seconds: number) => {
  if (seconds < 3600) {
    return new Date(seconds * 1000).toISOString().substring(14, 19);
  }
  return new Date(seconds * 1000).toISOString().slice(11, 19);
};
