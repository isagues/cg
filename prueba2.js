import * as THREE from '../build/three.module.js';

import { OrbitControls } from '../examples/jsm/controls/OrbitControls.js';
import { createRotationSpline, createStarSpline, extrutionSplines, rotationSplines, zip } from './utils.js'

let camera, scene, renderer, controls;

init();
animate();

function init() {

    camera = new THREE.PerspectiveCamera(33, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.z = 1000;

    scene = new THREE.Scene();

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.addEventListener('change', render);
    controls.minDistance = 50;
    controls.maxDistance = 1000;
    controls.enablePan = false;
    controls.target.set(0, 20, 0);
    controls.update();

    function addLight(...pos) {
        const color = 0xFFFFFF;
        const intensity = 1;
        const light = new THREE.DirectionalLight(color, intensity);
        light.position.set(...pos);
        scene.add(light);
    }
    addLight(-1, 2, 4);
    addLight(2, -2, 3);

    // const splineCount = 100;
    // const baseSpline = createStarSpline(7);
    // const theta = Math.PI / 256;
    // const offset = 1;

    // const splines = extrutionSplines(baseSpline, splineCount, offset, theta);

    const splineCount = 180;
    const baseSpline = createRotationSpline();
 
    const splines = rotationSplines(baseSpline, splineCount);


    function geometryPointsFromSplines(splines, samplesCount, nc=3) {
        // nc == numero de componentes de los vectores de postion

        // s2: -–-----s21-------s22

        // s1: -–-----s11-------s12

        const numVertices = samplesCount * (splines.length - 1) * 4; // 4 porque usamos indices para no repetir
        
        const positions = new Float32Array(numVertices * nc);
        const indices = [];
        
        let posNdx = 0;
        let ndx = 0;

        for (const [s1, s2] of zip(splines, splines.slice(1))) {

            for (let i = 0; i < samplesCount; i++) {

                const t1 = i / samplesCount;
                const t2 = (i + 1) / samplesCount;

                const s11 = s1.getPoint(t1);
                const s12 = s1.getPoint(t2);
                const s21 = s2.getPoint(t1);
                const s22 = s2.getPoint(t2);

                positions.set(s11.toArray(), posNdx); posNdx += nc;
                positions.set(s12.toArray(), posNdx); posNdx += nc;
                positions.set(s21.toArray(), posNdx); posNdx += nc;
                positions.set(s22.toArray(), posNdx); posNdx += nc;

                indices.push(
                    ndx, ndx + 1, ndx + 2,
                    ndx + 2, ndx + 1, ndx + 3,
                );
                ndx += 4;
            }
        }

        return {positions, indices};
    }

    function normalFromPosition(position, nc=3) {
        // nc == numero de componentes de los vectores de postion

        const normal = new Float32Array(position.length);
        // Calculo de las normales de cada vértice de cada triangulo
        const pA = new THREE.Vector3();
        const pB = new THREE.Vector3();
        const pC = new THREE.Vector3();

        const np = 4

        for (let i = 0; i < position.length; i+=(nc * np)) {
            // normales de cara plana
            pA.fromArray(position, i + (0 * nc));
            pB.fromArray(position, i + (1 * nc));
            pC.fromArray(position, i + (2 * nc));
            
            pC.sub( pB );
            pA.sub( pB );
            pC.cross( pA );
            pC.normalize();
            
            pC.toArray( normal, i + (0 * nc));
            pC.toArray( normal, i + (1 * nc));
            pC.toArray( normal, i + (2 * nc));
            pC.toArray( normal, i + (3 * nc));
        }

        return normal;
    }

    const {positions, indices} = geometryPointsFromSplines(splines, 1000);
 
    const normals = normalFromPosition(positions, 3);
    const geometry = new THREE.BufferGeometry();
    const positionNumComponents = 3;
    const normalNumComponents = 3;

    const positionAttribute = new THREE.BufferAttribute(positions, positionNumComponents);
    positionAttribute.dynamic = true;
    geometry.setAttribute(
        'position',
        positionAttribute);
    geometry.setAttribute(
        'normal',
        new THREE.BufferAttribute(normals, normalNumComponents));
    geometry.setIndex(indices);

    function makeInstance(geometry, color, x) {
        const material = new THREE.MeshPhongMaterial({
            color,
            side: THREE.DoubleSide,
            shininess: 100,
        });

        const cube = new THREE.Mesh(geometry, material);
        scene.add(cube);

        cube.position.x = x;
        return cube;
    }

    function makeWireeframeInstance(geometry) {
        const wireframe = new THREE.WireframeGeometry(geometry);

        const line = new THREE.LineSegments(wireframe);
        line.material.depthTest = false;
        line.material.opacity = 0.5;
        line.material.transparent = true;
        line.position.z = -25;
        scene.add(line);
    }

    const cubes = [
        makeInstance(geometry, 0xFF0000, 0),
        // makeWireeframeInstance(geometry),
    ];

    //
    const axesHelper = new THREE.AxesHelper(15);
    scene.add(axesHelper);

    document.body.style.touchAction = 'none';
    //

    window.addEventListener('resize', onWindowResize);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}

//

function animate() {

    requestAnimationFrame(animate);
    // controls.update();
    render();

}

function render() {

    renderer.render(scene, camera);
}