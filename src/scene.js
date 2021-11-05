
import * as THREE from 'three';
//import * as THREE from 'https://unpkg.com/three@0.126.1/build/three.module.js' // this wont work
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
// handle simple animations
import gsap from 'gsap';
// simple gui for manipulating and tweaking values
import * as dat from 'dat.gui';
//import { Plane } from 'svelthree';



// world state values
const world = {
    plane: {
      width: 10,
      height: 10,
      depth: 0.7,
      widthSegments: 10,
      heightSegments: 10
    },


}


// create dat.gui interface for tweaking values
const gui = new dat.GUI();

// generate planeGeometry 
// randomizes geometry on z axis. pretty neat

function generatePlane() {
    planeMesh.geometry.dispose()
    planeMesh.geometry = new THREE.PlaneGeometry(
        world.plane.width,
        world.plane.height,
        world.plane.widthSegments,
        world.plane.heightSegments
    )
    console.log(planeMesh.geometry)

    // get planeMesh point array
    // loop through point array and adjust z values
    const {array} = planeMesh.geometry.attributes.position
    console.log("Plane array size: ", array.length/3)
    for (let i = 0; i < array.length; i += 3){
        // do something
        const x = array[i]
        const y = array[i+1]
        const z = array[i+2]

        if(i/3 < 3){
            console.log("i: ",parseInt(i/2),", x: ",x,", y: ",y,", z: ",z)
        }
        array[i+2] = z + Math.random() * world.plane.depth

    }
}





// add gui slider for adjusting width 
gui.add(world.plane, 'width', 1, 20).onChange(generatePlane)
// add gui slider for adjusting height
gui.add(world.plane, 'height', 1, 20).onChange(generatePlane)
// add gui slider for adjusting depth
gui.add(world.plane, 'depth', -1, 1).onChange(generatePlane)
// add gui slider for widthsegments and heightsegments
gui.add(world.plane, 'widthSegments', 1, 100).onChange(generatePlane)
gui.add(world.plane, 'heightSegments', 1, 100).onChange(generatePlane)






let renderer // why the fuck does svelte only work when I put this here

// instantiate raycaster
const raycaster = new THREE.Raycaster()

// instantiate the scene
const scene = new THREE.Scene()
// instantiate camera
const camera = new THREE.PerspectiveCamera(
    75, 
    window.innerWidth / window.innerHeight, 
    0.1, 
    1000
);
// default camera position
camera.position.z = 15;


// create new cube and cube material
const geometry = new THREE.BoxGeometry( 0.5, 0.5, 0.5);
const cubeMaterial = new THREE.MeshPhongMaterial({ 
    color: 0x00ffff                         // hex values for (R, G, B) => (0x [ff, ff, ff])
}); 
// create and add cube
const cube = new THREE.Mesh(geometry, cubeMaterial);
scene.add(cube);
cube.position.set(5,0,5);



// create array of cubes
function createCubeArray() {
    // empty buffer for cubes
    let cubeArray = [];
    let squareNum = 0
    for (var i = 0; i < world.plane.widthSegments; i++) {
        for (var j = 0; j < world.plane.heightSegments; j++) {

            let object = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), cubeMaterial);
            object.position.x = i;
            object.position.y = j;
            object.position.z = k;
            cubeArray.push(object);
            boxHolder.add(object);


            squareNum += 1
        }
    }
}
//createCubeArray()


// create new plane
const planeGeometry = new THREE.PlaneGeometry(//5,5,10,10)
    world.plane.width,
    world.plane.height,
    world.plane.widthSegments,
    world.plane.heightSegments)
// new plane material
const planeMaterial = new THREE.MeshPhongMaterial({
    color: 0xff0000,
    side: THREE.DoubleSide,
    flatShading: THREE.FlatShading,
    //vertexColors: true
})
// create plane and add to scene
const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial)
scene.add(planeMesh)


