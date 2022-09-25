import * as THREE from '../build/three.module.js';
import { setMaterials } from './utils.js'
import { GeneratedGeometry } from './geometries.js'

export class Printer {
    
    constructor(position = new THREE.Vector3(100, 0, 0), printerRadius = 30, printerHeight = 30, maxPieceHeight = 50, steps=3) {
        this.position = position;
        this.printerRadius = printerRadius;
        this.printerHeight = printerHeight;
        this.maxPieceHeight = maxPieceHeight;
        this.steps = steps;
        this.liftHeight = this.printerHeight + 5;
        this.heightInterval = this.maxPieceHeight / this.steps;
        this.printer = this.createPrinter();
        this.materials = setMaterials();
        this.printing = false;
        this.liftHead;
        this.piece;
        this.piecePosition = new THREE.Vector3();
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
      liftHead.add(liftPlain);

      return liftHead;
    }

    createLift(printerBasePosition) {
        const structure = new THREE.Group();

        const height = this.maxPieceHeight * 2;

        const columnMaterial    = new THREE.MeshLambertMaterial({ color: 0xE6D3C3 });
        const columnGeometry    = new THREE.CylinderGeometry(2, 2, height, 32);
        const column = new THREE.Mesh(columnGeometry, columnMaterial);
        column.position.x = this.printerRadius - 5;
        column.position.y = this.printerHeight + height / 2;

        structure.add(column);

        this.liftHead = this.createLiftHead(column.position);
        this.resetLift();
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

        printer.position.copy(this.position);
      
        return printer;
    }

      renderPiece(geometryController) {

        this.resetLift();
        this.printer.remove(this.piece);
        if (this.printing) return;
        this.printing = true;
        for (let i = 1; i <= this.steps; i++) {
          setTimeout(() => { 
            this.animationFrame(geometryController, i * this.heightInterval);
          }, i * 500);      
        }
        this.printing = false;
    }

    animationFrame(geometryController, height) {
      this.removePiece();
      this.upLiftHead();
      this.renderGeometry(geometryController, height);
    }

    upLiftHead() {
      if(this.liftHead.position.y < this.maxPieceHeight + this.liftHeight) {
        this.liftHead.translateY((this.heightInterval + 2));
      }
    }

    resetLift(){
      this.liftHead.position.y = this.liftHeight;
    }

    removePiece(){
      if (this.piece !== undefined) this.printer.remove(this.piece);
    }

    takePiece() {
      return this.piece;
    }

    renderGeometry(geometryController, height) {      
      const geometry = new GeneratedGeometry(geometryController.geometryCode, height, geometryController.geometryRotation, Math.round(geometryController.geometryResolution));
      
      this.piece = new THREE.Mesh( geometry, this.materials[ geometryController.geometryMaterial ] );
      this.piece.position.y = this.printerHeight + height;
      this.piece.rotateX(Math.PI / 2);
      this.printer.add(this.piece);
      this.setPiecePosition(height);
  }

  setPiecePosition() {
      this.piece.getWorldPosition(this.piecePosition);
      this.piecePosition.y = this.piecePosition.y - this.printerHeight;
  }
  
}