/* ════════════════════════════════════════════
   NAVBAR
═══════════════════════════════════════════ */
var navbar = document.getElementById('navbar');
window.addEventListener('scroll', function () {
  if (window.scrollY > 30) navbar.classList.add('scrolled');
  else navbar.classList.remove('scrolled');
});

var hamburger = document.getElementById('navHamburger');
var mobileMenu = document.getElementById('mobileMenu');
var mobileClose = document.getElementById('mobileClose');
hamburger.addEventListener('click', function () { mobileMenu.classList.add('open'); });
mobileClose.addEventListener('click', function () { mobileMenu.classList.remove('open'); });
document.querySelectorAll('.mobile-menu a').forEach(function (a) {
  a.addEventListener('click', function () { mobileMenu.classList.remove('open'); });
});

/* ════════════════════════════════════════════
   FADE-IN ON SCROLL
═══════════════════════════════════════════ */
var fadeEls = document.querySelectorAll('.fade-in');
var fadeObs = new IntersectionObserver(function (entries) {
  entries.forEach(function (e) {
    if (e.isIntersecting) e.target.classList.add('visible');
  });
}, { threshold: .2 });
fadeEls.forEach(function (el) { fadeObs.observe(el); });

/* ════════════════════════════════════════════
   CONTADORES DO HERO
═══════════════════════════════════════════ */
var statsDone = false;
var statsObs = new IntersectionObserver(function (entries) {
  if (entries[0].isIntersecting && !statsDone) {
    statsDone = true;
    document.querySelectorAll('.stat-num[data-target]').forEach(function (el) {
      var target = parseInt(el.dataset.target, 10);
      var dur = 1800, start = null;
      function step(ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        var ease = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.floor(ease * target);
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = target;
      }
      requestAnimationFrame(step);
    });
  }
}, { threshold: .4 });
var heroStats = document.querySelector('.hero-stats');
if (heroStats) statsObs.observe(heroStats);


/* ════════════════════════════════════════════
   FUNDO 3D — REDE DE SINAPSES (canvas fixo)
═══════════════════════════════════════════ */
(function () {
  var canvas = document.getElementById('bg-canvas');
  var renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.z = 18;

  function resize() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);

  var COUNT = 110;
  var positions = new Float32Array(COUNT * 3);
  var velocities = [];
  for (var i = 0; i < COUNT; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 36;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 22;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
    velocities.push({
      x: (Math.random() - 0.5) * 0.006,
      y: (Math.random() - 0.5) * 0.006,
      z: (Math.random() - 0.5) * 0.006
    });
  }
  var geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  var material = new THREE.PointsMaterial({ color: 0x4fd8ff, size: 0.16, transparent: true, opacity: 0.85 });
  var points = new THREE.Points(geometry, material);
  scene.add(points);

  // linhas entre pontos próximos (sinapses)
  var lineGeometry = new THREE.BufferGeometry();
  var lineMaterial = new THREE.LineBasicMaterial({ color: 0x8b6bff, transparent: true, opacity: 0.18 });
  var lines = new THREE.LineSegments(lineGeometry, lineMaterial);
  scene.add(lines);

  function updateLines() {
    var pos = geometry.attributes.position.array;
    var linePositions = [];
    var maxDist = 6.5;
    for (var a = 0; a < COUNT; a++) {
      for (var b = a + 1; b < COUNT; b++) {
        var dx = pos[a * 3] - pos[b * 3];
        var dy = pos[a * 3 + 1] - pos[b * 3 + 1];
        var dz = pos[a * 3 + 2] - pos[b * 3 + 2];
        var d = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (d < maxDist) {
          linePositions.push(pos[a * 3], pos[a * 3 + 1], pos[a * 3 + 2]);
          linePositions.push(pos[b * 3], pos[b * 3 + 1], pos[b * 3 + 2]);
        }
      }
    }
    lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
  }
  updateLines();

  var frame = 0;
  function animate() {
    requestAnimationFrame(animate);
    var pos = geometry.attributes.position.array;
    for (var i = 0; i < COUNT; i++) {
      pos[i * 3] += velocities[i].x;
      pos[i * 3 + 1] += velocities[i].y;
      pos[i * 3 + 2] += velocities[i].z;
      if (Math.abs(pos[i * 3]) > 18) velocities[i].x *= -1;
      if (Math.abs(pos[i * 3 + 1]) > 11) velocities[i].y *= -1;
      if (Math.abs(pos[i * 3 + 2]) > 10) velocities[i].z *= -1;
    }
    geometry.attributes.position.needsUpdate = true;
    frame++;
    if (frame % 4 === 0) updateLines();
    scene.rotation.y += 0.0006;
    renderer.render(scene, camera);

    animate();
})();

