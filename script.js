/* ==========================================
   NAVBAR
========================================== */

const navbar = document.getElementById("navbar");

if (navbar) {
  window.addEventListener("scroll", () => {
    navbar.classList.toggle("scrolled", window.scrollY > 30);
  });
}

/* ==========================================
   MENU MOBILE
========================================== */

const hamburger = document.getElementById("navHamburger");
const mobileMenu = document.getElementById("mobileMenu");
const mobileClose = document.getElementById("mobileClose");

if (hamburger && mobileMenu) {
  hamburger.addEventListener("click", () => {
    mobileMenu.classList.add("open");
  });
}

if (mobileClose && mobileMenu) {
  mobileClose.addEventListener("click", () => {
    mobileMenu.classList.remove("open");
  });
}

document.querySelectorAll(".mobile-menu a").forEach(link => {
  link.addEventListener("click", () => {
    mobileMenu?.classList.remove("open");
  });
});

/* ==========================================
   FADE-IN
========================================== */

const fadeElements = document.querySelectorAll(".fade-in");

const fadeObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
    }
  });
}, {
  threshold: 0.2
});

fadeElements.forEach(el => fadeObserver.observe(el));

/* ==========================================
   CONTADORES
========================================== */

let statsStarted = false;

const statsObserver = new IntersectionObserver(entries => {

  if (!entries[0].isIntersecting || statsStarted) return;

  statsStarted = true;

  document.querySelectorAll(".stat-num[data-target]").forEach(el => {

    const target = Number(el.dataset.target);

    let start = null;

    function animate(time) {

      if (!start) start = time;

      const progress = Math.min((time - start) / 1800, 1);

      const value = Math.floor(
        (1 - Math.pow(1 - progress, 3)) * target
      );

      el.textContent = value;

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        el.textContent = target;
      }
    }

    requestAnimationFrame(animate);

  });

}, {
  threshold: 0.4
});

const heroStats = document.querySelector(".hero-stats");

if (heroStats) {
  statsObserver.observe(heroStats);
}
/* ==========================================
   FUNDO 3D — REDE DE SINAPSES
========================================== */

(() => {

    const canvas = document.getElementById("bg-canvas");

    if (!canvas || typeof THREE === "undefined") return;

    const renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        0.1,
        100
    );

    camera.position.z = 18;

    function resize() {

        renderer.setSize(window.innerWidth, window.innerHeight);

        camera.aspect = window.innerWidth / window.innerHeight;

        camera.updateProjectionMatrix();

    }

    resize();

    window.addEventListener("resize", resize);

    const COUNT = 110;

    const positions = new Float32Array(COUNT * 3);

    const velocities = [];

    for (let i = 0; i < COUNT; i++) {

        positions[i * 3] = (Math.random() - 0.5) * 36;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 22;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 20;

        velocities.push({
            x: (Math.random() - 0.5) * 0.006,
            y: (Math.random() - 0.5) * 0.006,
            z: (Math.random() - 0.5) * 0.006
        });

    }

    const geometry = new THREE.BufferGeometry();

    geometry.setAttribute(
        "position",
        new THREE.BufferAttribute(positions, 3)
    );

    const material = new THREE.PointsMaterial({
        color: 0x4fd8ff,
        size: 0.16,
        transparent: true,
        opacity: 0.85
    });

    const points = new THREE.Points(geometry, material);

    scene.add(points);

    const lineGeometry = new THREE.BufferGeometry();

    const lineMaterial = new THREE.LineBasicMaterial({
        color: 0x8b6bff,
        transparent: true,
        opacity: 0.18
    });

    const lines = new THREE.LineSegments(
        lineGeometry,
        lineMaterial
    );

    scene.add(lines);

    function updateLines() {

        const pos = geometry.attributes.position.array;

        const vertices = [];

        const maxDistance = 6.5;

        for (let a = 0; a < COUNT; a++) {

            for (let b = a + 1; b < COUNT; b++) {

                const dx = pos[a * 3] - pos[b * 3];
                const dy = pos[a * 3 + 1] - pos[b * 3 + 1];
                const dz = pos[a * 3 + 2] - pos[b * 3 + 2];

                const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

                if (distance < maxDistance) {

                    vertices.push(
                        pos[a * 3],
                        pos[a * 3 + 1],
                        pos[a * 3 + 2],

                        pos[b * 3],
                        pos[b * 3 + 1],
                        pos[b * 3 + 2]
                    );

                }

            }

        }

        lineGeometry.setAttribute(
            "position",
            new THREE.Float32BufferAttribute(vertices, 3)
        );

    }

    updateLines();

    let frame = 0;

    function animate() {

        requestAnimationFrame(animate);

        const pos = geometry.attributes.position.array;

        for (let i = 0; i < COUNT; i++) {

            pos[i * 3] += velocities[i].x;
            pos[i * 3 + 1] += velocities[i].y;
            pos[i * 3 + 2] += velocities[i].z;

            if (Math.abs(pos[i * 3]) > 18)
                velocities[i].x *= -1;

            if (Math.abs(pos[i * 3 + 1]) > 11)
                velocities[i].y *= -1;

            if (Math.abs(pos[i * 3 + 2]) > 10)
                velocities[i].z *= -1;

        }

        geometry.attributes.position.needsUpdate = true;

        frame++;

        if (frame % 4 === 0) {
            updateLines();
        }

        scene.rotation.y += 0.0006;

        renderer.render(scene, camera);

    }

    animate();

})();
/* ==========================================================
   MAPA 3D DO CÉREBRO
   Desenvolvido do zero
========================================================== */

