import * as THREE from '../build/three.module.js';


export function createStarSpline(n=7, phase=0) {
    
    const pointsF = []

    for (let i = 0; i < n * 2; i++) {
        const l = i % 2 == 0 ? 30 : 50;
        const a = i / n * Math.PI + phase;
        pointsF.push(new THREE.Vector3(Math.cos(a) * l, Math.sin(a) * l, 0));
    }

    return new THREE.CatmullRomCurve3(pointsF, true);
}

/**
 * Zips any number of arrays. It will always zip() the largest array returning undefined for shorter arrays.
 * @param  {...Array<any>} arrays 
 */
export function* zip(...arrays){
    const maxLength = arrays.reduce((max, curIterable) => curIterable.length > max ? curIterable.length: max, 0);
    for (let i = 0; i < maxLength; i++) {
      yield arrays.map(array => array[i]);
    }
  }