/* ════════════════════════════════════════════
   MAPA 3D — REGIÕES DO CÉREBRO (interativo)
═══════════════════════════════════════════ */
(function () {
  var canvasEl = document.getElementById('brain-canvas');
  var wrap = canvasEl.parentElement;
  var renderer = new THREE.WebGLRenderer({ canvas: canvasEl, alpha: true, antialias: true });
  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(50, wrap.clientWidth / wrap.clientHeight, 0.1, 100);
  camera.position.set(0, 0, 9);

  function resize() {
    renderer.setSize(wrap.clientWidth, wrap.clientHeight);
    camera.aspect = wrap.clientWidth / wrap.clientHeight;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);

  var group = new THREE.Group();
  scene.add(group);

  // núcleo wireframe (representação estilizada do cérebro)
  var coreGeo = new THREE.IcosahedronGeometry(2.7, 2);
  var coreMat = new THREE.MeshBasicMaterial({ color: 0x4fd8ff, wireframe: true, transparent: true, opacity: 0.22 });
  var core = new THREE.Mesh(coreGeo, coreMat);
  group.add(core);

  var coreGlowGeo = new THREE.IcosahedronGeometry(2.65, 1);
  var coreGlowMat = new THREE.MeshBasicMaterial({ color: 0x8b6bff, wireframe: true, transparent: true, opacity: 0.12 });
  group.add(new THREE.Mesh(coreGlowGeo, coreGlowMat));

  // regiões cerebrais — pontos clicáveis
  var regions = [
    { name: 'Córtex Cerebral', desc: 'Camada externa responsável pelo raciocínio, linguagem, planejamento e percepção consciente. É onde o pensamento abstrato acontece.', pos: [2.1, 1.6, 1.4] },
    { name: 'Hipocampo', desc: 'Estrutura em forma de cavalo-marinho essencial para transformar experiências em memórias de longo prazo.', pos: [-1.8, -0.4, 1.9] },
    { name: 'Amígdala', desc: 'Núcleo do sistema límbico que processa emoções intensas, especialmente medo e respostas de alerta.', pos: [-1.2, -1.1, -1.7] },
    { name: 'Cerebelo', desc: 'Localizado na base do cérebro, coordena equilíbrio, postura e a precisão dos movimentos voluntários.', pos: [0.3, -2.3, -1.1] },
    { name: 'Tronco Encefálico', desc: 'Conecta o cérebro à medula espinhal e controla funções vitais automáticas, como respiração e batimentos cardíacos.', pos: [0.1, -2.6, 0.6] },
    { name: 'Lobo Frontal', desc: 'Responsável por funções executivas: tomada de decisão, controle de impulsos e personalidade.', pos: [2.4, 0.6, -1.5] },
    { name: 'Lobo Occipital', desc: 'Área dedicada ao processamento visual, interpretando cores, formas e movimento captados pelos olhos.', pos: [-2.3, 1.2, -0.8] }
  ];

  var nodeMeshes = [];
  var nodeGeo = new THREE.SphereGeometry(0.11, 16, 16);
  regions.forEach(function (r) {
    var mat = new THREE.MeshBasicMaterial({ color: 0x8af0ff });
    var mesh = new THREE.Mesh(nodeGeo, mat);
    mesh.position.set(r.pos[0], r.pos[1], r.pos[2]);
    mesh.userData = r;
    group.add(mesh);
    nodeMeshes.push(mesh);

    // halo pulsante
    var haloGeo = new THREE.SphereGeometry(0.22, 16, 16);
    var haloMat = new THREE.MeshBasicMaterial({ color: 0x4fd8ff, transparent: true, opacity: 0.25 });
    var halo = new THREE.Mesh(haloGeo, haloMat);
    halo.position.copy(mesh.position);
    halo.userData.isHalo = true;
    group.add(halo);
  });

  // luz ambiente sutil (mesh básico não depende de luz, mas mantém consistência se evoluir)
  scene.add(new THREE.AmbientLight(0xffffff, 0.6));

  // interação: arrastar para girar
  var isDragging = false, prevX = 0, prevY = 0;
  var rotY = 0.4, rotX = -0.2;
  canvasEl.addEventListener('pointerdown', function (e) {
    isDragging = true; prevX = e.clientX; prevY = e.clientY;
  });
  window.addEventListener('pointerup', function () { isDragging = false; });
  window.addEventListener('pointermove', function (e) {
    if (!isDragging) return;
    var dx = e.clientX - prevX, dy = e.clientY - prevY;
    rotY += dx * 0.005;
    rotX += dy * 0.005;
    rotX = Math.max(-1, Math.min(1, rotX));
    prevX = e.clientX; prevY = e.clientY;
  });
  animate();
})();