(() => {

const canvas = document.getElementById("brain-canvas");

if (!canvas || typeof THREE === "undefined") return;

const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true
});

renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    45,
    canvas.clientWidth / canvas.clientHeight,
    0.1,
    100
);

camera.position.set(0,0,9);

function resize(){

    const width = canvas.parentElement.clientWidth;
    const height = canvas.parentElement.clientHeight;

    renderer.setSize(width,height);

    camera.aspect = width / height;

    camera.updateProjectionMatrix();

}

resize();

window.addEventListener("resize",resize);

const root = new THREE.Group();

scene.add(root);

/* =========================
      ILUMINAÇÃO
========================= */

scene.add(new THREE.AmbientLight(0xffffff,1));

const light = new THREE.DirectionalLight(0x66ddff,2);

light.position.set(4,5,6);

scene.add(light);

/* =========================
      NÚCLEO
========================= */

const brainGeometry = new THREE.IcosahedronGeometry(
    2.6,
    6
);

const brainMaterial = new THREE.MeshPhysicalMaterial({

    color:0x7fdfff,

    roughness:0.28,

    metalness:0,

    transmission:.35,

    transparent:true,

    opacity:.55,

    clearcoat:1

});

const brain = new THREE.Mesh(
    brainGeometry,
    brainMaterial
);

root.add(brain);

/* Wireframe */

const wire = new THREE.LineSegments(

    new THREE.WireframeGeometry(brainGeometry),

    new THREE.LineBasicMaterial({

        color:0x58d8ff,

        transparent:true,

        opacity:.20

    })

);

root.add(wire);
  /* ==========================================================
   REGIÕES DO CÉREBRO
========================================================== */

const regions = [

    {
        name: "Lobo Frontal",
        description: "Responsável pelo planejamento, decisões e personalidade.",
        color: 0x58d8ff,
        position: [2.2,0.8,1.2]
    },

    {
        name: "Lobo Parietal",
        description: "Integra informações sensoriais do corpo.",
        color: 0x00ffaa,
        position: [-1.4,1.6,0.5]
    },

    {
        name: "Lobo Temporal",
        description: "Processa audição, memória e linguagem.",
        color: 0xffb347,
        position: [2.0,-0.6,-1.4]
    },

    {
        name: "Lobo Occipital",
        description: "Centro do processamento visual.",
        color: 0xff6b6b,
        position: [-2.4,0,-1.5]
    },

    {
        name: "Hipocampo",
        description: "Essencial para formação das memórias.",
        color: 0xc084fc,
        position: [-0.7,-0.8,1.8]
    },

    {
        name: "Amígdala",
        description: "Relacionada às emoções.",
        color: 0xff4d8d,
        position: [0.8,-1.2,1.3]
    }

];

/* ==========================================================
   PONTOS
========================================================== */

const nodes = [];

const nodeGeometry = new THREE.SphereGeometry(
    0.12,
    24,
    24
);

regions.forEach(region=>{

    const material = new THREE.MeshStandardMaterial({

        color:region.color,

        emissive:region.color,

        emissiveIntensity:1.5

    });

    const sphere = new THREE.Mesh(
        nodeGeometry,
        material
    );

    sphere.position.set(...region.position);

    sphere.userData = region;

    root.add(sphere);

    nodes.push(sphere);

});

/* ==========================================================
   CONEXÕES
========================================================== */

const connectionMaterial =
new THREE.LineBasicMaterial({

    color:0x4fd8ff,

    transparent:true,

    opacity:.25

});

for(let i=0;i<nodes.length;i++){

    for(let j=i+1;j<nodes.length;j++){

        const geometry = new THREE.BufferGeometry().setFromPoints([

            nodes[i].position,

            nodes[j].position

        ]);

        const line = new THREE.Line(

            geometry,

            connectionMaterial

        );

        root.add(line);

    }

}

