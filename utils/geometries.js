import * as THREE from '../libs/three.module.js';

export const shapes = {
    B1: {
        getSpline: (width, height) => createB1Curve(width),
        type: 'EXTRUSION',
    },
    B2: {
        getSpline: (width, height) => createB2Curve(width),
        type: 'EXTRUSION',
    },
    B3: {
        getSpline: (width, height) => createB3Curve(width),
        type: 'EXTRUSION',
    },
    B4: {
        getSpline: (width, height) => createB4Curve(width),
        type: 'EXTRUSION',
    },
    A1: {
        getSpline: (width, height) => createA1Cruve(width, height),
        type: 'ROTATION',
    },
    A2: {
        getSpline: (width, height) => createA2Cruve(width, height),
        type: 'ROTATION',
    },
    A3: {
        getSpline: (width, height) => createA3Cruve(width, height),
        type: 'ROTATION',
    },
    A4: {
        getSpline: (width, height) => createA4Cruve(width, height),
        type: 'ROTATION',
    },
}

const Z_AXIS = new THREE.Vector3(0, 0, 1);
const FULL_ROTATION = Math.PI * 2;

export class GeneratedGeometry extends THREE.BufferGeometry {

    constructor(shapeName = 'B2', height = 25, width = 25, theta = 0, resolution = 180, progress=1) {

        super();

        const shape = shapes[shapeName];

        let sampleCount;
        let splineProgres = 1;
        let sampleProgres = 1;

        let pointTransformation;
        let getUVValue;

        let spline = shape.getSpline(width, height);

        if (shape.type === 'EXTRUSION') {
            const offset = height / resolution;
            const delta = theta / resolution;
            
            sampleCount = resolution * 5;
            splineProgres = progress;
            
            pointTransformation = p => p.applyAxisAngle(Z_AXIS, delta).add(new THREE.Vector3(0, 0, offset));
            getUVValue = (indexInSpline, splineNumber) => [/*u*/indexInSpline, /*v*/ splineNumber];
        }
        else if (shape.type === 'ROTATION') {
            const theta = FULL_ROTATION / resolution;
            
            sampleCount = resolution;
            sampleProgres = progress;

            pointTransformation = p => p.applyAxisAngle(Z_AXIS, theta);
            getUVValue = (indexInSpline, splineNumber) => [/*u*/splineNumber, /*v*/ indexInSpline];
        }

        const { positions, indices, uvs } = geometryPositionsFromSplines(spline, resolution, sampleCount, pointTransformation, getUVValue, splineProgres, sampleProgres);
        const normals = normalFromPosition(positions, 3);

        this.setIndex(indices);
        this.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
        this.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));

        // TODO(nacho): porque¿?¿?¿
        this.computeBoundingSphere();
    }
}

function geometryPositionsFromSplines(spline, splineCount, samplesCount, pointTransformation, getUVValue, splineProgres=1, sampleProgres=1, nc = 3) {
    // nc == numero de componentes de los vectores de postion

    // s2: -–-----s21-------s22

    // s1: -–-----s11-------s12

    const numVertices = samplesCount * splineCount * 4; // 4 porque usamos indices para no repetir

    const positions = new Float32Array(numVertices * nc);
    const uvs = new Float32Array(numVertices * 2);
    const indices = [];

    let posNdx = 0;
    let uvsNdx = 0;
    let ndx = 0;

    let points = [];
    let nextPoints = [];

    const effectiveSampleCount = Math.floor(samplesCount * sampleProgres);
    const effectiveSplineCount = Math.floor(splineCount * splineProgres);

    for (let i = 0; i <= effectiveSampleCount; i++) {
        let point = spline.getPoint(i / samplesCount);
        if (point.isVector2) {
            point = new THREE.Vector3(point.x, point.y, 0);
        }
        nextPoints.push(point);
    }

    for (let k = 0; k < effectiveSplineCount; k++) {

        points = nextPoints;
        nextPoints = [];

        for (let i = 0; i <= effectiveSampleCount; i++) {
            nextPoints.push(pointTransformation(points[i].clone()));
        }

        for (let i = 0; i < effectiveSampleCount; i++) {

            const s11 = points[i];
            const s12 = points[i + 1];
            const s21 = nextPoints[i];
            const s22 = nextPoints[i + 1];

            positions.set(s11.toArray(), posNdx); posNdx += nc;
            positions.set(s12.toArray(), posNdx); posNdx += nc;
            positions.set(s21.toArray(), posNdx); posNdx += nc;
            positions.set(s22.toArray(), posNdx); posNdx += nc;

            uvs.set(getUVValue(i/samplesCount       , k/splineCount)      , uvsNdx); uvsNdx += 2;
            uvs.set(getUVValue((i+1)/samplesCount   , k/splineCount)      , uvsNdx); uvsNdx += 2;
            uvs.set(getUVValue(i/samplesCount       , (k+1)/splineCount)  , uvsNdx); uvsNdx += 2;
            uvs.set(getUVValue((i+1)/samplesCount   , (k+1)/splineCount)  , uvsNdx); uvsNdx += 2;

            indices.push(
                ndx, ndx + 1, ndx + 2,
                ndx + 2, ndx + 1, ndx + 3,
            );
            ndx += 4;
        }
    }

    return { positions, indices, uvs };
}

