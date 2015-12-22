import expect from 'expect';
import Loader from '../../src/3.loader.js';
import Module from '../../src/8.module.js';
import ModuleStatus from '../../src/5.module-status.js';

describe('Reflect.Module.ModuleStatus', () => {
    it('exports a class', () => {
        expect(ModuleStatus).toBeA('function');
    });
    it('is subclasseable', () => {
        class foo extends ModuleStatus {
            constructor(loader, key, module) {
                super(loader, key, module);
            }
        }
        let o = new foo(new Loader(), 'some-key', new Module());
        expect(o).toBeAn('object');
        expect(o.load).toBeA('function');
        expect(o.result).toBeA('function');
        expect(o.resolve).toBeA('function');
        expect(o.reject).toBeA('function');
    });
    it('1rd argument loader is required', () => {
        expect(() => {
            new ModuleStatus();
        }).toThrow();
    });
    it('2rd argument key is required', () => {
        expect(() => {
            new ModuleStatus(new Loader());
        }).toThrow();
    });
    it('3rd argument module is optional', () => {
        let o = new ModuleStatus(new Loader(), 'some-key');
        expect(o).toBeAn('object');
        expect(o.load).toBeA('function');
        expect(o.result).toBeA('function');
        expect(o.resolve).toBeA('function');
        expect(o.reject).toBeA('function');
    });
});
