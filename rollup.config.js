import nodeResolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import babel from '@rollup/plugin-babel'
import replace from '@rollup/plugin-replace'
import { terser } from 'rollup-plugin-terser'
import postcss from 'rollup-plugin-postcss'
import livereload from 'rollup-plugin-livereload'
import serve from 'rollup-plugin-serve'

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
]
