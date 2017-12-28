import React from 'react';
import ReactDOM from 'react-dom';
import styles from './app.css';
import 'antd/dist/antd.css';
import CropUpload from './CropUpload';


export default class App extends React.Component {
  render() {
    return (
        <div id="app">
            <CropUpload />
        </div>
    );
  }
}
