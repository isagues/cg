import * as THREE from '../libs/three.module.js';
import { lerp, areVectorClose, loadTexture } from '../utils/utils.js';

const MOVEMENT_SPEED = 1;
const ROTATION_SPEED = 0.01;
const WHEEL_ROTATION_SPEED = -Math.PI/40;
const MAX_MOVEMENT_SPEED = 5;
const MAX_ROTATION_SPEED = 0.05;

export class Forklift {

    constructor(params) {
        this.state = {
            speed: 0,
            angle: 0,
            liftSpeed: 0
        };
        this.params = params;
        this.cameras = {};
        this.components = {}
        this.car = this.createCar();
        this.piece;
        this.createCameras();
    }

    /// ------------------------------
    /// -------- CAR CREATION --------
    /// ------------------------------

    createCar() {
        const car = new THREE.Group();

        const lift = this.createLift(this.params.carWidth / 2, 0.25);
        lift.position.y = 12 - 15 / 2;
        lift.position.x = this.params.carLength/2;
        car.add(lift);

        const car_texture = loadTexture('/texturaGrua.jpg');
        const car_normal_texture = loadTexture('texturaGruaNormalMap.jpg');

        const main = new THREE.Mesh(
            new THREE.BoxBufferGeometry(this.params.carLength, 15, this.params.carWidth),
            new THREE.MeshPhongMaterial({ map : car_texture, normalMap: car_normal_texture})
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

        this.addWheels(car);

        car.position.copy(this.params.position);

        return car;
    }

    createLift(spacing, liftPosition) {
        const structure = new THREE.Group();

        const acrossCount = 5;

        const columnMaterial = new THREE.MeshLambertMaterial({ color: 0xEEEEEE });
        const acrossMaterial = new THREE.MeshLambertMaterial({ color: 0x00EEEE });
        const liftTexture = loadTexture('ScratchedPaintedMetal01_1K_BaseColor.png');
        const liftMaterial = new THREE.MeshLambertMaterial({map: liftTexture});

        const columnGeometry = new THREE.BoxBufferGeometry(5, this.params.liftHeight, 5);
        const liftGeometry = new THREE.BoxBufferGeometry(spacing * 2, 0.5, spacing * 2);
        const acrossGeometry = new THREE.BoxBufferGeometry(2, 2, spacing * 2);

        const column1 = new THREE.Mesh(columnGeometry, columnMaterial);
        column1.position.z = - spacing;
        column1.position.y = this.params.liftHeight / 2;
        structure.add(column1);

        const column2 = new THREE.Mesh(columnGeometry, columnMaterial);
        column2.position.z = spacing;
        column2.position.y = this.params.liftHeight / 2;
        structure.add(column2);

        for (let i = 0; i <= acrossCount; i++) {
            const across = new THREE.Mesh(acrossGeometry, acrossMaterial);
            across.position.y = lerp(1, this.params.liftHeight - 1, i / acrossCount);

            structure.add(across);
        }

        this.components.lift = new THREE.Group();
        const liftFloor = new THREE.Mesh(liftGeometry, liftMaterial);
        this.components.lift.add(liftFloor);
        this.components.lift.position.x = spacing;
        this.components.lift.position.y = lerp(0, this.params.liftHeight, liftPosition);

        structure.add(this.components.lift);

        return structure;
    }

    addWheels(car) {

        const wheel = this.createWheel();

        const wheels = {
            all: [],
            right: [],
            left: []
        };
    
        const rightOffset = new THREE.Vector3(0, 0, this.params.carWidth / 2); 
        const leftOffset = rightOffset.clone().negate(); 
        
        const frontOffset = new THREE.Vector3((this.params.carLength * 0.6) / 2, 0, 0); 
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
            car.add(w);
        }

        this.components.wheels = wheels;
    }

    createWheel() {
        const wheelRadius = 5;
        const wheelWidth = 5;

        const wheelGeometry = new THREE.CylinderGeometry(wheelRadius, wheelRadius, wheelWidth, 32);

        const texture = loadTexture('rueda.jpg');
        const wheelMaterial = new THREE.MeshLambertMaterial({map: texture});
        const blackMaterial = new THREE.MeshLambertMaterial({color: 0x000000});
        const materials = [blackMaterial, wheelMaterial, blackMaterial];
        const wheelMesh = new THREE.Mesh(wheelGeometry, materials);
        
        return wheelMesh;
    }

