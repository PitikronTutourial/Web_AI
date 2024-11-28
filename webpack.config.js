const compression = require('compression');

module.exports = {
  // การกำหนดค่าอื่น ๆ ของ webpack config ของคุณ...

  devServer: {
    setupMiddlewares: (devServer) => {
      devServer.app.use(compression());

      // อื่น ๆ ตามต้องการ...
    }
  }
};
