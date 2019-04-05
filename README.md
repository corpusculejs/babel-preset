> ## 🛠 Status: In Development
> @corpuscule/babel-preset is currently under development. Feedback is always welcome, but be careful with
using it in production.

# @corpuscule/babel-preset
[![Latest Stable Version](https://img.shields.io/npm/v/@corpuscule/babel-preset.svg)](https://www.npmjs.com/package/@corpuscule/babel-preset)
[![Build Status](https://travis-ci.com/corpusculejs/babel-preset.svg?branch=master)](https://travis-ci.org/corpusculejs/babel-preset)
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![Test Coverage](https://img.shields.io/codecov/c/github/corpusculejs/babel-preset/master.svg)](https://codecov.io/gh/corpusculejs/babel-preset)

Babel plugins preset that allows working with the [Corpuscule](https://github.com/corpusculejs/corpuscule) project while
[decorator specification](https://github.com/tc39/proposal-decorators) is in development.

## Rationale
### History
The earlier versions of Corpuscule used the [second decorator proposal](https://github.com/tc39/proposal-decorators/tree/7fa580b40f2c19c561511ea2c978e307ae689a1b).
However, on January 2019, this proposal was deprecated due to the complexity and potential performance penalty, and
work on the third proposal was started.

Due to the beginning state of the new specification, the absence of the Babel implementation of it, it was decided to
rewrite Corpuscule to the emulation of the new decorator proposal.

### Emulation of the proposal
Emulation means that Corpuscule does not follow the specification yet. It respects basic ideas, but the implementation
is based on the first decorator proposal (stage 1, also Typescript decorators or legacy decorator proposal) supplemented
with the particular Babel plugin that adds missing functionality to it. 

This decision is made because the new proposal changes syntax a lot and until Typescript implements this syntax in the
compiler they will be incompatible. Implementation of the new syntax requires decorators to be on stage 3 which means
that Corpuscule will also wait until it happens.

### Plugins
* `babel-plugin-inject-decorator-initializer`. Description see [below](#babel-plugin-inject-decorator-initializer).
* [`@babel/plugin-proposal-decorators`](https://babeljs.io/docs/en/babel-plugin-proposal-decorators) (in a `legacy`
mode).
* [`@babel/plugin-proposal-class-properties`](https://babeljs.io/docs/en/babel-plugin-proposal-class-properties) (in a
`loose` mode).

#### `babel-plugin-inject-decorator-initializer`
The supplementing Babel plugin that adds missing functionality for the legacy decorator implementation works in the
following way: 
1) Each class has two static fields with arrays. The first array contains initializers that will be injected into the
constructor (`@initializer` implementation). The second array contains registrations (`@register` implementation) that
will run after the class is created.
2) During its work plugin injects a call of a simple iterator function that runs all the callbacks, into the proper
place: constructor for initializers and right after class is created for registrations.
3) Each initializer receives an instance as an argument. Registration receives class target as well, but it is often
unnecessary for the legacy proposal because a class is already accessible during the decorator work. 
4) While the decorator's execution you can add new callbacks to the `__initializers` and `__registrations` arrays. They
will work in the order decorators execute.

### Why preset, not a plugin?
First of all, preset contains all necessary decorators to work, because the legacy proposal requires a couple of
settings (e.g. [`@babel/plugin-proposal-class-properties`](https://babeljs.io/docs/en/babel-plugin-proposal-class-properties)
in `loose` mode).

Then, when decorators become a  standard, and the tweaks for legacy implementation are not necessary anymore, this
package could be used for other goals like removing property guards in production. 

## Installation
```bash
$ npm install --save-dev @corpuscule/babel-preset
```

## Usage
`.babelrc`
```json
{
  "presets": ["@corpuscule/babel-preset", "@babel/preset-typescript"]
}
```