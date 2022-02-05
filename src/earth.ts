
import * as THREE from "three"
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as loader from "ts-loader/dist";

import * as UTILS from 'three/examples/jsm/utils/BufferGeometryUtils.js';

import vShader from './shaders/vertexShader.glsl.js';
import fShader from './shaders/fragmentShader.glsl.js';

import atmosphereVertexShader from './shaders/atmosphereVertexShader.glsl.js';
import atmosphereFragmentShader from './shaders/atmosphereFragmentShader.glsl.js';

import { GeoJsonGeometry } from 'three-geojson-geometry';


class Earth {


    public RADIUS = 50;
    public RESOLUTION = 512;
    public USE_WIREFRAME = false;
    public HEIGHT_SCALE = 0.03;
    public BIAS = 0;



    public convertLongLatToSpherePos(long, lat) {
        let phi = (180 - long) * Math.PI / 180;
        let tetha = (90 - lat) * Math.PI / 180;

        let x = (this.RADIUS) * Math.cos(phi) * Math.sin(tetha);
        let z = (this.RADIUS) * Math.sin(phi) * Math.sin(tetha);
        let y = (this.RADIUS) * Math.cos(tetha)

        return { x, y, z }
    }

    public convertSpherePosToLongLat(x, y, z) {

        let tetha = Math.acos(y / this.RADIUS);

        let phi = 0.
        if (x > 0) {
            phi = Math.atan(z / x)
        }
        else if (x < 0) {
            phi = Math.atan(z / x) + Math.PI;
        }
        else {
            phi = Math.PI / 2
        }

        let long = -(phi * 180 / Math.PI - 180);
        let lat = -(tetha * 180 / Math.PI - 90)

        return { long, lat }
    }



