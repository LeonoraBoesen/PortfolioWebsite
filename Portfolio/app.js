const canvas = document.querySelector('#webgl-canvas');
const label = document.querySelector('#label');

// Three.js Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;

// Ambient light for general illumination
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);

// PointLight for the selected card
const cardLight = new THREE.PointLight(0xffffff, 1.5, 10);
cardLight.visible = false;
scene.add(cardLight);

// Tabletop
const tableGeometry = new THREE.PlaneGeometry(20, 20);
const tableMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
const table = new THREE.Mesh(tableGeometry, tableMaterial);
table.rotation.x = -Math.PI / 2;
table.position.y = -0.1;
table.receiveShadow = true;
scene.add(table);

// Cards
const cards = [];
const cardTexts = [
  "Skill 1: Programming & Scripting",
  "Skill 2: Game Design",
  "Skill 3: Level Design",
  "Skill 4: Visual & 3D Tools",
  "Skill 5: Implementation",
  "Skill 6: AR/VR Development",
  "Skill 7: UX/UI Design",
  "Skill 8: Playtesting & Analysis",
  "Skill 9: Production, Collaboration & Version Control",
  "SKill 10: Documentation & Communication"
];

const cardGeometry = new THREE.BoxGeometry(1.5, 0.1, 2);
const cardMaterial = new THREE.MeshStandardMaterial({ color: 0x0077ff });
const fanRadius = 6;
const angleStep = Math.PI / 10;

for (let i = 0; i < 10; i++) {
  const card = new THREE.Mesh(cardGeometry, cardMaterial.clone());
  const angle = -Math.PI / 2.25 + i * angleStep;
  card.position.set(fanRadius * Math.sin(angle), 0, fanRadius * Math.cos(angle));
  card.rotation.y = angle;
  card.userData = { text: cardTexts[i] };
  scene.add(card);
  cards.push(card);
}

// Camera Position
camera.position.set(0, 8, 10);
camera.lookAt(0, 0, 0);

// Interaction Logic
let selectedCard = null;
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function deselectCard() {
  if (selectedCard) {
    gsap.to(selectedCard.position, {
      x: selectedCard.userData.originalPosition.x,
      y: 0,
      z: selectedCard.userData.originalPosition.z,
      duration: 0.5
    });
    gsap.to(selectedCard.rotation, {
      x: 0,
      y: selectedCard.userData.originalRotation,
      z: 0,
      duration: 0.5
    });
    cardLight.visible = false;
    label.style.display = 'none';
    selectedCard = null;
  }
}

function onMouseMove(event) {
  const rect = canvas.getBoundingClientRect(); // Get canvas bounding rectangle
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
}

function onMouseClick(event) {
  const rect = canvas.getBoundingClientRect(); // Get canvas bounding rectangle
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects(cards);

  if (intersects.length > 0) {
    const clickedCard = intersects[0].object;

    if (selectedCard === clickedCard) {
      deselectCard();
    } else {
      deselectCard();

      selectedCard = clickedCard;

      // Move the card to the center
      gsap.to(clickedCard.position, {
        x: 0,
        y: 5.5,
        z: 7,
        duration: 0.5,
        onComplete: () => {
          // Dim ambient light for everything else
          gsap.to(ambientLight, { intensity: 0.2, duration: 0.5 });

          // Position and enable the card light
          cardLight.position.set(
            clickedCard.position.x,
            clickedCard.position.y + 2,
            clickedCard.position.z + 3
          );
          cardLight.visible = true;

          // Update label content
          label.textContent = clickedCard.userData.text; // Display the card's specific text
          label.style.display = 'block';

          // Convert card's 3D position to 2D screen coordinates
          const vector = clickedCard.position.clone().project(camera);
          const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
          const y = (1 - (vector.y * 0.5 + 0.5)) * window.innerHeight;

          // Position label next to the card
          label.style.left = `${x + 150}px`;
          label.style.top = `${y}px`;
        },
      });
      gsap.to(clickedCard.rotation, {
        x: 1,
        y: Math.PI,
        z: 3.15,
        duration: 0.5,
      });
    }
  } else {
    deselectCard(); // Deselect if clicking on an empty canvas
  }
}


cards.forEach(card => {
  card.userData.originalPosition = { ...card.position };
  card.userData.originalRotation = card.rotation.y;
});

// Animation Loop
function animate() {
  requestAnimationFrame(animate);
  raycaster.setFromCamera(mouse, camera);
  renderer.render(scene, camera);
}

canvas.addEventListener('mousemove', onMouseMove);
canvas.addEventListener('click', onMouseClick);

animate();
