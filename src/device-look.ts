import { Euler, Quaternion, Vector3 } from 'three';

export function startDeviceLook(viewer: PanoramaViewer, onSample: () => void) {
  const euler = new Euler();
  const rotation = new Quaternion();
  const screenRotation = new Quaternion();
  const cameraRotation = new Quaternion(-Math.SQRT1_2, 0, 0, Math.SQRT1_2);
  const zAxis = new Vector3(0, 0, 1);
  const direction = new Vector3();
  const radians = Math.PI / 180;
  let baseline: { yaw: number; pitch: number; viewYaw: number; viewPitch: number } | undefined;
  let frame = 0;
  let active = true;
  let receivedSample = false;
  let target: { yaw: number; pitch: number } | undefined;

  const render = () => {
    frame = 0;
    if (!active || !target) return;
    viewer.lookAt(target.pitch, target.yaw, undefined, 0);
  };
  const calibrate = () => { baseline = undefined; };
  const orient = (event: DeviceOrientationEvent) => {
    if (!active || event.alpha === null || event.beta === null || event.gamma === null
      || ![event.alpha, event.beta, event.gamma].every(Number.isFinite)) return;
    const screenAngle = screen.orientation?.angle ?? Number((window as Window & { orientation?: number }).orientation ?? 0);
    euler.set(event.beta * radians, event.alpha * radians, -event.gamma * radians, 'YXZ');
    rotation.setFromEuler(euler).multiply(cameraRotation);
    rotation.multiply(screenRotation.setFromAxisAngle(zAxis, -screenAngle * radians));
    direction.set(0, 0, -1).applyQuaternion(rotation);
    const yaw = Math.atan2(direction.x, -direction.z) / radians;
    const pitch = Math.asin(Math.max(-1, Math.min(1, direction.y))) / radians;
    baseline ??= { yaw, pitch, viewYaw: viewer.getYaw(), viewPitch: viewer.getPitch() };
    const difference = ((yaw - baseline.yaw + 540) % 360) - 180;
    target = { yaw: baseline.viewYaw + difference, pitch: Math.max(-85, Math.min(85, baseline.viewPitch + pitch - baseline.pitch)) };
    if (!receivedSample) { receivedSample = true; onSample(); }
    if (!frame) frame = requestAnimationFrame(render);
  };

  window.addEventListener('deviceorientation', orient);
  window.addEventListener('orientationchange', calibrate);
  screen.orientation?.addEventListener('change', calibrate);
  return () => {
    active = false;
    cancelAnimationFrame(frame);
    window.removeEventListener('deviceorientation', orient);
    window.removeEventListener('orientationchange', calibrate);
    screen.orientation?.removeEventListener('change', calibrate);
  };
}
