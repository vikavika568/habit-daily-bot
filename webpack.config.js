const path = require('path')
const nodeExternals = require('webpack-node-externals')
const TerserPlugin = require('terser-webpack-plugin')

module.exports = {
  mode: 'production',
  entry: './src/index.js',

  node: {
    __dirname: false
  },

  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'main.js'
  },

  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        loader: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      }
    ]
  },

  plugins: [
    // new CleanWebpackPlugin(),
    // new CopyPlugin({
    //   patterns: [{ from: 'database', to: 'database' }]
    // })
  ],

  externalsPresets: { node: true },

  externals: [nodeExternals()],

  resolve: {
    extensions: ['.js', '.jsx', '.json', '.ts', '.tsx'],
    alias: {
      '@': path.join(__dirname, 'src')
    }
  },

  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        exclude: /database/
      })
    ]
  }
}
