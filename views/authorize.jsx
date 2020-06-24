import React from 'react';

import Card from './components/card';
import Center from './components/center';
import Overlay from './components/overlay';

export default class Authorize extends React.Component {
  render() {
    const labelStyle = {
      display: 'flex',
      justifyContent: 'start',
      flexDirection: 'column'
    };

    const submitStyle = {
      textAlign: 'center',
      minWidth: 64,
      height: 36,
      padding: '0 16px',
      fontSize: 14,
      fontWeight: 400,
      borderRadius: 4,
      outline: 'none',
      cursor: 'pointer'
    };

    const contentStyle = {
      ...labelStyle,
      alignItems: 'center'
    };

    let username = 'demo';
    let password = 'demo';

    console.log('props', this.props);

    const client = this.props.client;
    return (
      <Overlay backgroundColor={'#ddd'}>
        <Center>
          <Card>
            <div>
              <div>
                <h1>OpenSlides4 Authentifizierungsdienst</h1>
                <div style={contentStyle}>
                  <h2>Anfragender Client</h2>
                  <div>Name: {client.clientName}</div>
                  <div>ID: {client.clientId}</div>
                  <div>Geltungsbereiche: {client.scope}</div>

                  <p>Genehmigen Sie den Zugriff?</p>
                  <form action="/approve" method="POST">
                    <div>
                      <div style={labelStyle}>
                        <label htmlFor="username">Benutzername</label>
                        <input type="text" name="username" onChange={value => (username = value)} value={username} />
                      </div>
                      <div style={labelStyle}>
                        <label htmlFor="password">Passwort</label>
                        <input
                          type="password"
                          name="password"
                          onChange={value => (password = value)}
                          value={username}
                        />
                      </div>
                    </div>

                    <input type="hidden" name="reqid" value={this.props.reqid} />
                    <input style={submitStyle} type="submit" name="approve" value="Approve" />
                    <input style={submitStyle} type="submit" name="deny" value="deny" />
                  </form>
                </div>
              </div>
            </div>
          </Card>
        </Center>
      </Overlay>
    );
  }
}
