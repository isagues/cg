import * as THREE from '../build/three.module.js';

export class Forklift {
    
    constructor(position = new THREE.Vector3(0, 0 ,0)) {
        this.position = position;
        this.car = this.createCar();
    }
    
    createWheels() {
        const geometry = new THREE.CylinderGeometry( 5, 5, 40, 32 );
        const material = new THREE.MeshLambertMaterial({ color: 0x333333 });
        const wheel = new THREE.Mesh(geometry, material);
        return wheel;
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

        const lift = new THREE.Mesh(liftGeometry, liftMaterial);
        lift.position.x = spacing;
        lift.position.y = lerp(0, height, liftPosition);
        structure.add(lift);

        return structure;
    }

    createCar() {
        const car = new THREE.Group();
        
        const width = 30;

        const backWheel = this.createWheels();
        backWheel.rotation.x = Math.PI/2;
        backWheel.position.y = 6;
        backWheel.position.x = -18;
        car.add(backWheel);
        
        const frontWheel = this.createWheels();
        frontWheel.rotation.x = Math.PI/2;
        frontWheel.position.y = 6;  
        frontWheel.position.x = 18;
        car.add(frontWheel);
        
        const lift = this.createLift(width/2, 0.25);
        lift.position.y = 12 - 15/2;  
        lift.position.x = 30;
        car.add(lift);
      
        const main = new THREE.Mesh(
          new THREE.BoxBufferGeometry(60, 15, 30),
          new THREE.MeshLambertMaterial({ color: 0x78b14b })
        );
        main.position.y = 12;
        car.add(main);
      
        const cabin = new THREE.Mesh(
          new THREE.BoxBufferGeometry(33, 12, 24),
          new THREE.MeshLambertMaterial({ color: 0xffffff })
        );
        cabin.position.x = -6;
        cabin.position.y = 25.5;
        car.add(cabin);
      
        return car;
      }
}

function lerp(a, b, t) {
    return (a * (1.0 - t)) + (b * t);

    // It's also sometimes written as:
    // return a + ((b - a) * t);
    // ... which might be easier to read for some people.
    // The two are mathematically equivalent.
}