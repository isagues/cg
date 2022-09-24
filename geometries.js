import * as THREE from '../build/three.module.js';
import { createB1Curve, createB2Curve, createB3Curve, createA3Cruve} from './utils.js'


export const shapes = {
    B1: {
        spline: createB1Curve(25),
        type: 'EXTRUSION',
    },
    B2: {
        spline: createB2Curve(25),
        type: 'EXTRUSION',
    },
    B3: {
        spline: createB3Curve(25),
        type: 'EXTRUSION',
    },
    A3: {
        spline: createA3Cruve(25, 30),
        type: 'ROTATION',
    },
}

const Z_AXIS = new THREE.Vector3(0, 0, 1);
const FULL_ROTATION = Math.PI * 2;

export class GeneratedGeometry extends THREE.BufferGeometry {

    constructor(shapeName = 'B2', height = 25, theta = 0, resolution = 180) {

        super();

        const shape = shapes[shapeName];

        let splines, sampleCount;

        let pointTransformation;

        if(shape.type === 'EXTRUSION') {
            const offset = height / resolution;
            const delta =  theta / resolution;
            sampleCount = resolution * 5;
            pointTransformation = p => p.applyAxisAngle(Z_AXIS, delta).add(new THREE.Vector3(0, 0, offset));
        } 
        else if(shape.type === 'ROTATION') {
            const theta = FULL_ROTATION / resolution;
            sampleCount = resolution;
            pointTransformation = p => p.applyAxisAngle(Z_AXIS, theta);
        }

        const {positions, indices} = geometryPositionsFromSplines(shape.spline, resolution, sampleCount, pointTransformation);
        const normals = normalFromPosition(positions, 3);

        // this.setIndex( new BufferAttribute( indices, 1 ) );
        this.setIndex(indices);
		this.setAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
		this.setAttribute( 'normal', new THREE.BufferAttribute( normals, 3 ) );
		// this.setAttribute( 'uv', new BufferAttribute( uvs, 2 ) );

        // TODO(nacho): porque¿?¿?¿
        this.computeBoundingSphere();
    }
}

function geometryPositionsFromSplines(spline, splineCount, samplesCount, pointTransformation, nc=3) {
    // nc == numero de componentes de los vectores de postion

    // s2: -–-----s21-------s22

    // s1: -–-----s11-------s12

    const numVertices = samplesCount * splineCount * 4; // 4 porque usamos indices para no repetir

    const positions = new Float32Array(numVertices * nc);
    const indices = [];

    let posNdx = 0;
    let ndx = 0;

    let points = [];
    let nextPoints = [];

    for(let i = 0; i <= samplesCount; i++) {
        let point = spline.getPoint(i / samplesCount);
        if(point.isVector2) {
            point = new THREE.Vector3(point.x, point.y, 0);
        }
        nextPoints.push(point);
    }

    for (let k = 0; k < splineCount; k++) {

        points = nextPoints;
        nextPoints = [];

        for(let i = 0; i <= samplesCount; i++) {
            nextPoints.push(pointTransformation(points[i].clone()));
        }

        for (let i = 0; i < samplesCount; i++) {

            const s11 = points[i];
            const s12 = points[i+1];
            const s21 = nextPoints[i];
            const s22 = nextPoints[i+1];
            
            positions.set(s11.toArray(), posNdx); posNdx += nc;
            positions.set(s12.toArray(), posNdx); posNdx += nc;
            positions.set(s21.toArray(), posNdx); posNdx += nc;
            positions.set(s22.toArray(), posNdx); posNdx += nc;

            indices.push(
                ndx, ndx + 1, ndx + 2,
                ndx + 2, ndx + 1, ndx + 3,
            );
            ndx += 4;
        }
    }

    return {positions, indices};
}

function normalFromPosition(position, nc=3) {
    // nc == numero de componentes de los vectores de postion

    const normal = new Float32Array(position.length);
    // Calculo de las normales de cada vértice de cada triangulo
    const pA = new THREE.Vector3();
    const pB = new THREE.Vector3();
    const pC = new THREE.Vector3();

    const np = 4
    // np = cantidad de puntos que conforman un cuadrado

    for (let i = 0; i < position.length; i+=(nc * np)) {
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