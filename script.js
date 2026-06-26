// Typewriter for hero subtitle
const lines = [
  'Mérnökinformatikus BSc hallgató',
  'Python · C · C++ programozás',
  'Mikrovezérlők & IoT',
  '3D nyomtatás & modellezés',
  'Webfejlesztés iránti érdeklődés',
];
let lineIdx = 0, charIdx = 0, deleting = false;
const el = document.getElementById('typed-text');

function type() {
  const current = lines[lineIdx];
  if (!deleting) {
    el.textContent = current.slice(0, ++charIdx);
    if (charIdx === current.length) {
      deleting = true;
      setTimeout(type, 2200);
      return;
    }
  } else {
    el.textContent = current.slice(0, --charIdx);
    if (charIdx === 0) {
      deleting = false;
      lineIdx = (lineIdx + 1) % lines.length;
    }
  }
  setTimeout(type, deleting ? 40 : 70);
}
type();

const obs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.opacity = '1';
      e.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.05 });

document.querySelectorAll('.reveal-item').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(18px)';
  el.style.transition = 'opacity .45s ease, transform .45s ease';
  obs.observe(el);
});

// Copy Email to Clipboard
function copyEmail() {
  navigator.clipboard.writeText('leventefarkas111@gmail.com').then(() => {
    const btn = document.getElementById('copy-btn');
    if (btn) {
      const oldText = btn.innerHTML;
      btn.innerHTML = '✔';
      setTimeout(() => {
        btn.innerHTML = oldText;
      }, 2000);
    }
  });
}

// Three.js Interactive Particle Sphere (Scandinavian Style)
let scene, camera, renderer, particleSphere;
const container = document.getElementById('canvas-container');

if (container) {
  const initThree = () => {
    const width = container.clientWidth;
    const height = container.clientHeight;

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 10;

    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Create a particle sphere
    const count = 1500;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);


    const colorAccent = new THREE.Color('#B07D62');
    const colorText = new THREE.Color('#1C1917');
    const colorMuted = new THREE.Color('#6E6A66');

    for (let i = 0; i < count; i++) {
      const phi = Math.acos(-1 + (2 * i) / count);
      const theta = Math.sqrt(count * Math.PI) * phi;
      const r = 2.8 + Math.random() * 0.4;

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
      blending: THREE.NormalBlending
    });

    particleSphere = new THREE.Points(geometry, material);
    scene.add(particleSphere);

    let mouseX = 0, mouseY = 0;
    let targetX = 0, targetY = 0;

    window.addEventListener('mousemove', (e) => {
      mouseX = (e.clientX / window.innerWidth) - 0.5;
      mouseY = (e.clientY / window.innerHeight) - 0.5;
    });

    const clock = new THREE.Clock();

    const animate = () => {
      requestAnimationFrame(animate);

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
    window.addEventListener('resize', () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
  };

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    initThree();
  } else {
    document.addEventListener('DOMContentLoaded', initThree);
  }
}
