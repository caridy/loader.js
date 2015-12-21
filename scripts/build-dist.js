import * as p from 'path';
import * as fs from 'fs';
import rollup from 'rollup';
import babel from 'rollup-plugin-babel';
import npm from 'rollup-plugin-npm';
import commonjs from 'rollup-plugin-commonjs';
import replace from 'rollup-plugin-replace';
import uglify from 'uglify-js';

const copyright = (
`/*
 * Copyright ${new Date().getFullYear()}, Caridy Patiño <caridy@gmail.com>.
 * Copyrights licensed under the MIT License.
 * See the accompanying LICENSE file for terms.
 */
`
);

function createBundle() {
    let bundle = rollup.rollup({
        entry: p.resolve('src/system-browser.js'),
        plugins: [
            babel({
                babelrc: false,
                presets: [
                    'es2015-rollup',
                ],
                plugins: [
                    'transform-object-rest-spread',
                ],
            }),
            npm({
                jsnext: true,
                skip: [
                    // 'reflect',
                ],
            }),
            commonjs({
                sourceMap: true,
            }),
            replace({
                'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
            }),
        ],
    });

    // Cast as native Promise.
    return Promise.resolve(bundle);
}

function writeBundle(bundle, {minify = false}) {
    const filename = `loader${minify ? '.min.js' : '.js'}`;
    const dest = p.resolve(`dist/${filename}`);

    let result = bundle.generate({
        format: 'umd',
        moduleName: 'loaderPolyfill',
        banner: copyright,
        sourceMap: true,
        sourceMapFile: dest,
    });

    if (minify) {
        result = uglify.minify(result.code, {
            fromString: true,
            inSourceMap: result.map,
            outSourceMap: `${filename}.map`,
            warnings: false,
        });

        result.map = JSON.parse(result.map);
    } else {
        result.code += `\n//# sourceMappingURL=${filename}.map`;
    }

    let {code, map} = result;

    // Tweak source paths.
    map.sources = map.sources.map((path) => p.relative('..', path));
    map.sourceRoot = 'loader:///';

    const throwIfError = (err) => {
        if (err) {
            throw err;
        }
    };

    fs.writeFile(dest, code, throwIfError);
    fs.writeFile(`${dest}.map`, JSON.stringify(map), throwIfError);

    console.log(`Writing: ${p.relative('.', dest)}`);
    console.log(`Writing: ${p.relative('.', `${dest}.map`)}`);
}

// -----------------------------------------------------------------------------

process.on('unhandledRejection', (reason) => {throw reason;});

createBundle().then((bundle) => {
    writeBundle(bundle, {minify: process.env.NODE_ENV === 'production'});
});
