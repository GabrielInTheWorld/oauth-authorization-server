import React from 'react';

export default function Card(props) {
  const cardStyle = {
    padding: 16,
    boxShadow: '0 4px 5px 0 rgba(0, 0, 0, 0.14), 0 1px 10px 0 rgba(0, 0, 0, 0.12), 0 2px 4px -1px rgba(0, 0, 0, 0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 480,
    minHeight: 360,
    backgroundColor: 'white',
    borderRadius: 6
  };

  return <div style={cardStyle}>{props.children}</div>;
}
