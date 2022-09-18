import * as THREE from '../build/three.module.js';


export function createStarSpline(n=7, phase=0, z=0) {
    
    const points = []

    for (let i = 0; i < n * 2; i++) {
        const l = i % 2 == 0 ? 30 : 50;
        const a = i / n * Math.PI + phase;
        points.push(new THREE.Vector3(Math.cos(a) * l, Math.sin(a) * l, z));
    }

    return new THREE.CatmullRomCurve3(points, true);
}

/**
 * Zips any number of arrays. It will always zip() the largest array returning undefined for shorter arrays.
 * @param  {...Array<any>} arrays 
 */
export function* zip(...arrays){
    const minLength = arrays.reduce((min, curIterable) => curIterable.length < min ? curIterable.length: min, 100000);
    for (let i = 0; i < minLength; i++) {
      yield arrays.map(array => array[i]);
    }
  }