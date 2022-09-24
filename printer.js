import * as THREE from '../build/three.module.js';


export class Printer {
    
    constructor(position = new THREE.Vector3(100, 0 ,0)) {
        this.position = position;
        this.printer = this.createPrinter();
        this.liftPosition = 0;
        this.geometry;
    }

    createLiftHead(columnPosition) {
      const liftHead = new THREE.Group();
      const acrossMaterial    = new THREE.MeshLambertMaterial({ color: 0x266594 });
      const liftMaterial      = new THREE.MeshLambertMaterial({ color: 0x5EDF60 });

      const first_cube      = new THREE.BoxGeometry(5, 5, 5);
      const columnPiece = new THREE.Mesh( first_cube, liftMaterial );
      columnPiece.position.x = columnPosition.x;
      columnPiece.position.y = columnPosition.y;
      
      liftHead.add(columnPiece);

      const across_bar      = new THREE.BoxGeometry(15, 4, 5);
      const acrossPiece = new THREE.Mesh( across_bar, acrossMaterial );
      acrossPiece.position.x = columnPosition.x - 10;
      acrossPiece.position.y = columnPosition.y;
      liftHead.add(acrossPiece);

      const lift_cube      = new THREE.BoxGeometry(5, 5, 10);
      const liftHeadCube = new THREE.Mesh( lift_cube, liftMaterial );
      liftHeadCube.position.x = acrossPiece.position.x - 15/2;
      liftHeadCube.position.y = columnPosition.y;
      liftHead.add(liftHeadCube);

      const lift      = new THREE.BoxGeometry(30, 1, 30);
      const liftPlain = new THREE.Mesh( lift, liftMaterial );
      liftPlain.position.x = liftHeadCube.position.x;
      liftPlain.position.y = liftHeadCube.position.y - 5/2;
      liftHead.add(liftPlain);

      return liftHead;
    }

    createLift(printer_radius, printer_height, printerBasePosition) {
        const structure = new THREE.Group();

        const height = 75;

        const columnMaterial    = new THREE.MeshLambertMaterial({ color: 0xE6D3C3 });
        const columnGeometry    = new THREE.CylinderGeometry(2, 2, height, 32);
        const column = new THREE.Mesh(columnGeometry, columnMaterial);
        column.position.x = printer_radius / 2 + 5/2;
        column.position.y = printer_height + printerBasePosition.y;

        structure.add(column);

        const head = this.createLiftHead(column.position);
        structure.add(head);

        return structure;
    }

    createPrinter() {
        const printer = new THREE.Group();
        const printer_height = 30;
        const printer_radius = 30;
        const geometry = new THREE.CylinderGeometry( printer_radius, printer_radius, printer_height, 32 );
        const material = new THREE.MeshLambertMaterial({ color: 0xE6D3C3 });
        const printerBase = new THREE.Mesh(geometry, material);
     
        printerBase.position.y = printer_height/2;
        
        printer.add(printerBase)

        
        const lift = this.createLift(printer_radius, printer_height, printerBase.position);
        printer.add(lift);

        printer.position.x = this.position.x;
        printer.position.y = this.position.y;
        printer.position.z = this.position.z;
      
        return printer;
    }

    up() {
        this.liftPosition += 1;
    }

    down() {
        this.liftPosition -= 1;
    }

    updatePrinter() {
        if(this.lift && this.liftPosition != 0) this.lift.translateY(this.liftPosition);
    }
}

function lerp(a, b, t) {
    return (a * (1.0 - t)) + (b * t);
    
    // It's also sometimes written as:
    // return a + ((b - a) * t);
    // ... which might be easier to read for some people.
    // The two are mathematically equivalent.
}