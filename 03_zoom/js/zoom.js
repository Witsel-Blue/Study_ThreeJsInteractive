import * as THREE from "https://unpkg.com/three@0.108.0/build/three.module.js";
import { OrbitControls } from "https://unpkg.com/three@0.108.0/examples/jsm/controls/OrbitControls.js";

let WIDTH = window.innerWidth;
let HEIGHT = window.innerHeight;
let scene, camera, renderer, controls;
let boxGroup = new THREE.Object3D();

const dataArr = [
    {
        'img': './img/img0.png',
        'link': 'http://witselblue.site/project/monimo',
    },
    {
        'img': './img/img1.png',
        'link': 'http://witselblue.site/project/OnlineMemorial',
    },
    {
        'img': './img/img2.png',
        'link': 'http://witselblue.site/project/DCAMP',
    },
    {
        'img': './img/img3.png',
        'link': 'http://witselblue.site/project/OxfamVirtualWalker',
    },
    {
        'img': './img/img4.png',
        'link': 'http://witselblue.site/project/DCDCenter',
    },
    {
        'img': './img/img5.png',
        'link': 'http://witselblue.site/project/cabinnet',
    },
    {
        'img': './img/img6.png',
        'link': 'http://witselblue.site/project/KACE',
    },
    {
        'img': './img/img7.png',
        'link': 'http://witselblue.site/project/RNJOB',
    },
    {
        'img': './img/img8.png',
        'link': 'http://witselblue.site/project/portfolio',
    },
];

const totalNum = dataArr.length - 1;  //전체 박스 갯수
const depthNum = 30; //박스와 박스 사이 z값. 깊이
const totalDepthNum = totalNum * depthNum; //전체 깊이

let targetZNum = 0;
let moveZ = 0;
let mouseX = 0,
    mouseY = 0,
    moveX = 0,
    moveY = 0;

const init = () => {
    scene = new THREE.Scene();
    scene.background = new THREE.Color("#000");
    camera = new THREE.PerspectiveCamera(75, WIDTH / HEIGHT, 1, 1000);
    camera.position.set(0, 0, 50);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(WIDTH, HEIGHT);
    renderer.shadowMap.enabled = true;
    //그림자
    // document.body.appendChild(renderer.domElement);

    // dom에 canvas 오버랩
    document.querySelector("#canvasWrap").appendChild(renderer.domElement);


    //안개
    const near = 100;
    const far = 300;
    const color = "#000";
    scene.fog = new THREE.Fog(color, near, far);

    // const axes = new THREE.AxesHelper(150);
    // scene.add(axes);

    // const gridHelper = new THREE.GridHelper(240, 20);
    // scene.add(gridHelper);

    //조명
    var light = new THREE.HemisphereLight(0xffffff, 0x080820, 0.8);
    light.position.set(100, 100, 0);
    scene.add(light);
    for (let i = 0; i <= totalNum; i++) {
        addBox(i);
    }
    scene.add(boxGroup);
    addLight(15, 15, 20);
};

//박스 추가
const addBox = (i) => {
    // const imgMap = new THREE.TextureLoader().load(
    //     "./img/img" + i + ".png"
    // );
    const imgMap = new THREE.TextureLoader().load(dataArr[i].img);

    const material = new THREE.SpriteMaterial({ map: imgMap });
    const boxMesh = new THREE.Sprite(material);
    boxMesh.scale.set(32, 18, 1);

    let x = Math.random() * 100 - 100 / 2;
    let y = Math.random() * 50 - 50 / 2;
    let z = -i * depthNum;
    boxMesh.position.set(x, y, z);
    boxMesh.name = `imgBox_${i}`;
    boxMesh.link = dataArr[i].link;
    boxGroup.add(boxMesh);
};

//조명
const addLight = (...pos) => {
    const color = 0xffffff;
    const intensity = 0.4;
    const light = new THREE.PointLight(color, intensity);
    light.castShadow = true;

    light.position.set(...pos);

    // const helper = new THREE.PointLightHelper(light);
    // scene.add(helper);

    scene.add(light);
};

// 레이캐스터
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

const onPointerMove = (event) => {
    pointer.x = (event.clientX / WIDTH) * 2 - 1;
    pointer.y = -(event.clientY / HEIGHT) * 2 + 1;

    raycaster.setFromCamera(pointer, camera);

    const intersects = raycaster.intersectObjects(boxGroup.children);

    //마우스 오버 시 빨간색으로
    // for (let i = 0; i < intersects.length; i++) {
    //     intersects[i].object.material.color.set(0xff0000);
    // }

    if (intersects.length > 0) {
        document.querySelector("body").style.cursor = "pointer";
    } else {
        document.querySelector("body").style.cursor = "auto";
    }
};

const onDocumentMouseDown = (event) => {
    const vector = new THREE.Vector3(pointer.x, pointer.y, 0.5);

    vector.unproject(camera);
    raycaster.setFromCamera(pointer, camera);

    const intersects = raycaster.intersectObjects(boxGroup.children);

    if (intersects.length > 0) {
        const item = intersects[0].object;
        window.open(item.link, '_parent');
    }
};

const animate = () => {
    // targetZNum += 0.2; // 자동 스크롤
    moveZ += (targetZNum - moveZ) * 0.07;
    boxGroup.position.z = moveZ;

    moveX += (mouseX - moveX - WIDTH / 2) * 0.05;
    moveY += (mouseY - moveY - WIDTH / 2) * 0.05;

    boxGroup.position.x = -(moveX / 50);
    boxGroup.position.y = moveY / 50;

    camera.lookAt(scene.position);
    camera.updateProjectionMatrix();
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

const scrollFunc = (event) => {
    if (event.deltaY < 0) {
        if (targetZNum > 0) {
            targetZNum -= depthNum;
        }
    } else {
        if (targetZNum < totalDepthNum) {
            targetZNum += depthNum;
        }
    }
};

init();
animate();
window.addEventListener("resize", stageResize);
window.addEventListener("wheel", scrollFunc);
window.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});
window.addEventListener("pointermove", onPointerMove);
window.addEventListener("mousedown", onDocumentMouseDown);