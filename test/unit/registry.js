import expect from 'expect';
import Loader from '../../src/3.loader.js';
import Registry from '../../src/4.registry.js';

describe('Registry', () => {

    describe('new Loader().registry', () => {
        let registry = new Loader().registry;

        it('is an member of loader', () => {
            expect(registry).toBeAn('object');
        });
        it('.constructor', () => {
            expect(registry.constructor).toBeA('function');
        });
        it('@@iterator', () => {
            expect(registry[Symbol.iterator]).toBeA('function');
        });
        it('.entries', () => {
            expect(registry.entries).toBeA('function');
        });
        it('.keys', () => {
            expect(registry.keys).toBeA('function');
        });
        it('.values', () => {
            expect(registry.values).toBeA('function');
        });
        it('.get', () => {
            expect(registry.get).toBeA('function');
        });
        it('.set', () => {
            expect(registry.set).toBeA('function');
        });
        it('.has', () => {
            expect(registry.has).toBeA('function');
        });
        it('.delete', () => {
            expect(registry.delete).toBeA('function');
        });
        it('cannot be subclasseable', () => {
            let prototype = Object.getPrototypeOf(registry);
            expect(prototype).toBeAn('object');
            function foo () {}
            foo.prototype = Object.create(prototype);
            foo.prototype.constructor = registry.constructor;
            expect(() => {
                new foo();
            }).toThrow();
        });
    });

    describe('new Registry()', () => {
        let loader = new Loader();
        let registry = loader.registry;

        it('cannot be instantiate directly', () => {
            expect(() => {
                new Registry({});
            }).toThrow();
        });
        it('cannot be subclasseable', () => {
            let prototype = Object.getPrototypeOf(registry);
            expect(prototype).toBeAn('object');
            function foo () {}
            foo.prototype = Object.create(prototype);
            foo.prototype.constructor = loader.registry.constructor;
            expect(() => {
                new foo();
            }).toThrow();
        });
    });

});
