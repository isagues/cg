import * as THREE from '../build/three.module.js';

const Z_AXIS = new THREE.Vector3(0, 0, 1);

const FULL_ROTATION = Math.PI * 2;

export function createB1Curve(width, n=3) {
    
    const points = []

    for (let i = 0; i < n; i++) {
        const l = width / 2;
        const a = 2 * i / n * Math.PI;
        points.push( new THREE.Vector2( Math.cos( a ) * l, Math.sin( a ) * l ) );
    }
    const curve = new THREE.Shape(points);
    curve.closePath();
    return curve;
}

export function createB2Curve(width, n=7) {
    
    const points = []

    for (let i = 0; i < n * 2; i++) {
        const l = i % 2 == 0 ? 3 * width/4 : width/2;
        const a = i / n * Math.PI;
        points.push(new THREE.Vector3(Math.cos(a) * l, Math.sin(a) * l, 0));
    }

    return new THREE.CatmullRomCurve3(points, true);
}

export function createB3Curve(width) {
    
    const d = width/13;

    const curve = new THREE.Path();

    curve.moveTo(-3*d, -2*d);
    curve.lineTo(-6*d, -2*d);
    curve.splineThru([
      new THREE.Vector2(-6*d, -2*d),
      new THREE.Vector2(-6*d, -6*d),
      new THREE.Vector2(-2*d, -6*d),
    ]);
    curve.lineTo(-2*d, -3*d);
    curve.lineTo(2*d, -3*d);
    curve.lineTo(2*d, -6*d);
    curve.splineThru([
      new THREE.Vector2(2*d, -6*d),
      new THREE.Vector2(6*d, -6*d),
      new THREE.Vector2(6*d, -2*d),
    ]);
    curve.lineTo(3*d, -2*d);
    curve.lineTo(3*d, 2*d);
    curve.lineTo(6*d, 2*d);
    curve.splineThru([
      new THREE.Vector2(6*d, 2*d),
      new THREE.Vector2(6*d, 6*d),
      new THREE.Vector2(2*d, 6*d),
    ]);
    curve.lineTo(2*d, 3*d);
    curve.lineTo(-2*d, 3*d);
    curve.lineTo(-2*d, 6*d);
    curve.splineThru([
      new THREE.Vector2(-2*d, 6*d),
      new THREE.Vector2(-6*d, 6*d),
      new THREE.Vector2(-6*d, 2*d),
    ]);
    curve.lineTo(-3*d, 2*d);
    curve.closePath();

    return curve;
}

// export function extrutionSplines(baseSpline, splineCount, offset, theta) {

//     const splines = [];

//     for (let i = 0; i < splineCount; i++) {

//       // clonar
//       const points = [];
//       const offsetVec = new THREE.Vector3(0, 0, i * offset);

//       debugger;
//       for (const p of baseSpline.points) {
//           const point = p.clone().applyAxisAngle(Z_AXIS, theta * i).add(offsetVec);
//           points.push(point);
//       }

//       const spline = new THREE.CatmullRomCurve3(points, true);
//       splines.push(spline);
//   }
//   return splines;
// }

// export function createRotationSpline() {
//   const curve = new THREE.CatmullRomCurve3( [
//     new THREE.Vector3( 0, 0, 0 ),
//     new THREE.Vector3( 30, 0, 0 ),
//     new THREE.Vector3( 10, 0, 5 ),
//     new THREE.Vector3( 10, 0, 7 ),
//     new THREE.Vector3( 20, 0, 12 ),
//     new THREE.Vector3( 20, 0, 24 ),
//     new THREE.Vector3( 15, 0, 28 ),
//     new THREE.Vector3( 5, 0, 35 )
//   ] );
//   return curve;
// }

export function createA3Cruve(width, height) {

  const curve = new THREE.CurvePath();
  const d = width / 2 / 10;
  const h = height / 10;


  curve.add(new THREE.LineCurve3(
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(10*d, 0, 0)
    ));
    
  curve.add(new THREE.LineCurve3(
    new THREE.Vector3(10*d, 0, 0),
    new THREE.Vector3(3*d, 0, h)
  ));

  curve.add(new THREE.LineCurve3(
    new THREE.Vector3(3*d, 0, h),
    new THREE.Vector3(3*d, 0, 2*h)
  ));

  curve.add(new THREE.CatmullRomCurve3([
    new THREE.Vector3(3*d, 0, 2*h),
    new THREE.Vector3(6*d, 0, 3*h),
    new THREE.Vector3(6*d, 0, 7*h),
    new THREE.Vector3(4*d, 0, 8*h),
    new THREE.Vector3(d, 0, 9*h)
  ]));

  return curve;
}

// export function rotationSplines(baseSpline, splineCount) {

//   const splines = [];

//   for (let i = 0; i < splineCount + 1; i++) {

//     const theta = FULL_ROTATION / splineCount;
//     // clonar
//     const points = [];

//     for (const p of baseSpline.points) {
//         const point = p.clone().applyAxisAngle(Z_AXIS, theta * i);
//         points.push(point);
//     }

//     const spline = new THREE.CatmullRomCurve3(points, true);
//     splines.push(spline);
// }
// return splines;
// }

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

  // It's also sometimes written as:
  // return a + ((b - a) * t);
  // ... which might be easier to read for some people.
  // The two are mathematically equivalent.
}