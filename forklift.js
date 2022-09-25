import * as THREE from '../build/three.module.js';
import { lerp, areVectorClose } from './utils.js';

const MOVEMENT_SPEED = 1;
const ROTATION_SPEED = 0.01;
const WHEEL_ROTATION_SPEED = -Math.PI/40;
const MAX_MOVEMENT_SPEED = 5;
const MAX_ROTATION_SPEED = 0.05;

export class Forklift {

    constructor(ratio, position = new THREE.Vector3(0, 0, 0)) {
        this.position = position;
        this.ratio = ratio;
        this.speed = 0;
        this.angle = 0;
        this.width = 30;
        this.carLength = 60;
        this.liftSpeed = 0;
        this.cameras = {};
        this.liftHeight = 100;
        this.components = {}
        this.car = this.createCar();
        this.piece;
        this.addWheels();

        this.createCameras();
    }

    createWheels() {
        const geometry = new THREE.CylinderGeometry(5, 5, 40, 32);
        const material = new THREE.MeshLambertMaterial({ color: 0x333333 });
        const wheel = new THREE.Mesh(geometry, material);
        return wheel;
    }

    createLift(spacing, liftPosition) {
        const structure = new THREE.Group();

        const acrossCount = 5;

        const columnMaterial = new THREE.MeshLambertMaterial({ color: 0xEEEEEE });
        const acrossMaterial = new THREE.MeshLambertMaterial({ color: 0x00EEEE });
        const liftMaterial = new THREE.MeshLambertMaterial({ color: 0x44FF77 });

        const columnGeometry = new THREE.BoxBufferGeometry(5, this.liftHeight, 5);
        const liftGeometry = new THREE.BoxBufferGeometry(spacing * 2, 0.5, spacing * 2);
        const acrossGeometry = new THREE.BoxBufferGeometry(2, 2, spacing * 2);

        const column1 = new THREE.Mesh(columnGeometry, columnMaterial);
        column1.position.z = - spacing;
        column1.position.y = this.liftHeight / 2;
        structure.add(column1);

        const column2 = new THREE.Mesh(columnGeometry, columnMaterial);
        column2.position.z = spacing;
        column2.position.y = this.liftHeight / 2;
        structure.add(column2);

        for (let i = 0; i <= acrossCount; i++) {
            const across = new THREE.Mesh(acrossGeometry, acrossMaterial);
            across.position.y = lerp(1, this.liftHeight - 1, i / acrossCount);

            structure.add(across);
        }
        this.components.lift = new THREE.Group();
        const liftFloor = new THREE.Mesh(liftGeometry, liftMaterial);
        this.components.lift.add(liftFloor);
        this.components.lift.position.x = spacing;
        this.components.lift.position.y = lerp(0, this.liftHeight, liftPosition);

        structure.add(this.components.lift);

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
        camera.rotation.y = -Math.PI / 2;

        this.car.add(camera);
        return camera
    }