function normalFromPosition(position, nc = 3) {
    // nc == numero de componentes de los vectores de postion

    const normal = new Float32Array(position.length);
    // Calculo de las normales de cada vértice de cada triangulo
    const pA = new THREE.Vector3();
    const pB = new THREE.Vector3();
    const pC = new THREE.Vector3();

    const np = 4
    // np = cantidad de puntos que conforman un cuadrado

    for (let i = 0; i < position.length; i += (nc * np)) {
        // normales de cara plana
        pA.fromArray(position, i + (0 * nc));
        pB.fromArray(position, i + (1 * nc));
        pC.fromArray(position, i + (2 * nc));

        pC.sub(pB);
        pA.sub(pB);
        pC.cross(pA);
        pC.normalize();

        pC.toArray(normal, i + (0 * nc));
        pC.toArray(normal, i + (1 * nc));
        pC.toArray(normal, i + (2 * nc));
        pC.toArray(normal, i + (3 * nc));
    }

    return normal;
}

function createB1Curve(width, n = 3) {

    const points = []

    for (let i = 0; i < n; i++) {
        const l = width / 2;
        const a = 2 * i / n * Math.PI;
        points.push(new THREE.Vector2(Math.cos(a) * l, Math.sin(a) * l));
    }
    const curve = new THREE.Shape(points);
    curve.closePath();
    return curve;
}

function createB2Curve(width, n = 7) {

    const points = []

    for (let i = 0; i < n * 2; i++) {
        const l = i % 2 == 0 ? 3 * width / 4 : width / 2;
        const a = i / n * Math.PI;
        points.push(new THREE.Vector3(Math.cos(a) * l, Math.sin(a) * l, 0));
    }

    return new THREE.CatmullRomCurve3(points, true);
}

function createB3Curve(width) {

    const d = width / 13;

    const curve = new THREE.Path();

    curve.moveTo(-3 * d, -2 * d);
    curve.lineTo(-6 * d, -2 * d);
    curve.splineThru([
        new THREE.Vector2(-6 * d, -2 * d),
        new THREE.Vector2(-6 * d, -6 * d),
        new THREE.Vector2(-2 * d, -6 * d),
    ]);
    curve.lineTo(-2 * d, -3 * d);
    curve.lineTo(2 * d, -3 * d);
    curve.lineTo(2 * d, -6 * d);
    curve.splineThru([
        new THREE.Vector2(2 * d, -6 * d),
        new THREE.Vector2(6 * d, -6 * d),
        new THREE.Vector2(6 * d, -2 * d),
    ]);
    curve.lineTo(3 * d, -2 * d);
    curve.lineTo(3 * d, 2 * d);
    curve.lineTo(6 * d, 2 * d);
    curve.splineThru([
        new THREE.Vector2(6 * d, 2 * d),
        new THREE.Vector2(6 * d, 6 * d),
        new THREE.Vector2(2 * d, 6 * d),
    ]);
    curve.lineTo(2 * d, 3 * d);
    curve.lineTo(-2 * d, 3 * d);
    curve.lineTo(-2 * d, 6 * d);
    curve.splineThru([
        new THREE.Vector2(-2 * d, 6 * d),
        new THREE.Vector2(-6 * d, 6 * d),
        new THREE.Vector2(-6 * d, 2 * d),
    ]);
    curve.lineTo(-3 * d, 2 * d);
    curve.closePath();

    return curve;
}

