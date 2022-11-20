import * as THREE from '../libs/three.module.js';

export function setMaterials(){
    const materials = {};
    let textureLoader = new THREE.TextureLoader();
    const text1 = textureLoader.load('./textures/Pattern02_1K_VarA.png');
    text1.wrapS = THREE.RepeatWrapping;
    text1.wrapT = THREE.RepeatWrapping;
    text1.repeat.set( 15, 15 );

    materials[ 'wireframe' ] = new THREE.MeshBasicMaterial( { wireframe: true } );
    materials[ 'flat' ] = new THREE.MeshPhongMaterial( { specular: 0xEE2299, flatShading: true, side: THREE.DoubleSide } );
    materials[ 'smooth' ] = new THREE.MeshLambertMaterial( { color: 0xEE2299, side: THREE.DoubleSide } );
    materials[ 'glossy' ] = new THREE.MeshPhongMaterial( { color: 0xEE2299, side: THREE.DoubleSide } );
    materials[ 'textura3' ] = new THREE.MeshLambertMaterial( { side: THREE.DoubleSide, map: text1 } );

  return materials;
}

export function areVectorClose( v1, v2, epsilon = 50 ) {
  return ( Math.abs( v1.x - v2.x ) + Math.abs( v1.y - v2.y ) + Math.abs( v1.z - v2.z ) ) < epsilon;

}

export function lerp(a, b, t) {
  return (a * (1.0 - t)) + (b * t);
}