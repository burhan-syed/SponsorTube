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