/* ════════════════════════════════════════════
   MAPA 3D — REGIÕES DO CÉREBRO (interativo)
═══════════════════════════════════════════ */
(function () {
  var canvasEl = document.getElementById('brain-canvas');
  var wrap = canvasEl.parentElement;
  var renderer = new THREE.WebGLRenderer({ canvas: canvasEl, alpha: true, antialias: true });
  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(50, wrap.clientWidth / wrap.clientHeight, 0.1, 100);
  camera.position.set(0, 0, 9);

  function resize() {
    renderer.setSize(wrap.clientWidth, wrap.clientHeight);
    camera.aspect = wrap.clientWidth / wrap.clientHeight;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);

  var group = new THREE.Group();
  scene.add(group);

  // núcleo wireframe (representação estilizada do cérebro)
  var coreGeo = new THREE.IcosahedronGeometry(2.7, 2);
  var coreMat = new THREE.MeshBasicMaterial({ color: 0x4fd8ff, wireframe: true, transparent: true, opacity: 0.22 });
  var core = new THREE.Mesh(coreGeo, coreMat);
  group.add(core);

  var coreGlowGeo = new THREE.IcosahedronGeometry(2.65, 1);
  var coreGlowMat = new THREE.MeshBasicMaterial({ color: 0x8b6bff, wireframe: true, transparent: true, opacity: 0.12 });
  group.add(new THREE.Mesh(coreGlowGeo, coreGlowMat));

  // regiões cerebrais — pontos clicáveis
  var regions = [
    { name: 'Córtex Cerebral', desc: 'Camada externa responsável pelo raciocínio, linguagem, planejamento e percepção consciente. É onde o pensamento abstrato acontece.', pos: [2.1, 1.6, 1.4] },
    { name: 'Hipocampo', desc: 'Estrutura em forma de cavalo-marinho essencial para transformar experiências em memórias de longo prazo.', pos: [-1.8, -0.4, 1.9] },
    { name: 'Amígdala', desc: 'Núcleo do sistema límbico que processa emoções intensas, especialmente medo e respostas de alerta.', pos: [-1.2, -1.1, -1.7] },
    { name: 'Cerebelo', desc: 'Localizado na base do cérebro, coordena equilíbrio, postura e a precisão dos movimentos voluntários.', pos: [0.3, -2.3, -1.1] },
    { name: 'Tronco Encefálico', desc: 'Conecta o cérebro à medula espinhal e controla funções vitais automáticas, como respiração e batimentos cardíacos.', pos: [0.1, -2.6, 0.6] },
    { name: 'Lobo Frontal', desc: 'Responsável por funções executivas: tomada de decisão, controle de impulsos e personalidade.', pos: [2.4, 0.6, -1.5] },
    { name: 'Lobo Occipital', desc: 'Área dedicada ao processamento visual, interpretando cores, formas e movimento captados pelos olhos.', pos: [-2.3, 1.2, -0.8] }
  ];

  var nodeMeshes = [];
  var nodeGeo = new THREE.SphereGeometry(0.11, 16, 16);
  regions.forEach(function (r) {
    var mat = new THREE.MeshBasicMaterial({ color: 0x8af0ff });
    var mesh = new THREE.Mesh(nodeGeo, mat);
    mesh.position.set(r.pos[0], r.pos[1], r.pos[2]);
    mesh.userData = r;
    group.add(mesh);
    nodeMeshes.push(mesh);

    // halo pulsante
    var haloGeo = new THREE.SphereGeometry(0.22, 16, 16);
    var haloMat = new THREE.MeshBasicMaterial({ color: 0x4fd8ff, transparent: true, opacity: 0.25 });
    var halo = new THREE.Mesh(haloGeo, haloMat);
    halo.position.copy(mesh.position);
    halo.userData.isHalo = true;
    group.add(halo);
  });

  // luz ambiente sutil (mesh básico não depende de luz, mas mantém consistência se evoluir)
  scene.add(new THREE.AmbientLight(0xffffff, 0.6));

  // interação: arrastar para girar
  var isDragging = false, prevX = 0, prevY = 0;
  var rotY = 0.4, rotX = -0.2;
  canvasEl.addEventListener('pointerdown', function (e) {
    isDragging = true; prevX = e.clientX; prevY = e.clientY;
  });
  window.addEventListener('pointerup', function () { isDragging = false; });
  window.addEventListener('pointermove', function (e) {
    if (!isDragging) return;
    var dx = e.clientX - prevX, dy = e.clientY - prevY;
    rotY += dx * 0.005;
    rotX += dy * 0.005;
    rotX = Math.max(-1, Math.min(1, rotX));
    prevX = e.clientX; prevY = e.clientY;
  });
  // luz ambiente sutil (mesh básico não depende de luz, mas mantém consistência se evoluir)
  scene.add(new THREE.AmbientLight(0xffffff, 0.6));

  // interação: arrastar para girar
  var isDragging = false, prevX = 0, prevY = 0;
  var rotY = 0.4, rotX = -0.2;
  canvasEl.addEventListener('pointerdown', function (e) {
    isDragging = true; prevX = e.clientX; prevY = e.clientY;
  });
  window.addEventListener('pointerup', function () { isDragging = false; });
  window.addEventListener('pointermove', function (e) {
    if (!isDragging) return;
    var dx = e.clientX - prevX, dy = e.clientY - prevY;
    rotY += dx * 0.005;
    rotX += dy * 0.005;
    rotX = Math.max(-1, Math.min(1, rotX));
    prevX = e.clientX; prevY = e.clientY;
  });

  // clique em região
  var raycaster = new THREE.Raycaster();
  var mouse = new THREE.Vector2();
  var infoTitle = document.getElementById('brainInfoTitle');
  var infoDesc = document.getElementById('brainInfoDesc');
  var infoEyebrow = document.querySelector('.brain-info-eyebrow');

  canvasEl.addEventListener('click', function (e) {
    var rect = canvasEl.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    var hits = raycaster.intersectObjects(nodeMeshes);
    if (hits.length > 0) {
      var data = hits[0].object.userData;
      infoEyebrow.textContent = 'Região selecionada';
      infoTitle.textContent = data.name;
      infoDesc.textContent = data.desc;
    }
  });

  var clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    var t = clock.getElapsedTime();
    if (!isDragging) rotY += 0.0025;
    group.rotation.y = rotY;
    group.rotation.x = rotX;
    core.rotation.y -= 0.0012;

    // pulso dos halos
    group.children.forEach(function (child) {
      if (child.userData && child.userData.isHalo) {
        var s = 1 + Math.sin(t * 2.4) * 0.18;
        child.scale.set(s, s, s);
      }
    });

    renderer.render(scene, camera);
  }
  animate();
})();

