window.addEventListener('load', initialize);

var geometriesNames = [
    'tetrahedron',
    'cube',
    'sphere',
    'icosahedron',
    'dodecahedron'
];

var materialNames = [
    'phongFlat',
    'phongSmooth',
    'lambert'
];

var params = {
    geometry: 'tetrahedron',
    subdivAmount: 0,
    material: 'phongFlat',
    meshColor: '#ff8000',
    surface: true,
    wireColor: '#ffffff',
    wireframe: true
};

var crnParams = {
    subdivAmount: 0,
    geometry: null,
    mesh: null,
    wireMesh: null,
    wireMat: null,
    meshColor: new THREE.Color(parseInt(params.meshColor.replace('#', '0x'))),
    wireColor: new THREE.Color(parseInt(params.wireColor.replace('#', '0x'))),
    material: params.material,
};

var geometries = [];
var materials = [];

var guiControls;
var stats;

var renderer;
var scene;
var camera;
var controls;

var width, height;

//subdivide

function printVertices(geometry) {
    console.log("Print vertices!");
    var vertices = new Float32Array(geometry.vertices.length * 3);
    for (var i = 0, il = geometry.vertices.length; i < il; ++i) {
        console.log(geometry.vertices[i].x + ", " + geometry.vertices[i].y + ", " + geometry.vertices[i].z);
    }
    console.log("Print faces!");
    var indices = new Uint32Array(geometry.faces.length * 3);
    for (var i = 0, il = geometry.faces.length; i < il; ++i) {
        console.log(geometry.faces[i].a + ", " + geometry.faces[i].b + ", " + geometry.faces[i].c);
    }
}

function changeMeshGeometry() {
    scene.remove(crnParams.mesh);
    scene.remove(crnParams.wireMesh);
    createDefaultGeometry();
}

function changeSubdivAmount() {
    printVertices(crnParams.geometry);
}

function changeMeshMaterial(){
    crnParams.mesh.material = materials[params.material];
    crnParams.material = params.material;
    crnParams.mesh.material.needsUpdate = true;
}

function changeMeshColor() {
    crnParams.meshColor = new THREE.Color(parseInt(params.meshColor.replace('#', '0x')));
    materials['phongFlat'].color = crnParams.meshColor;
    materials['phongSmooth'].color = crnParams.meshColor;
    materials['lambert'].color = crnParams.meshColor;
    crnParams.mesh.material.needsUpdate = true;
}

function changeMeshSurface() {
    crnParams.mesh.visible = params.surface;
}

function changeWireMeshColor() {
    crnParams.wireColor = new THREE.Color(parseInt(params.wireColor.replace('#', '0x')));
    crnParams.wireMat.color = crnParams.wireColor;
    crnParams.wireMat.needsUpdate = true;
}

function changeMeshWireframe() {
    crnParams.wireMesh.visible = params.wireframe;
}

function initGui() {
    gui = new dat.GUI();
    gui.add(params, 'geometry', geometriesNames).onChange(changeMeshGeometry);
    gui.add(params, 'subdivAmount').onChange(changeSubdivAmount);
    gui.add(params, 'material', materialNames).onChange(changeMeshMaterial);
    gui.addColor(params, 'meshColor').name('color').onChange(changeMeshColor);
    gui.add(params, 'surface').onChange(changeMeshSurface);
    gui.addColor(params, 'wireColor').name('wire color').onChange(changeWireMeshColor);
    gui.add(params, 'wireframe').onChange(changeMeshWireframe);
}

function createInitialGeoms() {
    geometries['tetrahedron'] = new THREE.TetrahedronGeometry(4);
    geometries['cube'] = new THREE.BoxGeometry(4, 4, 4);
    geometries['sphere'] = new THREE.SphereGeometry(4, 16, 9);
    geometries['icosahedron'] = new THREE.IcosahedronGeometry(4);
    geometries['dodecahedron'] = new THREE.DodecahedronGeometry(4);
}

function createMaterials() {
    var commonPhongParams = {
        color: crnParams.meshColor,
        shininess: 40,
        specular: 0x222222
    };
    materials['phongFlat'] = new THREE.MeshPhongMaterial(commonPhongParams);
    materials['phongFlat'].shading = THREE.FlatShading;
    materials['phongSmooth'] = new THREE.MeshPhongMaterial(commonPhongParams);
    materials['phongSmooth'].shading = THREE.SmoothShading;
    materials['lambert'] = new THREE.MeshLambertMaterial({color: crnParams.meshColor});
    // create the wireframe material
    crnParams.wireMat = new THREE.MeshBasicMaterial({
        color: crnParams.wireColor,
        wireframe: true
    });
}


function createDefaultGeometry() {
    crnParams.geometry = geometries[params.geometry];
    crnParams.subdivAmount = 0;
    crnParams.mesh = new THREE.Mesh(
        crnParams.geometry,
        crnParams.material
    );
    changeMeshMaterial();
    scene.add(crnParams.mesh);
    // create the wireframe mesh
    crnParams.wireMesh = new THREE.Mesh(
        crnParams.geometry,
        crnParams.wireMat
    );
    scene.add(crnParams.wireMesh);
}

function createDefaultLights() {
    // create a point light
    var pointLight = new THREE.PointLight(0xFFFFFF);
    pointLight.position.x = 10;
    pointLight.position.y = 50;
    pointLight.position.z = 130;
    scene.add(pointLight);

    // create a point light
    var pointLight = new THREE.PointLight(0xFFFFFF);
    pointLight.position.x = -10;
    pointLight.position.y = -50;
    pointLight.position.z = -130;
    scene.add(pointLight);
}

function initialize() {
    width = window.innerWidth;
    height = window.innerHeight;

    // Get the DOM element to attach to
    const container = document.querySelector('#container');

    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.top = '0px';
    stats.domElement.style.zIndex = 100;
    container.appendChild( stats.domElement );

    // Create a WebGL renderer, camera and a scene
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(width, height);

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera( 45, width / height, 0.1, 40);
    camera.position.z = 15;

    controls = new THREE.OrbitControls(camera,renderer.domElement);
    controls.addEventListener('change', render);
    // some custom control settings
    controls.enablePan = false;

    scene.add(camera);

    window.addEventListener( 'resize', onWindowResize, false );

    initGui();

    // Attach the renderer-supplied DOM element.
    container.appendChild(renderer.domElement);

    createDefaultLights();
    createInitialGeoms();
    createMaterials();
    createDefaultGeometry();

    requestAnimationFrame(update);
}

function update () {
  renderer.render(scene, camera);
  stats.update();
  requestAnimationFrame(update);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

function render() {
    renderer.render( scene, camera );
}
