const everyAsync = async (
  arr: any[],
  predicate: (el: any) => Promise<boolean>,
): Promise<boolean> => {
  for (const el of arr) {
    if (!(await predicate(el))) return false;
  }
  return true;
};

export default everyAsync;
