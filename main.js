import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);
scene.fog = new THREE.Fog(0x87ceeb, 100, 500);

// Camera
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.set(80, 60, 80);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.getElementById('canvas-container').appendChild(renderer.domElement);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.maxPolarAngle = Math.PI / 2.1;

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(50, 100, 50);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
directionalLight.shadow.camera.far = 200;
directionalLight.shadow.camera.left = -100;
directionalLight.shadow.camera.right = 100;
directionalLight.shadow.camera.top = 100;
directionalLight.shadow.camera.bottom = -100;
scene.add(directionalLight);

// Stadium lights
const stadiumLights = [
    { x: -40, z: -30 },
    { x: 40, z: -30 },
    { x: -40, z: 30 },
    { x: 40, z: 30 }
];

stadiumLights.forEach(pos => {
    const light = new THREE.PointLight(0xffffff, 1, 100);
    light.position.set(pos.x, 40, pos.z);
    scene.add(light);

    // Light pole
    const poleGeometry = new THREE.CylinderGeometry(0.5, 0.5, 40, 8);
    const poleMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const pole = new THREE.Mesh(poleGeometry, poleMaterial);
    pole.position.set(pos.x, 20, pos.z);
    pole.castShadow = true;
    scene.add(pole);

    // Light fixture
    const fixtureGeometry = new THREE.BoxGeometry(3, 2, 3);
    const fixtureMaterial = new THREE.MeshStandardMaterial({
        color: 0xffff00,
        emissive: 0xffff00,
        emissiveIntensity: 0.5
    });
    const fixture = new THREE.Mesh(fixtureGeometry, fixtureMaterial);
    fixture.position.set(pos.x, 41, pos.z);
    scene.add(fixture);
});

// Ground/Field
const fieldGeometry = new THREE.PlaneGeometry(60, 100);
const fieldMaterial = new THREE.MeshStandardMaterial({
    color: 0x2d8f2d,
    roughness: 0.8
});
const field = new THREE.Mesh(fieldGeometry, fieldMaterial);
field.rotation.x = -Math.PI / 2;
field.receiveShadow = true;
scene.add(field);

// Field lines
const lineMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });

// Center circle
const centerCircleGeometry = new THREE.RingGeometry(9, 9.5, 64);
const centerCircle = new THREE.Mesh(centerCircleGeometry, lineMaterial);
centerCircle.rotation.x = -Math.PI / 2;
centerCircle.position.y = 0.01;
scene.add(centerCircle);

// Center line
const centerLineGeometry = new THREE.PlaneGeometry(0.5, 60);
const centerLine = new THREE.Mesh(centerLineGeometry, lineMaterial);
centerLine.rotation.x = -Math.PI / 2;
centerLine.position.y = 0.01;
scene.add(centerLine);

// Penalty boxes
[-37, 37].forEach(z => {
    const boxGeometry = new THREE.PlaneGeometry(40, 16);
    const boxEdges = new THREE.EdgesGeometry(boxGeometry);
    const boxLine = new THREE.LineSegments(
        boxEdges,
        new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 })
    );
    boxLine.rotation.x = -Math.PI / 2;
    boxLine.position.set(0, 0.01, z);
    scene.add(boxLine);
});

// Goals
[-50, 50].forEach(z => {
    // Posts
    const postGeometry = new THREE.CylinderGeometry(0.3, 0.3, 8, 16);
    const postMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });

    [-7.5, 7.5].forEach(x => {
        const post = new THREE.Mesh(postGeometry, postMaterial);
        post.position.set(x, 4, z);
        post.castShadow = true;
        scene.add(post);
    });

    // Crossbar
    const crossbarGeometry = new THREE.CylinderGeometry(0.3, 0.3, 15, 16);
    const crossbar = new THREE.Mesh(crossbarGeometry, postMaterial);
    crossbar.rotation.z = Math.PI / 2;
    crossbar.position.set(0, 8, z);
    crossbar.castShadow = true;
    scene.add(crossbar);

    // Net
    const netGeometry = new THREE.PlaneGeometry(15, 8);
    const netMaterial = new THREE.MeshStandardMaterial({
        color: 0xcccccc,
        transparent: true,
        opacity: 0.3,
        side: THREE.DoubleSide
    });
    const net = new THREE.Mesh(netGeometry, netMaterial);
    net.position.set(0, 4, z);
    scene.add(net);
});

// Stadium bowl/seating tiers
function createStadiumBowl() {
    const sections = 40;
    const tiers = [
        { radius: 70, height: 5, rows: 15, color: 0xff0000 },
        { radius: 75, height: 15, rows: 20, color: 0x0000ff },
        { radius: 80, height: 30, rows: 25, color: 0xffff00 }
    ];

    tiers.forEach((tier, tierIndex) => {
        for (let i = 0; i < sections; i++) {
            const angle = (i / sections) * Math.PI * 2;
            const nextAngle = ((i + 1) / sections) * Math.PI * 2;

            const shape = new THREE.Shape();
            shape.moveTo(
                Math.cos(angle) * tier.radius,
                Math.sin(angle) * tier.radius
            );
            shape.lineTo(
                Math.cos(nextAngle) * tier.radius,
                Math.sin(nextAngle) * tier.radius
            );
            shape.lineTo(
                Math.cos(nextAngle) * (tier.radius + 3),
                Math.sin(nextAngle) * (tier.radius + 3)
            );
            shape.lineTo(
                Math.cos(angle) * (tier.radius + 3),
                Math.sin(angle) * (tier.radius + 3)
            );

            const extrudeSettings = {
                steps: 1,
                depth: tier.rows * 0.5,
                bevelEnabled: false
            };

            const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
            const material = new THREE.MeshStandardMaterial({
                color: tier.color,
                roughness: 0.7
            });
            const section = new THREE.Mesh(geometry, material);
            section.rotation.x = Math.PI / 2;
            section.position.y = tier.height;
            section.castShadow = true;
            section.receiveShadow = true;
            scene.add(section);
        }
    });
}

createStadiumBowl();

// Roof structure
const roofSegments = 32;
const roofRadius = 85;
for (let i = 0; i < roofSegments; i++) {
    const angle = (i / roofSegments) * Math.PI * 2;
    const nextAngle = ((i + 1) / roofSegments) * Math.PI * 2;

    const x1 = Math.cos(angle) * roofRadius;
    const z1 = Math.sin(angle) * roofRadius;
    const x2 = Math.cos(nextAngle) * roofRadius;
    const z2 = Math.sin(nextAngle) * roofRadius;

    const points = [
        new THREE.Vector3(x1, 50, z1),
        new THREE.Vector3(x2, 50, z2),
        new THREE.Vector3(x2 * 0.7, 55, z2 * 0.7),
        new THREE.Vector3(x1 * 0.7, 55, z1 * 0.7)
    ];

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const indices = [0, 1, 2, 0, 2, 3];
    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    const material = new THREE.MeshStandardMaterial({
        color: 0x333333,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.7
    });
    const roofPanel = new THREE.Mesh(geometry, material);
    roofPanel.castShadow = true;
    scene.add(roofPanel);
}

// Scoreboard
const scoreboardGeometry = new THREE.BoxGeometry(30, 10, 2);
const scoreboardMaterial = new THREE.MeshStandardMaterial({
    color: 0x000000,
    emissive: 0x003300,
    emissiveIntensity: 0.3
});
const scoreboard = new THREE.Mesh(scoreboardGeometry, scoreboardMaterial);
scoreboard.position.set(0, 35, -65);
scene.add(scoreboard);

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
