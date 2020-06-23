import React from 'react';

export default function Center(props) {
  const style = {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };
  return <div style={style}>{props.children}</div>;
}
