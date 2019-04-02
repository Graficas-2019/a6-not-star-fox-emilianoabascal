var renderer, scene, camera, root, obstacle, group, groupTree = null;
var game = false;
var crashBuilding= 0;
var floor;
var INTERSECTED;
var counter = 0;
var actualTime = 0;
var highScore = 0;
var animator = null,
duration1 = 1,
loopAnimation = false;
var deadAnimator;
var morphs = [];
var obsacles = [];
var score = 0;
var duration = 20000; // ms
var currentTime = Date.now();
var max = 22;
var min = -22;
var health = 100;
var maxDragonY = 8;
var minDragonY = -2;
var MaxEnemies = 4;
var objLoader = null
var positionsX;
var animation = "idle";
var shots= [];
var enemies= [];

function startGame(){

    if(highScore<score){
        highScore = score;
    }
        
//    document.getElementById("highScore").innerHTML = "best score: " + highScore;
    gameMinutes = 0
    gameStarted = Date.now();
    actualTime = Date.now();
    actualTime2 = Date.now();
    score = 0;
    names = 0;
    robotsSpawned = 0;
    document.getElementById("time").innerHTML = 60+" s";
    document.getElementById("score").innerHTML = "score: " +score;
    document.getElementById("startButton").style.display="none";
    document.getElementById("startButton").disabled = true;
    game = true;
    
}
function changeAnimation(animation_text){
    animation = animation_text;
    if(animation =="dead"){
        createDeadAnimation();
    }
}

