import React from 'react';
import { makeStyles, Card, CardActions, CardContent, Button, Typography } from '@material-ui/core';

export default function Authorize(props) {
  console.log('props', props);
  return (
    <Card>
      <div>
        <form action="/approve" method="POST">
          <input type="hidden" name="reqid" value={props.reqid} />
          <input type="submit" name="approve" value="Approve" />
          <input type="submit" name="deny" value="deny" />
        </form>
      </div>
    </Card>
  );
}
