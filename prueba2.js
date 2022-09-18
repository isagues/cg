import * as THREE from '../build/three.module.js';

import { OrbitControls } from '../examples/jsm/controls/OrbitControls.js';
import {createStarSpline, zip} from './utils.js'

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


    const point = new THREE.Vector3();
    const color = new THREE.Color();
    const material = new THREE.LineBasicMaterial({ color: 0xffffff, vertexColors: true });

    let line, p;

    const verticesCount = 100
    const splines = [];
    const geometries = [];
    const splineCount = 3;

    for(let i = 0; i < splineCount * 2; i++) {
        
        const spline = createStarSpline(7, i * Math.PI / 16);
        splines.push(spline);
    }

    const segmentsCount = 100;
    let posNdx = 0;
    let ndx = 0;


    // s2: -–-----s21-------s22

    // s1: -–-----s11-------s12

    const numVertices = segmentsCount * (splines.length - 1) * 6;
    const numComponents = 3;
    const positions = new Float32Array(numVertices * numComponents);
    const indices = [];



    for(const spline of splines){

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

        geometries.push(geometry)
    }

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
    }

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