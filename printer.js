import * as THREE from '../build/three.module.js';
import { setMaterials } from './utils.js'
import { GeneratedGeometry } from './geometries.js'

export class Printer {
    
    constructor(position = new THREE.Vector3(100, 0 ,0), printerRadius = 30, printerHeight = 30) {
        this.position = position;
        this.printerRadius = printerRadius;
        this.printerHeight = printerHeight;
        this.printer = this.createPrinter();
        this.liftPosition = 0;
        this.materials = setMaterials();
        this.printing = false;
        this.liftHead;
        this.piece;
    }

    createLiftHead(columnPosition) {
      const liftHead = new THREE.Group();
      const acrossMaterial    = new THREE.MeshLambertMaterial({ color: 0x266594 });
      const liftMaterial      = new THREE.MeshLambertMaterial({ color: 0x5EDF60 });

      const cube_size = 5;
      const first_cube      = new THREE.BoxGeometry(cube_size, cube_size, cube_size);
      const columnPiece = new THREE.Mesh( first_cube, liftMaterial );
      columnPiece.position.x = columnPosition.x;
      
      liftHead.add(columnPiece);

      const across_bar_length = 20;
      const across_bar      = new THREE.BoxGeometry(across_bar_length, 4, cube_size);
      const acrossPiece = new THREE.Mesh( across_bar, acrossMaterial );
      acrossPiece.position.x = columnPosition.x - across_bar_length / 2 - cube_size/2;

      liftHead.add(acrossPiece);

      const lift_cube      = new THREE.BoxGeometry(cube_size, cube_size, 10);
      const liftHeadCube = new THREE.Mesh( lift_cube, liftMaterial );
      liftHeadCube.position.x = acrossPiece.position.x - across_bar_length/2 - cube_size/2;

      liftHead.add(liftHeadCube);

      const lift      = new THREE.BoxGeometry(30, 1, 30);
      const liftPlain = new THREE.Mesh( lift, liftMaterial );
      liftPlain.position.x = liftHeadCube.position.x;
      liftPlain.position.y = liftHeadCube.position.y - cube_size/2;
      liftHead.add(liftPlain);

      return liftHead;
    }

    createLift(printerBasePosition) {
        const structure = new THREE.Group();

        const height = 100;

        const columnMaterial    = new THREE.MeshLambertMaterial({ color: 0xE6D3C3 });
        const columnGeometry    = new THREE.CylinderGeometry(2, 2, height, 32);
        const column = new THREE.Mesh(columnGeometry, columnMaterial);
        column.position.x = this.printerRadius - 5;
        column.position.y = this.printerHeight + printerBasePosition.y;

        structure.add(column);

        this.liftHead = this.createLiftHead(column.position);
        this.liftHead.position.y = this.printerHeight * 1.5;
        structure.add(this.liftHead);

        return structure;
    }

    createPrinter() {
        const printer = new THREE.Group();

        const geometry = new THREE.CylinderGeometry( this.printerRadius, this.printerRadius, this.printerHeight, 32);
        const material = new THREE.MeshLambertMaterial({ color: 0xE6D3C3 });
        const printerBase = new THREE.Mesh(geometry, material);
     
        printerBase.position.y = this.printerHeight/2;
        
        printer.add(printerBase)

        const lift = this.createLift(printerBase.position);
        printer.add(lift);

        printer.position.x = this.position.x;
        printer.position.y = this.position.y;
        printer.position.z = this.position.z;
      
        return printer;
    }

  //   renderPiece(geometryController) {
  //     const maxHeight = 50;
  //     const heightInterval = maxHeight / 10;
  //     this.liftHead.position.y = this.printerHeight * 1.5;
  //     this.printer.remove(this.piece);
  //     if (this.printing) return;
  //     this.printing = true;
  //     for (let i = 0; i < 10; i++) {
  //         setTimeout(() => { 
  //           if (this.piece !== undefined) this.printer.remove(this.piece);
  //           let height = maxHeight / (10 - i);
  //           this.liftHead.translateY(heightInterval/2);
  //           this.renderGeometry(geometryController, height);
  //          }, 3000);  
  //     }
  //     this.printing = false;
  // }

      renderPiece(geometryController) {
        const maxHeight = 50;
        const heightInterval = maxHeight / 3;
        this.liftHead.position.y = this.printerHeight * 1.5;
        this.printer.remove(this.piece);
        if (this.printing) return;
        this.printing = true;

        setTimeout(() => { 
          if (this.piece !== undefined) this.printer.remove(this.piece);
          this.liftHead.translateY(heightInterval/2);
          this.renderGeometry(geometryController, maxHeight / 3);
        }, 1000);
        setTimeout(() => { 
          if (this.piece !== undefined) this.printer.remove(this.piece);
          this.liftHead.translateY(heightInterval/2);
          this.renderGeometry(geometryController, maxHeight / 2);
        }, 2000);
        setTimeout(() => { 
          if (this.piece !== undefined) this.printer.remove(this.piece);
          this.liftHead.translateY(heightInterval/2);
          this.renderGeometry(geometryController, maxHeight);
        }, 3000);

        this.printing = false;
    }


    renderGeometry(geometryController, height) {      
      const geometry = new GeneratedGeometry(geometryController.geometryCode, height, geometryController.geometryRotation, Math.round(geometryController.geometryResolution));
      
      this.piece = new THREE.Mesh( geometry, this.materials[ geometryController.geometryMaterial ] );
      this.piece.position.y = this.printerHeight + height/2;
      this.piece.rotateX(Math.PI / 2);
      
      this.printer.add(this.piece);
  }
  
}