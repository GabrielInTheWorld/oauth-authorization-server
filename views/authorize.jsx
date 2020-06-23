import React from 'react';

import Authenticate from './authenticate';
import Card from './components/card';
import Center from './components/center';
import Overlay from './components/overlay';
import Button from './components/button';
// import { Card, Overlay, Center } from './components';

export default class Authorize extends React.Component {
  render() {
    const inputStyle = {
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

    let isAuthenticated = false;

    const onConfirm = token => {
      console.log('token', token);
      isAuthenticated = true;
    };

    console.log('props', this.props);
    return (
      <Overlay backgroundColor={'#ddd'}>
        <Center>
          <Card>
            <div>
              {/* <Authenticate
                onAuthenticate={(username, password) => this.props.onAuthenticate(username, password)}
                onConfirm={token => onConfirm(token)}
              /> */}
              <div>
                <form action="/approve" method="POST">
                  <input type="hidden" name="reqid" value={this.props.reqid} />
                  <input style={inputStyle} type="submit" name="approve" value="Approve" />
                  <input style={inputStyle} type="submit" name="deny" value="deny" />
                </form>
              </div>
            </div>
          </Card>
        </Center>
      </Overlay>
    );
  }
}
