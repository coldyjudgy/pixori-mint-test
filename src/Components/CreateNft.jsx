import { Button } from '@material-ui/core';
import React from 'react';

import '../styles/index.css';

const CreateNft = (props) => {
   const arr1=props.create;
    const handleClick = () => {
        console.log(arr1)


      }
  return (

    <Button
    style={{ background: "ffffff", padding: '27px' }}
    
    onClick={() =>{ handleClick();}}>Create
      </Button>


  )
}

export default CreateNft;