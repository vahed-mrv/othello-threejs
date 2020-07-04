'use strict';

var camera, scene, renderer, canvas;
var robot, body, left_hand, right_hand, left_leg, right_leg, head, hat;

init();
// animate();
createPanel();

function init() {
    scene = new THREE.Scene();

    initCamera();
    initLights();
    initObjects();
    render();
}

function initObjects() {
    var surfaceGeometry = new THREE.PlaneGeometry(300, 350);
    var surfaceMaterial = new THREE.MeshPhongMaterial({color: 0xcccccc, side: THREE.DoubleSide});//new THREE.MeshBasicMaterial({color: "#e0e0e0", side: THREE.DoubleSide});
    var surfaceMesh = new THREE.Mesh(surfaceGeometry, surfaceMaterial);
    surfaceMesh.rotateX(Math.PI / 2);
    surfaceMesh.position.y = -50;
    scene.add(surfaceMesh);

    //create group for robot
    robot = new THREE.Group();
    scene.add(robot);

    //Legs
    var geometry = new THREE.CylinderGeometry(0.5, 0.5, 2);
    var material = new THREE.MeshPhongMaterial( { color: 0x454890 } );
    left_leg = new THREE.Mesh( geometry, material );
    right_leg = new THREE.Mesh( geometry, material );
    left_leg.position.set(-1, 0, 0);
    robot.add(left_leg);
    right_leg.position.set(1, 0, 0);
    robot.add(right_leg);

    //Hands
    var geometry = new THREE.CylinderGeometry(0.5, 0.5, 2);
    var material = new THREE.MeshPhongMaterial( { color: 0x454890 } );
    left_hand = new THREE.Mesh( geometry, material );
    right_hand = new THREE.Mesh( geometry, material );
    left_hand.position.set(-2.5, 3.3, 0);
    left_hand.rotateZ(Math.PI / 2);
    robot.add(left_hand);
    right_hand.position.set(2.5, 3.3, 0);
    right_hand.rotateZ(Math.PI / 2);
    robot.add(right_hand);

    //Body
    var geometry = new THREE.BoxGeometry(3, 3, 1);
    var loader = new THREE.TextureLoader();
    var material = new THREE.MeshBasicMaterial({
        map: loader.load('images/body.jpg'),
    });
    body = new THREE.Mesh( geometry, material )
    body.position.set(0, 2.5, 0);
    robot.add(body);

    //Head
    var geometry = new THREE.SphereGeometry( 1.5, 32, 32 );
    var material = new THREE.MeshPhongMaterial( {color: 0xffff00} );
    head = new THREE.Mesh( geometry, material );
    head.position.set(0, 5.5, 0);
    robot.add( head );

    //Hat
    var geometry = new THREE.ConeGeometry( 1.5, 3, 32 );
    var material = new THREE.MeshBasicMaterial( {color: 0xff0000} );
    hat = new THREE.Mesh( geometry, material );
    hat.position.set(0, 7.5, 0);
    robot.add( hat );

    // scene.fog = new THREE.FogExp2(0x2a2a2a, 0.1);
    scene.fog = new THREE.Fog(0x2f2f2f , 1, 20);
}

function initCamera() {
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(-6, 7, 16);
    camera.lookAt(scene.position);
}

function initLights() {
    var spotLight = new THREE.SpotLight(0x789abc);
    spotLight.angle = 0.8;
    spotLight.penumbra = 0.05;
    spotLight.position.set(0, 60, 20);
    scene.add(spotLight);

    // add subtle ambient lighting
    var ambiColor = "#ffffff";
    var ambientLight = new THREE.AmbientLight(ambiColor,0.5);
    scene.add(ambientLight);
}

function render() {
    canvas = document.querySelector('#c');
    if(!renderer)
        renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias: true} );
    renderer.setClearColor(new THREE.Color(0x000000));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.render( scene, camera );
}

function createPanel() {
    var gui = new dat.GUI({width: 400});
    var lightsFolder = gui.addFolder('Body Parts');

    var props = {
        'Tip': "Use Keyboard Arrows For Move",
        'Show Legs': true,
        'Show Hands': true,
        'Show Body': true,
        'Show Head': true,
        'Show Hat': true,
    };

    gui.add(props, 'Tip');

    lightsFolder.add(props, 'Show Legs').onChange(function () {
        left_leg.visible = !left_leg.visible;
        right_leg.visible = !right_leg.visible;
        render();
    });

    lightsFolder.add(props, 'Show Hands').onChange(function () {
        left_hand.visible = !left_hand.visible;
        right_hand.visible = !right_hand.visible;
        render();
    });

    lightsFolder.add(props, 'Show Body').onChange(function () {
        body.visible = !body.visible;
        render();
    });

    lightsFolder.add(props, 'Show Head').onChange(function () {
        head.visible = !head.visible;
        render();
    });
    
    lightsFolder.add(props, 'Show Hat').onChange(function () {
        hat.visible = !hat.visible;
        render();
    });

    lightsFolder.open();
}

document.addEventListener("keydown", onDocumentKeyDown, false);
function onDocumentKeyDown(event) {
    var speed = 0.1;
    var keyCode = event.code;
    if (keyCode == "ArrowRight") {
        robot.position.x += speed;
    } else if (keyCode == "ArrowLeft") {
        robot.position.x -= speed;
    } else if (keyCode == "ArrowDown") {
        robot.position.z += speed;
    } else if (keyCode == "ArrowUp") {
        robot.position.z -= speed;
    }
    render();
};
