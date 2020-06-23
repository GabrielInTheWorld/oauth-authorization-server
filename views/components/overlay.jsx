import React from 'react';

export default function Overlay(props) {
  const style = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: props.backgroundColor ? props.backgroundColor : 'gray'
  };
  return <div style={style}>{props.children}</div>;
}