/* ════════════════════════════════════════════
   CURIOSIDADES
═══════════════════════════════════════════ */
var curiosidades = [
  { title: 'Milhares de pensamentos por dia', text: 'Estima-se que o cérebro gere entre 6 mil e 70 mil pensamentos diários, em fluxo praticamente contínuo, mesmo durante atividades automáticas.' },
  { title: 'Impulsos a 400 km/h', text: 'Os neurônios mais rápidos transmitem sinais a até 120 m/s — o equivalente a mais de 400 km/h — permitindo reflexos quase instantâneos.' },
  { title: 'O cérebro trabalha enquanto você dorme', text: 'Durante o sono, especialmente na fase REM, o cérebro consolida memórias recentes e reorganiza conexões formadas durante o dia.' },
  { title: 'Nunca desliga completamente', text: 'Mesmo em repouso profundo ou anestesia leve, o cérebro mantém atividade elétrica basal constante — ele nunca para de funcionar.' },
  { title: 'Capacidade de armazenamento gigantesca', text: 'Pesquisadores estimam a capacidade de memória do cérebro em algo próximo a 2,5 milhões de gigabytes, dada a quantidade de sinapses possíveis.' },
  { title: 'O cérebro não sente dor', text: 'O tecido cerebral não possui receptores de dor; é por isso que cirurgias podem ser feitas com o paciente consciente, sentindo dor apenas no escalpo.' },
  { title: 'Multitarefa é uma ilusão', text: 'O cérebro não processa duas tarefas complexas verdadeiramente ao mesmo tempo — ele alterna rapidamente entre elas, o que gera perda de eficiência.' },
  { title: 'Emoções influenciam a memória', text: 'Eventos emocionalmente intensos ativam a amígdala, que reforça a consolidação da memória — por isso lembranças fortes parecem mais vívidas.' },
  { title: 'O cérebro encolhe levemente ao longo do dia', text: 'Devido à compressão das fibras nervosas e à variação de líquido cefalorraquidiano, o volume cerebral varia sutilmente entre o início e o fim do dia.' },
  { title: 'Exercício físico estimula novos neurônios', text: 'A atividade aeróbica regular aumenta a liberação de BDNF, uma proteína que favorece a neurogênese, especialmente no hipocampo.' },
  { title: 'O cérebro processa imagens em milissegundos', text: 'O sistema visual humano consegue identificar uma cena complexa em menos de 100 milissegundos, antes mesmo de termos consciência plena do que vimos.' },
  { title: 'Bilinguismo fortalece o córtex pré-frontal', text: 'Pessoas que falam mais de um idioma regularmente desenvolvem maior densidade de massa cinzenta em áreas ligadas ao controle executivo.' }
];
var curioGrid = document.getElementById('curioGrid');
curiosidades.forEach(function (c, i) {
  var card = document.createElement('article');
  card.className = 'curio-card';
  var num = String(i + 1).padStart(2, '0');
  card.innerHTML = '<span class="curio-num">' + num + '</span><h3>' + c.title + '</h3><p>' + c.text + '</p>';
  curioGrid.appendChild(card);
});

