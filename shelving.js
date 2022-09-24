import * as THREE from '../build/three.module.js';
import {lerp} from './utils.js';

const MOVEMENT_SPEED = 1;
const ROTATION_SPEED = 0.01;

export class Shelving { 

    constructor(position = new THREE.Vector3(-100, 0, 125)) {
        this.object = this.createShelving();
        this.object.position.copy(position);
        this.object.rotation.y = Math.PI /2;
    }


    createShelving() {
        const structure = new THREE.Group();

        const height = 100;
        const width = 250;
        const depth = 50;

        const colRows = 2;
        const colPerRow = 9;
        const shelfLevels = 2;

        const columnMaterial    = new THREE.MeshLambertMaterial({ color: 0xEEEEEE });
        const shelfMaterial    = new THREE.MeshLambertMaterial({ color: 0x00EEEE });

        const columnGeometry    = new THREE.BoxBufferGeometry(1, height, 1);
        const shelfGeometry    = new THREE.BoxBufferGeometry(width, 1, depth);

        for(let i = 0; i < colRows; i++) {
            for(let j = 0; j < colPerRow; j++) {
                const col = new THREE.Mesh(columnGeometry, columnMaterial);
                col.position.z = lerp(1, depth - 1, i / (colRows-1));
                col.position.x = lerp(1, width - 1, j / (colPerRow-1));
                col.position.y = height/2;
                structure.add(col); 
            }
        }

        for(let i = 0; i < shelfLevels; i++) {
            const shelf = new THREE.Mesh(shelfGeometry, shelfMaterial);
            shelf.position.y = lerp(0, height, (i+1)/(shelfLevels+1));
            shelf.position.x = width / 2; 
            shelf.position.z = depth / 2; 
            structure.add(shelf); 
        }

        // this.lift = new THREE.Mesh(liftGeometry, liftMaterial);
        // this.lift.position.x = spacing;
        // this.lift.position.y = lerp(0, height, liftPosition);
        // structure.add(this.lift);

        return structure;
    }
}