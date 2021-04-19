import React, { useEffect, useState ,useMemo} from 'react';
import { Button } from '@material-ui/core';

import './styles/index.css';
import './styles/playhead.css';
import BeatMachine from './Components/BeatMachine';
import InstrumentRow from './Components/InstrumentRow';
import Bpm from './helpers/useBPM';
import BeatLabel from './Components/BeatLabel';
import CreateNft from './Components/CreateNft.jsx';
import Tempo from './Components/Tempo';
import { instruments, getBassNote } from './helpers/instruments';
import PlayButton from './Components/PlayButton';
import StopButton from './Components/StopButton';

import Volume from './Components/Volume';
import { Howl } from 'howler';
import Editor from "./Editor";
import useStyles from './App.styles';
import Colorbutton from "./colorbutton";
import { Fragment } from 'react';

import ColorPicker from './Components/ColorPicker.js';

const arr1= Array.from(Array(16), () => new Array(32).fill(0));
const offCell = {
  on: false,
  color: '#000000',
};
const initialCells = Array.from({ length: 40 }, () => offCell);

const App = () => {

  const [hideDrawingPanel, setHideDrawingPanel] = useState(true);


  const [cells, setCells] = useState(initialCells);
  const [selectedColor, setColor] = useState("000000");

  const classes = useStyles();
  const colorSwatch = useMemo(
    () => [
      ...new Set(cells.filter((cell) => cell.on).map((cell) => cell.color)),
    ],
    [cells]
  );

  const chatString = useMemo(
    () => cells.map((cell) => cell.color.slice(1)).join(','),
    [cells]
  );


  function changeColor(color) {
    setColor(color.hex);
  }
  //beat machine initial states
  const [isPlaying, setIsPlaying] = useState(false);
  const [tempo, setTempo] = useState(120);
  const [volNum, setVolNum] = useState(50);
  // state tracking for playhead when isPlaying
  const [squares, setSquares] = useState([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,]);
  // state tracking for our dumb component when !isPlaying
  const [playHeadArray, setPlayHeadArray] = useState([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,]);
  const [counter, setCounter] = useState(0);
  // holds on off state for each row of instruments
  const [grid, setGrid] = useState([
    instruments[0].pattern,
    instruments[1].pattern,
    instruments[2].pattern,
    instruments[3].pattern,
    instruments[4].pattern,
    instruments[5].pattern,
    instruments[6].pattern,
    instruments[7].pattern,
    instruments[8].pattern,
    instruments[9].pattern,
    instruments[10].pattern,
    instruments[11].pattern,
    instruments[12].pattern,
    instruments[13].pattern,    
    instruments[14].pattern,
    instruments[15].pattern,
  ]);

  // TODO: Refactor player controls into helpers
  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  //set BPM
  let beats = Bpm(tempo);

  //ParseInt() as tempo field currently a string
  const handleTempoChange = (event) => {
    const eventValue = event.target.value;
    setTempo(parseInt(eventValue));
  };

  //volume handler
  const handleVol = (event, volNum) => {
    setVolNum(volNum);
  };

  //Animation Specific functions
  //helper function for playHeadLoop()
  const getPreviousSquare = () => {
    if (counter === 0) {
      return document.getElementById('31');
    } else {
      return document.getElementById(`${counter - 1}`);
    }
  };

  // animates playhead based off the counter position
  const playHeadLoop = () => {
    //get the square to animate
    let squareToAnimate = document.getElementById(`${counter}`);
    //find previousSquare
    let previousSquare = getPreviousSquare();
    //TODO Re-factor into one toggle
    previousSquare.classList.remove('playhead');
    previousSquare.classList.add('inactive');
    squareToAnimate.classList.remove('inactive');
    squareToAnimate.classList.add('playhead');
  };

  //when player is stopped reset playhead and array to initial values
  const resetSquares = () => {
    setCounter(0);
    setPlayHeadArray(
      squares.map((square, i) => (
        <td
          key={i + squares}
          id={i}
          className={square > 0 ? 'playhead' : 'inactive cycle'}
        ></td>
      ))
    );
  };

  //handles any changes user makes to instrument grid and updates values accordingly
  const updateGrid = (row, column, toggle,color) => {
    const clonedObj = { ...grid[row] };
    clonedObj[column] = toggle;
    //temporary const for setGrid
    const arrayToPassSetGrid = [];
    for (let i = 0; i < 16; i++) {
      if (row === i) {
        arrayToPassSetGrid.push(clonedObj);
      } else {
        arrayToPassSetGrid.push(grid[i]);
      }
    }

    arr1[row].splice(column,1,color)
    setGrid(arrayToPassSetGrid);


  };

  //play an individual sound from our array from PlaySounds()
  const playSound = (source) => {
    var sound = new Howl({
      src: [source],
      html5: true,
      volume: volNum / 100,
    });
    sound.play();
  };

  //Iterate through the array of collected sounds compiled from our grid in loop()
  const playSounds = (array) => {
    for (let i = 0; i < array.length; i++) {
      playSound(array[i]);
    }
  };

  //collate all active sound samples on the current beat into an array from instruments
  const loop = () => {
    //create an array to hold our sounds for a beat
    let soundArr = [];
    //loop through each instrument in our column
    for (let j = 0; j < 16; j++) {
      //if the square is active e.g. 0,0
      if (grid[j][counter]) {
        //set a temporary variable to hold our soundSrc
        let soundSrc =
          instruments[j].name === 'Bassline'
          //e.g. "./BassSamples/D-BassNote.wav"
            ? getBassNote(counter)
            : instruments[j].sound;
            //e.g. "./DrumSamples/ClosedHats/HiHat01.wav"
        soundArr.push(soundSrc);
      }
      playSounds(soundArr);
    }
  };

  //useEffect re-renders and runs our beat machine functions if IsPlaying per tick of setInterval
  useEffect(() => {
    //is the beat machine playing?
    if (isPlaying) {
      //set an interval to perform player logic
      const interval = setInterval(() => {
        //animate the playHead based on counter position
        playHeadLoop();
        // create an array of up to 6 sounds that are then played at the same time
        loop();
        // increments counter based on current tempo
        if (counter < 31) {
          setCounter((prevState) => ++prevState);
        } else {
          setCounter(0);
        }
      }, beats);
      return () => clearInterval(interval);
    }
    resetSquares();
  }, [isPlaying, beats, volNum, counter]);
 

  //Map each instrumentRow onto the beat machine
  const instrumentRows = instruments.map((instrument, row ) => {
    return (
      <InstrumentRow
      
        key={row}
        row={row}
        updateGrid={(row, column, toggle,color) => updateGrid(row, column, toggle,color)}
        instrumentName={instrument.name}
        instrumentSound={instrument.sound}
        pattern={instrument.pattern}
        instrumentColor={selectedColor}
      />
    );
  });
  

  //Conditionally Render Playhead if isPlaying
  const playHead = () => {
    if (isPlaying) {
      return (
        <>
          <td className="instrument" />
          {playHeadArray}
        </>
      );
    } else {
      return (
        <>
          <td className={isPlaying ? 'hidden' : 'instrument'} />
          <td className="inactive"></td>
          <td className="inactive"></td>
          <td className="inactive"></td>
          <td className="inactive"></td>
          <td className="inactive"></td>
          <td className="inactive"></td>
          <td className="inactive"></td>
          <td className="inactive"></td>
          <td className="inactive"></td>
          <td className="inactive"></td>
          <td className="inactive"></td>
          <td className="inactive"></td>
          <td className="inactive"></td>
          <td className="inactive"></td>
          <td className="inactive"></td>
          <td className="inactive"></td>
          <td className="inactive"></td>
          <td className="inactive"></td>
          <td className="inactive"></td>
          <td className="inactive"></td>
          <td className="inactive"></td>
          <td className="inactive"></td>
          <td className="inactive"></td>
          <td className="inactive"></td>
          <td className="inactive"></td>
          <td className="inactive"></td>
          <td className="inactive"></td>
          <td className="inactive"></td>
          <td className="inactive"></td>
          <td className="inactive"></td>
          <td className="inactive"></td>
          <td className="inactive"></td>
        </>
      );
    }



  };
  const handleClick = () => {
    console.log(arr1)
    alert('Creating NFT!')
  

  }
  




  //store playHeadComponent in a variable for readability
  const playHeadComponent = playHead();

  //App returns the composite of our beat machine and components
  return (
    <Fragment>
    <div className="container">
      <div className="titleImg">
        <BeatMachine />
 
      </div>
      <div className="btnGroup">
        <PlayButton onClick={togglePlay} isPlaying={isPlaying} />
        <StopButton onClick={togglePlay} isPlaying={isPlaying} />
      </div>
      <br />
      <div className="volTempo">
        <div className="volStyle">
          <Volume volNum={volNum} onChange={handleVol} />
        </div>
        <div className="tempoStyle">
          <Tempo
            value={tempo}
            onTempoChange={(event) => {
              handleTempoChange(event);
            }}
          />
        </div>
        <div id="a">
    
      {hideDrawingPanel}
{/* <SwatchesPicker color={selectedColor} onChangeComplete={changeColor} />  */}
<ColorPicker  color={selectedColor} onChangeComplete={changeColor} onSetColor={setColor} />
      <div className={classes.colorSwatchContainer}>
        {colorSwatch.map((color) => (
          <div
            key={color}
            onClick={() => setColor(color)}
            className={classes.colorSwatch}
            style={{ background: color }}
          />
        ))}
      </div>
</div></div>
      <br />
      <table border="0">
        <tbody className="table">
          {playHeadComponent}
          {instrumentRows}
         
        </tbody>
      </table>
    
    <div>
    <Button
    style={{ background: "ffffff", padding: '27px' }}
    
    onClick={() =>{ handleClick();}}>Create
      </Button>
    </div>

    </div>
    </Fragment>
  );


  
};

export default App;
