import { Canvas } from '@react-three/fiber'
import React, { useRef } from 'react';
import { CubeCamera, Environment, OrbitControls, PerspectiveCamera, Stats } from '@react-three/drei';
import Lights from '../../src/components/Lights';
import Ground from '../../src/components/Ground';
import Tree from '../../src/components/Tree';
import Player from '../components/Player';
import House from '../components/House';
// import { Physics, useBox } from '@react-three/cannon'


const Home = () => {
  const testing = false;
  // const [ref, api] = useBox(() => ({ mass: 1 }))

  return (
    <div className="container">
       {/* <div style={{background:"#fff",padding:"10px 20px"}}>hello world</div> */}
      <Canvas shadows>
        {testing ? <Stats /> : null}
        {/* {testing ? <axesHelper args={[2]} /> : null} */}
        {testing ? <gridHelper args={[10, 10]} /> : null}
        <OrbitControls 
        target={[0, 0.55, 0]}
        maxPolarAngle={1.45}
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        enableDamping={true}
        />
      {/* <Physics broadphase="SAP"
        gravity={[0, -2.6, 0]}> */}
      
        <PerspectiveCamera makeDefault fov={50} position={[3, 2, 5]} />
        {/* <CubeCamera resolution={256} frames={Infinity}>
        {(texture) => (
          <>
            <Environment map={texture} />
            <ambientLight intensity={0.09} />
            <pointLight position={[50,50,50]} />
          </>
        )}
      </CubeCamera> */}
        {/* <Tree boundary={85} count={50} /> */}
        <Lights />
        <Player />
        {/* <Ground /> */}
        {/* <House /> */}
      {/* </Physics> */}
      </Canvas>
    </div>
  )
};

export default Home;