    createBackCamera() {
        const camera = new THREE.PerspectiveCamera(90, this.ratio, 1, 550);
        camera.position.y = 60;
        camera.position.x = -70;
        camera.rotation.y = -Math.PI / 2;

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

    addWheels() {

        const wheel = this.createWheel();

        const wheels = {
            all: [],
            right: [],
            left: []
        };
    
        const rightOffset = new THREE.Vector3(0, 0, this.width / 2); 
        const leftOffset = rightOffset.clone().negate(); 
        
        const frontOffset = new THREE.Vector3((this.carLength * 0.6) / 2, 0, 0); 
        const backOffset = frontOffset.clone().negate();
        
        const heightOffset = new THREE.Vector3(0, 6, 0); 
        
        const rightRotation = Math.PI / 2;
        const leftRotation = -rightRotation;

        const rightFront = wheel.clone(); rightFront.position.copy(rightOffset.clone().add(frontOffset).add(heightOffset)); rightFront.rotateX(rightRotation);
        const rightBack = wheel.clone(); rightBack.position.copy(rightOffset.clone().add(backOffset).add(heightOffset)); rightBack.rotateX(rightRotation);
        const leftFront = wheel.clone(); leftFront.position.copy(leftOffset.clone().add(frontOffset).add(heightOffset)); leftFront.rotateX(leftRotation);
        const leftBack = wheel.clone(); leftBack.position.copy(leftOffset.clone().add(backOffset).add(heightOffset)); leftBack.rotateX(leftRotation);

        wheels.right.push(rightFront); wheels.all.push(rightFront);
        wheels.right.push(rightBack); wheels.all.push(rightBack);
        wheels.left.push(leftFront); wheels.all.push(leftFront);
        wheels.left.push(leftBack); wheels.all.push(leftBack);

        for(let w of wheels.all) {
            this.car.add(w);
        }

        this.components.wheels = wheels;
    }

    createCar() {
        const car = new THREE.Group();

        const lift = this.createLift(this.width / 2, 0.25);
        lift.position.y = 12 - 15 / 2;
        lift.position.x = this.carLength/2;
        car.add(lift);

        const main = new THREE.Mesh(
            new THREE.BoxBufferGeometry(this.carLength, 15, this.width),
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

    grab(piece, piecePosition, pieceHeight) {
      
      let liftPosition = new THREE.Vector3();
      this.components.lift.getWorldPosition(liftPosition); //TODO agregar distancia del lift
      if (this.piece === undefined && piecePosition !== undefined ) { //&& areVectorClose(piecePosition, liftPosition)
        this.piece = piece;
        debugger;
        this.piece.position.y = this.piece.position.y;
        this.piece.position.x = 5;
        this.components.lift.add(this.piece);
        return true;
      }
      return false;
    }

    updateLiftPosition() {
        if (this.liftSpeed == 0) return;
        if (this.components.lift.position.y + this.liftSpeed >= this.liftHeight) {
            this.components.lift.position.setY(this.liftHeight);
            this.liftSpeed = 0
        }
        else if (this.components.lift.position.y + this.dd <= 0) {
            this.components.lift.position.setY(0);
            this.liftSpeed = 0
        }
        else {
            this.components.lift.translateY(this.liftSpeed)
        }
    }

    moveCar() {
        if(this.speed == 0) return;

        this.car.translateX(this.speed);

        const speed = Math.abs(this.speed / MOVEMENT_SPEED) * 1.2;

        const rightRotation = Math.sign(this.speed) * speed * WHEEL_ROTATION_SPEED;
        const leftRotation = -rightRotation;

        this.components.wheels.left.forEach(w => w.rotateY(leftRotation));
        this.components.wheels.right.forEach(w => w.rotateY(rightRotation));
    }

    rotateCar() {
        if (this.angle == 0) return;

        this.car.rotateY(this.angle);
        
        const speed = this.angle / ROTATION_SPEED * 0.8;

        this.components.wheels.all.forEach(w => w.rotateY(WHEEL_ROTATION_SPEED * speed));
    }

    updateCar() {
        this.moveCar();
        this.rotateCar();
        this.updateLiftPosition();
    }

    createWheel() {
        const wheel = new THREE.Group();
        
        const wheelRadius = 5;
        const wheelWidth = 5;

        const wheelGeometry = new THREE.CylinderGeometry(wheelRadius, wheelRadius, wheelWidth, 32);
        const wheelMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
        wheel.add(new THREE.Mesh(wheelGeometry, wheelMaterial));
        

        // Estrella
        const starMaterial1 = new THREE.MeshLambertMaterial({ color: 0xb00000, wireframe: false });
        const starMaterial2 = new THREE.MeshLambertMaterial({ color: 0xff8000, wireframe: false });

        const points = [], numPts = 5;

        for (let i = 0; i < numPts * 2; i++) {

            const l = i % 2 == 1 ? 1.25 : 2.5;
            const a = i / numPts * Math.PI;
            points.push(new THREE.Vector2(Math.cos(a) * l, Math.sin(a) * l));
        }

        const starShape = new THREE.Shape(points);
        const starMaterials = [starMaterial1, starMaterial2];

        const extrudeSettings = {
            depth: 0.5,
            steps: 1,
            bevelEnabled: true,
            bevelThickness: 1,
            bevelSize: 1,
            bevelSegments: 1
        };

        const starGeometry = new THREE.ExtrudeGeometry(starShape, extrudeSettings);

        const starMesh = new THREE.Mesh(starGeometry, starMaterials);
        starMesh.position.set( 0, wheelWidth/2, 0 );
        starMesh.rotateX(Math.PI/2);
        wheel.add(starMesh)
        
        return wheel;
    }
}