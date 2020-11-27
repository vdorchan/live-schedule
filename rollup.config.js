import nodeResolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import babel from '@rollup/plugin-babel'
import replace from '@rollup/plugin-replace'
import { terser } from 'rollup-plugin-terser'
import postcss from 'rollup-plugin-postcss'
import livereload from 'rollup-plugin-livereload'
import serve from 'rollup-plugin-serve'
import Vue from 'rollup-plugin-vue'

import pkg from './package.json'

const babelRuntimeVersion = pkg.dependencies['@babel/runtime'].replace(
  /^[^0-9]*/,
  ''
)

export default [
  // UMD Development
  {
    input: 'src/index.js',
    output: {
      file: 'dist/schedule.js',
      format: 'umd',
      name: 'Schedule',
      indent: false,
    },
    plugins: [
      nodeResolve(),
      babel({
        exclude: 'node_modules/**',
        plugins: [
          ['@babel/plugin-transform-runtime', { version: babelRuntimeVersion }],
        ],
        babelHelpers: 'runtime',
      }),
      commonjs(),
      postcss(),
      serve(),
      livereload({
        watch: ['dist', 'example'],
      }),
    ],
  },

  // UMD Production
  {
    input: 'src/index.js',
    output: {
      file: 'dist/schedule.min.js',
      format: 'umd',
      name: 'Schedlue',
      indent: false,
    },
    plugins: [
      nodeResolve(),
      babel({
        exclude: 'node_modules/**',
        plugins: [
          ['@babel/plugin-transform-runtime', { version: babelRuntimeVersion }],
        ],
        babelHelpers: 'runtime',
      }),
      replace({
        'process.env.NODE_ENV': JSON.stringify('production'),
      }),
      terser({
        compress: {
          pure_getters: true,
          unsafe: true,
          unsafe_comps: true,
          warnings: false,
        },
      }),
      commonjs(),
      postcss(),
    ],
  },

  {
    input: 'src/index.js',
    output: {
      file: 'dist/schedule.esm.js',
      format: 'es',
      name: 'Schedlue',
      indent: false,
    },
    plugins: [
      nodeResolve(),
      babel({
        exclude: 'node_modules/**',
        plugins: [
          ['@babel/plugin-transform-runtime', { version: babelRuntimeVersion }],
        ],
        babelHelpers: 'runtime',
      }),
      replace({
        'process.env.NODE_ENV': JSON.stringify('development'),
      }),
      commonjs(),
      postcss(),
    ],
  },

  {
    input: 'src/components/index.js',
    output: {
      file: 'vue/schedule-vue.esm.js',
      format: 'es',
      name: 'schedule',
      indent: false,
    },
    plugins: [
      commonjs(),
      Vue(),
      nodeResolve(),
      babel({
        exclude: 'node_modules/**',
        plugins: [
          ['@babel/plugin-transform-runtime', { version: babelRuntimeVersion, useESModules: true }],
        ],
        babelHelpers: 'runtime',
      }),
      replace({
        'process.env.NODE_ENV': JSON.stringify('development'),
      }),
      postcss(),
    ],
  },
]
