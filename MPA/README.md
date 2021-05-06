# Multi Page Application

The files inside this folder serve to configure webpack for the development of a multi page web-app.  

It enables:  
- Automatic entry point discovery
- Cache busting
- Sass support
- Dev-server
- Asset hashing (w/ cache busting)
- JSX
- Extracted CSS

# Dependencies

You can install all the webpack-related dependencies with this command:
```bash
npm i --save-dev webpack webpack-cli html-webpack-plugin mini-css-extract-plugin babel-loader css-loader postcss-loader sass sass-loader @babel/core @babel/preset-react autoprefixer webpack-merge postcss-preset-env webpack-dev-server clean-webpack-plugin eslint-webpack-plugin eslint eslint-plugin-react eslint-plugin-react-hooks eslint-plugin-import @babel/eslint-parser
```

**RECOMMENDATION:** `npm install @loadable/component`

## Webpack dependencies (webpacks loaders/plugins)

The following loaders/plugins are required:

- Plugins:
    - [HtmlWebpackPlugin](https://webpack.js.org/plugins/html-webpack-plugin/)
    - [MiniCssExtractPlugin](https://webpack.js.org/plugins/mini-css-extract-plugin/)
    - [webpack-dev-server](https://www.npmjs.com/package/mini-css-extract-plugin)
    - [clean-webpack-plugin](https://www.npmjs.com/package/clean-webpack-plugin)
    - [eslint-webpack-plugin](https://webpack.js.org/plugins/eslint-webpack-plugin/)
- Loaders:
    - [babel-loader](https://webpack.js.org/loaders/babel-loader/)
    - [css-loader](https://webpack.js.org/loaders/css-loader/)
    - [postcss-loader](https://webpack.js.org/loaders/postcss-loader/)
    - [sass-loader](https://webpack.js.org/loaders/sass-loader/)

## Other dependencies

- `sass`
- `react` `react-dom`
-  `@babel/core`
- `@babel/preset-react`
- [autoprefixer](https://www.npmjs.com/package/autoprefixer)
- [webpack-merge](https://www.npmjs.com/package/webpack-merge)
- [postcss-preset-env](https://www.npmjs.com/package/postcss-preset-env)


# `package.json["devDependencies"]`

Your `package.json` file should include at least the following packages: 

```json
"dependencies": {
    "@loadable/component": "^5.14.1",
    "react": "^17.0.1",
    "react-dom": "^17.0.1"
},
"devDependencies": {
    "@babel/core": "^7.13.1",
    "@babel/preset-react": "^7.12.13",
    "autoprefixer": "^10.2.4",
    "babel-loader": "^8.2.2",
    "clean-webpack-plugin": "^3.0.0",
    "css-loader": "^5.1.0",
    "html-webpack-plugin": "^5.2.0",
    "mini-css-extract-plugin": "^1.3.9",
    "postcss-loader": "^5.0.0",
    "postcss-preset-env": "^6.7.0",
    "sass": "^1.32.8",
    "sass-loader": "^11.0.1",
    "webpack": "^5.24.2",
    "webpack-cli": "^4.5.0",
    "webpack-dev-server": "^3.11.2",
    "webpack-merge": "^5.7.3"
}
```

*Other recommended dependencies:*  
```json
"react-router-dom": "^5.2.0",
"react-spring": "^8.0.27",
"react-use-gesture": "^8.0.0",
"react-use-measure": "^2.0.3",
```