    constructor(scene, camera, renderer) {





        // const ambientLight = new THREE.AmbientLight(0xffffff, 1); // soft white light
        // scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        scene.add(directionalLight);


        const controls = new OrbitControls(camera, renderer.domElement);
        controls.update();

        controls.mouseButtons = {
            RIGHT: THREE.MOUSE.ROTATE,
            MIDDLE: null,
            LEFT: null
        }

        controls.touches = {
            ONE: THREE.TOUCH.ROTATE,
            TWO: null,
        }

        controls.minDistance = 1.1 * this.RADIUS;
        controls.maxDistance = 5 * this.RADIUS;

        camera.position.set(0, 0, 2 * this.RADIUS);





        var earthGeometry = new THREE.IcosahedronGeometry(this.RADIUS, this.RESOLUTION);

        let loader = new THREE.TextureLoader();

        let earthDiffuseMap = loader.load("Images/uv3.jpg");
        let earthBordersMap = loader.load("Images/borders.png");
        let earthHeightMap = loader.load("Images/earth_heightmap.jpg");
        let earthSpecularMap = loader.load("Images/specular.png");
        let earthNormalMap = loader.load("Images/EarthNormal.png");

        earthDiffuseMap.minFilter = THREE.NearestFilter;
        earthDiffuseMap.magFilter = THREE.NearestFilter;

        earthBordersMap.minFilter = THREE.NearestFilter;
        earthBordersMap.magFilter = THREE.NearestFilter;

        earthHeightMap.minFilter = THREE.NearestFilter;
        earthHeightMap.magFilter = THREE.NearestFilter;

        earthSpecularMap.minFilter = THREE.NearestFilter;
        earthSpecularMap.magFilter = THREE.NearestFilter;

        earthNormalMap.minFilter = THREE.NearestFilter;
        earthNormalMap.magFilter = THREE.NearestFilter;


        let borderColor = new THREE.Vector4(1.0, 1.0, 1.0, 1.0);




        var self = this;



        let raycaster = new THREE.Raycaster();
        let mouse = new THREE.Vector2();
        let mouse2 = new THREE.Vector2();
        document.addEventListener('mousemove', onMouseMove, false);


        let mouseOverPoint = new THREE.Vector3();


        function onMouseMove(event) {
            mouse.x = (event.clientX);
            mouse.y = -(event.clientY - renderer.domElement.height);

        }







        let json = require('./data/countries.json');

        const alt = this.RADIUS + 0.2;

        const lineObjs = [];
        const countries = []

        const materials = [
            new THREE.LineBasicMaterial({ color: 'blue' }), // outer ring
            new THREE.LineBasicMaterial({ color: 'green' }) // inner holes
        ];

        json.features.forEach(({ properties, geometry }, index) => {
            lineObjs.push(new THREE.LineSegments(
                new GeoJsonGeometry(geometry, alt),
                materials
            ));

            let country = {
                name: properties.ADMIN,
                type: geometry.type,
                geometry: geometry.coordinates
            }
            country.geometry.forEach(el => {
                el.map(e => new THREE.Vector2(e[0], e[1]))
            })
            countries.push(country)

        });

        let scale = 2;
        const width = scale * 3600;
        const height = scale * 1800;
        const size = width * height;
        let data = new Uint8Array(4 * size);

        const color = new THREE.Color(0xffffff);

        const r = Math.floor(color.r * 255);
        const g = Math.floor(color.g * 255);
        const b = Math.floor(color.b * 255);


        countries.forEach(country => {
            country.geometry.forEach(geo => {
                if (country.type == "MultiPolygon") geo = geo[0]

                let last_point = null;
                geo.forEach(point => {



                    // long : -180 -> 180
                    let x = scale * 10 * (point[0] + 180);
                    // lat : -90 -> 90
                    let y = scale * 10 * (point[1] + 90);

                    x = Math.round(x);
                    y = Math.round(y);


                    if (last_point != null) {

                        let vec = new THREE.Vector2(x - last_point.x, y - last_point.y);
                        let len = vec.length()
                        let dir = vec.normalize();
                        // if(len>1){
                        //     console.log("length" + len);
                        //     console.log(vec)
                        //     console.log(x,y)
                        //     console.log(last_point)
                        //     console.log(country.name)

                        // } 
                        for (let index = 0; index <= len; index++) {


                            let xp = last_point.x + index * dir.x;
                            let yp = last_point.y + index * dir.y;

                            xp = Math.round(xp);
                            yp = Math.round(yp);


                            data[4 * xp + width * yp * 4] = r;
                            data[4 * xp + width * yp * 4 + 1] = g;
                            data[4 * xp + width * yp * 4 + 2] = b;
                            data[4 * xp + width * yp * 4 + 3] = 255;
                        }
                    }

                    last_point = new THREE.Vector2(x, y);

                });
                last_point = null;
            });
        });


        let dataTexture = new THREE.DataTexture(data, width, height, THREE.RGBAFormat);

        dataTexture.needsUpdate = true;
        earthBordersMap = dataTexture;


        // MATERIAL WITH CUSTOM SHADERS

        var uniforms = {
            texture1: { type: 'sampler2D', value: earthDiffuseMap },
            normalMap: { type: 'sampler2D', value: earthNormalMap },
            borderMap: { type: 'sampler2D', value: earthBordersMap },
            borderColor: { type: 'vec4', value: borderColor },
            mousePos: { type: 'vec3', value: mouse },
            resolution: { type: "vec2", value: new THREE.Vector2(renderer.domElement.width, renderer.domElement.height) },
            heightMap: { type: 'sampler2D', value: earthHeightMap },
            R: { type: 'float', value: this.RADIUS },
            heightScale: { type: 'float', value: this.HEIGHT_SCALE }
        };

        var material = new THREE.ShaderMaterial({
            uniforms: uniforms,
            vertexShader: vShader,
            fragmentShader: fShader,
            wireframe: this.USE_WIREFRAME
        });


        var basicMaterial = new THREE.MeshBasicMaterial({
            wireframe: this.USE_WIREFRAME,
            map: dataTexture,
        });

        var earthMesh = new THREE.Mesh(earthGeometry, material);
        earthMesh.name = "earth";

        scene.add(earthMesh);



        // lineObjs.forEach((obj, index) => {
        //     obj.rotation.y = -Math.PI / 2;
        //     scene.add(obj)

        //     // // Set a random color to the contry borders
        //     // let color = new THREE.Color();
        //     // color.setHex(Math.floor(Math.random() * 16777215))
        //     // obj.material = [
        //     //     new THREE.LineBasicMaterial({ color: color }), // outer ring
        //     //     new THREE.LineBasicMaterial({ color: 'green' }) // inner holes
        //     // ];

        //     // change the color of first country
        //     if (index == 0) {
        //         obj.material = [
        //             new THREE.LineBasicMaterial({ color: 'red' }), // outer ring
        //             new THREE.LineBasicMaterial({ color: 'green' }) // inner holes
        //         ];
        //     }
        // }
        // );


        // // console.log(lineObjs)




        // Add Atmosphere
        let camDir = new THREE.Vector3();
        camera.getWorldDirection(camDir)

        camDir.multiplyScalar(-1.0);
        camDir.normalize();

        let dist = controls.getDistance() - self.RADIUS;
        let max_dist = controls.maxDistance - self.RADIUS;

        var atmosphereMaterial = new THREE.ShaderMaterial({
            vertexShader: atmosphereVertexShader,
            fragmentShader: atmosphereFragmentShader,
            blending: THREE.AdditiveBlending,
            side: THREE.BackSide,
            uniforms: {
                cameraDirection: { type: 'vec3', value: camDir },
                cameraDistance: { type: 'float', value: dist / max_dist }
            }
        });

        var atmosphere = new THREE.Mesh(
            new THREE.IcosahedronGeometry(this.RADIUS, this.RESOLUTION),
            atmosphereMaterial

        );
        atmosphere.name = "atmosphere";
        atmosphere.scale.set(1.02, 1.02, 1.02);

        scene.add(atmosphere);




        let skyboxTexture = new THREE.TextureLoader().load("./Images/starmap.jpg");
        skyboxTexture.minFilter = THREE.NearestFilter;
        skyboxTexture.magFilter = THREE.NearestFilter;


        const skyboxGeometry = new THREE.SphereGeometry( 1000, 128, 128 );
        const skyboxMaterial = new THREE.MeshBasicMaterial( {
            map: skyboxTexture,
            side: THREE.BackSide
        } );
        const skybox = new THREE.Mesh( skyboxGeometry, skyboxMaterial );
        scene.add( skybox );

        // scene.background = new THREE.TextureLoader().load("./Images/pinTexture.png");

            // scene.background = new THREE.Color( "0xffffff" );




        function eerp(a, b, t) {
            return Math.pow(a, 1 - t) * Math.pow(b, t)
        }



        function animate() {
            requestAnimationFrame(animate);
            controls.update();
            let dist = controls.getDistance() - self.RADIUS;
            let max_dist = controls.maxDistance - self.RADIUS;
            let speed = eerp(0.01, 100, dist / max_dist)
            if (speed > 1) speed = 1;
            controls.rotateSpeed = speed


            material.uniforms.mousePos.value = mouse;

            camera.getWorldDirection(camDir);

            camDir.multiplyScalar(-1.0);
            camDir.normalize();

            atmosphereMaterial.uniforms.cameraDirection.value = camDir;
            atmosphereMaterial.uniforms.cameraDistance.value = dist / max_dist;





            renderer.render(scene, camera);
        };

        animate();
    }


}

export { Earth as Earth }