const sineCurveDeform = () => {

}
generatePlane()

// create light
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(0, -1, 1);
scene.add(light);

const backLight = new THREE.DirectionalLight(0xffffff, 1);
backLight.position.set(0, 0, -1);
scene.add(backLight);




// mouse position buffer
const mouse = {
    x: undefined,
    y: undefined
};

let frame = 0;

const animate = () => {
    // get current animation frame
    requestAnimationFrame(animate);
    
    // push new animation frame to renderer
    renderer.render(scene, camera);

    raycaster.setFromCamera(mouse, camera)
    const planeIntersects = raycaster.intersectObject(planeMesh)
    if (planeIntersects.length>0){

        // get points of selected square
        const squarePoints = planeMesh.geometry.index.array.slice(
            Math.floor(planeIntersects[0].faceIndex/2) * 6,
            Math.floor(planeIntersects[0].faceIndex/2 ) * 6 + 5
        )

        const uniqueSquarePoints = [...new Set(squarePoints)]
        // get avg x y z position from 4 points
        
        let px = 0
        let py = 0
        let pz = 0
        for(let i=0; i< uniqueSquarePoints.length; i++){
            let x = planeMesh.geometry.attributes.position.array[uniqueSquarePoints[i]*3]
            let y = planeMesh.geometry.attributes.position.array[uniqueSquarePoints[i]*3+1]
            let z = planeMesh.geometry.attributes.position.array[uniqueSquarePoints[i]*3+2]

            px += (x - px)/(i+1)
            py += (y - py)/(i+1)
            pz += (z - pz)/(i+1)
        }
        
        cube.position.set(px,py,pz)


        console.log(
            "face tri index:", planeIntersects[0].faceIndex,
            "\nface poly index:", Math.floor(planeIntersects[0].faceIndex/2),
            
            "\ntri a:", planeIntersects[0].face.a, 
            ", tri b:", planeIntersects[0].face.b, 
            ", tri c:", planeIntersects[0].face.c,
            
            //"\ntotal number of points", planeMesh.geometry.attributes.position.array.length/3, 
            //figure out which square mouse is in (because 2 tri-faces make a square)
            
            "\nposition points of selected square face", squarePoints,
            "\nunique:", uniqueSquarePoints,
            
            "\n ", uniqueSquarePoints[0],uniqueSquarePoints[1],uniqueSquarePoints[2],uniqueSquarePoints[3],

            "\navg position x:",px," y:",py," z:",pz,


            // planeIntersects[0].faceIndex
            // returns single value within [0, 199]
            // [0, 1, 2, 3, 4, 5, ..., 198, 199] * 3
            // [0, 3, 6, 9, 12, 15, ..., 594, 597]
            


            // planeMesh.geometry.index.array
            // returns ordered array of points relating to tri faces 
            // from 0 to 599    [a, b, c, a, b, c, a, b, c, ...]
            // Uint16Array(600) [0, 11, 1, 11, 12, 1, 1, 12, 2, 12, 13, 2, 2, 13, 3, 13, ...]



        )



    }
        
    // update animation frame
    frame += 0.01

    cube.rotation.x = frame;
    cube.rotation.y = frame;

    



};

const resize = () => {
    // set size of window
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(devicePixelRatio)
    document.body.appendChild(renderer.domElement)
    

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
};


export const createScene = (el) => {
    renderer = new THREE.WebGLRenderer({ antialias: true, canvas: el });
    
    new OrbitControls(camera, renderer.domElement)
    resize();
    animate();

    //console.log(scene);
    //console.log(camera);
    //console.log(renderer);
    


}

window.addEventListener('resize', resize);



window.addEventListener('mousemove', (event) => {
    
    mouse.x = (event.clientX / innerWidth) * 2 - 1
    mouse.y = -(event.clientY / innerHeight) * 2 + 1
    //console.log("normalized - mouse x: ",mouse.x, "mouse y: ", mouse.y)
  })