/* ════════════════════════════════════════════
   MITOS E FATOS
═══════════════════════════════════════════ */
var mitos = [
  { statement: 'Usamos apenas 10% do cérebro.', isMito: true, answer: 'Exames de neuroimagem mostram que praticamente todas as áreas do cérebro têm alguma atividade ao longo do dia — nenhuma região fica permanentemente inativa.' },
  { statement: 'Ouvir música pode melhorar o foco em certas tarefas.', isMito: false, answer: 'Estudos indicam que músicas sem letra, em volume moderado, podem ajudar na concentração durante tarefas repetitivas para algumas pessoas.' },
  { statement: 'Neurônios nunca se regeneram.', isMito: true, answer: 'A neurogênese — formação de novos neurônios — foi comprovada em regiões como o hipocampo, mesmo na vida adulta.' },
  { statement: 'O cérebro consome grande parte da energia do corpo, mesmo em repouso.', isMito: false, answer: 'Mesmo sem realizar tarefas mentais intensas, o cérebro consome cerca de 20% da energia total do corpo para manter suas funções basais.' },
  { statement: 'Pessoas são "do lado esquerdo" ou "do lado direito" do cérebro.', isMito: true, answer: 'Os dois hemisférios trabalham de forma integrada na maioria das tarefas; a ideia de dominância total de um lado não é sustentada pela neurociência.' },
  { statement: 'O sono é essencial para a consolidação da memória.', isMito: false, answer: 'Durante o sono, especialmente na fase REM, o cérebro reorganiza e fortalece conexões relacionadas a memórias recentes.' },
  { statement: 'Jogos de memória "treinam o cérebro inteiro" e aumentam a inteligência geral.', isMito: true, answer: 'Eles melhoram principalmente a habilidade específica treinada; a transferência desse ganho para a inteligência geral é limitada, segundo diversos estudos.' },
  { statement: 'O estresse crônico pode afetar a estrutura do hipocampo.', isMito: false, answer: 'Níveis elevados e prolongados de cortisol estão associados à redução de volume no hipocampo, prejudicando a formação de novas memórias.' }
];

var mitosGrid = document.getElementById('mitosGrid');
mitos.forEach(function (m) {
  var card = document.createElement('div');
  card.className = 'mito-card';
  card.innerHTML =
    '<span class="mito-tag">Mito ou verdade?</span>' +
    '<p class="mito-statement">' + m.statement + '</p>' +
    '<div class="mito-answer"><span class="mito-badge ' + (m.isMito ? 'mito' : 'verdade') + '">' +
    (m.isMito ? 'MITO —' : 'VERDADE —') + '</span>' + m.answer + '</div>';
  card.addEventListener('click', function () {
    card.querySelector('.mito-answer').classList.toggle('show');
  });
  mitosGrid.appendChild(card);
});

/* ════════════════════════════════════════════
   QUIZ (10 perguntas corrigidas)
═══════════════════════════════════════════ */
var quizData = [
  { q: 'Quem é considerado o pai da Psicanálise?', opts: ['Carl Jung', 'Sigmund Freud', 'B. F. Skinner', 'Jean Piaget'], ans: 1, exp: 'Sigmund Freud (1856–1939) fundou a Psicanálise, explorando o inconsciente e os mecanismos de defesa psíquica.' },
  { q: 'Qual estrutura cerebral é fundamental para a formação de novas memórias?', opts: ['Amígdala', 'Cerebelo', 'Hipocampo', 'Córtex pré-frontal'], ans: 2, exp: 'O hipocampo é essencial para consolidar memórias de curto para longo prazo, transferindo-as para o córtex.' },
  { q: 'O que é neuroplasticidade?', opts: ['Capacidade do cérebro de se adaptar e criar novas conexões', 'Rigidez estrutural do sistema nervoso', 'Processo de morte de neurônios', 'Um tipo de transtorno neurológico'], ans: 0, exp: 'Neuroplasticidade é a capacidade do cérebro de se reorganizar, formando novas conexões sinápticas ao longo da vida.' },
  { q: 'Qual psicólogo desenvolveu a hierarquia das necessidades humanas?', opts: ['Carl Rogers', 'B. F. Skinner', 'Abraham Maslow', 'William James'], ans: 2, exp: 'Abraham Maslow (1908–1970) propôs a pirâmide das necessidades, do fisiológico até a autorrealização.' },
  { q: 'O que caracteriza o condicionamento operante?', opts: ['Aprendizagem por associação de estímulos neutros', 'Aprendizagem moldada por reforços e punições', 'Teoria do inconsciente coletivo', 'Estágios fixos do desenvolvimento infantil'], ans: 1, exp: 'O condicionamento operante, descrito por Skinner, explica como comportamentos são moldados pelas consequências que produzem.' },
  { q: 'Aproximadamente quantos neurônios tem o cérebro humano adulto?', opts: ['Cerca de 10 bilhões', 'Cerca de 86 bilhões', 'Cerca de 1 trilhão', 'Cerca de 500 milhões'], ans: 1, exp: 'Estima-se que o cérebro humano contenha cerca de 86 bilhões de neurônios, conectados por trilhões de sinapses.' },
  { q: 'Qual é a principal função da amígdala no cérebro?', opts: ['Processamento de emoções, especialmente o medo', 'Controle do equilíbrio motor', 'Produção da linguagem falada', 'Regulação da temperatura corporal'], ans: 0, exp: 'A amígdala é uma estrutura do sistema límbico ligada ao processamento emocional, em especial respostas de medo e alerta.' },
  { q: 'Qual corrente da Psicologia enfatiza o estudo do comportamento observável?', opts: ['Psicanálise', 'Gestalt', 'Behaviorismo', 'Humanismo'], ans: 2, exp: 'O Behaviorismo, iniciado por Watson e desenvolvido por Skinner, concentra-se no comportamento observável e mensurável.' },
  { q: 'O conceito de inteligência emocional refere-se a:', opts: ['Ter um QI elevado', 'Reconhecer e gerir as próprias emoções e as dos outros', 'Ausência total de emoções negativas', 'Habilidade exclusivamente matemática'], ans: 1, exp: 'Popularizada por Daniel Goleman, a inteligência emocional envolve reconhecer, compreender e regular emoções próprias e alheias.' },
  { q: 'Jean Piaget é reconhecido por suas pesquisas sobre:', opts: ['O inconsciente humano', 'O comportamento animal', 'O desenvolvimento cognitivo infantil', 'A neurociência molecular'], ans: 2, exp: 'Jean Piaget (1896–1980) descreveu os estágios do desenvolvimento cognitivo ao longo da infância.' }
];

