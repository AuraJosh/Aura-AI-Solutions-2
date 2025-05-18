// Initialize scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById("model-container").appendChild(renderer.domElement);

// Add lighting
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(0, 1, 1).normalize();
scene.add(light);

// Load the GLTF model
const loader = new THREE.GLTFLoader();
let model;
loader.load(
  "token.glb", // Ensure this path is correct relative to your HTML file
  function (gltf) {
    model = gltf.scene;
    model.scale.set(50, 50, 50); // Adjust scale as needed
    scene.add(model);
  },
  undefined,
  function (error) {
    console.error(error);
  }
);

// Position the camera
camera.position.z = 50;

// Handle window resize
window.addEventListener("resize", function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Rotation variables
let rotateOnScroll = false;
let rotateOnClick = false;

// Scroll event to rotate model
window.addEventListener("scroll", () => {
  rotateOnScroll = true;
});

// Click event to rotate model
document.getElementById("model-container").addEventListener("click", () => {
  rotateOnClick = true;
});

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  if (model) {
    if (rotateOnScroll) {
      model.rotation.y += 0.01;
      rotateOnScroll = false;
    }
    if (rotateOnClick) {
      model.rotation.y += 0.05;
      rotateOnClick = false;
    }
  }

  renderer.render(scene, camera);
}
animate();
