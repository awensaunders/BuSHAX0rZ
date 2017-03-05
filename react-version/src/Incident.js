import React, { Component } from 'react';
import { Marker, Popup } from 'react-leaflet';
import { Panel } from 'react-bootstrap';

class Incident extends Component {
    render() {
        return (
            <Marker position={this.props.position}>
              <Popup>
                <Panel header={this.props.title}>
                  <p>Latitude: {this.props.position[0]}</p>
                  <p>Longitude: {this.props.position[1]}</p>
                </Panel>
              </Popup>
            </Marker>
        );
    }
}

export default Incident;
