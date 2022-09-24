import * as THREE from '../build/three.module.js';
import {lerp} from './utils.js';

const MOVEMENT_SPEED = 1;
const ROTATION_SPEED = 0.01;
const MAX_MOVEMENT_SPEED = 5;
const MAX_ROTATION_SPEED = 0.05;

export class Forklift {
    
    constructor(ratio, position = new THREE.Vector3(0, 0 ,0)) {
        this.position = position;
        this.ratio = ratio;
        this.speed = 0;
        this.angle = 0;
        this.liftSpeed = 0;
        this.cameras = {};
        this.liftHeight = 100;
        this.car = this.createCar();

        this.createCameras();
    }
    
    createWheels() {
        const geometry = new THREE.CylinderGeometry( 5, 5, 40, 32 );
        const material = new THREE.MeshLambertMaterial({ color: 0x333333 });
        const wheel = new THREE.Mesh(geometry, material);
        return wheel;
    }

    createLift(spacing, liftPosition) {
        const structure = new THREE.Group();

        const acrossCount = 5;

        const columnMaterial    = new THREE.MeshLambertMaterial({ color: 0xEEEEEE });
        const acrossMaterial    = new THREE.MeshLambertMaterial({ color: 0x00EEEE });
        const liftMaterial      = new THREE.MeshLambertMaterial({ color: 0x44FF77 });

        const columnGeometry    = new THREE.BoxBufferGeometry(5, this.liftHeight, 5);
        const liftGeometry      = new THREE.BoxBufferGeometry(spacing*2, 0.5, spacing*2);
        const acrossGeometry    = new THREE.BoxBufferGeometry(2, 2, spacing*2);

        const column1 = new THREE.Mesh(columnGeometry, columnMaterial);
        column1.position.z = - spacing;
        column1.position.y = this.liftHeight / 2;
        structure.add(column1);
        
        const column2 = new THREE.Mesh(columnGeometry, columnMaterial);
        column2.position.z = spacing;
        column2.position.y = this.liftHeight / 2;
        structure.add(column2);

        for(let i = 0; i <= acrossCount; i++) {
            const across = new THREE.Mesh(acrossGeometry, acrossMaterial);
            across.position.y = lerp(1, this.liftHeight-1, i/acrossCount);

            structure.add(across); 
        }

        this.lift = new THREE.Mesh(liftGeometry, liftMaterial);
        this.lift.position.x = spacing;
        this.lift.position.y = lerp(0, this.liftHeight, liftPosition);
        structure.add(this.lift);

        return structure;
    }

    createCameras() {
        this.cameras = {
            driver: this.createDriverCamera(),
            back: this.createBackCamera(),
            side: this.createSideCamera(),
        }
    }

    createDriverCamera() {
        const camera = new THREE.PerspectiveCamera(90, this.ratio, 1, 550);
        camera.position.y = 25;
        camera.position.z = -10;
        camera.rotation.y = -Math.PI/2;

        this.car.add(camera);
        return camera
    }

    createBackCamera() {
        const camera = new THREE.PerspectiveCamera(90, this.ratio, 1, 550);
        camera.position.y = 60;
        camera.position.x = -70;
        camera.rotation.y = -Math.PI/2;

        this.car.add(camera);
        return camera
    }

    createSideCamera() {
        const camera = new THREE.PerspectiveCamera(90, this.ratio, 1, 550);
        camera.position.y = 60;
        camera.position.z = 75;
        // camera.rotation.y = Math.PI/2;

        this.car.add(camera);
        return camera
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

    foward() {
        this.speed += MOVEMENT_SPEED;
        this.speed = Math.min(this.speed, MAX_MOVEMENT_SPEED);
    }

    backward() {
        this.speed -= MOVEMENT_SPEED;
        this.speed = Math.max(this.speed, -MAX_MOVEMENT_SPEED);
    }

    stopMovement() {
        this.speed = 0;
    }

    right() {
        this.angle -= ROTATION_SPEED;
        this.angle = Math.max(this.angle, -MAX_ROTATION_SPEED);
    }

    left() {
        this.angle += ROTATION_SPEED;
        this.angle = Math.min(this.angle, MAX_ROTATION_SPEED);
    }

    stopRotation() {
        this.angle = 0;
    }

    up() {
        this.liftSpeed += 1;
    }

    down() {
        this.liftSpeed -= 1;
    }

    stopLiftMovement() {
        this.liftSpeed = 0;
    }

    updateLiftPosition() {
        if(this.liftSpeed == 0) return;
        if(this.lift.position.y + this.liftSpeed >= this.liftHeight) {
            this.lift.position.setY(this.liftHeight);
            this.liftSpee = 0
        }
        else if(this.lift.position.y + this.liftSpeed <= 0) {
            this.lift.position.setY(0);
            this.liftSpee = 0
        }
        else {
            this.lift.translateY(this.liftSpeed)
        }
    }

    updateCar() {
        if(this.speed != 0) this.car.translateX(this.speed);
        if(this.angle != 0) this.car.rotateY(this.angle);    
        if(this.lift && this.liftSpeed != 0) this.updateLiftPosition();
    }
}