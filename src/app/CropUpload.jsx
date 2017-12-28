import React, { Component } from 'react';
import 'cropperjs/dist/cropper.css';

import ReactCropper from './react-cropper';
import { Button, message } from 'antd';
import { progressBarFetch, setOriginalFetch, ProgressBar } from 'react-fetch-progressbar';

/* global FileReader */

const src = 'img/child.jpg';

export default class CropUpload extends Component {

  constructor(props) {
    super(props);
    this.state = {
      src,
      cropResult: null,
      uptoken: null,
      uploadedFile: null,
    };
    this.cropImage = this.cropImage.bind(this);
    this.onChange = this.onChange.bind(this);
    this.useDefaultImage = this.useDefaultImage.bind(this);
    this.getUptoken = this.getUptoken.bind(this);
    this.uploadBase64ImgToQiniu = this.uploadBase64ImgToQiniu.bind(this);
  }

  componentDidMount() {
    // Let react-fetch-progressbar know what the original fetch is.
    setOriginalFetch(window.fetch);

    /* 
      Now override the fetch with progressBarFetch, so the ProgressBar
      knows how many requests are currently active.
    */
    window.fetch = progressBarFetch;
  }

  onChange(e) {
    e.preventDefault();
    let files;
    if (e.dataTransfer) {
      files = e.dataTransfer.files;
    } else if (e.target) {
      files = e.target.files;
    }
    const reader = new FileReader();
    reader.onload = () => {
      this.setState({ src: reader.result });
    };
    reader.readAsDataURL(files[0]);
  }

  cropImage() {
    if (typeof this.cropper.getCroppedCanvas() === 'undefined') {
      return;
    }
    this.setState({
      cropResult: this.cropper.getCroppedCanvas().toDataURL(),
    });
  }

  useDefaultImage() {
    this.setState({ src });
  }

  getUptoken() {
    var options = {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    };

    fetch('http://qiniubackend.com:8080/uptoken', options).then(response => response.json())
      .then(data => {
        console.log(data);
        message.success('Got upload token.');
        this.setState({
          uptoken: data.token
          });
      })
      .catch(error => {
        console.log('Oops, error: ', error);
        message.error('Failed to get upload token.');
        })
  }

  uploadBase64ImgToQiniu() {
    var url = "http://up.qiniu.com/putb64/-1"; 
    var img = this.state.cropResult.slice(22);
    var auth = "UpToken " + this.state.uptoken;
    var options = {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/octet-stream',
        'Authorization': auth
      },
      body: img
    };

    fetch(url, options).then(response => response.json())
      .then(data => {
        console.log(data);
        message.success('Upload to Qiniu succeeded!');
        this.setState({
          uploadedFile: data.key
          });        
      })
      .catch(error => {
        console.log('Oops, error: ', error);
        message.error('Failed upload to Qiniu.');
        })
  }

//  getUptoken() {
//    const _this = this;
//    var xhr = new XMLHttpRequest();
//    xhr.onreadystatechange = function(){
//      if (xhr.readyState==4){
//        console.log(xhr.responseText)
//        var obj = JSON.parse(xhr.responseText);
//        _this.setState({
//          uptoken: obj.token
//        });
//      }
//    }
//    xhr.open("GET", "http://qiniubackend.com:8080/uptoken", true);
//    xhr.send();
//  }

//  uploadBase64ImgToQiniu() {
//    var url = "http://up.qiniu.com/putb64/-1"; 
//    var xhr = new XMLHttpRequest();
//    var img = this.state.cropResult.slice(22);
//    var auth = "UpToken " + this.state.uptoken;

//    xhr.open("POST", url, true);
//    xhr.setRequestHeader("Content-Type", "application/octet-stream");
//    xhr.setRequestHeader("Authorization", auth);
//    xhr.send(img);
//  }

  render() {
    return (
      <div>
        <div style={{ width: '100%' }}>
          <div>
            <input type="file" onChange={this.onChange} />
            <Button type="primary" onClick={this.useDefaultImage}>Use default img</Button>
          </div>
          <br />
          <ReactCropper
            style={{ height: 400, width: '100%' }}
            aspectRatio={4 / 3}
            preview=".img-preview"
            guides={false}
            src={this.state.src}
            ref={cropper => { this.cropper = cropper; }}
          />
        </div>
        <div>
          <div className="box" style={{ width: '50%', float: 'right' }}>
            <h1>Preview</h1>
            <div className="img-preview" style={{ width: '100%', float: 'left', height: 300 }} />
          </div>
          <div className="box" style={{ width: '50%', float: 'right' }}>
            <h1>
              <span>Crop</span>
            </h1>
            <div>
              <Button type="primary" onClick={this.uploadBase64ImgToQiniu} style={{ float: 'right' }}>Upload</Button>
              <Button type="primary" onClick={this.getUptoken} style={{ float: 'right' }}>Update Token</Button>
              <Button type="primary" onClick={this.cropImage} style={{ float: 'right' }}>Crop</Button>
            </div>
            <br />
            <div>
              <ProgressBar />
            </div>
            <br />
            <div>
              <img style={{ width: '100%' }} src={this.state.cropResult} alt="cropped image" />
            </div>
          </div>
        </div>
        <br style={{ clear: 'both' }} />
      </div>
    );
  }
}
