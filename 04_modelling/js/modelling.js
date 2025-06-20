import * as THREE from "https://unpkg.com/three@0.108.0/build/three.module.js";
import { OrbitControls } from "https://unpkg.com/three@0.108.0/examples/jsm/controls/OrbitControls.js";
import { FBXLoader } from "https://unpkg.com/three@0.108.0/examples/jsm/loaders/FBXLoader.js";

let WIDTH = window.innerWidth;
let HEIGHT = window.innerHeight;

let scene, camera, renderer;
let controls;

let mixers = [];
let action;

//샘플 3d 모델링 다운로드
//1. https://www.mixamo.com/
//2. https://free3d.com/ko/3d-models/fbx
//3. https://www.turbosquid.com/

const init = () => {
    scene = new THREE.Scene();
    scene.background = new THREE.Color("#eee");
    camera = new THREE.PerspectiveCamera(70, WIDTH / HEIGHT, 0.1, 2000);
    camera.position.set(50, 50, 100);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(WIDTH, HEIGHT);
    renderer.shadowMap.enabled = true;

    document.body.appendChild(renderer.domElement);

    //카메라 컨트롤
    controls = new OrbitControls(camera, renderer.domElement);

    //바닥
    const geometry = new THREE.CylinderGeometry(400, 400, 5, 100);
    const material = new THREE.MeshPhongMaterial({
        color: 0xeeeeee,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(0, -2, 0);
    mesh.receiveShadow = true;
    scene.add(mesh);

    {
        //조명 넣기
        var light = new THREE.HemisphereLight(0xffffff, 0x080820, 1);
        light.position.set(100, 100, 100);
        scene.add(light);
    }
    {
        //조명
        const color = 0xffffff;
        const intensity = 0.6;
        const light = new THREE.PointLight(color, intensity);
        light.castShadow = true;

        light.position.set(40, 120, 40);

        light.shadow.mapSize.width = 2048;
        light.shadow.mapSize.height = 2048;
        light.shadow.radius = 5;

        const sphereSize = 10;
        scene.add(light);
    }

    {
        //안개
        const near = 100;
        const far = 300;
        const color = "#eeeeee";
        scene.fog = new THREE.Fog(color, near, far);
    }

    const fbxLoader = new FBXLoader();

    fbxLoader.load(
        "./model/Taunt.fbx",
        (object) => {
            console.log(object);

            object.traverse(function (child) {
                if (child.isMesh) {
                    child.castShadow = true;
                }
            });

            //애니메이션
            object.mixer = new THREE.AnimationMixer(object);

            mixers.push(object.mixer);

            if (mixers.length > 0) {
                action = object.mixer.clipAction(object.animations[0]);
                // action.play();
            }

            object.scale.set(0.3, 0.3, 0.3);
            object.position.y = 0;
            scene.add(object);
        },
        (xhr) => {
            console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
        },
        (error) => {
            console.log(error);
        }
    );

    document.addEventListener("keydown", onDocumentKeyDown);
};

let keyCode = 0;

const onDocumentKeyDown = (event) => {
    keyCode = event.key || event.keyCode;

    if (keyCode == "Enter" || keyCode == 13) {
        action.play();
        // action.setLoop(0, 1);
    } else {
        action.stop();
    }
};

const clock = new THREE.Clock();

const animate = () => {
    const delta = clock.getDelta();

    for (let i = 0; i < mixers.length; i++) {
        mixers[i].update(delta);
    }

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
};

const stageResize = () => {
    WIDTH = window.innerWidth;
    HEIGHT = window.innerHeight;

    camera.updateProjectionMatrix();
    renderer.setSize(WIDTH, HEIGHT);
    camera.aspect = WIDTH / HEIGHT;
};

init();
animate();
window.addEventListener("resize", stageResize);

const fbxLoadFunc = (modelName) => {
    const fbxLoader = new FBXLoader();

    fbxLoader.load(
        modelName,
        (object) => {
            object.traverse(function (child) {
                if (child.isMesh) {
                    child.castShadow = true;
                }
            });

            //애니메이션
            if (object.animations != undefined) {
                object.mixer = new THREE.AnimationMixer(object);
                mixers.push(object.mixer);

                if (mixers.length > 0) {
                    var action = object.mixer.clipAction(object.animations[0]);
                    action.play();
                }
            }

            //크기
            let scaleNum = 0.4;
            object.scale.set(scaleNum, scaleNum, scaleNum);

            //위치
            object.translateX(-30);
            object.translateY(-50);
            scene.add(object);
        },
        (xhr) => {
            console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
        },
        (error) => {
            console.log(error);
        }
    );
};
