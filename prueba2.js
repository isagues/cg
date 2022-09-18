import * as THREE from '../build/three.module.js';

import { OrbitControls } from '../examples/jsm/controls/OrbitControls.js';
import { createStarSpline, zip } from './utils.js'

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


    const splines = [];
    const geometries = [];
    const splineCount = 10;

    const baseSpline = createStarSpline(7);
    const Z_AXIS = new THREE.Vector3(0, 0, 1);
    const theta = Math.PI / 64;
    const offset = 5

    for (let i = 0; i < splineCount; i++) {

        // clonar
        const points = [];
        const offsetVec = new THREE.Vector3(0, 0, i * offset);

        for (const p of baseSpline.points) {
            const point = p.clone().applyAxisAngle(Z_AXIS, theta * i).add(offsetVec);
            points.push(point);
        }

        const spline = new THREE.CatmullRomCurve3(points, true);
        splines.push(spline);
    }

    const segmentsCount = 100;
    let posNdx = 0;
    let ndx = 0;

    // s2: -–-----s21-------s22

    // s1: -–-----s11-------s12

    const numVertices = segmentsCount * (splines.length - 1) * 4;
    const numComponents = 3;
    const positions = new Float32Array(numVertices * numComponents);
    const indices = [];

    for (const [s1, s2] of zip(splines, splines.slice(1))) {

        for (let i = 0; i < segmentsCount; i++) {

            const t1 = i / segmentsCount;
            const t2 = (i + 1) / segmentsCount;

            const s11 = new THREE.Vector3();
            const s12 = new THREE.Vector3();
            const s21 = new THREE.Vector3();
            const s22 = new THREE.Vector3();

            s1.getPoint(t1, s11)
            s1.getPoint(t2, s12)
            s2.getPoint(t1, s21)
            s2.getPoint(t2, s22)


            positions.set(s11.toArray(), posNdx); posNdx += numComponents;
            positions.set(s12.toArray(), posNdx); posNdx += numComponents;
            positions.set(s21.toArray(), posNdx); posNdx += numComponents;
            positions.set(s22.toArray(), posNdx); posNdx += numComponents;

            indices.push(
                ndx, ndx + 1, ndx + 2,
                ndx + 2, ndx + 1, ndx + 3,
            );
            ndx += 4;
        }
        /*
        const vertices = [], colors = [];
        for (let i = 0; i < verticesCount * 100; i++) {

            spline.getPoint(i / verticesCount / 100, point)
    
            vertices.push(point.x, point.y, point.z);
    
            color.setHSL(0.6, 1.0, 0.8);
            colors.push(color.r, color.g, color.b);
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

        geometries.push(geometry)*/
    }
    /*
    const parameters = [
        [material, [0, 0, -10], geometries[0]],
        [material, [0, 0, 0], geometries[1]],
        [material, [0, 0, 10], geometries[2]],
    ];


    for (const p of parameters) {

        line = new THREE.Line(p[2], p[0]);
        line.position.x = p[1][0];
        line.position.y = p[1][1];
        line.position.z = p[1][2];
        scene.add(line);
    }*/

    console.log(positions)
    const normals = positions.slice();
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
        // makeInstance(geometry, 0xFF0000, 0),
        makeWireeframeInstance(geometry),
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