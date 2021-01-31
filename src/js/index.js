import * as THREE from '../../node_modules/three/src/Three.js';
import { EXRLoader } from '../../node_modules/three/examples/jsm/loaders/EXRLoader.js';
import { OrbitControls } from '../../node_modules/three/examples/jsm/controls/OrbitControls.js';

const playButton = document.getElementById('play');
playButton.addEventListener('click', onInit);

const canvas = document.getElementById('canvas');

function onInit() {
  playButton.remove();
  canvas.style.opacity = 1;

  // Create WebGLRenderer
  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
  });
  renderer.autoClear = false;

  // Create scene
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2( 0xcccccc, 0.002 );
  const scene_back = new THREE.Scene();

  // Create cameras
  const camera = new THREE.PerspectiveCamera(75, 1.0, 0.1, 2500.0);
  const camera_back = new THREE.PerspectiveCamera(75, 1.0, 0.1, 2500000.0);
  camera.position.set(1, 100, 10);
  camera_back.position.set(1, 100, 10);

  /**
   * Load EXR Texuture
   * 
   * Deep Star Maps 2020
   * https://svs.gsfc.nasa.gov/4851
   */
  new EXRLoader()
    .setDataType(THREE.UnsignedByteType)
    .load('./img/starmap_2020_4k.exr', function (texture) {
      const sky_geometry = new THREE.SphereGeometry(90000, 300, 300);
      const sky_material = new THREE.MeshBasicMaterial(
        {
          map: texture,
          side: THREE.DoubleSide,
        }
      );
      const sky_mesh = new THREE.Mesh(sky_geometry, sky_material);
      scene_back.add(sky_mesh);
    });


  // Setup TextureLoader
  const loader = new THREE.TextureLoader();

  // Create Ground
  const ground_geometry = new THREE.PlaneGeometry(90000, 90000, 30, 30);
  const ground_material = new THREE.MeshLambertMaterial({ map: loader.load('./img/Ground037_1K_Color.png'), flatShading: true });
  ground_material.map.wrapS = THREE.RepeatWrapping;
  ground_material.map.wrapT = THREE.RepeatWrapping;
  ground_material.map.repeat.set(300, 300);
  const ground_mesh = new THREE.Mesh(ground_geometry, ground_material);
  ground_mesh.rotation.x = Math.PI / -2;

  scene_back.add(ground_mesh);

  // Cereate Box
  const box_mesh = new THREE.Mesh(
    new THREE.BoxGeometry(10, 10, 10, 1, 1, 1),
    new THREE.MeshBasicMaterial({
      color: 0xffffff
    })
  );
  box_mesh.position.set(100, 10, 100);
  box_mesh.rotation.z = Math.PI / -2;
  scene.add(box_mesh);

  // Create AxesHelper
  const axis = new THREE.AxesHelper(25000);
  scene_back.add(axis);

  // Setup OrbitControls
  const controls = new OrbitControls( camera, renderer.domElement );
  controls.listenToKeyEvents( window );
  controls.target = new THREE.Vector3(0, 100, 0);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.screenSpacePanning = false;

  const controls_back = new OrbitControls( camera_back, renderer.domElement );
  controls_back.listenToKeyEvents( window );
  controls_back.target = new THREE.Vector3(0, 100, 0);
  controls_back.enableDamping = true;
  controls_back.dampingFactor = 0.05;
  controls_back.screenSpacePanning = false;

  // Create AmbientLight
  const ambientLight = new THREE.AmbientLight( 0x222222 );
  scene.add( ambientLight );
  scene_back.add( ambientLight );

  // Create AudioListener
  const listener = new THREE.AudioListener();
  camera_back.add( listener );

  const sound = new THREE.PositionalAudio( listener );

  const audioLoader = new THREE.AudioLoader();
  audioLoader.load('./sounds/takibi.mp3', function ( buffer ) {
    sound.setBuffer( buffer );
    sound.setRefDistance( 20 );
    sound.loop = true;
    sound.play();
  })
  box_mesh.add( sound );

  tick();

  /**
   *  Main Loop
   *  Render a scenes using cameras.
   *  And update Controls.
   */
  function tick() {
    renderer.clear(true, true, true);
    renderer.render(scene_back, camera_back);
    renderer.render(scene, camera);

    controls.update();
    controls_back.update();

    requestAnimationFrame(tick);
  }

  onResize();
  window.addEventListener('resize', onResize);

  /**
   *  Processing when a window is resized event
   */
  function onResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    camera_back.aspect = width / height;
    camera_back.updateProjectionMatrix();
  }
}