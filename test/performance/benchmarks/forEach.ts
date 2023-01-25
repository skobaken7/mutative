// @ts-nocheck
import fs from 'fs';
import { Suite } from 'benchmark';
import { parse } from 'json2csv';
import deepFreeze from 'deep-freeze';
import produce, {
  enablePatches,
  produceWithPatches,
  setAutoFreeze,
  setUseProxies,
} from 'immer';
import { create } from '../../..';

const getData = () => {
  const baseState: { arr: any[]; map: Record<string, any> } = {
    arr: [],
    map: {},
  };

  const createTestObject = () =>
    Array(10 * 5)
      .fill(1)
      .reduce((i, _, k) => Object.assign(i, { [k]: k }), {});

  baseState.arr = Array(10 ** 4 * 5)
    .fill('')
    .map(() => createTestObject());

  Array(10 ** 3)
    .fill(1)
    .forEach((_, i) => {
      baseState.map[i] = { i };
    });
  return baseState;
  // return deepFreeze(baseState);
};

let baseState: any;
let i: any;

const suite = new Suite();

suite
  .add(
    'Naive handcrafted reducer - No Freeze',
    function () {
      const state = {
        ...baseState,
        arr: [],
        map: {},
      };
      for (const item of baseState.arr) {
        state.arr.push({ ...item, a: 1 });
      }
      for (const item in baseState.map) {
        state.map[item] = { ...item, a: 1 };
      }
    },
    {
      onStart: () => {
        i = Math.random();
        baseState = getData();
      },
    }
  )
  .add(
    'Mutative - No Freeze(by default)',
    function () {
      const state = create(baseState, (draft) => {
        for (const item of draft.arr) {
          item.a = 1;
        }
        for (const item in draft.map) {
          draft.map[item].a = 1;
        }
      });
    },
    {
      onStart: () => {
        i = Math.random();
        baseState = getData();
      },
    }
  )
  .add(
    'Immer - No Freeze',
    function () {
      const state = produce(baseState, (draft: any) => {
        for (const item of draft.arr) {
          item.a = 1;
        }
        for (const item in draft.map) {
          draft.map[item].a = 1;
        }
      });
    },
    {
      onStart: () => {
        setAutoFreeze(false);
        setUseProxies(true);
        i = Math.random();
        baseState = getData();
      },
    }
  )
  .add(
    'Mutative - Freeze',
    function () {
      const state = create(
        baseState,
        (draft) => {
          for (const item of draft.arr) {
            item.a = 1;
          }
          for (const item in draft.map) {
            draft.map[item].a = 1;
          }
        },
        {
          enableAutoFreeze: true,
          enablePatches: false,
        }
      );
    },
    {
      onStart: () => {
        i = Math.random();
        baseState = getData();
      },
    }
  )
  .add(
    'Immer - Freeze(by default)',
    function () {
      const state = produce(baseState, (draft: any) => {
        for (const item of draft.arr) {
          item.a = 1;
        }
        for (const item in draft.map) {
          draft.map[item].a = 1;
        }
      });
    },
    {
      onStart: () => {
        setAutoFreeze(true);
        setUseProxies(true);
        i = Math.random();
        baseState = getData();
      },
    }
  )
  .add(
    'Mutative - Patches and No Freeze',
    function () {
      const state = create(
        baseState,
        (draft) => {
          for (const item of draft.arr) {
            item.a = 1;
          }
          for (const item in draft.map) {
            draft.map[item].a = 1;
          }
        },
        {
          enableAutoFreeze: false,
          enablePatches: true,
        }
      );
    },
    {
      onStart: () => {
        i = Math.random();
        baseState = getData();
      },
    }
  )
  .add(
    'Immer - Patches and No Freeze',
    function () {
      const state = produceWithPatches(baseState, (draft: any) => {
        for (const item of draft.arr) {
          item.a = 1;
        }
        for (const item in draft.map) {
          draft.map[item].a = 1;
        }
      });
    },
    {
      onStart: () => {
        setAutoFreeze(false);
        setUseProxies(true);
        enablePatches();
        i = Math.random();
        baseState = getData();
      },
    }
  )
  .add(
    'Mutative - Patches and Freeze',
    function () {
      const state = create(
        baseState,
        (draft) => {
          for (const item of draft.arr) {
            item.a = 1;
          }
          for (const item in draft.map) {
            draft.map[item].a = 1;
          }
        },
        {
          enableAutoFreeze: true,
          enablePatches: true,
        }
      );
    },
    {
      onStart: () => {
        i = Math.random();
        baseState = getData();
      },
    }
  )
  .add(
    'Immer - Patches and Freeze',
    function () {
      const state = produceWithPatches(baseState, (draft: any) => {
        for (const item of draft.arr) {
          item.a = 1;
        }
        for (const item in draft.map) {
          draft.map[item].a = 1;
        }
      });
    },
    {
      onStart: () => {
        setAutoFreeze(true);
        setUseProxies(true);
        enablePatches();
        i = Math.random();
        baseState = getData();
      },
    }
  )
  .on('cycle', function (event) {
    console.log(String(event.target));
  })
  .on('complete', function () {
    console.log('The fastest method is ' + this.filter('fastest').map('name'));
  })
  .run({ async: false });
