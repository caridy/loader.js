import expect from 'expect';
import Loader from '../../src/3.loader.js';

describe('Reflect.Loader', () => {
    it('exports a class', () => {
        expect(Loader).toBeA('function');
    });
    it('is subclasseable', () => {
        class foo extends Loader {
            constructor() {
                super();
            }
        }
        let o = new foo();
        expect(o).toBeAn('object');
        expect(o.import).toBeA('function');
        expect(o.resolve).toBeA('function');
        expect(o.load).toBeA('function');
    });
    it('instance has a registry', () => {
        let o = new Loader();
        let registry = o.registry;
        expect(registry).toBeA('object');
        expect(registry.entries).toBeA('function');
    });
    it('import()', () => {
        let o = new Loader();
        o.import('foo');
    });

});
