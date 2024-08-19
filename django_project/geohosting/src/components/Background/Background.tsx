import React from 'react';

const Background: React.FC = () => {
  const leftBoxStyle: React.CSSProperties = {
    position: 'absolute',
    left: '0',
    top: '0',
    width: window.innerWidth >= 1280 ? '10vw' : window.innerWidth >= 768 ? '14vw' : '20vw',
    height: '100%',
    backgroundImage: "url('/static/images/left-geohosting.svg')",
    backgroundSize: '100% 1300px',
    backgroundRepeat: 'repeat-y',
    backgroundPosition: 'left top',
    zIndex: -1,
    float: 'left',
  };

  const rightBoxStyle: React.CSSProperties = {
    position: 'absolute',
    right: '0',
    top: '0',
    width: window.innerWidth >= 1280 ? '10vw' : window.innerWidth >= 768 ? '14vw' : '20vw',
    height: '100%',
    backgroundImage: "url('/static/images/right-geohosting.svg')",
    backgroundSize: '100% 1400px',
    backgroundRepeat: 'repeat-y',
    backgroundPosition: 'right top -350px',
    zIndex: -1,
  };

  return (
    <>
      <div style={leftBoxStyle} />
      <div style={rightBoxStyle} />
    </>
  );
};

export default Background;
