import * as THREE from '../libs/three.module.js';
import {lerp} from '../utils/utils.js';

const MOVEMENT_SPEED = 1;
const ROTATION_SPEED = 0.01;
const DISTANCE_TO_SHELF = 15;

export class Shelving { 

    constructor(position = new THREE.Vector3(-100, 0, 0)) {
        this.object = this.createShelving();
        this.object.position.copy(position);
        this.object.rotation.y = Math.PI /2;
    }


    createShelving() {
        const structure = new THREE.Group();

        const height = 100;
        const width = 250;
        const depth = 30;

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
                col.position.z = lerp(- (depth/2 - 1), (depth/2 - 1), i / (colRows-1));
                col.position.x = lerp(-(width/2 - 1), (width/2 - 1), j / (colPerRow-1));
                col.position.y = height/2;
                structure.add(col); 
            }
        }

        for(let i = 0; i < shelfLevels; i++) {
            const shelf = new THREE.Mesh(shelfGeometry, shelfMaterial);
            shelf.position.y = lerp(0, height, (i+1)/(shelfLevels+1));
            structure.add(shelf); 
        }

        this.slots = []
        for(let i = 0; i < shelfLevels; i++) {
            const levelSlots = [];
            for(let j = 0; j < colRows - 1; j++) {
                const depthSlots = [];
                for(let k = 0; k < colPerRow - 1; k++) {
                    const group = new THREE.Group();
                    group.position.y = lerp(0, height, (i+1)/(shelfLevels+1));
                    group.position.z = lerp(- (depth/2 - 1), (depth/2 - 1), j / (colRows-1));
                    group.position.x = lerp(-(width/2 - 1), (width/2 - 1), k / (colPerRow-1));
                    
                    const centerPos = new THREE.Vector3(
                        (width/(colPerRow - 1))/ 2,
                        0,
                        (depth/(colRows - 1))/2
                    );

                    structure.add(group);
                    
                    depthSlots.push({group: group, empty: true, centerPos: centerPos, getWorldPos: () => group.localToWorld(centerPos.clone())});
                }
                levelSlots.push(depthSlots);
            }
            this.slots.push(levelSlots);
        }

        return structure;
    }

    dropPiece(piece, liftPosition) {
      let nearestSlot = this.nearestSlot(liftPosition);

      if (nearestSlot.distance < DISTANCE_TO_SHELF && nearestSlot.slot.empty) {
        piece.position.copy(nearestSlot.slot.centerPos);
        nearestSlot.slot.group.add(piece);
        return true;
      }
      return false;
    }

    nearestSlot(position) {
      const min = this.slots
        .flat(2)
        .reduce((p, c) => position.distanceTo(p.getWorldPos()) > position.distanceTo(c.getWorldPos()) ? c : p)
        ;
      return {slot: min, distance: position.distanceTo(min.getWorldPos())};
    }
}