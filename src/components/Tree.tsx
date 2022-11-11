import { useLoader } from "@react-three/fiber";
import { useEffect, useState } from "react";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

interface treeType {
    position: { x: number, z: number };
    box: number;
}
interface props {
    boundary: number;
    count: number;
}
const Tree = ({ boundary, count }: props) => {
    const model = useLoader(GLTFLoader, "./models/tree_pinus.glb");

    const [trees, setTrees] = useState<treeType[]>([]);
    model.scene.traverse((object) => {
        if (object.isMesh) {
            object.castShadow = true;
        }
    });

    const newPosition = (box: number, boundary: number) => {
        return (
            boundary / 2 - box / 2 - (boundary - box) * (Math.round(Math.random() * 100) / 100)
        );
    }

    const boxIntersect = (
        minAx: number,
        minAz: number,
        maxAx: number,
        maxAz: number,
        minBx: number,
        minBz: number,
        maxBx: number,
        maxBz: number
     ) => {
        
        let aLeft0fB = maxAx < minBx;
        let aRightOfB = minAx > maxBx;
        let aAboveB = minAz > maxBz;
        let aBelowB = maxAz < minBz;
        return !(aLeft0fB || aRightOfB || aAboveB || aBelowB);
     }
      

    const isOverlapping = (index: number, tree: any, trees: any[]) => {
        const minTargetX = tree.position.x - tree.box / 2;
        const maxTargetX = tree.position.x + tree.box / 2;
        const minTargetZ = tree.position.z - tree.box / 2;
        const maxTargetZ = tree.position.z + tree.box / 2;
        for (let i = 0; i < index; i++) {
            let minChildX = trees[i].position.x - trees[i].box / 2;
            let maxChildX = trees[i].position.x + trees[i].box / 2;
            let minChildZ = trees[i].position.z - trees[i].box / 2;
            let maxChildZ = trees[i].position.z + trees[i].box / 2;
            if (boxIntersect(minTargetX, minTargetZ, maxTargetX, maxTargetZ, minChildX, minChildZ, maxChildX, maxChildZ)) {
                return true;
            }
        }
        return false;
    }

    const updatePosition = (treeArray: treeType[], boundary: number) => {
        treeArray.forEach((tree, index) => {
            do{
                tree.position.x = newPosition(tree.box, boundary);
                tree.position.z = newPosition(tree.box, boundary);
            } while (isOverlapping(index,tree,treeArray));
        }); 
        setTrees(treeArray);
    }
    useEffect(() => {
        const tempTrees: treeType[] = [];
        for (let i = 0; i < count; i++) {
            tempTrees.push({ position: { x: 0, z: 0 }, box: 1 });
        }
        updatePosition(tempTrees, boundary);
    }, [boundary, count])

    return (
        <group rotation={[0, 4, 0]}>
            {trees.map((tree, index) => {
                return (
                    <object3D key={index} position={[tree.position.x, 0, tree.position.z]}>
                            <mesh > {/*  scale={[tree.box, tree.box, tree.box]} */}
                            <boxGeometry />
                            <meshBasicMaterial color={"#458745"} wireframe />
                        </mesh>
                        <primitive object={model.scene.clone()} />
                    </object3D>
                )
            })}
        </group>
    );
};


export default Tree;