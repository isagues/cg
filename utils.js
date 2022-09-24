import * as THREE from '../build/three.module.js';

// /**
//  * Zips any number of arrays. It will always zip() the largest array returning undefined for shorter arrays.
//  * @param  {...Array<any>} arrays 
//  */
// export function* zip(...arrays){
//     const minLength = arrays.reduce((min, curIterable) => curIterable.length < min ? curIterable.length: min, 100000);
//     for (let i = 0; i < minLength; i++) {
//       yield arrays.map(array => array[i]);
//     }
//   }

export function setMaterials(){
    const materials = {};
    materials[ 'wireframe' ] = new THREE.MeshBasicMaterial( { wireframe: true } );
    materials[ 'flat' ] = new THREE.MeshPhongMaterial( { specular: 0x000000, flatShading: true, side: THREE.DoubleSide } );
    materials[ 'smooth' ] = new THREE.MeshLambertMaterial( { side: THREE.DoubleSide } );
    materials[ 'glossy' ] = new THREE.MeshPhongMaterial( { side: THREE.DoubleSide } );

  return materials;
}

export function lerp(a, b, t) {
  return (a * (1.0 - t)) + (b * t);
}