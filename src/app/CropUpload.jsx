import React, { Component } from 'react';
import 'cropperjs/dist/cropper.css';

import ReactCropper from './react-cropper';
import { Button, Menu, Dropdown, Icon, Upload, message } from 'antd';
import { progressBarFetch, setOriginalFetch, ProgressBar } from 'react-fetch-progressbar';

const ButtonGroup = Button.Group;
const src = 'img/child.jpg';
const noCrop = 'img/nocrop.png';

export default class CropUpload extends Component {

  constructor(props) {
    super(props);
    this.state = {
      src,
      ratio: 4 / 3,
      cropResult: noCrop,
      uptoken: null,
      uploadedFile: null,
    };
    this.cropImage = this.cropImage.bind(this);
    this.onChange = this.onChange.bind(this);
    this.changeRatio = this.changeRatio.bind(this);
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

  changeRatio(e) {
    const keyRatioMap = {"1":4/3, "2":16/9, "3":16/10};
    var aspectRatio = keyRatioMap[e.key];
    this.setState({
      ratio: aspectRatio
    });
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

    console.log(QINIU_UPTOKEN_URL);
    fetch(QINIU_UPTOKEN_URL, options).then(response => response.json())
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
    // strip off the starting substring of base64 encoding
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
    const ratioMenu = (
      <Menu onClick={ this.changeRatio }>
        <Menu.Item key="1">4:3</Menu.Item>
        <Menu.Item key="2">16:9</Menu.Item>
        <Menu.Item key="3">16:10</Menu.Item>
      </Menu>
    );

    return (
      <div>
        <div style={{ width: '100%' }}>
          <ProgressBar />
        </div>
        <div style={{ width: '100%' }}>
          <div>
          <ButtonGroup>
            <input type="file" onChange={this.onChange} />
            <Button type="primary" onClick={this.useDefaultImage}>Use default img</Button>
            <Dropdown overlay={ratioMenu}>
              <Button type="primary">
                Ratio <Icon type="down" />
              </Button>
            </Dropdown>
          </ButtonGroup>
          </div>
          <ReactCropper
            style={{ height: 400, width: '100%' }}
            aspectRatio={this.state.ratio}
            preview=".img-preview"
            guides={true}
            src={this.state.src}
            background={true}
            ref={cropper => { this.cropper = cropper; }}
          />
        </div>
        <div>
          <div className="box" style={{ width: '50%', float: 'right' }}>
            <h1>Preview</h1>
            <div className="img-preview" style={{ width: '100%', float: 'left', height: 300 }} />
          </div>
          <div className="box" style={{ width: '50%', float: 'right' }}>
            <div style={{ float: 'left' }}>
              <h1>Crop</h1>
            </div>
            <div style={{ float: 'right' }}>
              <ButtonGroup style={{ float: 'right' }}>
                <Button type="primary" icon="picture" onClick={this.cropImage}>Crop</Button>
                <Button type="primary" icon="sync" onClick={this.getUptoken}>UpToken</Button>
                <Button type="primary" icon="cloud-upload-o" onClick={this.uploadBase64ImgToQiniu}>Upload</Button>
              </ButtonGroup>
            </div>
            <br />
            <div>
              <img style={{ width:'100%', border:'1px solid #021a40' }} src={this.state.cropResult} alt="cropped image" />
            </div>
          </div>
        </div>
        <br style={{ clear: 'both' }} />
      </div>
    );
  }
}
