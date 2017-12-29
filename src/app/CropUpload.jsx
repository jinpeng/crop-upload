import React, { Component } from 'react';
import 'cropperjs/dist/cropper.css';

import ReactCropper from './react-cropper';
import { Button, Icon, message } from 'antd';
import { progressBarFetch, setOriginalFetch, ProgressBar } from 'react-fetch-progressbar';

const ButtonGroup = Button.Group;
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
      });
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

    fetch(url, options).then(response => {
      if (response.ok) {
        message.success('Upload to Qiniu succeeded!');
        return response.json();
      } else if (response.status == 401) {
        message.error('No permission, please get updated uptoken.');
        Promise.reject(response.json());
      } else {
        Promise.reject(response.json());
      }
    })
    .then(data => {
        console.log(data);
        this.setState({
          uploadedFile: data.key
        });        
    })
    .catch(error => {
      console.log('Oops, error: ', error);
      message.error('Failed upload to Qiniu: ', error);
    });
  }

  render() {
    return (
      <div>
        <div style={{ width: '100%' }}>
          <ProgressBar />
        </div>
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
              <ButtonGroup style={{ float: 'right' }}>
                <Button type="primary" onClick={this.cropImage}>Crop</Button>
                <Button type="primary" onClick={this.getUptoken}>Update Token</Button>
                <Button type="primary" onClick={this.uploadBase64ImgToQiniu}>Upload</Button>
              </ButtonGroup>
            </div>
            <br />
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