var qIndex = 0, qScore = 0, quizLocked = false;
var quizQEl = document.getElementById('quizQ');
var quizOptsEl = document.getElementById('quizOpts');
var quizExpEl = document.getElementById('quizExp');
var quizNextBtn = document.getElementById('quizNext');
var qNumEl = document.getElementById('qNum');
var qScoreEl = document.getElementById('qScore');
var quizBar = document.getElementById('quizBar');
var quizCard = document.getElementById('quizCard');
var quizFinal = document.getElementById('quizFinal');

function renderQuiz() {
  var d = quizData[qIndex];
  qNumEl.textContent = qIndex + 1;
  quizBar.style.width = (((qIndex) / quizData.length) * 100) + '%';
  quizQEl.textContent = d.q;
  quizOptsEl.innerHTML = '';
  d.opts.forEach(function (opt, i) {
    var btn = document.createElement('button');
    btn.className = 'quiz-opt';
    btn.textContent = opt;
    btn.addEventListener('click', function () {
      if (quizLocked) return;
      quizLocked = true;
      var allBtns = quizOptsEl.querySelectorAll('.quiz-opt');
      allBtns.forEach(function (b, j) {
        if (j === d.ans) b.classList.add('correct');
        else if (b === btn) b.classList.add('wrong');
        b.disabled = true;
      });
      if (i === d.ans) { qScore++; qScoreEl.textContent = qScore; }
      quizExpEl.textContent = d.exp;
      quizExpEl.classList.add('show');
      quizNextBtn.style.display = 'inline-flex';
    });
    quizOptsEl.appendChild(btn);
  });
  quizExpEl.classList.remove('show');
  quizExpEl.textContent = '';
  quizNextBtn.style.display = 'none';
  quizLocked = false;
}
quizNextBtn.addEventListener('click', function () {
  qIndex++;
  if (qIndex >= quizData.length) {
    quizBar.style.width = '100%';
    quizCard.style.display = 'none';
    document.querySelector('.quiz-meta').style.display = 'none';
    quizFinal.style.display = 'block';
    document.getElementById('finalScore').textContent = qScore + '/10';
    var msg = '';
    var emoji = '🧠';
    if (qScore >= 9) { msg = 'Excelente! Você tem um domínio impressionante sobre Psicologia e Neurociência.'; emoji = '🏆'; }
    else if (qScore >= 7) { msg = 'Muito bem! Você possui um bom conhecimento sobre a mente humana.'; emoji = '✨'; }
    else if (qScore >= 5) { msg = 'Bom resultado! Ainda há muito a descobrir — revise os conteúdos do site.'; emoji = '🧩'; }
    else { msg = 'Um ótimo começo! A mente humana é fascinante — explore mais as seções acima.'; emoji = '🌱'; }
    document.getElementById('finalMsg').textContent = msg;
    document.getElementById('finalEmoji').textContent = emoji;
    if (qScore >= 7 && typeof window.launchConfetti === 'function') {
      window.launchConfetti();
    }
  } else {
    renderQuiz();
  }
});

