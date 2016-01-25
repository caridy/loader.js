import * as p from 'path';
import * as fs from 'fs';
import {rollup} from 'rollup';
import babel from 'rollup-plugin-babel';
import npm from 'rollup-plugin-npm';
import commonjs from 'rollup-plugin-commonjs';

const copyright = (
`/*
 * Copyright ${new Date().getFullYear()}, Caridy Patiño <caridy@gmail.com>.
 * Copyrights licensed under the MIT License.
 * See the accompanying LICENSE file for terms.
 */
`
);

const entry = p.resolve('src/system-browser.js');
const dest  = p.resolve('dist/loader.js');

const bundleConfig = {
    dest,
    format: 'umd',
    moduleName: 'loaderPolyfill',
    banner: copyright,
    sourceMap: false,
};

let babelConfig = JSON.parse(fs.readFileSync('.babelrc', 'utf8'));
babelConfig.babelrc = false;
babelConfig.presets = babelConfig.presets.map((preset) => {
    return preset === 'es2015' ? 'es2015-rollup' : preset;
});

let plugins = [
    babel(babelConfig),
    npm(),
    commonjs({
        sourceMap: false,
    }),
];

let bundle = Promise.resolve(rollup({entry, plugins}));
bundle.then(({write}) => write(bundleConfig));

process.on('unhandledRejection', (reason) => {throw reason;});
