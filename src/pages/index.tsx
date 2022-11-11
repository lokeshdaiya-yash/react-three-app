import { Canvas } from '@react-three/fiber'
import React, {  } from 'react';
import { OrbitControls, Stats } from '@react-three/drei';
import Lights from '../../src/components/Lights';
import Ground from '../../src/components/Ground';
import Tree from '../../src/components/Tree';
import Player from '../components/Player';

const Home = () => {
  const testing = true;
  return (
    <div className="container">
      <Canvas shadows>
        {testing ? <Stats /> : null}
        {/* {testing ? <axesHelper args={[2]} /> : null} */}
        {testing ? <gridHelper args={[10, 10]} /> : null}
        <OrbitControls />
        <Tree boundary={85} count={50} />
        <Lights />
        <Player />
        <Ground />
      </Canvas>
    </div>
  )
};

export default Home;