function loadTree(){
    if(!objLoader)
        objLoader = new THREE.OBJLoader();
    objLoader.load('models/lowpolytree.obj',
    function(object){
        object.traverse( function ( child ){
            if (child instanceof THREE.Mesh){
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });                
        tree = object;
        tree.scale.set(4,4,4);
        tree.position.set(positionsX)
        tree.bbox = new THREE.Box3()
        tree.bbox.setFromObject(tree)
        group.add(object);
    });
}
function loadEnemies(){
    if(!objLoader)
        objLoader = new THREE.OBJLoader();
    objLoader.load('models/enemy.obj',

        function(object){
            var texture = new THREE.TextureLoader().load('models/enemyTexture.png');
            object.traverse( function ( child ){
                if ( child instanceof THREE.Mesh ){
                    child.castShadow = true;
                    child.receiveShadow = true;
                    child.material.map = texture;
                }
            });
            enemy = object;
            enemy.scale.set(2,2,2);
            enemy.position.set(positionsX)
            enemy.rotation.set(Math.PI,0,0)
            enemy.bbox = new THREE.Box3()
            enemy.bbox.setFromObject(enemy)
            group.add(object);
            enemies.push(enemy);
        });
}
function cloneObstacle(i){
    var newobstacle = tree.clone();
    newobstacle.bbox = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
    newobstacle.position.set(Math.random() * (max - min) + min,Math.random() * (maxDragonY - minDragonY) + minDragonY, -110);
    obsacles.push(newobstacle);
    scene.add(newobstacle);
}

function loadMileniumFalcon(){
    if(!objLoader)
        objLoader = new THREE.OBJLoader();
    objLoader.load('models/NewTieFighter.obj',
        function(object){
            object.traverse( function ( child ){
                if ( child instanceof THREE.Mesh ){
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });
            object.scale.set(0.5,0.5,0.5);
            object.position.z = 90;
            object.rotation.x = 60;
            object.position.y = 5;
            hero = object;
            group.add(hero);
            hero.bbox = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
        });
}

function heroShot(initialPosition){
    var geometry = new THREE.CylinderGeometry( .3, .3, 2, 32 );
    var material = new THREE.MeshBasicMaterial( {color: 0xFF0000} );
    var shot = new THREE.Mesh( geometry, material );
    shot.rotation.set(Math.PI,0,0)
    shot.position.copy(initialPosition)
    shot.bbox = new THREE.Box3()
    shot.bbox.setFromObject(shot)
    return shot
}

function cloneEnemies (i){
    var newEnemie = enemy.clone();
    newEnemie.bbox = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
    newEnemie.position.set(Math.random() * (max - min) + min,Math.random() * (maxDragonY - minDragonY) + minDragonY, -100);
    enemies.push(newEnemie);
    scene.add(newEnemie);
}


function animate() {
    hero.bbox.setFromObject(hero)
    var now = Date.now();
    var deltat = now - currentTime;
    var finish = now - gameStarted;
    currentTime = now;
    var seconds = (now - actualTime)/1000
    if (seconds >= 1.5){
        if (counter < MaxEnemies){
            counter += 1;
            cloneObstacle(counter);
            cloneEnemies(counter);
            actualTime = now; 
        }
    }
    if (obsacles.length > 0){
        for(obstacle of obsacles){
            obstacle.bbox.setFromObject(obstacle)
            if(hero.bbox.intersectsBox(obstacle.bbox)){
                crashBuilding += 1
                if (crashBuilding >= 8){
                    crashBuilding = 0
                    health -= 30;
                }
            }
            obstacle.position.z += 1.2 ;
            obstacle.position.y = -4 ;   
        }
            if(obstacle.position.z >= camera.position.z - 5){
                obstacle.position.set(Math.random() * (max - min) + min,Math.random() * (maxDragonY - minDragonY) + minDragonY, -105);
            }
    }

    if(enemies.length > 0){
        for(enemy of enemies){
            for(shot of shots){
                shot.bbox.setFromObject(shot)
                enemy.bbox.setFromObject(enemy)
                if(shot.bbox.intersectsBox(enemy.bbox)){
                    scene.remove(shot)
                    score ++;
                    document.getElementById("score").innerHTML = "score: " +score;
                    enemy.position.set(Math.random() * (max - min) + min,Math.random() * (maxDragonY - minDragonY) + minDragonY, -100);
                    shots.splice(i, 1)
                }
            }
                enemy.position.z += .7 ;
            
            if(enemy.position.z >= camera.position.z-5){  
                    enemy.position.set(Math.random() * (max - min) + min,Math.random() * (maxDragonY - minDragonY) + minDragonY, -100);
            }
        }
    
    }
    if(health <= 0 || finish > 1000){
        gameStarted = now;
        gameMinutes+=1;
        document.getElementById("time").innerHTML = 60-gameMinutes+ " s";
        if(gameMinutes == 60){
            document.getElementById("startButton").style.display="block";
            document.getElementById("startButton").disabled = false;
            health = 100;
            game = false;
            for(obstacle of obsacles){
                scene.remove(obstacle); 
                
            }
            obsacles.splice(1, obsacles.length)

            for(enemy of enemies){
                scene.remove(enemies); 
                
            }
            enemies.splice(0, enemies.length)
            for(shots_i of shots){
                scene.remove(shots_i); 
                
            }
            shots.splice(1, shots.length)

            hero.position.z = 80;
            hero.position.y = 2;
            hero.position.x = 0;
            counter = 0;
            
        }
    }
    for(var i=0; i<shots.length; i++) {
        if(shots[i].position.z == -160) {
            scene.remove(shots[i])
            shots.splice(i, 1)
        }else{
            shots[i].rotation.set(Math.PI/2,0,0)
            shots[i].position.z -= 3
        }
      }
}
function run() 
{
    requestAnimationFrame(function() { run(); });
    renderer.render( scene, camera );
        if(game)
        {
            animate();
            KF.update();
            animator.start();

        }

}

var directionalLight = null;
var spotLight = null;
var ambientLight = null;
var mapUrl = "images/floor.gif";

var SHADOW_MAP_WIDTH = 2048, SHADOW_MAP_HEIGHT = 2048;


function createScene(canvas) {
    // Create the Three.js renderer and attach it to our canvas
    renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias: true } );
    // Set the viewport size
    renderer.setSize(window.innerWidth, window.innerHeight);
    // // Turn on shadows
    renderer.shadowMap.enabled = true;
    // // Options are THREE.BasicShadowMap, THREE.PCFShadowMap, PCFSoftShadowMap
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    // Create a new Three.js scene
    scene = new THREE.Scene();
    // Add  a camera so we can view the scene
    camera = new THREE.PerspectiveCamera( 45, canvas.width / canvas.height, 1, 4000 );
    camera.position.set(0, 9, 117.9);
    camera.rotation.set(-Math.PI/18,0,0);
    scene.add(camera);
    // Create a group to hold all the objects
    root = new THREE.Object3D;
    spotLight = new THREE.SpotLight (0xffffff);
    spotLight.position.set(-20, 100, 0);
    spotLight.target.position.set(-2, 0, -2);
    root.add(spotLight);
    spotLight.castShadow = true;
    spotLight.shadow.camera.near = 1;
    spotLight.shadow.camera.far = 200;
    spotLight.shadow.camera.fov = 45;
    spotLight.shadow.mapSize.width = SHADOW_MAP_WIDTH;
    spotLight.shadow.mapSize.height = SHADOW_MAP_HEIGHT;
    ambientLight = new THREE.AmbientLight ( 0x888888 );
    root.add(ambientLight);
    loadMileniumFalcon();
    loadEnemies();
    loadTree();
    // Create a group to hold the objects
    group = new THREE.Object3D;
    root.add(group);
    groupTree = new THREE.Object3D;
    root.add(groupTree);
    sphericalHelper = new THREE.Spherical();
    // Create a texture map
    var map = new THREE.TextureLoader().load(mapUrl);
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.repeat.set(4, 4);
    var color = 0xffffff;
    // // Put in a ground plane to show off the lighting
    geometry = new THREE.PlaneGeometry(200, 200, 50, 50);
    floor = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({color:color, map:map, side:THREE.DoubleSide}));
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -4.02;
    // // Add the mesh to our group
    group.add( floor );
    floor.castShadow = false;
    floor.receiveShadow = true;
    // Now add the group to our scene
    scene.add( root );
    // axes
    scene.add( setSkyBox() );
        
    document.onkeydown = handleKeyDown;
    window.addEventListener( 'resize', onWindowResize);
}