document.getElementById('quizReset').addEventListener('click', function () {
  qIndex = 0; qScore = 0;
  qScoreEl.textContent = 0;
  quizCard.style.display = '';
  document.querySelector('.quiz-meta').style.display = '';
  quizFinal.style.display = 'none';
  renderQuiz();
});

renderQuiz();

/* ════════════════════════════════════════════
   LINHA DO TEMPO DA NEUROCIÊNCIA
═══════════════════════════════════════════ */
var timelineData = [
  { year: '1873', title: 'O método de Golgi', text: 'Camillo Golgi desenvolve a "reazione nera", técnica de coloração que permite visualizar neurônios individuais ao microscópio pela primeira vez.' },
  { year: '1891', title: 'A "doutrina do neurônio"', text: 'Wilhelm Waldeyer consolida a ideia de que o sistema nervoso é formado por células independentes — os neurônios — e não por uma rede contínua.' },
  { year: '1906', title: 'Prêmio Nobel para Golgi e Cajal', text: 'Camillo Golgi e Santiago Ramón y Cajal dividem o Nobel de Medicina por suas pesquisas sobre a estrutura do sistema nervoso.' },
  { year: '1929', title: 'O eletroencefalograma (EEG)', text: 'Hans Berger registra, pela primeira vez, a atividade elétrica do cérebro humano através do escalpo, dando origem ao EEG moderno.' },
  { year: '1949', title: 'Teoria da plasticidade sináptica', text: 'Donald Hebb propõe que conexões entre neurônios se fortalecem quando ativadas repetidamente — base do que conhecemos hoje como aprendizagem.' },
  { year: '1981', title: 'Especialização dos hemisférios', text: 'Roger Sperry recebe o Nobel por suas descobertas sobre funções especializadas dos hemisférios cerebrais, embora a ideia popular de "lados opostos" tenha sido simplificada de forma equivocada.' },
  { year: '1990', title: 'A "Década do Cérebro"', text: 'Os Estados Unidos declaram os anos 1990 como a Década do Cérebro, impulsionando investimentos massivos em neurociência e neuroimagem.' },
  { year: '2013', title: 'Grandes projetos de mapeamento cerebral', text: 'Iniciativas como o BRAIN Initiative (EUA) e o Human Brain Project (Europa) começam a mapear circuitos neurais em escala sem precedentes.' }
];

var timelineList = document.getElementById('timelineList');
timelineData.forEach(function (item) {
  var el = document.createElement('div');
  el.className = 'timeline-item fade-in';
  el.innerHTML =
    '<span class="timeline-dot"></span>' +
    '<span class="timeline-year">' + item.year + '</span>' +
    '<h3>' + item.title + '</h3>' +
    '<p>' + item.text + '</p>';
  timelineList.appendChild(el);
  fadeObs.observe(el);
});

/* ════════════════════════════════════════════
   FUNÇÕES CEREBRAIS (detalhado)
═══════════════════════════════════════════ */
var funcoesData = [
  { tag: 'Lobo Frontal', title: 'Planejamento e controle', text: 'Responsável por funções executivas: tomada de decisão, controle de impulsos, planejamento de longo prazo e parte importante da personalidade.' },
  { tag: 'Lobo Parietal', title: 'Integração sensorial', text: 'Processa informações de tato, temperatura e dor, além de integrar dados espaciais para orientação e coordenação motora fina.' },
  { tag: 'Lobo Temporal', title: 'Audição e linguagem', text: 'Abriga o córtex auditivo primário e áreas-chave para compreensão da linguagem, como a área de Wernicke.' },
  { tag: 'Lobo Occipital', title: 'Processamento visual', text: 'Dedicado quase exclusivamente à visão: interpreta cor, forma, profundidade e movimento captados pelos olhos.' },
  { tag: 'Sistema Límbico', title: 'Emoção e motivação', text: 'Conjunto de estruturas (incluindo amígdala e hipocampo) que regula emoções, motivação e a formação de memórias afetivas.' },
  { tag: 'Cerebelo', title: 'Equilíbrio e precisão', text: 'Apesar de pequeno, concentra a maior parte dos neurônios do sistema nervoso, ajustando a precisão e fluidez dos movimentos.' }
];
var funcoesGrid = document.getElementById('funcoesGrid');
funcoesData.forEach(function (f) {
  var card = document.createElement('article');
  card.className = 'funcao-card tilt-card';
  card.innerHTML = '<span class="funcao-tag">' + f.tag + '</span><h3>' + f.title + '</h3><p>' + f.text + '</p>';
  funcoesGrid.appendChild(card);
});

