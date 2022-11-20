import * as THREE from '../libs/three.module.js';

let textureLoader = new THREE.TextureLoader();

export const materials = {
    'wireframe': new THREE.MeshBasicMaterial( { wireframe: true } ),
    'flat' : new THREE.MeshPhongMaterial( { specular: 0xEE2299, flatShading: true, side: THREE.DoubleSide } ),
    'smooth' : new THREE.MeshLambertMaterial( { color: 0xEE2299, side: THREE.DoubleSide } ),
    'glossy' : new THREE.MeshPhongMaterial( { color: 0xEE2299, side: THREE.DoubleSide } ),
    'texture' : new THREE.MeshLambertMaterial( { side: THREE.DoubleSide } )
}

export const textures = {
  'black_marble': loadTexture('Marble03_1K_BaseColor.png'),
  'white_marble': loadTexture('Marble09_1K_BaseColor.png'),
  'stripes': loadTexture('patron3.png'),
  'pattern_1_a': loadTexture('Pattern02_1K_VarA.png'),
  'pattern_1_b': loadTexture('Pattern02_1K_VarB.png')
}

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
  materials[ 'texture' ] = new THREE.MeshLambertMaterial( { side: THREE.DoubleSide } );

return materials;
}

export function loadTexture(textureName) {
  const texture = textureLoader.load('./textures/' + textureName);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;

  return texture;
}

export function areVectorClose( v1, v2, epsilon = 50 ) {
  return ( Math.abs( v1.x - v2.x ) + Math.abs( v1.y - v2.y ) + Math.abs( v1.z - v2.z ) ) < epsilon;

}

export function lerp(a, b, t) {
  return (a * (1.0 - t)) + (b * t);
}