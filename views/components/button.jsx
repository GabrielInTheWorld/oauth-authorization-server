import React from 'react';

export default function Button(props) {
  console.log('button props', props);
  // const click = props.onClick ? props.onClick : () => {};
  const click = () => {
    console.log('clicked!');
    if (props.onClick) {
      props.onClick();
    }
  };

  const buttonType = props.type ? props.type : 'button';
  const style = {
    minWidth: 64,
    height: 36,
    padding: '0 16px',
    fontSize: 14,
    fontWeight: 400,
    borderRadius: 4,
    background: props.color ? props.color : '#ddd'
  };
  return (
    <button style={style} onClick={click} type={buttonType} value={props.value}>
      {props.children}
    </button>
  );
}