    /// ------------------------------
    /// ------- EVENT HANDLERS -------
    /// ------------------------------

    foward() {
        this.state.speed += MOVEMENT_SPEED;
        this.state.speed = Math.min(this.state.speed, MAX_MOVEMENT_SPEED);
    }

    backward() {
        this.state.speed -= MOVEMENT_SPEED;
        this.state.speed = Math.max(this.state.speed, -MAX_MOVEMENT_SPEED);
    }

    stopMovement() {
        this.state.speed = 0;
    }

    right() {
        this.state.angle -= ROTATION_SPEED;
        this.state.angle = Math.max(this.state.angle, -MAX_ROTATION_SPEED);
    }

    left() {
        this.state.angle += ROTATION_SPEED;
        this.state.angle = Math.min(this.state.angle, MAX_ROTATION_SPEED);
    }

    stopRotation() {
        this.state.angle = 0;
    }

    up() {
        this.state.liftSpeed += 1;
    }

    down() {
        this.state.liftSpeed -= 1;
    }

    stopLiftMovement() {
        this.state.liftSpeed = 0;
    }

    grab(piece, piecePosition) {
      
      let liftPosition = new THREE.Vector3();
      this.components.lift.getWorldPosition(liftPosition); 
      if (piece !== undefined && piecePosition !== undefined && areVectorClose(piecePosition, liftPosition)) { //
        this.piece = piece;
        this.piece.position.y = 0;
        this.components.lift.add(this.piece);
        return true;
      }
      return false;
    }

    getPiece() {
      return this.piece;
    }

    removePiece() {
      if (this.piece !== undefined){
        this.components.lift.remove(this.piece);
      }
    }

    
    /// ------------------------------
    /// --------- UPDATE CAR ---------
    /// ------------------------------

    updateCar() {
        this.moveCar();
        this.rotateCar();
        this.updateLiftPosition();
    }

    moveCar() {
        if(this.state.speed == 0) return;

        this.car.translateX(this.state.speed);

        const speed = Math.abs(this.state.speed / MOVEMENT_SPEED) * 1.2;

        const rightRotation = Math.sign(this.state.speed) * speed * WHEEL_ROTATION_SPEED;
        const leftRotation = -rightRotation;

        this.components.wheels.left.forEach(w => w.rotateY(leftRotation));
        this.components.wheels.right.forEach(w => w.rotateY(rightRotation));
    }

    rotateCar() {
        if (this.state.angle == 0) return;

        this.car.rotateY(this.state.angle);
        
        const speed = this.state.angle / ROTATION_SPEED * 0.8;

        this.components.wheels.all.forEach(w => w.rotateY(WHEEL_ROTATION_SPEED * speed));
    }

    updateLiftPosition() {
        if (this.state.liftSpeed == 0) return;
        if (this.components.lift.position.y + this.state.liftSpeed >= this.params.liftHeight) {
            this.components.lift.position.setY(this.params.liftHeight);
            this.state.liftSpeed = 0
        }
        else if (this.components.lift.position.y + this.state.liftSpeed <= 0) {
            this.components.lift.position.setY(0);
            this.state.liftSpeed = 0
        }
        else {
            this.components.lift.translateY(this.state.liftSpeed)
        }
    }

    /// ------------------------------
    /// ----------- Cameras ----------
    /// ------------------------------

    createCameras() {
        this.cameras = {
            driver: this.createDriverCamera(),
            back: this.createBackCamera(),
            side: this.createSideCamera(),
        }
    }

    createDriverCamera() {
        const camera = new THREE.PerspectiveCamera(90, this.params.ratio, 1, 550);
        camera.position.y = 25;
        camera.position.z = -10;
        camera.rotation.y = -Math.PI / 2;

        this.car.add(camera);
        return camera
    }

    createBackCamera() {
        const camera = new THREE.PerspectiveCamera(90, this.params.ratio, 1, 550);
        camera.position.y = 60;
        camera.position.x = -70;
        camera.rotation.y = -Math.PI / 2;

        this.car.add(camera);
        return camera
    }

    createSideCamera() {
        const camera = new THREE.PerspectiveCamera(90, this.params.ratio, 1, 550);
        camera.position.y = 60;
        camera.position.z = 75;

        this.car.add(camera);
        return camera
    }
}