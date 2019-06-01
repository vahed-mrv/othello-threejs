'use strict';

var camera, scene, renderer, canvas, sound;

var balls= [[null,null,null,null,null,null,null,null],
            [null,null,null,null,null,null,null,null],
            [null,null,null,null,null,null,null,null],
            [null,null,null,null,null,null,null,null],
            [null,null,null,null,null,null,null,null],
            [null,null,null,null,null,null,null,null],
            [null,null,null,null,null,null,null,null],
            [null,null,null,null,null,null,null,null]];

var godi = [[null,null,null,null,null,null,null,null],
            [null,null,null,null,null,null,null,null],
            [null,null,null,null,null,null,null,null],
            [null,null,null,null,null,null,null,null],
            [null,null,null,null,null,null,null,null],
            [null,null,null,null,null,null,null,null],
            [null,null,null,null,null,null,null,null],
            [null,null,null,null,null,null,null,null]];

init();

function init() {

    scene = new THREE.Scene();
    
    initCamera();
    
    initLights();

    initAudio();
    
    loadObjects();
    
    canvas = document.querySelector('#c');
    renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias: true} );
    
    renderer.render( scene, camera );

}

function initCamera() {
    camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 0.01, 100 );
    camera.position.set(20, 80, 35);
    camera.lookAt(0, -5, 0);
}

function initLights() {
    const color = 0xFFFFFF;
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(30, 60, -60);
    light.target.position.set(0, 0, 0);
    scene.add(light);
    scene.add(light.target);
    
    const color2 = 0xFFFFFF;
    const intensity2 = 0.1;
    const light2 = new THREE.AmbientLight(color2, intensity2);
    scene.add(light2); 
}

function initAudio() {
    // create an AudioListener and add it to the camera
    var listener = new THREE.AudioListener();
    camera.add( listener );

    // create a global audio source
    sound = new THREE.Audio( listener );

    // load a sound and set it as the Audio object's buffer
    var audioLoader = new THREE.AudioLoader();
    audioLoader.load( 'sounds/ding.ogg', function( buffer ) {
        sound.setBuffer( buffer );
        sound.setLoop( false );
        sound.setVolume( 1 );
    });
}

function loadObjects() {
    const objLoader = new THREE.OBJLoader2();
    objLoader.loadMtl('models/othello.mtl', null, (materials) => {
        objLoader.setMaterials(materials);
        objLoader.load('models/surface.obj', (event) => {
            const root = event.detail.loaderRootNode;
            scene.add(root);
        });
        
        objLoader.load('models/godi.obj', (event) => {
            const root = event.detail.loaderRootNode;
            
            var godi_0_0_x = -(2.35+3*4.7);
            var godi_0_0_z = -(2.35+3*4.7);
            var godi_y = 2.52
            var godi_offset = 4.7;
            
            root.children[0].position.set(godi_0_0_x, godi_y, godi_0_0_z);
            godi[0][0] = root.children[0];
            godi[0][0].name = 'godi_'+ 0 + '_' + 0;
            
            for(var i = 0; i < 8; i++) {
                for(var j = 0; j < 8; j++) {
                    if(i==0 &&  j==0)
                    continue;
                    
                    godi[i][j] = root.children[0].clone();
                    godi[i][j].position.set(godi_0_0_x+i*godi_offset, godi_y, godi_0_0_z+j*godi_offset);
                    godi[i][j].name = 'godi_'+ i + '_' + j;
                    root.children.push(godi[i][j]);
                }
            }
        });        
    });
    
    const objLoader2 = new THREE.OBJLoader2();
    objLoader2.loadMtl('models/othello.mtl', null, (materials) => {
        objLoader2.setMaterials(materials);
        objLoader2.load('models/ball.obj', (event) => {
            const root = event.detail.loaderRootNode;
            
            var ball_0_0_x = -(2.35+3*4.7);
            var ball_0_0_z = -(2.35+3*4.7);
            var ball_y = 2.6;
            var ball_offset = 4.7;
            
            root.children[0].position.set(ball_0_0_x, ball_y, ball_0_0_z);
            balls[0][0] = root.children[0];
            balls[0][0].name = 'ball_'+ 0 + '_' + 0;
            balls[0][0].visible = false;
            
            for(var i = 0; i < 8; i++) {
                for(var j = 0; j < 8; j++) {
                    if(i==0 &&  j==0)
                    continue;
                    
                    balls[i][j] = root.children[0].clone();
                    balls[i][j].position.set(ball_0_0_x+i*ball_offset, ball_y, ball_0_0_z+j*ball_offset);
                    balls[i][j].name = 'ball_'+ i + '_' + j;
                    balls[i][j].visible = false;
                    root.children.push(balls[i][j]);
                }
            }
            
            scene.add(root);
            refreshSurface();
            
            // console.log(scene);
        });
    });   
}

//Game logic//////////////////////////////////////////////////////////
var mode = 'start';
var alternate = 'red';
var matrix =   [[null,null,null,null,null,null,null,null],
                [null,null,null,null,null,null,null,null],
                [null,null,null,null,null,null,null,null],
                [null,null,null,'red','green',null,null,null],
                [null,null,null,'green','red',null,null,null],
                [null,null,null,null,null,null,null,null],
                [null,null,null,null,null,null,null,null],
                [null,null,null,null,null,null,null,null]];

var change_matrix= [[null,null,null,null,null,null,null,null],
                    [null,null,null,null,null,null,null,null],
                    [null,null,null,null,null,null,null,null],
                    [null,null,null,null,null,null,null,null],
                    [null,null,null,null,null,null,null,null],
                    [null,null,null,null,null,null,null,null],
                    [null,null,null,null,null,null,null,null],
                    [null,null,null,null,null,null,null,null]];

