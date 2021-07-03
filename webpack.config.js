var path = require('path');

module.exports = {
	mode: 'development',
	entry: {
		bundle: path.resolve(__dirname, 'frontend/src/index.js')
	},
	module: {
		rules: [
      {
        test: /\.js$/,
        loader: "babel-loader",
        exclude: /(node_modules)/
      },
      // {
      //   test: /\.(png|jpg|gif|svg)$/,
      //   exclude: /(static)/,
      //   use: {
      //     loader: 'file-loader',
      //     options: {
      //       name: '[path][name]-[hash].[ext]',
      //       outputPath: '../',
      //       publicPath: '/dist',
      //     },
      //   },
      // },
      {
        test: /\.s[ac]ss$/i,
        use: [
          // Creates `style` nodes from JS strings
          {
            loader: 'style-loader',
            // options: { url: false }
          },
          // Translates CSS into CommonJS
          {
            loader: 'css-loader',
            options: { url: false }  
          },
          // Compiles Sass to CSS
          {
            loader: 'sass-loader',
            options: { sassOptions: {relativeUrls: false} }
          },
        ]
      }
    ]
	},
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'frontend/src'),
    }
  }
};