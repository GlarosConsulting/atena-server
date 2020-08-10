export default function contains(str?: string | null, value?: string): boolean {
  return value && str ? str.toUpperCase().includes(value.toUpperCase()) : false;
}
