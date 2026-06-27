import { useEffect, useState, useRef } from 'react';
import * as THREE from 'three';

function App() {
  const [typedText, setTypedText] = useState('');
  const [copyStatus, setCopyStatus] = useState('📋');
  const canvasRef = useRef(null);

  // Typewriter effect
  useEffect(() => {
    const lines = [
      'Mérnökinformatikus BSc hallgató',
      'Python · C · C++ programozás',
      'Mikrovezérlők & IoT',
      '3D nyomtatás & modellezés',
      'Webfejlesztés iránti érdeklődés',
    ];
    let lineIdx = 0;
    let charIdx = 0;
    let deleting = false;
    let timeoutId;

    function type() {
      const current = lines[lineIdx];
      if (!deleting) {
        setTypedText(current.slice(0, charIdx + 1));
        charIdx++;
        if (charIdx === current.length) {
          deleting = true;
          timeoutId = setTimeout(type, 2200);
          return;
        }
      } else {
        setTypedText(current.slice(0, charIdx - 1));
        charIdx--;
        if (charIdx === 0) {
          deleting = false;
          lineIdx = (lineIdx + 1) % lines.length;
        }
      }
      timeoutId = setTimeout(type, deleting ? 40 : 70);
    }
    type();
    return () => clearTimeout(timeoutId);
  }, []);

  // Scroll reveal
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('opacity-100', 'translate-y-0');
            e.target.classList.remove('opacity-0', 'translate-y-[18px]');
          }
        });
      },
      { threshold: 0.05 }
    );

    document.querySelectorAll('.reveal-item').forEach((el) => {
      obs.observe(el);
    });

    return () => obs.disconnect();
  }, []);

  // Three.js interactive 3D particle sphere
  useEffect(() => {
    if (!canvasRef.current) return;
    const container = canvasRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 10;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Create a particle sphere
    const count = 1500;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    // Colors matching the Scandinavian palette: terracotta accent (#B07D62) and charcoal (#1C1917)
    const colorAccent = new THREE.Color('#B07D62');
    const colorText = new THREE.Color('#1C1917');
    const colorMuted = new THREE.Color('#6E6A66');

    for (let i = 0; i < count; i++) {
      const phi = Math.acos(-1 + (2 * i) / count);
      const theta = Math.sqrt(count * Math.PI) * phi;
      const r = 2.8 + Math.random() * 0.4; // Radius with slight organic thickness

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      // Randomly color with Scandi colors
      const rand = Math.random();
      let col;
      if (rand < 0.4) {
        col = colorAccent;
      } else if (rand < 0.8) {
        col = colorText;
      } else {
        col = colorMuted;
      }

      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Custom Canvas point drawing (soft circle point texture)
    const pCanvas = document.createElement('canvas');
    pCanvas.width = 16;
    pCanvas.height = 16;
    const pCtx = pCanvas.getContext('2d');
    const grad = pCtx.createRadialGradient(8, 8, 0, 8, 8, 8);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    pCtx.fillStyle = grad;
    pCtx.fillRect(0, 0, 16, 16);
    const pTexture = new THREE.CanvasTexture(pCanvas);

    const material = new THREE.PointsMaterial({
      size: 0.12,
      vertexColors: true,
      map: pTexture,
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
    });

    const particleSphere = new THREE.Points(geometry, material);
    scene.add(particleSphere);

    // Mouse interactivity
    let mouseX = 0, mouseY = 0;
    let targetX = 0, targetY = 0;

    const handleMouseMove = (e) => {
      mouseX = e.clientX / window.innerWidth - 0.5;
      mouseY = e.clientY / window.innerHeight - 0.5;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Animation Loop
    const clock = new THREE.Clock();
    let animationFrameId;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      // Gentle continuous rotation
      particleSphere.rotation.y = elapsedTime * 0.05;
      particleSphere.rotation.x = elapsedTime * 0.02;

      // Mouse interactive tilt inertia
      targetX += (mouseX - targetX) * 0.05;
      targetY += (mouseY - targetY) * 0.05;

      particleSphere.rotation.y += targetX * 0.8;
      particleSphere.rotation.x += targetY * 0.8;

      renderer.render(scene, camera);
    };

    animate();

    // Resize listener
    const handleResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  const copyEmail = () => {
    navigator.clipboard.writeText('leventefarkas111@gmail.com').then(() => {
      setCopyStatus('✔');
      setTimeout(() => {
        setCopyStatus('📋');
      }, 2000);
    });
  };

  return (
    <>
      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-end px-4 md:px-6 xl:px-[calc(50%-580px)] h-14 bg-bg/80 backdrop-blur-md border-b border-border">
        <ul className="flex gap-4 md:gap-7 list-none">
          <li>
            <a href="#skills" className="text-[13px] text-muted no-underline font-mono tracking-wide transition-colors duration-200 hover:text-text">
              Készségek
            </a>
          </li>
          <li>
            <a href="#education" className="text-[13px] text-muted no-underline font-mono tracking-wide transition-colors duration-200 hover:text-text">
              Tanulmányok
            </a>
          </li>
          <li>
            <a href="#projects" className="text-[13px] text-muted no-underline font-mono tracking-wide transition-colors duration-200 hover:text-text">
              Projektek
            </a>
          </li>
          <li>
            <a href="#contact" className="text-[13px] text-muted no-underline font-mono tracking-wide transition-colors duration-200 hover:text-text">
              Kapcsolat
            </a>
          </li>
        </ul>
      </nav>

      {/* HERO */}
      <div id="hero" className="pt-[100px] lg:pt-[140px] pb-[100px] px-4 md:px-6 max-w-[1160px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <p className="font-mono text-[12px] text-accent tracking-[0.15em] uppercase mb-5 flex items-center gap-2 before:content-[''] before:inline-block before:w-6 before:h-[1px] before:bg-accent">
            Elérhető szakmai gyakorlatra
          </p>
          <h1 className="font-mono text-[clamp(36px,7vw,64px)] font-bold leading-[1.05] tracking-[-0.02em] mb-3 text-text">
            Farkas Levente
          </h1>
          <p className="font-mono text-[clamp(16px,2.5vw,22px)] text-muted font-light mb-8 min-h-[1.5em]" id="typed-sub">
            <span>{typedText}</span>
            <span className="cursor inline-block w-[2px] h-[1em] bg-accent ml-[2px] align-middle animate-blink"></span>
          </p>
          <p className="max-w-[560px] text-muted text-[15px] mb-10 leading-[1.8]">
            Mérnökinformatikus BSc hallgató vagyok a Széchenyi István Egyetemen. Nyitott vagyok szinte bármilyen szoftveres vagy hardveres fejlesztési projektre. Az egyetemi tanulmányaim mellett szabadidőmben sokat foglalkozom mikrovezérlőkkel, 3D nyomtatással és modern webes megoldásokkal.
          </p>
          <div className="flex gap-3.5 flex-wrap">
            <a
              className="inline-flex items-center gap-2 py-2.5 px-[22px] rounded-md font-mono text-[13px] font-semibold no-underline cursor-pointer border border-transparent transition-all duration-200 bg-text text-bg border-text hover:bg-muted hover:-translate-y-[1px]"
              href="#contact"
            >
              Kapcsolatfelvétel →
            </a>
            <a
              className="inline-flex items-center gap-2 py-2.5 px-[22px] rounded-md font-mono text-[13px] font-semibold no-underline cursor-pointer border border-border rounded-md transition-all duration-200 bg-transparent text-text hover:border-accent hover:bg-bg-card"
              href="https://github.com/FkLeviDev"
              target="_blank"
              rel="noreferrer"
            >
              GitHub ↗
            </a>
          </div>
        </div>
        <div ref={canvasRef} id="canvas-container" className="w-full h-[320px] md:h-[450px] relative order-first lg:order-last"></div>
      </div>

      <hr className="border-none border-t border-border mx-4 md:mx-6" />

      {/* SKILLS */}
      <section id="skills" className="py-20 px-4 md:px-6 max-w-[1160px] mx-auto">
        <p className="font-mono text-[11px] tracking-[0.14em] uppercase text-accent mb-2.5">// 01 · Készségek</p>
        <h2 class="font-mono text-[clamp(22px,3vw,32px)] font-bold mb-12 text-text">Technológiák &amp; amik érdekelnek</h2>
        <div className="flex flex-col border-t border-border">
          <div className="reveal-item opacity-0 translate-y-[18px] transition-all duration-[450ms] ease-out flex flex-col md:flex-row gap-4 md:gap-12 border-b border-border py-8">
            <div className="md:w-1/3 flex items-center gap-3">
              <span className="text-2xl">🐍</span>
              <h3 className="font-mono text-[15px] font-bold text-text">Programozás</h3>
            </div>
            <div className="md:w-2/3">
              <p className="text-[14px] text-muted mb-4">
                Főként Pythonban, C-ben és C++-ban szoktam kódot írni. Megismerkedtem az objektumorientált (OOP) tervezéssel és a NumPy alapú numerikus számításokkal is.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="font-mono text-[11px] font-medium py-[3px] px-2.5 rounded-[4px] bg-bg border border-border text-muted">Python</span>
                <span className="font-mono text-[11px] font-medium py-[3px] px-2.5 rounded-[4px] bg-bg border border-border text-muted">NumPy</span>
                <span className="font-mono text-[11px] font-medium py-[3px] px-2.5 rounded-[4px] bg-bg border border-border text-muted">C</span>
                <span className="font-mono text-[11px] font-medium py-[3px] px-2.5 rounded-[4px] bg-bg border border-border text-muted">C++</span>
                <span className="font-mono text-[11px] font-medium py-[3px] px-2.5 rounded-[4px] bg-bg border border-border text-muted">OOP</span>
              </div>
            </div>
          </div>

          <div className="reveal-item opacity-0 translate-y-[18px] transition-all duration-[450ms] ease-out flex flex-col md:flex-row gap-4 md:gap-12 border-b border-border py-8">
            <div className="md:w-1/3 flex items-center gap-3">
              <span className="text-2xl">🌐</span>
              <h3 className="font-mono text-[15px] font-bold text-text">Webfejlesztés</h3>
            </div>
            <div className="md:w-2/3">
              <p className="text-[14px] text-muted mb-4">
                Nagyon érdekel a modern frontend világ. Szívesen tanulom a JavaScriptet, TypeScriptet, és különösen izgat a 3D-s webes megjelenítés (például a Three.js használata).
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="font-mono text-[11px] font-medium py-[3px] px-2.5 rounded-[4px] bg-bg border border-border text-muted">JavaScript</span>
                <span className="font-mono text-[11px] font-medium py-[3px] px-2.5 rounded-[4px] bg-bg border border-border text-muted">TypeScript</span>
                <span className="font-mono text-[11px] font-medium py-[3px] px-2.5 rounded-[4px] bg-bg border border-border text-muted">Three.js</span>
                <span className="font-mono text-[11px] font-medium py-[3px] px-2.5 rounded-[4px] bg-bg border border-border text-muted">3D vizualizáció</span>
              </div>
            </div>
          </div>

          <div className="reveal-item opacity-0 translate-y-[18px] transition-all duration-[450ms] ease-out flex flex-col md:flex-row gap-4 md:gap-12 border-b border-border py-8">
            <div className="md:w-1/3 flex items-center gap-3">
              <span className="text-2xl">⚡</span>
              <h3 className="font-mono text-[15px] font-bold text-text">Hardver &amp; IoT</h3>
            </div>
            <div className="md:w-2/3">
              <p className="text-[14px] text-muted mb-4">
                Szívesen foglalkozom mikrovezérlőkkel (Arduino, ESP32) és egyedi hardveres/szoftveres rendszerek építésével. Emellett otthonosan mozgok a 3D nyomtatás és a 3D modellezés területén is.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="font-mono text-[11px] font-medium py-[3px] px-2.5 rounded-[4px] bg-bg border border-border text-muted">Mikrovezérlők</span>
                <span className="font-mono text-[11px] font-medium py-[3px] px-2.5 rounded-[4px] bg-bg border border-border text-muted">Arduino</span>
                <span className="font-mono text-[11px] font-medium py-[3px] px-2.5 rounded-[4px] bg-bg border border-border text-muted">ESP32</span>
                <span className="font-mono text-[11px] font-medium py-[3px] px-2.5 rounded-[4px] bg-bg border border-border text-muted">3D nyomtatás</span>
                <span className="font-mono text-[11px] font-medium py-[3px] px-2.5 rounded-[4px] bg-bg border border-border text-muted">3D modellezés</span>
                <span class="font-mono text-[11px] font-medium py-[3px] px-2.5 rounded-[4px] bg-bg border border-border text-muted">Pneumatika</span>
              </div>
            </div>
          </div>

          <div className="reveal-item opacity-0 translate-y-[18px] transition-all duration-[450ms] ease-out flex flex-col md:flex-row gap-4 md:gap-12 border-b border-border py-8">
            <div className="md:w-1/3 flex items-center gap-3">
              <span className="text-2xl">🛠️</span>
              <h3 className="font-mono text-[15px] font-bold text-text">Eszközök</h3>
            </div>
            <div className="md:w-2/3">
              <p className="text-[14px] text-muted mb-4">
                A verziókezeléshez Gitet és GitHubot használok. Napi szinten Linuxot (Mint disztribúciót) futtatok fejlesztői környezetként, a kódot pedig általában VS Code-ban írom.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="font-mono text-[11px] font-medium py-[3px] px-2.5 rounded-[4px] bg-bg border border-border text-muted">Git</span>
                <span className="font-mono text-[11px] font-medium py-[3px] px-2.5 rounded-[4px] bg-bg border border-border text-muted">GitHub</span>
                <span className="font-mono text-[11px] font-medium py-[3px] px-2.5 rounded-[4px] bg-bg border border-border text-muted">Linux (Mint)</span>
                <span className="font-mono text-[11px] font-medium py-[3px] px-2.5 rounded-[4px] bg-bg border border-border text-muted">VS Code</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <hr className="border-none border-t border-border mx-4 md:mx-6" />

      {/* EDUCATION / TIMELINE */}
      <section id="education" className="py-20 px-4 md:px-6 max-w-[1160px] mx-auto">
        <p class="font-mono text-[11px] tracking-[0.14em] uppercase text-accent mb-2.5">// 02 · Tanulmányok</p>
        <h2 className="font-mono text-[clamp(22px,3vw,32px)] font-bold mb-12 text-text">Képzés &amp; háttér</h2>
        <div className="timeline flex flex-col gap-0">
          <div className="reveal-item opacity-0 translate-y-[18px] transition-all duration-[450ms] ease-out tl-item grid grid-cols-[1px_1fr] gap-x-7 relative pb-8">
            <div className="tl-line flex flex-col items-center">
              <div className="tl-dot w-2.5 h-2.5 rounded-full bg-accent border-2 border-bg ring-2 ring-accent/30 mt-1.5 shrink-0 z-[1] relative -left-1"></div>
              <div className="tl-connector w-[1px] flex-1 bg-border mt-1 mb-0"></div>
            </div>
            <div className="pl-2">
              <p className="tl-date font-mono text-[11px] text-muted tracking-wider mb-1">2024. szeptember – jelenleg (5. félév: 2026. szept.)</p>
              <h3 className="text-[16px] font-bold text-text">Mérnökinformatikus BSc</h3>
              <p className="text-[13px] text-accent font-medium mb-2 font-mono">Széchenyi István Egyetem, Győr</p>
              <p className="text-[14px] text-muted leading-[1.7] max-w-2xl">
                Itt sajátítom el a programozás elméleti és gyakorlati alapjait (Python, C/C++), valamint a villamosmérnöki és informatikai alapozó tárgyakat.
              </p>
            </div>
          </div>

          <div className="reveal-item opacity-0 translate-y-[18px] transition-all duration-[450ms] ease-out tl-item grid grid-cols-[1px_1fr] gap-x-7 relative">
            <div className="tl-line flex flex-col items-center">
              <div className="tl-dot w-2.5 h-2.5 rounded-full bg-dim border-2 border-bg ring-2 ring-dim/20 mt-1.5 shrink-0 z-[1] relative -left-1"></div>
            </div>
            <div className="pl-2">
              <p className="tl-date font-mono text-[11px] text-muted tracking-wider mb-1">2023. szeptember – 2024. június</p>
              <h3 className="text-[16px] font-bold text-text">Elektronikai Technikus</h3>
              <p className="text-[13px] text-accent font-medium mb-2 font-mono">Szakmai képzés</p>
              <p className="text-[14px] text-muted leading-[1.7] max-w-2xl">
                Megtanultam az elektronikai rendszerek tervezésének, építésének és karbantartásának alapjait.
              </p>
            </div>
          </div>
        </div>
      </section>

      <hr className="border-none border-t border-border mx-4 md:mx-6" />

      {/* PROJECTS */}
      <section id="projects" className="py-20 px-4 md:px-6 max-w-[1160px] mx-auto">
        <p className="font-mono text-[11px] tracking-[0.14em] uppercase text-accent mb-2.5">// 03 · Projektek</p>
        <h2 className="font-mono text-[clamp(22px,3vw,32px)] font-bold mb-12 text-text">Egyetemi &amp; egyéb munkák</h2>
        <div className="flex flex-col border-t border-border">
          <div className="reveal-item opacity-0 translate-y-[18px] transition-all duration-[450ms] ease-out flex flex-col md:flex-row gap-4 md:gap-12 border-b border-border py-8 hover:bg-bg-hover/20 transition-all duration-200 px-2 -mx-2 rounded-md">
            <div className="md:w-1/3">
              <h3 className="font-mono text-[15px] font-bold text-text mb-1">Fizikai számítások</h3>
              <p className="proj-lang font-mono text-[11px] text-muted tracking-widest flex items-center gap-1.5">
                <span className="lang-dot w-2 h-2 rounded-full" style={{ backgroundColor: '#4F83A3' }}></span>
                Python · NumPy
              </p>
            </div>
            <div className="md:w-2/3">
              <p className="text-[14px] text-muted leading-[1.7]">
                Python és NumPy segítségével készítettem kisebb fizikai szimulációkat és numerikus számítási programokat egyetemi feladatokhoz.
              </p>
            </div>
          </div>

          <div className="reveal-item opacity-0 translate-y-[18px] transition-all duration-[450ms] ease-out flex flex-col md:flex-row gap-4 md:gap-12 border-b border-border py-8 hover:bg-bg-hover/20 transition-all duration-200 px-2 -mx-2 rounded-md">
            <div className="md:w-1/3">
              <h3 className="font-mono text-[15px] font-bold text-text mb-1">Algoritmikai feladatok</h3>
              <p className="proj-lang font-mono text-[11px] text-muted tracking-widest flex items-center gap-1.5">
                <span className="lang-dot w-2 h-2 rounded-full" style={{ backgroundColor: '#D86F8F' }}></span>
                C / C++
              </p>
            </div>
            <div className="md:w-2/3">
              <p className="text-[14px] text-muted leading-[1.7]">
                Különböző egyetemi és saját algoritmikus feladatokat oldottam meg C és C++ nyelveken, alapvető adatstruktúrák és OOP minták használatával.
              </p>
            </div>
          </div>

          <div className="reveal-item opacity-0 translate-y-[18px] transition-all duration-[450ms] ease-out flex flex-col md:flex-row gap-4 md:gap-12 border-b border-border py-8 hover:bg-bg-hover/20 transition-all duration-200 px-2 -mx-2 rounded-md">
            <div className="md:w-1/3">
              <h3 className="font-mono text-[15px] font-bold text-text mb-1">Hardveres hobbik</h3>
              <p className="proj-lang font-mono text-[11px] text-muted tracking-widest flex items-center gap-1.5">
                <span className="lang-dot w-2 h-2 rounded-full bg-accent"></span>
                Hardver &amp; 3D nyomtatás
              </p>
            </div>
            <div className="md:w-2/3">
              <p className="text-[14px] text-muted leading-[1.7]">
                Szabadidőmben szívesen javítok elektronikai eszközökket, építek egyedi áramköröket mikrovezérlőkkel (pl. Arduino), és tervezek, illetve nyomtatok 3D alkatrészeket.
              </p>
            </div>
          </div>
        </div>
      </section>

      <hr className="border-none border-t border-border mx-4 md:mx-6" />

      {/* CERTS */}
      <section id="certs" className="py-20 px-4 md:px-6 max-w-[1160px] mx-auto">
        <p className="font-mono text-[11px] tracking-[0.14em] uppercase text-accent mb-2.5">// 04 · Tanúsítványok</p>
        <h2 className="font-mono text-[clamp(22px,3vw,32px)] font-bold mb-10 text-text">Igazolt ismeretek</h2>
        <div className="flex flex-col border-t border-border">
          <div className="reveal-item opacity-0 translate-y-[18px] transition-all duration-[450ms] ease-out flex items-center gap-6 py-6 border-b border-border">
            <div className="cert-icon text-[32px] shrink-0">🏅</div>
            <div>
              <h3 className="font-mono text-[14px] font-bold text-text">Pneumatikai Ismeretek Tanúsítvány</h3>
              <p className="text-xs text-accent mt-0.5 font-medium">
                Festo · <span className="text-muted font-normal">Képzés keretében megszerzett igazolás pneumatikai rendszerek tervezéséből (2024. június)</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      <hr className="border-none border-t border-border mx-4 md:mx-6" />

      {/* CONTACT */}
      <section id="contact" class="py-20 px-4 md:px-6 max-w-[1160px] mx-auto text-center pb-[120px]">
        <p className="font-mono text-[11px] tracking-[0.14em] uppercase text-accent mb-2.5">// 05 · Kapcsolat</p>
        <h2 className="font-mono text-[clamp(22px,3vw,32px)] font-bold mb-10 text-text">Írj nekem</h2>
        <p className="contact-desc text-muted max-w-[460px] mx-auto mb-8">
          Nyitott vagyok szakmai gyakorlatra és bármilyen szoftveres vagy hardveres fejlesztési projektre. Ha van egy jó ötleted vagy lehetőséged, keress bátran!
        </p>
        <div className="flex items-center justify-center gap-3 max-w-md mx-auto">
          <a
            className="inline-flex items-center gap-2 py-2.5 px-6 rounded-md font-mono text-[13px] font-semibold no-underline cursor-pointer border border-transparent transition-all duration-200 bg-text text-bg border-text hover:bg-muted hover:-translate-y-[1px]"
            href="mailto:leventefarkas111@gmail.com"
          >
            📧 &nbsp;leventefarkas111@gmail.com
          </a>
          <button
            onClick={copyEmail}
            id="copy-btn"
            className="inline-flex items-center justify-center p-2.5 rounded-md font-mono text-[13px] font-semibold border border-border bg-bg-card text-muted hover:text-text hover:border-accent/40 transition-all duration-200"
            title="Email másolása"
          >
            {copyStatus}
          </button>
        </div>
        <div className="contact-links flex flex-wrap gap-3 justify-center mt-6">
          <a
            className="contact-link flex items-center gap-2 font-mono text-xs text-muted no-underline py-2 px-4 border border-border rounded-md transition-all duration-200 hover:text-text hover:border-accent/40 bg-bg-card"
            href="https://github.com/FkLeviDev"
            target="_blank"
            rel="noreferrer"
          >
            ⌥ github.com/FkLeviDev
          </a>
        </div>
      </section>

      <footer className="border-t border-border text-center p-6 font-mono text-[11px] text-dim bg-bg-card/50">
        <p>Farkas Levente · Mérnökinformatikus BSc hallgató · Széchenyi István Egyetem · 2026</p>
      </footer>
    </>
  );
}

export default App;
