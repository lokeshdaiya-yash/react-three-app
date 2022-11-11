import { useGLTF, useAnimations, OrbitControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useRef, useEffect } from "react";
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
    const model = useGLTF("./models/the_girl.glb");
    const { actions } = useAnimations(model.animations, model.scene);
    console.log(actions);
    model.scene.scale.set(0.5, 0.5, 0.5);

    model.scene.traverse((object) => {
        if (object.isMesh) {
            object.castShadow = true;
        }
    });
    const currentAction = useRef("");
    const controlsRef = useRef<typeof OrbitControls>();
    const camera = useThree((state) => state.camera);

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

            const moveX = walkDirection.x * velocity * delta;
            const moveZ = walkDirection.z * velocity * delta;
            model.scene.position.x += moveX;
            model.scene.position.z += moveZ;
            updateCameraTarget(moveX, moveZ);
        }

    });

    return (
        <>
            <OrbitControls ref={controlsRef} />
            <primitive object={model.scene} />
        </>
    );
}

export default Player;