function selectCell(i, j) {
    if(!matrix[i][j] && mode == 'normal') {

        if(sound.isPlaying)
            sound.stop();
        sound.play();

        matrix[i][j] = alternate;
        checkBlockade(i, j);
        refreshSurface();
        // switchAlternate();
    }
}

function checkBlockade(i, j) { 
    //right
    for(var x = i+1; x < 8; x++) {
        if(!matrix[x][j])
            break;

        if(matrix[x][j] == matrix[i][j]) {
            for(var xx = i+1; xx < x; xx++)
                change_matrix[xx][j] = 1;
            break;
        }
    }

    //left
    for(var x = i-1; x >= 0; x--) {
        if(!matrix[x][j])
            break;

        if(matrix[x][j] == matrix[i][j]) {
            for(var xx = i-1; xx > x; xx--)
                change_matrix[xx][j] = 1;
            break;
        }
    }

    //down
    for(var y = j+1; y < 8; y++) {
        if(!matrix[i][y])
            break;

        if(matrix[i][y] == matrix[i][j]) {
            for(var yy = j+1; yy < y; yy++)
                change_matrix[i][yy] = 1;
            break;
        }
    }

    //up
    for(var y = j-1; y >= 0; y--) {
        if(!matrix[i][y])
            break;

        if(matrix[i][y] == matrix[i][j]) {
            for(var yy = j-1; yy > y; yy--)
                change_matrix[i][yy] = 1;
            break;
        }
    }



    var to_be_rotate = false;
    for (let x = 0; x < 8; x++) {
        for (let y = 0; y < 8; y++) {
            if(change_matrix[x][y])
                to_be_rotate = true;
        }
    }

    if(!to_be_rotate) {
        refreshSurface();
        switchAlternate();
    } else {
        mode = 'animation';
    }    
}

function resetChangeMatrix() {
    for (let x = 0; x < 8; x++) {
        for (let y = 0; y < 8; y++) {
            if(change_matrix[x][y])
                change_matrix[x][y] = null;
        }
    }
}

function switchAlternate() {
    if(alternate == 'red') {
        alternate = 'green';
    } else {
        alternate = 'red';
    }

    document.getElementById('alternate-color').className = alternate;
}

function refreshSurface() {
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            if(!matrix[i][j]) {
                balls[i][j].visible = false;
            } else {
                balls[i][j].visible = true;
                balls[i][j].rotation.z = 0;
                if(matrix[i][j] == 'green')
                    balls[i][j].rotation.z = Math.PI;
            }
        }
    }
}
//////////////////////////////////////////////////////////////////////


//RayCaster logic for picking cell/////////////////////////////////////
class PickHelper {
    constructor() {
        this.raycaster = new THREE.Raycaster();
        this.pickedObject = null;
    }
    
    pick(normalizedPosition, scene, camera, time) {
        
        if (this.pickedObject) {
            this.pickedObject = undefined;
        }
        
        if(scene.children[4]) {
            
            // cast a ray through the frustum
            this.raycaster.setFromCamera(normalizedPosition, camera);
            // get the list of objects the ray intersected
            const intersectedObjects = this.raycaster.intersectObjects(scene.children[4].children);
            if (intersectedObjects.length) {
                // pick the first object. It's the closest one
                this.pickedObject = intersectedObjects[0].object;

                if(this.pickedObject.name.startsWith('godi')) {
                    var i = this.pickedObject.name.substring(5,6);
                    var j = this.pickedObject.name.substring(7,8);
                    selectCell(parseInt(i), parseInt(j));
                }

                clearPickPosition();
            }
        }
    }
}

const pickPosition = {x: 0, y: 0};
clearPickPosition();

function setPickPosition(event) {
    pickPosition.x = (event.clientX / canvas.clientWidth ) *  2 - 1;
    pickPosition.y = (event.clientY / canvas.clientHeight) * -2 + 1;  // note we flip Y
}

function clearPickPosition() {
    pickPosition.x = -100000;
    pickPosition.y = -100000;
}

const pickHelper = new PickHelper();

window.addEventListener('click', setPickPosition);
//////////////////////////////////////////////////////////////////////


animate();

function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const pixelRatio = window.devicePixelRatio;
    const width = canvas.clientWidth * pixelRatio;
    const height = canvas.clientHeight * pixelRatio;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
        renderer.setSize(width, height, false);
    }
    return needResize;
}

function animate(time) {
    
    time *= 0.001;
    
    if (resizeRendererToDisplaySize(renderer)) {
        const canvas = renderer.domElement;
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
    }

    if(mode == 'animation') {
        for (let x = 0; x < 8; x++) {
            for (let y = 0; y < 8; y++) {
                if(change_matrix[x][y]) {
                    balls[x][y].rotation.z += (alternate == 'red' ? -0.1 : 0.1);
                    if(balls[x][y].rotation.z <= 0 || balls[x][y].rotation.z >= Math.PI) {
                        mode = 'normal';
                        matrix[x][y] = alternate;
                    }
                }
            }
        }

        if(mode == 'normal') {
            refreshSurface();
            switchAlternate();
            resetChangeMatrix();
        }
    }

    if(mode == 'start') {
        camera.position.y -= 0.3;
        camera.lookAt(0, -5, 0);
        if(camera.position.y <= 30)
            mode = 'normal';
    }
    
    requestAnimationFrame( animate );
    
    pickHelper.pick(pickPosition, scene, camera, time);
    
    renderer.render( scene, camera );
    
}
