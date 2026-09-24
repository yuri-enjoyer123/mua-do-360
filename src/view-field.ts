const radians = Math.PI / 180;

export function horizontalField(longSideDegrees: number, aspect: number) {
  return 2 * Math.atan(Math.tan(longSideDegrees * radians / 2) * Math.min(1, aspect)) / radians;
}

export function longSideField(horizontalDegrees: number, aspect: number) {
  return 2 * Math.atan(Math.tan(horizontalDegrees * radians / 2) / Math.min(1, aspect)) / radians;
}
