import React from 'react';
import '../styles/index.css';
import './PlayButton'
import PlayButton from './PlayButton';
import '../styles/beatMachine.css';


const BeatMachine = () => {

    return(
      <>
        <div className="beatMachineTitle"><span className="beat">Flow </span><span className="juice">Pixorie</span></div>
        {/* <PlayButton /> */}
      </>
    )
  }

export default BeatMachine;
