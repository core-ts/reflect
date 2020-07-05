export function clone(obj: any): any {
  if (!obj) {
    return obj;
  }
  if (obj instanceof Date) {
    return new Date(obj.getTime());
  }
  if (typeof obj !== 'object') {
    return obj;
  }
  if (Array.isArray(obj)) {
    const arr = [];
    for (const sub of obj) {
      const c = clone(sub);
      arr.push(c);
    }
    return arr;
  }
  const x: any = {};
  const keys = Object.keys(obj);
  for (const k of keys) {
    const v = obj[k];
    if (v instanceof Date) {
      x[k] = new Date(v.getTime());
    } else {
      switch (typeof v) {
        case 'object':
          x[k] = clone(v);
          break;
        default:
          x[k] = v;
          break;
      }
    }
  }
  return x;
}

export function getDirectValue(obj: any, key: string) {
  if (obj && obj.hasOwnProperty(key)) {
    return obj[key];
  }
  return null;
}

export function valueOf(obj: any, key: string): any {
  const mapper = key.split('.').map(item => {
    return item.replace(/\[/g, '.[').replace(/\[|\]/g, '');
  });
  const reSplit = mapper.join('.').split('.');
  return reSplit.reduce((acc, current, index, source) => {
    const value = getDirectValue(acc, current);
    if (!value) {
      source.splice(1);
    }
    return value;
  }, obj);
}

export function setValue(obj: any, key: string, value: any): void {
  let replaceKey = key.replace(/\[/g, '.[').replace(/\.\./g, '.');
  if (replaceKey.indexOf('.') === 0) {
    replaceKey = replaceKey.slice(1, replaceKey.length);
  }
  const keys = replaceKey.split('.');
  let firstKey;
  firstKey = keys.shift();
  const isArrayKey = /\[([0-9]+)\]/.test(firstKey);

  const setKey = (_object, _isArrayKey, _key, _nextValue) => {
    if (_isArrayKey) {
      if (_object.length > _key) {
        _object[_key] = _nextValue;
      } else {
        _object.push(_nextValue);
      }
    } else {
      _object[_key] = _nextValue;
    }
    return _object;
  };

  if (keys.length > 0) {
    const firstKeyValue = obj[firstKey] || {};
    const returnValue = setValue(firstKeyValue, keys.join('.'), value);
    return setKey(obj, isArrayKey, firstKey, returnValue);
  }
  return setKey(obj, isArrayKey, firstKey, value);
}

export function diff(obj1: any, obj2: any): string[] {
  const fields = [];
  const key1s = Object.keys(obj1);
  for (const k of key1s) {
    const v1 = obj1[k];
    const v2 = obj2[k];
    if (v1 == null) {
      if (v2 != null) {
        fields.push(k);
      }
    } else {
      if (typeof v1 !== 'object') {
        if (v1 !== v2) {
          fields.push(k);
        }
      } else {
        const e = equal(v1, v2);
        if (!e) {
          fields.push(k);
        }
      }
    }
  }
  const key2s = Object.keys(obj2);
  const ni = notIn(key1s, key2s);
  for (const n of ni) {
    fields.push(n);
  }
  return fields;
}

export function notIn(s1: string[], s2: string[]): string[] {
  const r = [];
  for (const s of s2) {
    if (s1.indexOf(s) < 0) {
      r.push(s);
    }
  }
  return r;
}

export function equal(obj1: any, obj2: any): boolean {
  if (obj1 == null && obj2 == null) {
    return true;
  }
  if (obj1 == null || obj2 == null) {
    return false;
  }
  if ((typeof obj1) !== (typeof obj2)) {
    return false;
  }
  if (typeof obj1 !== 'object') {
    return obj1 === obj2;
  }
  if (obj1 instanceof Date) {
    if (!(obj2 instanceof Date)) {
      return false;
    }
    return (obj1.getTime() === obj2.getTime());
  }
  if (Array.isArray(obj1) && !Array.isArray(obj2)
      || !Array.isArray(obj1) && Array.isArray(obj2)) {
    return false;
  }
  if (!Array.isArray(obj1) && !Array.isArray(obj2)) {
    const key1s = Object.keys(obj1);
    const key2s = Object.keys(obj2);
    if (key1s.length !== key2s.length) {
      return false;
    }
    for (const k of key1s) {
      const v = obj1[k];
      if (typeof v !== 'object') {
        if (v !== obj2[k]) {
          return false;
        }
      } else {
        const e = equal(v, obj2[k]);
        if (e === false) {
          return false;
        }
      }
    }
    return true;
  }
  return equalArrays(obj1, obj2);
}

export function equalArrays<T>(ar1: T[], ar2: T[]): boolean {
  if (ar1 == null && ar2 == null) {
    return true;
  }
  if (ar1 == null || ar2 == null) {
    return false;
  }
  if (ar1.length !== ar2.length) {
    return false;
  }
  for (let i = 0; i < ar1.length; i++) {
    const e = equal(ar1[i], ar2[i]);
    if (e === false) {
      return false;
    }
  }
  return true;
}
