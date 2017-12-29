## crop-upload
A small tool for cropping and uploading image to Qiniu cloud.  
Should be used together with [crop-upload-server](https://github.com/jinpeng/crop-upload-server), which provide Qiniu cloud upload token generation API.

### Features
- Preset aspect ratios: 4:3, 16:9, 16:10
- Crop image inside browser without server
- Scale images with mouse wheel
- Preview cropped image
- Upload directly to Qiniu cloud
- Upload progress bar and notification

### For Developers

#### Techniques:
- ReactJS 16
- Webpack 3
- React Hot Loader 4 beta
- Ant Design 3
- react-cropper

#### Run:
Download source code and run in dev environment:

```
$ brew install yarn
$ git clone https://github.com/jinpeng/crop-upload.git
$ cd crop-upload
$ yarn install
$ yarn start
```
Install and run crop-upload-server by following the guide at:
[https://github.com/jinpeng/crop-upload-server](https://github.com/jinpeng/crop-upload-server)

Modify server URL in webpack.config.js

```
new webpack.DefinePlugin({
    QINIU_UPTOKEN_URL: process.env.ENV === 'dev' ? '"http://localhost:8000/uptoken"' : '"http://qiniubackend.com:8080/uptoken"'
})
```

Deploy to production environment:

```
$ yarn build
$ cp dist/* /usr/local/var/www/
$ cp src/img/* /usr/local/var/www/img/
```
Here the folder /usr/local/var/www/ is nginx web root folder.  
Configure nginx and run it.  
Open browser and point to http://qiniubackend.com:8080/index.html.

### For End Users
- Choose File: open image to edit
- Use default img: open default image for edit
- Ratio: select preset aspect ratio
- Crop: generate cropped image
- UpToken: get updated Qiniu upload token on first time and when neccessary
- Upload: upload generated cropped image to Qiniu cloud bucket, the bucket is set in crop-upload-server