/* ════════════════════════════════════════════
   GLOSSÁRIO (flip cards)
═══════════════════════════════════════════ */
var glossarioData = [
  { icon: '⚡', term: 'Sinapse', def: 'Ponto de contato entre dois neurônios onde a informação é transmitida, geralmente por meio de neurotransmissores químicos.' },
  { icon: '🧬', term: 'Neurotransmissor', def: 'Substância química liberada por um neurônio que transmite, amplifica ou modula sinais para outra célula através da sinapse.' },
  { icon: '🔄', term: 'Plasticidade', def: 'Capacidade do cérebro de reorganizar suas conexões em resposta à experiência, aprendizagem ou lesão.' },
  { icon: '🧠', term: 'Córtex', def: 'Camada externa enrugada do cérebro, associada a funções cognitivas superiores como linguagem e raciocínio.' },
  { icon: '💤', term: 'Sono REM', def: 'Fase do sono com movimento rápido dos olhos, associada a sonhos vívidos e à consolidação de memórias.' },
  { icon: '🔬', term: 'Neurogênese', def: 'Processo de formação de novos neurônios, hoje comprovado em algumas regiões do cérebro adulto, como o hipocampo.' },
  { icon: '🌐', term: 'Conectoma', def: 'Mapa completo das conexões neurais de um cérebro, comparável a um "diagrama elétrico" do sistema nervoso.' },
  { icon: '⚙️', term: 'Função executiva', def: 'Conjunto de processos mentais ligados a planejamento, controle de impulsos e tomada de decisão, sediados no lobo frontal.' }
];
var glossarioGrid = document.getElementById('glossarioGrid');
glossarioData.forEach(function (g) {
  var card = document.createElement('div');
  card.className = 'glossario-card';
  card.innerHTML =
    '<div class="glossario-inner">' +
    '<div class="glossario-face glossario-front"><span>' + g.icon + '</span><h3>' + g.term + '</h3></div>' +
    '<div class="glossario-face glossario-back">' + g.def + '</div>' +
    '</div>';
  card.addEventListener('click', function () { card.classList.toggle('flipped'); });
  glossarioGrid.appendChild(card);
});

/* ════════════════════════════════════════════
   TILT 3D NOS CARDS (segue o mouse)
═══════════════════════════════════════════ */
document.querySelectorAll('.tilt-card').forEach(function (card) {
  card.addEventListener('mousemove', function (e) {
    var rect = card.getBoundingClientRect();
    var x = (e.clientX - rect.left) / rect.width - 0.5;
    var y = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = 'rotateY(' + (x * 8) + 'deg) rotateX(' + (-y * 8) + 'deg) translateY(-4px)';
  });
  card.addEventListener('mouseleave', function () {
    card.style.transform = 'rotateY(0) rotateX(0) translateY(0)';
  });
});

/* ════════════════════════════════════════════
   CURSOR GLOW (acompanha o mouse no hero)
═══════════════════════════════════════════ */
(function () {
  var glow = document.createElement('div');
  glow.className = 'cursor-glow';
  document.body.appendChild(glow);
  var heroSection = document.getElementById('home');
  document.addEventListener('mousemove', function (e) {
    var heroRect = heroSection.getBoundingClientRect();
    if (heroRect.top < window.innerHeight && heroRect.bottom > 0) {
      glow.classList.add('active');
      glow.style.left = e.clientX + 'px';
      glow.style.top = e.clientY + 'px';
    } else {
      glow.classList.remove('active');
    }
  });
})();

/* ════════════════════════════════════════════
   CONFETE — celebração ao terminar o quiz
═══════════════════════════════════════════ */
(function () {
  var canvas = document.createElement('canvas');
  canvas.id = 'confetti-canvas';
  document.body.appendChild(canvas);
  var ctx = canvas.getContext('2d');
  var particles = [];
  var active = false;

  function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
  resize();
  window.addEventListener('resize', resize);

  var colors = ['#4fd8ff', '#8b6bff', '#8af0ff', '#b39bff', '#5be8a4'];

  window.launchConfetti = function () {
    particles = [];
    for (var i = 0; i < 140; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: -20 - Math.random() * canvas.height * 0.3,
        size: 4 + Math.random() * 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        speedY: 2 + Math.random() * 3,
        speedX: (Math.random() - 0.5) * 2,
        rot: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 8
      });
    }
    active = true;
    canvas.classList.add('active');
    setTimeout(function () { active = false; canvas.classList.remove('active'); }, 3200);
  };

  function loop() {
    requestAnimationFrame(loop);
    if (!active) { ctx.clearRect(0, 0, canvas.width, canvas.height); return; }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(function (p) {
      p.y += p.speedY;
      p.x += p.speedX;
      p.rot += p.rotSpeed;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot * Math.PI / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.5);
      ctx.restore();
    });
  }
  loop();
})();

/* ════════════════════════════════════════════
   TOAST (utilitário genérico)
═══════════════════════════════════════════ */
function showToast(msg) {
  var t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(function () { t.classList.remove('show'); }, 3000);
    }
