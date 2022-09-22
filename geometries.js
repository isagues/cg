import {
	BufferAttribute,
	BufferGeometry,
	Matrix4,
	Vector3,
	Vector4
} from '../build/three.module.js';

import { createRotationSpline, createStarSpline, extrutionSplines, rotationSplines, zip } from './utils.js'


const shapes = {
    B2: {
        spline: createStarSpline(7),
        type: 'EXTRUSION',
    },
    A3: {
        spline: createRotationSpline(),
        type: 'ROTATION',
    },
}


export class GeneratedGeometry extends BufferGeometry {

    constructor(shapeName = 'B2', height = 25, theta = 0, resolution = 180) {

        super();
        
        const shape = shapes[shapeName];

        let splines, sampleCount;

        if(shape.type === 'EXTRUSION') {
            const offset = height / resolution;
            const delta =  theta / resolution;
            splines = extrutionSplines(shape.spline, resolution, offset, delta);
            sampleCount = resolution * 5;
        } 
        else if(shape.type === 'ROTATION') {
            splines = rotationSplines(shape.spline, resolution);
            sampleCount = resolution;
        }

        const {positions, indices} = geometryPositionsFromSplines(splines, sampleCount);
        const normals = normalFromPosition(positions, 3);

        // this.setIndex( new BufferAttribute( indices, 1 ) );
        this.setIndex(indices);
		this.setAttribute( 'position', new BufferAttribute( positions, 3 ) );
		this.setAttribute( 'normal', new BufferAttribute( normals, 3 ) );
		// this.setAttribute( 'uv', new BufferAttribute( uvs, 2 ) );

        // TODO(nacho): porque¿?¿?¿
        this.computeBoundingSphere();
    }
}

function geometryPositionsFromSplines(splines, samplesCount, nc=3) {
    // nc == numero de componentes de los vectores de postion

    // s2: -–-----s21-------s22

    // s1: -–-----s11-------s12

    const numVertices = samplesCount * (splines.length - 1) * 4; // 4 porque usamos indices para no repetir
    
    const positions = new Float32Array(numVertices * nc);
    const indices = [];
    
    let posNdx = 0;
    let ndx = 0;

    for (const [s1, s2] of zip(splines, splines.slice(1))) {

        for (let i = 0; i < samplesCount; i++) {

            const t1 = i / samplesCount;
            const t2 = (i + 1) / samplesCount;

            const s11 = s1.getPoint(t1);
            const s12 = s1.getPoint(t2);
            const s21 = s2.getPoint(t1);
            const s22 = s2.getPoint(t2);

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
    const pA = new Vector3();
    const pB = new Vector3();
    const pC = new Vector3();

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