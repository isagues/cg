import * as THREE from '../build/three.module.js';

import { OrbitControls } from '../examples/jsm/controls/OrbitControls.js';
import { GeneratedGeometry } from './geometries.js'

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

    const materials = {};
    materials[ 'wireframe' ] = new THREE.MeshBasicMaterial( { wireframe: true } );
    materials[ 'flat' ] = new THREE.MeshPhongMaterial( { specular: 0x000000, flatShading: true, side: THREE.DoubleSide } );
    materials[ 'smooth' ] = new THREE.MeshLambertMaterial( { side: THREE.DoubleSide } );
    materials[ 'glossy' ] = new THREE.MeshPhongMaterial( { side: THREE.DoubleSide } );

    const geometry = new GeneratedGeometry('B2', 100, Math.PI / 2, 360);

    const meshiMesh = new THREE.Mesh( geometry, materials[ 'glossy' ] );

    scene.add( meshiMesh );
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