/* ==========================================================
   HALO PULSANTE
========================================================== */

nodes.forEach(node=>{

    const halo = new THREE.Mesh(

        new THREE.SphereGeometry(0.22,20,20),

        new THREE.MeshBasicMaterial({

            color:node.userData.color,

            transparent:true,

            opacity:.18

        })

    );

    halo.position.copy(node.position);

    node.userData.halo = halo;

    root.add(halo);

});
  /* ==========================================================
   INTERAÇÃO
========================================================== */

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

const infoTitle = document.getElementById("brainInfoTitle");
const infoDesc = document.getElementById("brainInfoDesc");

canvas.addEventListener("pointermove", event => {

    const rect = canvas.getBoundingClientRect();

    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

});

canvas.addEventListener("click", () => {

    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(nodes);

    if (!intersects.length) return;

    const selected = intersects[0].object;

    nodes.forEach(node => {

        node.material.emissiveIntensity = 1.5;

        gsap.to(node.scale,{
            x:1,
            y:1,
            z:1,
            duration:.3
        });

    });

    selected.material.emissiveIntensity = 4;

    gsap.to(selected.scale,{
        x:1.6,
        y:1.6,
        z:1.6,
        duration:.4,
        ease:"back.out(2)"
    });

    if(infoTitle) infoTitle.textContent = selected.userData.name;

    if(infoDesc) infoDesc.textContent = selected.userData.description;

});

/* ==========================================================
   ROTAÇÃO COM O MOUSE
========================================================== */

let targetX = 0;
let targetY = 0;

let rotationX = 0;
let rotationY = 0;

let dragging = false;

canvas.addEventListener("pointerdown",()=>{

    dragging = true;

});

window.addEventListener("pointerup",()=>{

    dragging = false;

});

window.addEventListener("pointermove",event=>{

    if(!dragging) return;

    targetY += event.movementX * 0.006;

    targetX += event.movementY * 0.006;

    targetX = Math.max(-0.8,Math.min(0.8,targetX));

});

/* ==========================================================
   ANIMAÇÃO
========================================================== */

const clock = new THREE.Clock();

function animate(){

    requestAnimationFrame(animate);

    const time = clock.getElapsedTime();

    rotationX += (targetX - rotationX) * .08;
    rotationY += (targetY - rotationY) * .08;

    root.rotation.x = rotationX;
    root.rotation.y = rotationY + time * .15;

    nodes.forEach(node=>{

        const halo = node.userData.halo;

        const pulse = 1 + Math.sin(time * 3) * .15;

        halo.scale.setScalar(pulse);

    });

    wire.rotation.y -= .002;

    renderer.render(scene,camera);

}

animate();

})();
/* ==========================================================
   ESTRELAS AO REDOR DO CÉREBRO
========================================================== */

const starGeometry = new THREE.BufferGeometry();

const starCount = 1200;

const starVertices = [];

for(let i = 0; i < starCount; i++){

    starVertices.push(

        (Math.random() - 0.5) * 120,
        (Math.random() - 0.5) * 120,
        (Math.random() - 0.5) * 120

    );

}

starGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(starVertices,3)
);

const stars = new THREE.Points(

    starGeometry,

    new THREE.PointsMaterial({

        color:0xffffff,
        size:0.15,
        transparent:true,
        opacity:.8

    })

);

scene.add(stars);

/* ==========================================================
   PARTÍCULAS EM VOLTA DO CÉREBRO
========================================================== */

const particleGroup = new THREE.Group();

scene.add(particleGroup);

const particleGeo = new THREE.SphereGeometry(.03,8,8);

for(let i=0;i<220;i++){

    const particle = new THREE.Mesh(

        particleGeo,

        new THREE.MeshBasicMaterial({

            color:0x58d8ff

        })

    );

    particle.userData = {

        radius:2.8 + Math.random()*1.4,

        angle:Math.random()*Math.PI*2,

        speed:.2 + Math.random()*.4,

        offset:(Math.random()-0.5)

    };

    particleGroup.add(particle);

}

/* ==========================================================
   ANIMAÇÃO DAS PARTÍCULAS
========================================================== */

function animateParticles(time){

    particleGroup.children.forEach(p=>{

        p.userData.angle += 0.002 * p.userData.speed;

        p.position.x =
            Math.cos(p.userData.angle)
            * p.userData.radius;

        p.position.z =
            Math.sin(p.userData.angle)
            * p.userData.radius;

        p.position.y =
            Math.sin(time+p.userData.offset)
            * .8;

    });

}

/* ==========================================================
   EFEITO DE RESPIRAÇÃO
========================================================== */

function animateBrain(time){

    const scale = 1 + Math.sin(time*2)*0.015;

    brain.scale.set(scale,scale,scale);

  }
