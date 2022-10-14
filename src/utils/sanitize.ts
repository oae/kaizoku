export const sanitizer = (value: string): string => {
  return value
    .replaceAll(/[\\/<>:;"'|?!*{}#%&^+,~\s]/g, '_')
    .replaceAll(/__+/g, '_')
    .replaceAll(/^[_\-.]+|[_\-.]+$/g, '_');
};
