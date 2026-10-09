import { useEffect, useRef } from 'react';

export function ImplantScene({ paused }: { paused: boolean }) {
  const mount = useRef<HTMLDivElement>(null);
  const pause = useRef(paused);
  useEffect(() => { pause.current = paused; }, [paused]);
  useEffect(() => {
    let disposed = false;
    let cleanup = () => {};
    Promise.all([import('three'), import('three/examples/jsm/environments/RoomEnvironment.js')]).then(([T, { RoomEnvironment }]) => {
      if (disposed || !mount.current) return;
      const host = mount.current;
      let renderer: InstanceType<typeof T.WebGLRenderer>;
      try { renderer = new T.WebGLRenderer({ alpha: true, antialias: true }); } catch { return; }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor(0x000000, 0);
      renderer.toneMapping = T.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.25;
      host.appendChild(renderer.domElement);
      const scene = new T.Scene();
      const environment = new RoomEnvironment();
      const pmrem = new T.PMREMGenerator(renderer);
      const env = pmrem.fromScene(environment, .04);
      scene.environment = env.texture;
      const camera = new T.PerspectiveCamera(34, 1, .1, 100);
      camera.position.set(0, .7, 8.8);
      camera.lookAt(0, .1, 0);
      scene.add(new T.HemisphereLight(0xffffff, 0x637e9c, 2));
      const light = new T.DirectionalLight(0xffffff, 5); light.position.set(-3, 5, 6); scene.add(light);
      const rim = new T.DirectionalLight(0xb8dfff, 4); rim.position.set(4, 2, -4); scene.add(rim);
      const metal = new T.MeshStandardMaterial({ color: 0xa9b3bd, metalness: 1, roughness: .24 });
      const ceramic = new T.MeshPhysicalMaterial({ color: 0xfffdf6, metalness: 0, roughness: .18, clearcoat: 1, clearcoatRoughness: .13, transmission: .08, thickness: .45, ior: 1.48 });
      const model = new T.Group(); scene.add(model);
      const implant = new T.Group(); model.add(implant); implant.position.y = -1.25;
      const core = new T.Mesh(new T.CylinderGeometry(.25, .15, 1.45, 64), metal); implant.add(core);
      const collar = new T.Mesh(new T.CylinderGeometry(.32, .3, .17, 64), metal); collar.position.y = .77; implant.add(collar);
      // Continuous helical titanium thread, rather than stacked image slices.
      const points = [];
      for (let i = 0; i <= 900; i++) { const t = i / 900; const angle = t * Math.PI * 2 * 11; const r = .18 + .12 * t; points.push(new T.Vector3(Math.cos(angle) * r, -.7 + t * 1.38, Math.sin(angle) * r)); }
      implant.add(new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points), 900, .04, 8, false), metal));
      const abutment = new T.Group(); model.add(abutment);
      abutment.add(new T.Mesh(new T.CylinderGeometry(.17, .28, .55, 64), metal));
      const lip = new T.Mesh(new T.CylinderGeometry(.32, .3, .08, 64), metal); lip.position.y = -.2; abutment.add(lip);
      const crown = new T.Group(); model.add(crown);
      // Organic molar mesh: four cusps and a shallow occlusal fissure.
      const positions: number[] = [], indices: number[] = [];
      const rings = 42, segments = 96;
      for (let j = 0; j <= rings; j++) {
        const v = j / rings;
        for (let i = 0; i <= segments; i++) {
          const a = i / segments * Math.PI * 2;
          const radius = v < .74 ? .36 + .17 * Math.sin(v / .74 * Math.PI * .65) : .51 * Math.cos((v - .74) / .26 * Math.PI / 2);
          const lobes = 1 + .075 * Math.cos(a * 4 + .3) + .025 * Math.sin(a * 3);
          const top = v > .7 ? .12 * Math.cos(a * 4 + .3) * Math.sin((v - .7) / .3 * Math.PI) : 0;
          positions.push(Math.cos(a) * radius * lobes, -.5 + v * 1.08 + top, Math.sin(a) * radius * lobes * .9);
          if (j < rings && i < segments) { const k = j * (segments + 1) + i; indices.push(k, k + segments + 1, k + 1, k + 1, k + segments + 1, k + segments + 2); }
        }
      }
      const geometry = new T.BufferGeometry(); geometry.setAttribute('position', new T.Float32BufferAttribute(positions, 3)); geometry.setIndex(indices); geometry.computeVertexNormals();
      crown.add(new T.Mesh(geometry, ceramic));
      const underside = new T.Mesh(new T.CircleGeometry(.36, 64), ceramic); underside.rotation.x = Math.PI / 2; underside.position.y = -.5; crown.add(underside);
      const resize = () => { const w = host.clientWidth, h = host.clientHeight; renderer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix(); model.position.x = w / h > 1.1 ? 2 : .2; };
      const observer = new ResizeObserver(resize); observer.observe(host); resize();
      const clock = new T.Clock(); let elapsed = 0; let frame = 0;
      const ease = (x: number) => { const t = Math.max(0, Math.min(1, x)); return t * t * (3 - 2 * t); };
      const animate = () => {
        frame = requestAnimationFrame(animate);
        const dt = Math.min(clock.getDelta(), .05); if (!pause.current) elapsed += dt;
        const phase = elapsed % 14;
        const assembly = phase < 9 ? ease((phase - 1.2) / 3.1) : 1 - ease((phase - 11.5) / 2.5);
        abutment.position.y = .18 - assembly * .37;
        crown.position.y = 1.47 - assembly * 1.0;
        crown.rotation.y = -.15 + Math.sin(elapsed * .35) * .12;
        model.rotation.y = -.18 + Math.sin(elapsed * .3) * .15;
        model.rotation.z = -.09;
        model.position.y = Math.sin(elapsed * .45) * .045;
        host.style.opacity = String(phase < 7 ? 1 : phase < 8.5 ? 1 - ease((phase - 7) / 1.5) : phase < 11.5 ? 0 : ease((phase - 11.5) / 1.5));
        host.parentElement?.style.setProperty('--smile-opacity', String(phase < 7 ? 0 : phase < 8.5 ? ease((phase - 7) / 1.5) : phase < 11.5 ? 1 : 1 - ease((phase - 11.5) / 1.5)));
        renderer.render(scene, camera);
      };
      animate();
      cleanup = () => { cancelAnimationFrame(frame); observer.disconnect(); scene.traverse(object => { if (object instanceof T.Mesh) object.geometry.dispose(); }); metal.dispose(); ceramic.dispose(); env.dispose(); environment.dispose(); pmrem.dispose(); renderer.dispose(); renderer.domElement.remove(); };
    });
    return () => { disposed = true; cleanup(); };
  }, []);
  return <div className="implant-webgl" ref={mount} aria-hidden="true" />;
}
