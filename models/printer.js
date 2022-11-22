import * as THREE from '../libs/three.module.js';
import { materials, textures, loadTexture } from '../utils/utils.js'
import { GeneratedGeometry } from '../utils/geometries.js'

export class Printer {

  constructor(position = new THREE.Vector3(100, 0, 0), printerRadius = 30, printerHeight = 30, maxPieceHeight = 50, steps = 100) {
    this.position = position;
    this.printerRadius = printerRadius;
    this.printerHeight = printerHeight;
    this.maxPieceHeight = maxPieceHeight;
    this.pieceWidth = this.printerRadius * 0.4;
    this.steps = steps;
    this.liftHeight = this.printerHeight + 5;
    this.heightInterval = this.maxPieceHeight / this.steps;
    this.printer = this.createPrinter();
    this.printing = false;
    this.liftHead;
    this.piece;
    this.piecePosition = new THREE.Vector3();
  }

  createLiftHead(columnPosition) {
    const liftHead = new THREE.Group();
    const acrossMaterial = new THREE.MeshLambertMaterial({ color: 0x266594 });
    const liftMaterial = new THREE.MeshLambertMaterial({ color: 0x5EDF60 });

    const cube_size = 5;
    const first_cube = new THREE.BoxGeometry(cube_size, cube_size, cube_size);
    const columnPiece = new THREE.Mesh(first_cube, liftMaterial);
    columnPiece.position.x = columnPosition.x;

    liftHead.add(columnPiece);

    const across_bar_length = 20;
    const across_bar = new THREE.BoxGeometry(across_bar_length, 4, cube_size);
    const acrossPiece = new THREE.Mesh(across_bar, acrossMaterial);
    acrossPiece.position.x = columnPosition.x - across_bar_length / 2 - cube_size / 2;

    liftHead.add(acrossPiece);

    const lift_cube = new THREE.BoxGeometry(cube_size, cube_size, 10);
    const liftHeadCube = new THREE.Mesh(lift_cube, liftMaterial);
    liftHeadCube.position.x = acrossPiece.position.x - across_bar_length / 2 - cube_size / 2;

    liftHead.add(liftHeadCube);

    const planeSide = 30;
    const lift = new THREE.Group();
    const lift_plane = new THREE.BoxGeometry(planeSide, 1, planeSide);
    const liftPlain = new THREE.Mesh(lift_plane, liftMaterial);
    lift.position.x = liftHeadCube.position.x;
    lift.position.y = liftHeadCube.position.y - cube_size / 2;
    lift.add(liftPlain);

    const corners = [{ x: -planeSide / 2, z: -planeSide / 2 }, { x: -planeSide / 2, z: planeSide / 2 }, { x: planeSide / 2, z: -planeSide / 2 }, { x: planeSide / 2, z: planeSide / 2 }];
    for (const c of corners) {
      const lightGroup = new THREE.Group();

      const geometry = new THREE.SphereGeometry(2, 32, 16);
      const material = new THREE.MeshBasicMaterial({ color: 0xBB4040 });
      const sphere = new THREE.Mesh(geometry, material);
      // sphere.position.set(0,-1,0)
      lightGroup.add(sphere);

      const light = new THREE.PointLight(0xBB4040, 1, 100, 2);
      lightGroup.add(light)

      lightGroup.position.set(c.x, 0, c.z);
      lift.add(lightGroup);
    }
    liftHead.add(lift);

    return liftHead;
  }

  createLift() {
    const structure = new THREE.Group();

    const height = this.maxPieceHeight * 2;

    const columnMaterial = new THREE.MeshPhongMaterial({ color: 0xE6D3C, shininess: 100 });
    const columnGeometry = new THREE.CylinderGeometry(2, 2, height, 32);
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

    var loader = new THREE.CubeTextureLoader();
    loader.setPath('textures/');

    var textureCube = loader.load([
      'greyRoom1_right.jpg', 'greyRoom1_left.jpg', 'greyRoom1_top.jpg',
      'greyRoom1_bottom.jpg', 'greyRoom1_front.jpg', 'greyRoom1_back.jpg',
    ]);

    textureCube.format = THREE.RGBAFormat;
    textureCube.mapping = THREE.CubeReflectionMapping;
    
    const material = new THREE.MeshPhongMaterial({
      specular: 0x888888,
      shininess: 120,
      envMap: textureCube,
      reflectivity: 1,
      emissive: 0x333333,
      map: loadTexture('ScratchedPaintedMetal01_1K_BaseColor.png')
    });

    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.arc(0, 0, this.printerRadius, 0, 2 * Math.PI);

    const extrudeSettings = {
      curveSegments: 360,
      steps: 16,
      depth: this.printerHeight,
      bevelEnabled: true,
      bevelThickness: 1,
      bevelSize: 4,
      bevelOffset: 0,
      bevelSegments: 1
    };

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

    const printerBase = new THREE.Mesh(geometry, material);

    printerBase.rotateX(-Math.PI / 2)

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
        this.animationFrame(geometryController, i / this.steps);
      }, i * 50);
    }
    setTimeout(() => {
      this.printing = false;
      this.piece.getWorldPosition(this.piecePosition);
    }, this.steps * 50);

  }

  animationFrame(geometryController, progress) {
    this.removePiece();
    this.renderGeometry(geometryController, progress);
    this.upLiftHead(new THREE.Box3().setFromObject(this.piece).getSize(new THREE.Vector3()).y);
  }

  upLiftHead(height) {
    this.liftHead.position.y = this.printerHeight + height + 5;
  }

  resetLift() {
    this.liftHead.position.y = this.liftHeight;
  }

  removePiece() {
    if (this.piece !== undefined) this.printer.remove(this.piece);
  }

  takePiece() {
    if (this.piece !== undefined && !this.printing) {
      return this.piece;
    }
  }

  renderGeometry(geometryController, progress) {
    const geometry = new GeneratedGeometry(geometryController.geometryCode, geometryController.geometryHeight, this.pieceWidth, geometryController.geometryRotation, Math.round(geometryController.geometryResolution), progress);
    const material = materials[geometryController.geometryMaterial];
    if (geometryController.geometryMaterial === 'texture') {
      const texture = textures[geometryController.textureChosen];
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      const repetition = Math.floor(geometryController.textureRepetition);
      texture.repeat.set(repetition, repetition);
      material.map = texture;
    }
    this.piece = new THREE.Mesh(geometry, material.clone());

    this.piece.position.y = this.printerHeight;
    this.piece.rotateX(-Math.PI / 2);
    this.printer.add(this.piece);
  }
}