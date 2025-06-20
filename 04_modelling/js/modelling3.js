import * as THREE from "https://unpkg.com/three@0.108.0/build/three.module.js";
import { OrbitControls } from "https://unpkg.com/three@0.108.0/examples/jsm/controls/OrbitControls.js";
import { FBXLoader } from "https://unpkg.com/three@0.108.0/examples/jsm/loaders/FBXLoader.js";

let WIDTH = window.innerWidth;
let HEIGHT = window.innerHeight;

let scene, camera, renderer;
let controls;

let model = new THREE.Object3D();
let mixers = [];


const init = () => {
    scene = new THREE.Scene();
    scene.background = new THREE.Color("#eee");
    camera = new THREE.PerspectiveCamera(75, WIDTH / HEIGHT, 0.1, 1000);
    camera.position.set(0, 40, 0);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(WIDTH, HEIGHT);
    renderer.shadowMap.enabled = true;

    document.querySelector("#canvasWrap").appendChild(renderer.domElement);

    //바닥
    const geometry = new THREE.BoxGeometry(5000, 1, 5000);
    const material = new THREE.MeshPhongMaterial({
        color: 0xeeeeee,
    });
    const boxMesh = new THREE.Mesh(geometry, material);
    boxMesh.position.set(0, 0, 0);
    boxMesh.receiveShadow = true;
    scene.add(boxMesh);

    {
        //조명
        var light = new THREE.HemisphereLight(0xffffff, 0x080820, 1);
        light.position.set(100, 100, 100);
        scene.add(light);
    }
    {
        //조명
        const color = 0xffffff;
        const intensity = 1;
        const light = new THREE.PointLight(color, intensity);
        light.position.set(140, 360, 150);
        scene.add(light);
    }
    {
        //안개
        const near = 1;
        const far = 250;
        const color = "#eeeeee";
        scene.fog = new THREE.Fog(color, near, far);
    }

    fbxLoadFunc("./model/standing.FBX", "mixamo.com", -2, 0, -20);
    fbxLoadFunc("./model/DismissingGesture.FBX", "mixamo.com", 12, 0, -300);
};

const fbxLoadFunc = (modelName, animationName, ...pos) => {
    const fbxLoader = new FBXLoader();
    fbxLoader.load(
        modelName,
        (object) => {
            object.traverse(function (child) {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });

            //애니메이션
            if (object.animations != undefined) {
                object.mixer = new THREE.AnimationMixer(object);
                const clips = object.animations;
                mixers.push(object.mixer);

                if (mixers.length > 0) {
                    const clip = THREE.AnimationClip.findByName(
                        clips,
                        animationName
                    );
                    let action = object.mixer.clipAction(clip);
                    action.play();
                }
            }

            //크기 조절
            let scaleNum = 0.3;
            object.scale.set(scaleNum, scaleNum, scaleNum);

            object.position.set(...pos);
            model.add(object);
            scene.add(model);
        },
        (xhr) => {
            console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
        },
        (error) => {
            console.log(error);
        }
    );
};

const clock = new THREE.Clock();

const animate = () => {
    const delta = clock.getDelta();
    for (let i = 0; i < mixers.length; i++) {
        mixers[i].update(delta);
    }

    camera.updateProjectionMatrix();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
};

const stageResize = () => {
    WIDTH = window.innerWidth;
    HEIGHT = window.innerHeight;

    renderer.setSize(WIDTH, HEIGHT);
    camera.aspect = WIDTH / HEIGHT;
};

init();
animate();
window.addEventListener("resize", stageResize);

// 토글 버튼
const button = document.querySelector("button");
let moveNum = 0;

button.addEventListener("click", () => {
    if (camera.position.z == -240) {
        moveNum = 0;
    } else {
        moveNum = -240;
    }

    //트윈맥스 카메라 이동
    gsap.to(camera.position, {
        duration: 1.8,
        delay: 0,
        z: moveNum,
        ease: "Power4.easeInOut",
    });
});
