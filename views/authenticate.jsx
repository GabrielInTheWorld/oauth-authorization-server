import React from 'react';
import ReactDOMServer from 'react-dom/server';

export default class Authenticate extends React.Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(event) {
    event.preventDefault();
    console.log('handling');
  }

  render() {
    const labelStyle = {
      display: 'flex',
      justifyContent: 'start',
      flexDirection: 'column'
    };

    const buttonStyle = {
      minWidth: 64,
      height: 36,
      padding: '0 16px',
      fontSize: 14,
      fontWeight: 400,
      borderRadius: 4,
      outline: 'none',
      background: '#ddd'
    };

    const click = () => {
      console.log('clicked!');
      if (props.onAuthenticate) {
        props.onAuthenticate(username, password);
      }
    };

    let username = 'demo';
    let password = 'demo';

    const content = (
      <div>
        <div>Authenticate</div>
        <div>
          <div style={labelStyle}>
            <label htmlFor="username">Benutzername</label>
            <input type="text" name="username" onChange={value => (username = value)} value={username} />
          </div>
          <div style={labelStyle}>
            <label htmlFor="password">Passwort</label>
            <input type="password" name="password" onChange={value => (password = value)} value={username} />
          </div>
        </div>
        <button onClick={this.handleSubmit}>Anmelden</button>
        {/* <form onSubmit={this.handleSubmit}>
          <button type="button" style={buttonStyle}>
            Anmelden
          </button>
        </form> */}
      </div>
    );
    return content;
    // return ReactDOMServer.renderToString(content);
  }
}
