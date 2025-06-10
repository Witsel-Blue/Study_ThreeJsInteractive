import * as THREE from "https://unpkg.com/three@0.108.0/build/three.module.js";
import { OrbitControls } from "https://unpkg.com/three@0.108.0/examples/jsm/controls/OrbitControls.js";

let WIDTH = window.innerWidth;
let HEIGHT = window.innerHeight;

let scene, camera, renderer;
let earth, moon, cloud;
let controls;

let cameraCenter = new THREE.Vector3();
let cameraLimit = 150;
let mouse = new THREE.Vector2();
let sceneCamera = false;

const init = () => {
    scene = new THREE.Scene();
    scene.background = new THREE.Color("#000000");
    camera = new THREE.PerspectiveCamera(75, WIDTH / HEIGHT, 0.1, 1000);
    camera.position.set(240, 60, 0);

    camera.lookAt(new THREE.Vector3(0, 0, 0));
    cameraCenter.x = camera.position.x;
    cameraCenter.y = camera.position.y;

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(WIDTH, HEIGHT);

    document.body.appendChild(renderer.domElement);

    //우주 공간 만들기
    {
        const imgLoader = new THREE.TextureLoader();
        imgLoader.load("./img/universe.jpg", (data) => {
            const material_univ = new THREE.MeshBasicMaterial({
                map: data,
                side: THREE.BackSide,
            });
            const geometry_univ = new THREE.SphereGeometry(500, 32, 32);
            const universe = new THREE.Mesh(geometry_univ, material_univ);
            scene.add(universe);
        });
    }

    //지구 만들기
    const earthMap = new THREE.TextureLoader().load("./img/Albedo.jpg");
    const material_earth = new THREE.MeshPhongMaterial({
        map: earthMap,
    });
    const geometry_earth = new THREE.SphereGeometry(80, 32, 32);
    earth = new THREE.Mesh(geometry_earth, material_earth);
    earth.rotation.x = 0.3;
    scene.add(earth);

    //구름
    const cloudMap = new THREE.TextureLoader().load("./img/Clouds.png");
    const material_cloud = new THREE.MeshPhongMaterial({
        map: cloudMap,
        transparent: true,
        opacity: 0.6,
    });
    const geometry_cloud = new THREE.SphereGeometry(82, 32, 32);
    cloud = new THREE.Mesh(geometry_cloud, material_cloud);
    earth.add(cloud);

    //달
    const moonMap = new THREE.TextureLoader().load("./img/moon.jpg");
    const geometry_moon = new THREE.SphereGeometry(6, 32, 32);
    const material_moon = new THREE.MeshPhongMaterial({
        map: moonMap,
    });

    moon = new THREE.Mesh(geometry_moon, material_moon);
    earth.add(moon);

    //조명
    var light = new THREE.HemisphereLight(0xffffff, 0x080820, 1.5);
    light.position.set(100, 100, -100);
    scene.add(light);
};

let time = 0;
const d = 120;

const animate = () => {
    earth.rotation.y += 0.0005;
    cloud.rotation.y += 0.0004;
    moon.rotation.y += 0.01;

    time = time + 0.001;
    moon.position.x = Math.sin(time) * d; // -120 부터 120사이의 값 반복
    moon.position.z = Math.cos(time) * d; // -120 부터 120사이의 값 반복

    //카메라가 바라보는 곳
    if (sceneCamera) {
        camera.lookAt(scene.position);
    } else {
        camera.lookAt(moon.position);
    }
    camera.position.x = cameraCenter.x + cameraLimit * mouse.x;
    camera.position.y = cameraCenter.y + cameraLimit * mouse.y;

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
};

const onDocumentMouseMove = (event) => {
    event.preventDefault();
    mouse.x = (event.clientX / WIDTH) * 2 - 1; // -1 ~ 1 까지 반환
    mouse.y = -(event.clientY / HEIGHT) * 2 + 1;
};

const onDocumentClick = (event) => {
    sceneCamera = sceneCamera ? false : true;
};

const stageResize = () => {
    WIDTH = window.innerWidth;
    HEIGHT = window.innerHeight;

    camera.updateProjectionMatrix();
    renderer.setSize(WIDTH, HEIGHT);
    camera.aspect = WIDTH / HEIGHT;
};

Math.radians = (degrees) => {
    return (degrees * Math.PI) / 180;
};

init();
animate();
window.addEventListener("resize", stageResize);
document.addEventListener("mousemove", onDocumentMouseMove);
document.addEventListener("click", onDocumentClick);