function setSkyBox(){
    var imagePrefix = "images/skyBox/bkg1_";
    var directions  = ["xpos", "xneg", "ypos", "yneg", "zpos", "zneg"];
    var imageSuffix = ".png";
    var skyGeometry = new THREE.CubeGeometry( 230, 100, 200 );	
    var loader = new THREE.TextureLoader();
    var materialArray = [];
    for (var i = 0; i < 6; i++)
        materialArray.push( new THREE.MeshBasicMaterial({
            map: loader.load( imagePrefix + directions[i] + imageSuffix ),
            side: THREE.BackSide
        }));
    var skyBox = new THREE.Mesh( skyGeometry, materialArray );
    skyBox.position.set(0,20,0)
    return skyBox;
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

function handleKeyDown(keyEvent){
    if ( keyEvent.keyCode === 37) {
        if(hero.position.x > -22)
        hero.position.x -= 1.5

    } else if ( keyEvent.keyCode === 39) {
        if(hero.position.x < 22)
        hero.position.x += 1.5

	}else if ( keyEvent.keyCode === 38){
        if(hero.position.y <= 11)
        hero.position.y += 0.5
    }
    else if ( keyEvent.keyCode === 40){
        if(hero.position.y > -4)
        hero.position.y -= 0.5
    }
    else if(keyEvent.keyCode == 32)
    {
    var shipPosition = hero.position.clone()
    var shot = heroShot(shipPosition)
    shots.push(shot)
    scene.add(shot)
    }
	
}

function simulateMovement(){    
    animator = new KF.KeyFrameAnimator;
    animator.init({ 
            interps:
                [
                    { 
                        keys:[0, 1], 
                        values:[
                                { x : 0, y : 0 },
                                { x : 0, y : 1 },
                                ],
                        target:floor.material.map.offset
                    },
                ],
            loop: loopAnimation,
            duration1:duration,
        });
}