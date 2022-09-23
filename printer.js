import * as THREE from '../build/three.module.js';


export class Forklift {
    
    constructor(position = new THREE.Vector3(-25, 0 ,0)) {
        this.position = position;
        this.printer = this.createPrinter();
        this.liftPosition = 0;
        this.geometry;
    }

    createLift(spacing, liftPosition) {
        const structure = new THREE.Group();

        const height = 75;
        const acrossCount = 5;

        const columnMaterial    = new THREE.MeshLambertMaterial({ color: 0xEEEEEE });
        const acrossMaterial    = new THREE.MeshLambertMaterial({ color: 0x00EEEE });
        const liftMaterial      = new THREE.MeshLambertMaterial({ color: 0x44FF77 });

        const columnGeometry    = new THREE.BoxBufferGeometry(5, height, 5);
        const liftGeometry      = new THREE.BoxBufferGeometry(spacing*2, 0.5, spacing*2);
        const acrossGeometry    = new THREE.BoxBufferGeometry(2, 2, spacing*2);

        const column1 = new THREE.Mesh(columnGeometry, columnMaterial);
        column1.position.z = - spacing;
        column1.position.y = height / 2;
        structure.add(column1);
        
        const column2 = new THREE.Mesh(columnGeometry, columnMaterial);
        column2.position.z = spacing;
        column2.position.y = height / 2;
        structure.add(column2);

        for(let i = 0; i <= acrossCount; i++) {
            const across = new THREE.Mesh(acrossGeometry, acrossMaterial);
            across.position.y = lerp(1, height-1, i/acrossCount);

            structure.add(across); 
        }

        this.lift = new THREE.Mesh(liftGeometry, liftMaterial);
        this.lift.position.x = spacing;
        this.lift.position.y = lerp(0, height, liftPosition);
        structure.add(this.lift);

        return structure;
    }


    createPrinter() {
        const printer = new THREE.Group();

        const geometry = new THREE.CylinderGeometry( 5, 5, 40, 32 );
        const material = new THREE.MeshLambertMaterial({ color: 0xe6d3c3 });
        const printerBase = new THREE.Mesh(geometry, material);
        printerBase.position.x = this.position.x;
        printerBase.position.y = this.position.y;
        printerBase.position.z = this.position.z;
        printer.add(printerBase)

        // const backWheel = this.createWheels();
        // backWheel.rotation.x = Math.PI/2;
        // backWheel.position.y = 6;
        // backWheel.position.x = -18;
        // car.add(backWheel);
        
        // const frontWheel = this.createWheels();
        // frontWheel.rotation.x = Math.PI/2;
        // frontWheel.position.y = 6;  
        // frontWheel.position.x = 18;
        // car.add(frontWheel);
        
        // const lift = this.createLift(width/2, 0.25);
        // lift.position.y = 12 - 15/2;  
        // lift.position.x = 30;
        // car.add(lift);
      
        // const main = new THREE.Mesh(
        //   new THREE.BoxBufferGeometry(60, 15, 30),
        //   new THREE.MeshLambertMaterial({ color: 0x78b14b })
        // );
        // main.position.y = 12;
        // car.add(main);
      
        // const cabin = new THREE.Mesh(
        //   new THREE.BoxBufferGeometry(33, 12, 24),
        //   new THREE.MeshLambertMaterial({ color: 0xffffff })
        // );
        // cabin.position.x = -6;
        // cabin.position.y = 25.5;
        // car.add(cabin);
      
        return printer;
    }

//     foward() {
//         this.speed += MOVEMENT_SPEED;
//     }

//     backward() {
//         this.speed -= MOVEMENT_SPEED;
//     }

//     right() {
//         this.angle -= ROTATION_SPEED;
//     }

//     left() {
//         this.angle += ROTATION_SPEED;
//     }

//     up() {
//         this.liftPosition += 1;
//     }

//     down() {
//         this.liftPosition -= 1;
//     }

//     updateCar() {
//         if(this.speed != 0) this.car.translateX(this.speed);
//         if(this.angle != 0) this.car.rotateY(this.angle);    
//         if(this.lift && this.liftPosition != 0) this.lift.translateY(this.liftPosition);
//     }
// }

// function lerp(a, b, t) {
//     return (a * (1.0 - t)) + (b * t);

    // It's also sometimes written as:
    // return a + ((b - a) * t);
    // ... which might be easier to read for some people.
    // The two are mathematically equivalent.
}