function createB4Curve(width) {

    const d = width / 11;

    const curve = new THREE.Path();

    curve.moveTo(-d, -4 * d);
    curve.absarc(
        0, -4 * d,
        d,
        Math.PI, 0
    );
    curve.lineTo(d, 4 * d);
    curve.absarc(
        0, 4 * d,
        d,
        0, Math.PI
    );
    curve.closePath();

    return curve;
}

function createA1Cruve(width, height) {

    const curve = new THREE.Path();
    const d = width / 2 / 10;
    const h = height / 10;

    curve.add(new THREE.LineCurve3(
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(8 * d, 0, 0)
    ));

    curve.add(new THREE.LineCurve3(
        new THREE.Vector3(8 * d, 0, 0),
        new THREE.Vector3(8 * d, 0, 2 * h)
    ));

    curve.add(new THREE.LineCurve3(
        new THREE.Vector3(8 * d, 0, 2 * h),
        new THREE.Vector3(2*d, 0, 2.5 * h)
    ));


    curve.add(new THREE.CubicBezierCurve3(
        new THREE.Vector3(2*d, 0, 2.5 * h),
        new THREE.Vector3(7*d, 0, 2.5 * h),
        new THREE.Vector3(7*d, 0, 7.5 * h),
        new THREE.Vector3(2*d, 0, 7.5 * h)
    ));

    curve.add(new THREE.LineCurve3(
        new THREE.Vector3(2*d, 0, 7.5 * h),
        new THREE.Vector3(8 * d, 0, 8 * h)
    ));

    curve.add(new THREE.LineCurve3(
        new THREE.Vector3(8 * d, 0, 8 * h),
        new THREE.Vector3(8 * d, 0, 10 * h),
    ));

    curve.add(new THREE.LineCurve3(
        new THREE.Vector3(8 * d, 0, 10 * h),
        new THREE.Vector3(0, 0, 10 * h)
    ));

    return curve;
}

function createA2Cruve(width, height) {

    const curve = new THREE.CurvePath();
    const d = width / 2 / 10;
    const h = height / 8;

    curve.add(new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(4 * d, 0, 0),
        new THREE.Vector3(5 * d, 0, h),
        new THREE.Vector3(3 * d, 0, 5 * h),
        new THREE.Vector3(5 * d, 0, 7 * h),
        new THREE.Vector3(4 * d, 0, 7.5 * h),
        new THREE.Vector3(3.8 * d, 0, 8 * h)
    ]));

    return curve;
}

function createA3Cruve(width, height) {

    const curve = new THREE.CurvePath();
    const d = width / 2 / 10;
    const h = height / 9;


    curve.add(new THREE.LineCurve3(
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(10 * d, 0, 0)
    ));

    curve.add(new THREE.LineCurve3(
        new THREE.Vector3(10 * d, 0, 0),
        new THREE.Vector3(3 * d, 0, h)
    ));

    curve.add(new THREE.LineCurve3(
        new THREE.Vector3(3 * d, 0, h),
        new THREE.Vector3(3 * d, 0, 2 * h)
    ));

    curve.add(new THREE.CatmullRomCurve3([
        new THREE.Vector3(3 * d, 0, 2 * h),
        new THREE.Vector3(6 * d, 0, 3 * h),
        new THREE.Vector3(6 * d, 0, 7 * h),
        new THREE.Vector3(4 * d, 0, 8 * h),
        new THREE.Vector3(d, 0, 9 * h)
    ]));

    return curve;
}

function createA4Cruve(width, height) {

    const curve = new THREE.CurvePath();
    const d = width / 2 / 10;
    const h = height / 7.3;

    curve.add(new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(5 * d, 0, 0),
        new THREE.Vector3(6 * d, 0, 0.5 * h),
        new THREE.Vector3(6 * d, 0, 1.5 * h),
        new THREE.Vector3(5 * d, 0, 2 * h),
        new THREE.Vector3(3 * d, 0, 2.2 * h),
        new THREE.Vector3(2.8 * d, 0, 2.6* h),
        new THREE.Vector3(5 * d, 0, 3.5 * h),
        new THREE.Vector3(8 * d, 0, 4 * h),
    ]));
    
    curve.add(new THREE.CatmullRomCurve3([
        new THREE.Vector3(8 * d, 0, 4 * h),
        new THREE.Vector3(4 * d, 0, 4.3 * h),
        new THREE.Vector3(3* d, 0, 6.5 * h),
        new THREE.Vector3(2.5* d, 0, 7 * h),
        new THREE.Vector3(0, 0, 7.3 * h),
    ]));

    return curve;
}
