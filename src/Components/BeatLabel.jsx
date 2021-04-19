import React from 'react';
import '../styles/index.css';

const quarterBeatLabels = [];
for (let i = 1; i <= 16; i++) {
  quarterBeatLabels.push(<td key={i}>{i}</td>);
}

const beatLabels = [];
let b = 1;
for (let i = 1; i <= 32; i++) {

 
    beatLabels.push(<td key={i} className='instrument'>{b}</td>);
    b++;
  
}

const BeatLabel = () => {

  return (
    <>
      <tr>
      <td className='instrument'></td>  
        {beatLabels}
      </tr>
    </>
  )
}

export default BeatLabel;