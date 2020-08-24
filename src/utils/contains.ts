export default function contains(str?: string | null, value?: string): boolean {
  return value && str ? str.toLowerCase().includes(value.toLowerCase()) : false;
}
