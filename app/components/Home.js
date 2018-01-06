// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'semantic-ui-react';

export default class Home extends Component {
  render() {
    return (
      <div>
        <div >
          <h2>Home</h2>
          <Button as={Link} to="/count" > Hello</Button>
        </div>
      </div>
    );
  }
}
