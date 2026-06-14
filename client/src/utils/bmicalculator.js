export function calcBMI(weight, heightCm) {
  const h = heightCm / 100;
  if (!h) return 0;
  return +(weight / (h * h)).toFixed(1);
}
