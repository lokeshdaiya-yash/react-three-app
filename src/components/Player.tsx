import { useGLTF, useAnimations, OrbitControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { useInput } from "../hooks/useInput";

interface direction {
    forward: any;
    backward: any;
    left: any;
    right: any;
}

let walkDirection = new THREE.Vector3();
let rotateAngle = new THREE.Vector3(0, 1, 0);
let rotateQuaternion = new THREE.Quaternion();
let cameraTarget = new THREE.Vector3();

const directionOffset = ({ forward, backward, left, right }: direction) => {
    var directionOffset = 0;
    if (forward) {
        if (left) {
            directionOffset = Math.PI / 4; //w+a 
        } else if (right) {
            directionOffset = -Math.PI / 4; //w+d 
        }
    } else if (backward) {
        if (left) {
            directionOffset = Math.PI / 4 + Math.PI / 2; //s+a 
        } else if (right) {
            directionOffset = -Math.PI / 4 - Math.PI / 2; //s+d 
        } else {
            directionOffset = Math.PI; //s
            // model.scene.rotation.y = 180;
        }
    } else if (left) {
        directionOffset = Math.PI / 2; //a 
    } else if (right) {
        directionOffset = -Math.PI / 2; //d 
    }
    return directionOffset;
};


const Player = () => {
    const { forward, backward, left, right, jump, shift } = useInput();
    const [houseView, setHouseView] = useState("Outer")

    // Girl Model
    const modelProduct1 = useGLTF("./models/mi/product_miair4_002.a0d751db5d52c6309e67d050ba9dbb64bbea1d0e.glb");
    const modelProduct2 = useGLTF("./models/mi/product_mibuds_003.832e811826fd0bbe95ac14522d3bd7a906bb8cac.glb");
    const modelProduct3 = useGLTF("./models/mi/Xiaomi_RN11_K6S_AtlanticBlue.a97d2244891c866a442a613a40fd46561ff856d8.glb");
    // modelProduct3.scene.position.set(-4,0,4) 
    // modelProduct3.scene.scale.set(6,6,6)
    const modelProduct4 = useGLTF("./models/mi/Xiaomi_RN11_K6T_GraphiteGray.3f16dceb1937ef2db29b591f0ecaa93bd2b1282f.glb");
    const modelProduct5 = useGLTF("./models/mi/Xiaomi_RN11_K7S_GraphiteGray.4cf0424a33626681d1d30a07b6ab668f7e76f960.glb");
    const modelProduct6 = useGLTF("./models/mi/Xiaomi_RN11_K7T_StarBlue.499ef5934fec25ac49d8e63046907438e4b6456e.glb");
    const modelShowroom = useGLTF("./models/mi/ve_space_048.0e4c3ace1211fc6c9bf3b1ca631abbf6bae866a7.glb");
    modelShowroom.scene.position.set(-4,0,4)
    modelShowroom.scene.scale.set(0.6,0.6,0.6)

    const model = useGLTF("./models/mi/mi_avatars_008.glb");
    const { actions } = useAnimations(model.animations, model.scene);
    console.log(actions," Girl Position");
    // model.scene.rotation.y = 0
    model.scene.scale.set(0.5, 0.5, 0.5);
    model.scene.traverse((object) => {
        if (object.isMesh) {
            object.castShadow = true;
        }
    });
    const currentAction = useRef("");
    const controlsRef = useRef<typeof OrbitControls>();
    const camera = useThree((state) => state.camera);


    // House External View Model
    const model2 = useGLTF("./textures/wooden_forest_houses/scene.gltf");
    model2.scene.position.set(-4,0,4) 
    model2.scene.scale.set(0.6,0.6,0.6)

    // House Internal View Model
    const model3 = useGLTF("./textures/dining_room__kichen_baked/scene.gltf");
    model3.scene.position.set(-4,0,4) 
    model3.scene.scale.set(1,1,1)

    // View Changing
    useEffect(() => {
        if(model.scene.position.x > 4){
            console.log("-4 here")
            setHouseView("Inner")
        }
        if(model.scene.position.x < 4)
            setHouseView("Outer")
    },[model])

    //to update the camera position
    const updateCameraTarget = (moveX: number, moveZ: number) => {
        //move camera
        camera.position.x += moveX;
        camera.position.z += moveZ;

        //update camera target
        cameraTarget.x = model.scene.position.x;
        cameraTarget.y = model.scene.position.y + 2;
        cameraTarget.z = model.scene.position.z;
        if (controlsRef.current) {
            controlsRef.current.target = cameraTarget;
        }

    }

    useEffect(() => {
        let action = "";
        if (forward || backward || left || right) {
            action = "Walk";
            if (shift) {
                action = "Running"
            }
        } else if (jump) {
            action = "Jump";
        } else {
            action = "Idel";
        }

        if (currentAction.current != action) {
            const nextActionToPlay = actions[action];
            const current = actions[currentAction.current];
            current?.fadeOut(0.2);
            nextActionToPlay?.reset().fadeIn(0.2).play();
            currentAction.current = action;
        }
    }, [forward, backward, left, right, jump, shift]);

    useFrame((state, delta) => {
        if (currentAction.current == "Walk" || currentAction.current == "Running") {
            // model.scene.position.x += 0.1;
            //calculate towards camera direction
            let anagleYCameraDirection = Math.atan2(
                camera.position.x - model.scene.position.x,
                camera.position.z - model.scene.position.z,
            );

            //diagonal movement angle offset
            let newDirectionOffset = directionOffset({
                forward, backward, left, right
            });

            //rotate model direction
            rotateQuaternion.setFromAxisAngle(
                rotateAngle,
                anagleYCameraDirection + newDirectionOffset
            );
            model.scene.quaternion.rotateTowards(rotateQuaternion, 0.2);

            //calculate direction 
            camera.getWorldDirection(walkDirection);
            walkDirection.y = 0;
            walkDirection.normalize();
            walkDirection.applyAxisAngle(rotateAngle, newDirectionOffset);

            const velocity = currentAction.current == "Running" ? 10 : 5;

            const moveX = walkDirection.x * velocity * 0.02;
            const moveZ = walkDirection.z * velocity * 0.02;
            model.scene.position.x += moveX;
            model.scene.position.z += moveZ;
            updateCameraTarget(moveX, moveZ);
        }

    });

    return (
        <>
            <OrbitControls ref={controlsRef} />
            <primitive object={model.scene} />
          
            <primitive object={modelShowroom.scene} />
            
            {/* <primitive object={modelProduct1.scene} position={[-12,-0.6,-9]} scale={[2,2,2]}/> */}
            {/* <primitive object={modelProduct2.scene} position={[-14,1,-12]} scale={[2,2,2]}/> */}
            <primitive object={modelProduct3.scene} position={[-12,-0.5,-19]} scale={[6,6,6]} />
            <primitive object={modelProduct4.scene} position={[-13.5,-1,-10]} scale={[6,6,6]} />
            <primitive object={modelProduct5.scene} position={[-2,0,-12]} scale={[6,6,6]} />
            <primitive object={modelProduct6.scene} position={[-1,-0.6,-11]} scale={[6,6,6]} />
           
            {/* {houseView === "Outer" ?
            <primitive object={model2.scene} />
            : <primitive object={model3.scene} /> } */}
        </>
    );
}

export default Player;