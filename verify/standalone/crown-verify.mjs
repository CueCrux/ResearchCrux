#!/usr/bin/env node
var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod2) => function __require2() {
  return mod2 || (0, cb[__getOwnPropNames(cb)[0]])((mod2 = { exports: {} }).exports, mod2), mod2.exports;
};
var __export = (target2, all) => {
  for (var name in all)
    __defProp(target2, name, { get: all[name], enumerable: true });
};

// node_modules/cbor-x/decode.js
function checkedRead() {
  try {
    let result = read();
    if (bundledStrings) {
      if (position >= bundledStrings.postBundlePosition) {
        let error = new Error("Unexpected bundle position");
        error.incomplete = true;
        throw error;
      }
      position = bundledStrings.postBundlePosition;
      bundledStrings = null;
    }
    if (position == srcEnd) {
      currentStructures = null;
      src = null;
      if (referenceMap)
        referenceMap = null;
    } else if (position > srcEnd) {
      let error = new Error("Unexpected end of CBOR data");
      error.incomplete = true;
      throw error;
    } else if (!sequentialMode) {
      throw new Error("Data read, but end of buffer not reached");
    }
    return result;
  } catch (error) {
    clearSource();
    if (error instanceof RangeError || error.message.startsWith("Unexpected end of buffer")) {
      error.incomplete = true;
    }
    throw error;
  }
}
function read() {
  let token = src[position++];
  let majorType = token >> 5;
  token = token & 31;
  if (token > 23) {
    switch (token) {
      case 24:
        token = src[position++];
        break;
      case 25:
        if (majorType == 7) {
          return getFloat16();
        }
        token = dataView.getUint16(position);
        position += 2;
        break;
      case 26:
        if (majorType == 7) {
          let value = dataView.getFloat32(position);
          if (currentDecoder.useFloat32 > 2) {
            let multiplier = mult10[(src[position] & 127) << 1 | src[position + 1] >> 7];
            position += 4;
            return (multiplier * value + (value > 0 ? 0.5 : -0.5) >> 0) / multiplier;
          }
          position += 4;
          return value;
        }
        token = dataView.getUint32(position);
        position += 4;
        if (majorType === 1) return -1 - token;
        break;
      case 27:
        if (majorType == 7) {
          let value = dataView.getFloat64(position);
          position += 8;
          return value;
        }
        if (majorType > 1) {
          if (dataView.getUint32(position) > 0)
            throw new Error("JavaScript does not support arrays, maps, or strings with length over 4294967295");
          token = dataView.getUint32(position + 4);
        } else if (currentDecoder.int64AsNumber) {
          token = dataView.getUint32(position) * 4294967296;
          token += dataView.getUint32(position + 4);
        } else token = dataView.getBigUint64(position);
        position += 8;
        break;
      case 31:
        switch (majorType) {
          case 2:
          // byte string
          case 3:
            throw new Error("Indefinite length not supported for byte or text strings");
          case 4:
            let array = [];
            let value, i = 0;
            while ((value = read()) != STOP_CODE) {
              if (i >= maxArraySize) throw new Error(`Array length exceeds ${maxArraySize}`);
              array[i++] = value;
            }
            return majorType == 4 ? array : majorType == 3 ? array.join("") : Buffer.concat(array);
          case 5:
            let key;
            if (currentDecoder.mapsAsObjects) {
              let object = {};
              let i2 = 0;
              if (currentDecoder.keyMap) {
                while ((key = read()) != STOP_CODE) {
                  if (i2++ >= maxMapSize) throw new Error(`Property count exceeds ${maxMapSize}`);
                  object[safeKey(currentDecoder.decodeKey(key))] = read();
                }
              } else {
                while ((key = read()) != STOP_CODE) {
                  if (i2++ >= maxMapSize) throw new Error(`Property count exceeds ${maxMapSize}`);
                  object[safeKey(key)] = read();
                }
              }
              return object;
            } else {
              if (restoreMapsAsObject) {
                currentDecoder.mapsAsObjects = true;
                restoreMapsAsObject = false;
              }
              let map = /* @__PURE__ */ new Map();
              if (currentDecoder.keyMap) {
                let i2 = 0;
                while ((key = read()) != STOP_CODE) {
                  if (i2++ >= maxMapSize) {
                    throw new Error(`Map size exceeds ${maxMapSize}`);
                  }
                  map.set(currentDecoder.decodeKey(key), read());
                }
              } else {
                let i2 = 0;
                while ((key = read()) != STOP_CODE) {
                  if (i2++ >= maxMapSize) {
                    throw new Error(`Map size exceeds ${maxMapSize}`);
                  }
                  map.set(key, read());
                }
              }
              return map;
            }
          case 7:
            return STOP_CODE;
          default:
            throw new Error("Invalid major type for indefinite length " + majorType);
        }
      default:
        throw new Error("Unknown token " + token);
    }
  }
  switch (majorType) {
    case 0:
      return token;
    case 1:
      return ~token;
    case 2:
      return readBin(token);
    case 3:
      if (srcStringEnd >= position) {
        return srcString.slice(position - srcStringStart, (position += token) - srcStringStart);
      }
      if (srcStringEnd == 0 && srcEnd < 140 && token < 32) {
        let string = token < 16 ? shortStringInJS(token) : longStringInJS(token);
        if (string != null)
          return string;
      }
      return readFixedString(token);
    case 4:
      if (token >= maxArraySize) throw new Error(`Array length exceeds ${maxArraySize}`);
      let array = new Array(token);
      for (let i = 0; i < token; i++) array[i] = read();
      return array;
    case 5:
      if (token >= maxMapSize) throw new Error(`Map size exceeds ${maxArraySize}`);
      if (currentDecoder.mapsAsObjects) {
        let object = {};
        if (currentDecoder.keyMap) for (let i = 0; i < token; i++) object[safeKey(currentDecoder.decodeKey(read()))] = read();
        else for (let i = 0; i < token; i++) object[safeKey(read())] = read();
        return object;
      } else {
        if (restoreMapsAsObject) {
          currentDecoder.mapsAsObjects = true;
          restoreMapsAsObject = false;
        }
        let map = /* @__PURE__ */ new Map();
        if (currentDecoder.keyMap) for (let i = 0; i < token; i++) map.set(currentDecoder.decodeKey(read()), read());
        else for (let i = 0; i < token; i++) map.set(read(), read());
        return map;
      }
    case 6:
      if (token >= BUNDLED_STRINGS_ID) {
        let structure = currentStructures[token & 8191];
        if (structure) {
          if (!structure.read) structure.read = createStructureReader(structure);
          return structure.read();
        }
        if (token < 65536) {
          if (token == RECORD_INLINE_ID) {
            let length = readJustLength();
            let id = read();
            let structure2 = read();
            recordDefinition(id, structure2);
            let object = {};
            if (currentDecoder.keyMap) for (let i = 2; i < length; i++) {
              let key = currentDecoder.decodeKey(structure2[i - 2]);
              object[safeKey(key)] = read();
            }
            else for (let i = 2; i < length; i++) {
              let key = structure2[i - 2];
              object[safeKey(key)] = read();
            }
            return object;
          } else if (token == RECORD_DEFINITIONS_ID) {
            let length = readJustLength();
            let id = read();
            for (let i = 2; i < length; i++) {
              recordDefinition(id++, read());
            }
            return read();
          } else if (token == BUNDLED_STRINGS_ID) {
            return readBundleExt();
          }
          if (currentDecoder.getShared) {
            loadShared();
            structure = currentStructures[token & 8191];
            if (structure) {
              if (!structure.read)
                structure.read = createStructureReader(structure);
              return structure.read();
            }
          }
        }
      }
      let extension = currentExtensions[token];
      if (extension) {
        if (extension.handlesRead)
          return extension(read);
        else
          return extension(read());
      } else {
        let input = read();
        for (let i = 0; i < currentExtensionRanges.length; i++) {
          let value = currentExtensionRanges[i](token, input);
          if (value !== void 0)
            return value;
        }
        return new Tag(input, token);
      }
    case 7:
      switch (token) {
        case 20:
          return false;
        case 21:
          return true;
        case 22:
          return null;
        case 23:
          return;
        // undefined
        case 31:
        default:
          let packedValue = (packedValues || getPackedValues())[token];
          if (packedValue !== void 0)
            return packedValue;
          throw new Error("Unknown token " + token);
      }
    default:
      if (isNaN(token)) {
        let error = new Error("Unexpected end of CBOR data");
        error.incomplete = true;
        throw error;
      }
      throw new Error("Unknown CBOR token " + token);
  }
}
function createStructureReader(structure) {
  if (!structure) throw new Error("Structure is required in record definition");
  function readObject() {
    let length = src[position++];
    length = length & 31;
    if (length > 23) {
      switch (length) {
        case 24:
          length = src[position++];
          break;
        case 25:
          length = dataView.getUint16(position);
          position += 2;
          break;
        case 26:
          length = dataView.getUint32(position);
          position += 4;
          break;
        default:
          throw new Error("Expected array header, but got " + src[position - 1]);
      }
    }
    let compiledReader = this.compiledReader;
    while (compiledReader) {
      if (compiledReader.propertyCount === length)
        return compiledReader(read);
      compiledReader = compiledReader.next;
    }
    if (this.slowReads++ >= inlineObjectReadThreshold) {
      let array = this.length == length ? this : this.slice(0, length);
      compiledReader = currentDecoder.keyMap ? new Function("r", "return {" + array.map((k) => currentDecoder.decodeKey(k)).map((k) => validName.test(k) ? safeKey(k) + ":r()" : "[" + JSON.stringify(k) + "]:r()").join(",") + "}") : new Function("r", "return {" + array.map((key) => validName.test(key) ? safeKey(key) + ":r()" : "[" + JSON.stringify(key) + "]:r()").join(",") + "}");
      if (this.compiledReader)
        compiledReader.next = this.compiledReader;
      compiledReader.propertyCount = length;
      this.compiledReader = compiledReader;
      return compiledReader(read);
    }
    let object = {};
    if (currentDecoder.keyMap) for (let i = 0; i < length; i++) object[safeKey(currentDecoder.decodeKey(this[i]))] = read();
    else for (let i = 0; i < length; i++) {
      object[safeKey(this[i])] = read();
    }
    return object;
  }
  structure.slowReads = 0;
  return readObject;
}
function safeKey(key) {
  if (typeof key === "string") return key === "__proto__" ? "__proto_" : key;
  if (typeof key === "number" || typeof key === "boolean" || typeof key === "bigint") return key.toString();
  if (key == null) return key + "";
  throw new Error("Invalid property name type " + typeof key);
}
function setExtractor(extractStrings) {
  isNativeAccelerationEnabled = true;
  readFixedString = readString(1);
  readString8 = readString(2);
  readString16 = readString(3);
  readString32 = readString(5);
  function readString(headerLength) {
    return function readString2(length) {
      let string = strings[stringPosition++];
      if (string == null) {
        if (bundledStrings)
          return readStringJS(length);
        let extraction = extractStrings(position, srcEnd, length, src);
        if (typeof extraction == "string") {
          string = extraction;
          strings = EMPTY_ARRAY;
        } else {
          strings = extraction;
          stringPosition = 1;
          srcStringEnd = 1;
          string = strings[0];
          if (string === void 0)
            throw new Error("Unexpected end of buffer");
        }
      }
      let srcStringLength = string.length;
      if (srcStringLength <= length) {
        position += length;
        return string;
      }
      srcString = string;
      srcStringStart = position;
      srcStringEnd = position + srcStringLength;
      position += length;
      return string.slice(0, length);
    };
  }
}
function readStringJS(length) {
  let result;
  if (length < 16) {
    if (result = shortStringInJS(length))
      return result;
  }
  if (length > 64 && decoder)
    return decoder.decode(src.subarray(position, position += length));
  const end = position + length;
  const units = [];
  result = "";
  while (position < end) {
    const byte1 = src[position++];
    if ((byte1 & 128) === 0) {
      units.push(byte1);
    } else if ((byte1 & 224) === 192) {
      const byte2 = src[position++] & 63;
      const codePoint = (byte1 & 31) << 6 | byte2;
      if (codePoint < 128) {
        units.push(65533);
      } else {
        units.push(codePoint);
      }
    } else if ((byte1 & 240) === 224) {
      const byte2 = src[position++] & 63;
      const byte3 = src[position++] & 63;
      const codePoint = (byte1 & 31) << 12 | byte2 << 6 | byte3;
      if (codePoint < 2048 || codePoint >= 55296 && codePoint <= 57343) {
        units.push(65533);
      } else {
        units.push(codePoint);
      }
    } else if ((byte1 & 248) === 240) {
      const byte2 = src[position++] & 63;
      const byte3 = src[position++] & 63;
      const byte4 = src[position++] & 63;
      let unit = (byte1 & 7) << 18 | byte2 << 12 | byte3 << 6 | byte4;
      if (unit < 65536 || unit > 1114111) {
        units.push(65533);
      } else if (unit > 65535) {
        unit -= 65536;
        units.push(unit >>> 10 & 1023 | 55296);
        unit = 56320 | unit & 1023;
        units.push(unit);
      } else {
        units.push(unit);
      }
    } else {
      units.push(65533);
    }
    if (units.length >= 4096) {
      result += fromCharCode.apply(String, units);
      units.length = 0;
    }
  }
  if (units.length > 0) {
    result += fromCharCode.apply(String, units);
  }
  return result;
}
function longStringInJS(length) {
  let start = position;
  let bytes = new Array(length);
  for (let i = 0; i < length; i++) {
    const byte = src[position++];
    if ((byte & 128) > 0) {
      position = start;
      return;
    }
    bytes[i] = byte;
  }
  return fromCharCode.apply(String, bytes);
}
function shortStringInJS(length) {
  if (length < 4) {
    if (length < 2) {
      if (length === 0)
        return "";
      else {
        let a = src[position++];
        if ((a & 128) > 1) {
          position -= 1;
          return;
        }
        return fromCharCode(a);
      }
    } else {
      let a = src[position++];
      let b = src[position++];
      if ((a & 128) > 0 || (b & 128) > 0) {
        position -= 2;
        return;
      }
      if (length < 3)
        return fromCharCode(a, b);
      let c = src[position++];
      if ((c & 128) > 0) {
        position -= 3;
        return;
      }
      return fromCharCode(a, b, c);
    }
  } else {
    let a = src[position++];
    let b = src[position++];
    let c = src[position++];
    let d = src[position++];
    if ((a & 128) > 0 || (b & 128) > 0 || (c & 128) > 0 || (d & 128) > 0) {
      position -= 4;
      return;
    }
    if (length < 6) {
      if (length === 4)
        return fromCharCode(a, b, c, d);
      else {
        let e = src[position++];
        if ((e & 128) > 0) {
          position -= 5;
          return;
        }
        return fromCharCode(a, b, c, d, e);
      }
    } else if (length < 8) {
      let e = src[position++];
      let f = src[position++];
      if ((e & 128) > 0 || (f & 128) > 0) {
        position -= 6;
        return;
      }
      if (length < 7)
        return fromCharCode(a, b, c, d, e, f);
      let g = src[position++];
      if ((g & 128) > 0) {
        position -= 7;
        return;
      }
      return fromCharCode(a, b, c, d, e, f, g);
    } else {
      let e = src[position++];
      let f = src[position++];
      let g = src[position++];
      let h = src[position++];
      if ((e & 128) > 0 || (f & 128) > 0 || (g & 128) > 0 || (h & 128) > 0) {
        position -= 8;
        return;
      }
      if (length < 10) {
        if (length === 8)
          return fromCharCode(a, b, c, d, e, f, g, h);
        else {
          let i = src[position++];
          if ((i & 128) > 0) {
            position -= 9;
            return;
          }
          return fromCharCode(a, b, c, d, e, f, g, h, i);
        }
      } else if (length < 12) {
        let i = src[position++];
        let j = src[position++];
        if ((i & 128) > 0 || (j & 128) > 0) {
          position -= 10;
          return;
        }
        if (length < 11)
          return fromCharCode(a, b, c, d, e, f, g, h, i, j);
        let k = src[position++];
        if ((k & 128) > 0) {
          position -= 11;
          return;
        }
        return fromCharCode(a, b, c, d, e, f, g, h, i, j, k);
      } else {
        let i = src[position++];
        let j = src[position++];
        let k = src[position++];
        let l = src[position++];
        if ((i & 128) > 0 || (j & 128) > 0 || (k & 128) > 0 || (l & 128) > 0) {
          position -= 12;
          return;
        }
        if (length < 14) {
          if (length === 12)
            return fromCharCode(a, b, c, d, e, f, g, h, i, j, k, l);
          else {
            let m = src[position++];
            if ((m & 128) > 0) {
              position -= 13;
              return;
            }
            return fromCharCode(a, b, c, d, e, f, g, h, i, j, k, l, m);
          }
        } else {
          let m = src[position++];
          let n = src[position++];
          if ((m & 128) > 0 || (n & 128) > 0) {
            position -= 14;
            return;
          }
          if (length < 15)
            return fromCharCode(a, b, c, d, e, f, g, h, i, j, k, l, m, n);
          let o = src[position++];
          if ((o & 128) > 0) {
            position -= 15;
            return;
          }
          return fromCharCode(a, b, c, d, e, f, g, h, i, j, k, l, m, n, o);
        }
      }
    }
  }
}
function readBin(length) {
  return currentDecoder.copyBuffers ? (
    // specifically use the copying slice (not the node one)
    Uint8Array.prototype.slice.call(src, position, position += length)
  ) : src.subarray(position, position += length);
}
function getFloat16() {
  let byte0 = src[position++];
  let byte1 = src[position++];
  let exponent = (byte0 & 127) >> 2;
  if (exponent === 31) {
    if (byte1 || byte0 & 3)
      return NaN;
    return byte0 & 128 ? -Infinity : Infinity;
  }
  if (exponent === 0) {
    let abs = ((byte0 & 3) << 8 | byte1) / (1 << 24);
    return byte0 & 128 ? -abs : abs;
  }
  u8Array[3] = byte0 & 128 | // sign bit
  (exponent >> 1) + 56;
  u8Array[2] = (byte0 & 7) << 5 | // last exponent bit and first two mantissa bits
  byte1 >> 3;
  u8Array[1] = byte1 << 5;
  u8Array[0] = 0;
  return f32Array[0];
}
function combine(a, b) {
  if (typeof a === "string")
    return a + b;
  if (a instanceof Array)
    return a.concat(b);
  return Object.assign({}, a, b);
}
function getPackedValues() {
  if (!packedValues) {
    if (currentDecoder.getShared)
      loadShared();
    else
      throw new Error("No packed values available");
  }
  return packedValues;
}
function registerTypedArray(TypedArray, tag) {
  let dvMethod = "get" + TypedArray.name.slice(0, -5);
  let bytesPerElement;
  if (typeof TypedArray === "function")
    bytesPerElement = TypedArray.BYTES_PER_ELEMENT;
  else
    TypedArray = null;
  for (let littleEndian = 0; littleEndian < 2; littleEndian++) {
    if (!littleEndian && bytesPerElement == 1)
      continue;
    let sizeShift = bytesPerElement == 2 ? 1 : bytesPerElement == 4 ? 2 : bytesPerElement == 8 ? 3 : 0;
    currentExtensions[littleEndian ? tag : tag - 4] = bytesPerElement == 1 || littleEndian == isLittleEndianMachine ? (buffer) => {
      if (!TypedArray)
        throw new Error("Could not find typed array for code " + tag);
      if (!currentDecoder.copyBuffers) {
        if (bytesPerElement === 1 || bytesPerElement === 2 && !(buffer.byteOffset & 1) || bytesPerElement === 4 && !(buffer.byteOffset & 3) || bytesPerElement === 8 && !(buffer.byteOffset & 7))
          return new TypedArray(buffer.buffer, buffer.byteOffset, buffer.byteLength >> sizeShift);
      }
      return new TypedArray(Uint8Array.prototype.slice.call(buffer, 0).buffer);
    } : (buffer) => {
      if (!TypedArray)
        throw new Error("Could not find typed array for code " + tag);
      let dv = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
      let elements = buffer.length >> sizeShift;
      let ta = new TypedArray(elements);
      let method = dv[dvMethod];
      for (let i = 0; i < elements; i++) {
        ta[i] = method.call(dv, i << sizeShift, littleEndian);
      }
      return ta;
    };
  }
}
function readBundleExt() {
  let length = readJustLength();
  let bundlePosition = position + read();
  for (let i = 2; i < length; i++) {
    let bundleLength = readJustLength();
    position += bundleLength;
  }
  let dataPosition = position;
  position = bundlePosition;
  bundledStrings = [readStringJS(readJustLength()), readStringJS(readJustLength())];
  bundledStrings.position0 = 0;
  bundledStrings.position1 = 0;
  bundledStrings.postBundlePosition = position;
  position = dataPosition;
  return read();
}
function readJustLength() {
  let token = src[position++] & 31;
  if (token > 23) {
    switch (token) {
      case 24:
        token = src[position++];
        break;
      case 25:
        token = dataView.getUint16(position);
        position += 2;
        break;
      case 26:
        token = dataView.getUint32(position);
        position += 4;
        break;
    }
  }
  return token;
}
function loadShared() {
  if (currentDecoder.getShared) {
    let sharedData = saveState(() => {
      src = null;
      return currentDecoder.getShared();
    }) || {};
    let updatedStructures = sharedData.structures || [];
    currentDecoder.sharedVersion = sharedData.version;
    packedValues = currentDecoder.sharedValues = sharedData.packedValues;
    if (currentStructures === true)
      currentDecoder.structures = currentStructures = updatedStructures;
    else
      currentStructures.splice.apply(currentStructures, [0, updatedStructures.length].concat(updatedStructures));
  }
}
function saveState(callback) {
  let savedSrcEnd = srcEnd;
  let savedPosition = position;
  let savedStringPosition = stringPosition;
  let savedSrcStringStart = srcStringStart;
  let savedSrcStringEnd = srcStringEnd;
  let savedSrcString = srcString;
  let savedStrings = strings;
  let savedReferenceMap = referenceMap;
  let savedBundledStrings = bundledStrings;
  let savedSrc = new Uint8Array(src.slice(0, srcEnd));
  let savedStructures = currentStructures;
  let savedDecoder = currentDecoder;
  let savedSequentialMode = sequentialMode;
  let value = callback();
  srcEnd = savedSrcEnd;
  position = savedPosition;
  stringPosition = savedStringPosition;
  srcStringStart = savedSrcStringStart;
  srcStringEnd = savedSrcStringEnd;
  srcString = savedSrcString;
  strings = savedStrings;
  referenceMap = savedReferenceMap;
  bundledStrings = savedBundledStrings;
  src = savedSrc;
  sequentialMode = savedSequentialMode;
  currentStructures = savedStructures;
  currentDecoder = savedDecoder;
  dataView = new DataView(src.buffer, src.byteOffset, src.byteLength);
  return value;
}
function clearSource() {
  src = null;
  referenceMap = null;
  currentStructures = null;
}
function addExtension(extension) {
  currentExtensions[extension.tag] = extension.decode;
}
function setSizeLimits(limits) {
  if (limits.maxMapSize) maxMapSize = limits.maxMapSize;
  if (limits.maxArraySize) maxArraySize = limits.maxArraySize;
  if (limits.maxObjectSize) maxObjectSize = limits.maxObjectSize;
}
function roundFloat32(float32Number) {
  f32Array[0] = float32Number;
  let multiplier = mult10[(u8Array[3] & 127) << 1 | u8Array[2] >> 7];
  return (multiplier * float32Number + (float32Number > 0 ? 0.5 : -0.5) >> 0) / multiplier;
}
var decoder, src, srcEnd, position, EMPTY_ARRAY, LEGACY_RECORD_INLINE_ID, RECORD_DEFINITIONS_ID, RECORD_INLINE_ID, BUNDLED_STRINGS_ID, PACKED_REFERENCE_TAG_ID, STOP_CODE, maxArraySize, maxMapSize, maxObjectSize, strings, stringPosition, currentDecoder, currentStructures, srcString, srcStringStart, srcStringEnd, bundledStrings, referenceMap, currentExtensions, currentExtensionRanges, packedValues, dataView, restoreMapsAsObject, defaultOptions, sequentialMode, inlineObjectReadThreshold, Decoder, validName, readFixedString, readString8, readString16, readString32, isNativeAccelerationEnabled, fromCharCode, f32Array, u8Array, keyCache, Tag, recordDefinition, glbl, packedTable, SHARED_DATA_TAG_ID, isLittleEndianMachine, typedArrays, typedArrayTags, mult10, defaultDecoder, decode, decodeMultiple, FLOAT32_OPTIONS;
var init_decode = __esm({
  "node_modules/cbor-x/decode.js"() {
    try {
      decoder = new TextDecoder();
    } catch (error) {
    }
    position = 0;
    EMPTY_ARRAY = [];
    LEGACY_RECORD_INLINE_ID = 105;
    RECORD_DEFINITIONS_ID = 57342;
    RECORD_INLINE_ID = 57343;
    BUNDLED_STRINGS_ID = 57337;
    PACKED_REFERENCE_TAG_ID = 6;
    STOP_CODE = {};
    maxArraySize = 11281e4;
    maxMapSize = 1681e4;
    maxObjectSize = 1671e4;
    strings = EMPTY_ARRAY;
    stringPosition = 0;
    currentDecoder = {};
    srcStringStart = 0;
    srcStringEnd = 0;
    currentExtensions = [];
    currentExtensionRanges = [];
    defaultOptions = {
      useRecords: false,
      mapsAsObjects: true
    };
    sequentialMode = false;
    inlineObjectReadThreshold = 2;
    try {
      new Function("");
    } catch (error) {
      inlineObjectReadThreshold = Infinity;
    }
    Decoder = class _Decoder {
      constructor(options) {
        if (options) {
          if ((options.keyMap || options._keyMap) && !options.useRecords) {
            options.useRecords = false;
            options.mapsAsObjects = true;
          }
          if (options.useRecords === false && options.mapsAsObjects === void 0)
            options.mapsAsObjects = true;
          if (options.getStructures)
            options.getShared = options.getStructures;
          if (options.getShared && !options.structures)
            (options.structures = []).uninitialized = true;
          if (options.keyMap) {
            this.mapKey = /* @__PURE__ */ new Map();
            for (let [k, v] of Object.entries(options.keyMap)) this.mapKey.set(v, k);
          }
        }
        Object.assign(this, options);
      }
      /*
      decodeKey(key) {
      	return this.keyMap
      		? Object.keys(this.keyMap)[Object.values(this.keyMap).indexOf(key)] || key
      		: key
      }
      */
      decodeKey(key) {
        return this.keyMap ? this.mapKey.get(key) || key : key;
      }
      encodeKey(key) {
        return this.keyMap && this.keyMap.hasOwnProperty(key) ? this.keyMap[key] : key;
      }
      encodeKeys(rec) {
        if (!this._keyMap) return rec;
        let map = /* @__PURE__ */ new Map();
        for (let [k, v] of Object.entries(rec)) map.set(this._keyMap.hasOwnProperty(k) ? this._keyMap[k] : k, v);
        return map;
      }
      decodeKeys(map) {
        if (!this._keyMap || map.constructor.name != "Map") return map;
        if (!this._mapKey) {
          this._mapKey = /* @__PURE__ */ new Map();
          for (let [k, v] of Object.entries(this._keyMap)) this._mapKey.set(v, k);
        }
        let res = {};
        map.forEach((v, k) => res[safeKey(this._mapKey.has(k) ? this._mapKey.get(k) : k)] = v);
        return res;
      }
      mapDecode(source, end) {
        let res = this.decode(source);
        if (this._keyMap) {
          switch (res.constructor.name) {
            case "Array":
              return res.map((r) => this.decodeKeys(r));
          }
        }
        return res;
      }
      decode(source, end) {
        if (src) {
          return saveState(() => {
            clearSource();
            return this ? this.decode(source, end) : _Decoder.prototype.decode.call(defaultOptions, source, end);
          });
        }
        srcEnd = end > -1 ? end : source.length;
        position = 0;
        stringPosition = 0;
        srcStringEnd = 0;
        srcString = null;
        strings = EMPTY_ARRAY;
        bundledStrings = null;
        src = source;
        try {
          dataView = source.dataView || (source.dataView = new DataView(source.buffer, source.byteOffset, source.byteLength));
        } catch (error) {
          src = null;
          if (source instanceof Uint8Array)
            throw error;
          throw new Error("Source must be a Uint8Array or Buffer but was a " + (source && typeof source == "object" ? source.constructor.name : typeof source));
        }
        if (this instanceof _Decoder) {
          currentDecoder = this;
          packedValues = this.sharedValues && (this.pack ? new Array(this.maxPrivatePackedValues || 16).concat(this.sharedValues) : this.sharedValues);
          if (this.structures) {
            currentStructures = this.structures;
            return checkedRead();
          } else if (!currentStructures || currentStructures.length > 0) {
            currentStructures = [];
          }
        } else {
          currentDecoder = defaultOptions;
          if (!currentStructures || currentStructures.length > 0)
            currentStructures = [];
          packedValues = null;
        }
        return checkedRead();
      }
      decodeMultiple(source, forEach) {
        let values, lastPosition = 0;
        try {
          let size = source.length;
          sequentialMode = true;
          let value = this ? this.decode(source, size) : defaultDecoder.decode(source, size);
          if (forEach) {
            if (forEach(value) === false) {
              return;
            }
            while (position < size) {
              lastPosition = position;
              if (forEach(checkedRead()) === false) {
                return;
              }
            }
          } else {
            values = [value];
            while (position < size) {
              lastPosition = position;
              values.push(checkedRead());
            }
            return values;
          }
        } catch (error) {
          error.lastPosition = lastPosition;
          error.values = values;
          throw error;
        } finally {
          sequentialMode = false;
          clearSource();
        }
      }
    };
    validName = /^[a-zA-Z_$][a-zA-Z\d_$]*$/;
    readFixedString = readStringJS;
    readString8 = readStringJS;
    readString16 = readStringJS;
    readString32 = readStringJS;
    isNativeAccelerationEnabled = false;
    fromCharCode = String.fromCharCode;
    f32Array = new Float32Array(1);
    u8Array = new Uint8Array(f32Array.buffer, 0, 4);
    keyCache = new Array(4096);
    Tag = class {
      constructor(value, tag) {
        this.value = value;
        this.tag = tag;
      }
    };
    currentExtensions[0] = (dateString) => {
      return new Date(dateString);
    };
    currentExtensions[1] = (epochSec) => {
      return new Date(Math.round(epochSec * 1e3));
    };
    currentExtensions[2] = (buffer) => {
      let value = BigInt(0);
      for (let i = 0, l = buffer.byteLength; i < l; i++) {
        value = BigInt(buffer[i]) + (value << BigInt(8));
      }
      return value;
    };
    currentExtensions[3] = (buffer) => {
      return BigInt(-1) - currentExtensions[2](buffer);
    };
    currentExtensions[4] = (fraction) => {
      return +(fraction[1] + "e" + fraction[0]);
    };
    currentExtensions[5] = (fraction) => {
      return fraction[1] * Math.exp(fraction[0] * Math.log(2));
    };
    recordDefinition = (id, structure) => {
      id = id - 57344;
      let existingStructure = currentStructures[id];
      if (existingStructure && existingStructure.isShared) {
        (currentStructures.restoreStructures || (currentStructures.restoreStructures = []))[id] = existingStructure;
      }
      currentStructures[id] = structure;
      structure.read = createStructureReader(structure);
    };
    currentExtensions[LEGACY_RECORD_INLINE_ID] = (data) => {
      let length = data.length;
      let structure = data[1];
      recordDefinition(data[0], structure);
      let object = {};
      for (let i = 2; i < length; i++) {
        let key = structure[i - 2];
        object[safeKey(key)] = data[i];
      }
      return object;
    };
    currentExtensions[14] = (value) => {
      if (bundledStrings)
        return bundledStrings[0].slice(bundledStrings.position0, bundledStrings.position0 += value);
      return new Tag(value, 14);
    };
    currentExtensions[15] = (value) => {
      if (bundledStrings)
        return bundledStrings[1].slice(bundledStrings.position1, bundledStrings.position1 += value);
      return new Tag(value, 15);
    };
    glbl = { Error, RegExp };
    currentExtensions[27] = (data) => {
      return (glbl[data[0]] || Error)(data[1], data[2]);
    };
    packedTable = (read2) => {
      if (src[position++] != 132) {
        let error = new Error("Packed values structure must be followed by a 4 element array");
        if (src.length < position)
          error.incomplete = true;
        throw error;
      }
      let newPackedValues = read2();
      if (!newPackedValues || !newPackedValues.length) {
        let error = new Error("Packed values structure must be followed by a 4 element array");
        error.incomplete = true;
        throw error;
      }
      packedValues = packedValues ? newPackedValues.concat(packedValues.slice(newPackedValues.length)) : newPackedValues;
      packedValues.prefixes = read2();
      packedValues.suffixes = read2();
      return read2();
    };
    packedTable.handlesRead = true;
    currentExtensions[51] = packedTable;
    currentExtensions[PACKED_REFERENCE_TAG_ID] = (data) => {
      if (!packedValues) {
        if (currentDecoder.getShared)
          loadShared();
        else
          return new Tag(data, PACKED_REFERENCE_TAG_ID);
      }
      if (typeof data == "number")
        return packedValues[16 + (data >= 0 ? 2 * data : -2 * data - 1)];
      let error = new Error("No support for non-integer packed references yet");
      if (data === void 0)
        error.incomplete = true;
      throw error;
    };
    currentExtensions[28] = (read2) => {
      if (!referenceMap) {
        referenceMap = /* @__PURE__ */ new Map();
        referenceMap.id = 0;
      }
      let id = referenceMap.id++;
      let startingPosition = position;
      let token = src[position];
      let target2;
      if (token >> 5 == 4)
        target2 = [];
      else
        target2 = {};
      let refEntry = { target: target2 };
      referenceMap.set(id, refEntry);
      let targetProperties = read2();
      if (refEntry.used) {
        if (Object.getPrototypeOf(target2) !== Object.getPrototypeOf(targetProperties)) {
          position = startingPosition;
          target2 = targetProperties;
          referenceMap.set(id, { target: target2 });
          targetProperties = read2();
        }
        return Object.assign(target2, targetProperties);
      }
      refEntry.target = targetProperties;
      return targetProperties;
    };
    currentExtensions[28].handlesRead = true;
    currentExtensions[29] = (id) => {
      let refEntry = referenceMap.get(id);
      refEntry.used = true;
      return refEntry.target;
    };
    currentExtensions[258] = (array) => new Set(array);
    (currentExtensions[259] = (read2) => {
      if (currentDecoder.mapsAsObjects) {
        currentDecoder.mapsAsObjects = false;
        restoreMapsAsObject = true;
      }
      return read2();
    }).handlesRead = true;
    SHARED_DATA_TAG_ID = 1399353956;
    currentExtensionRanges.push((tag, input) => {
      if (tag >= 225 && tag <= 255)
        return combine(getPackedValues().prefixes[tag - 224], input);
      if (tag >= 28704 && tag <= 32767)
        return combine(getPackedValues().prefixes[tag - 28672], input);
      if (tag >= 1879052288 && tag <= 2147483647)
        return combine(getPackedValues().prefixes[tag - 1879048192], input);
      if (tag >= 216 && tag <= 223)
        return combine(input, getPackedValues().suffixes[tag - 216]);
      if (tag >= 27647 && tag <= 28671)
        return combine(input, getPackedValues().suffixes[tag - 27639]);
      if (tag >= 1811940352 && tag <= 1879048191)
        return combine(input, getPackedValues().suffixes[tag - 1811939328]);
      if (tag == SHARED_DATA_TAG_ID) {
        return {
          packedValues,
          structures: currentStructures.slice(0),
          version: input
        };
      }
      if (tag == 55799)
        return input;
    });
    isLittleEndianMachine = new Uint8Array(new Uint16Array([1]).buffer)[0] == 1;
    typedArrays = [
      Uint8Array,
      Uint8ClampedArray,
      Uint16Array,
      Uint32Array,
      typeof BigUint64Array == "undefined" ? { name: "BigUint64Array" } : BigUint64Array,
      Int8Array,
      Int16Array,
      Int32Array,
      typeof BigInt64Array == "undefined" ? { name: "BigInt64Array" } : BigInt64Array,
      Float32Array,
      Float64Array
    ];
    typedArrayTags = [64, 68, 69, 70, 71, 72, 77, 78, 79, 85, 86];
    for (let i = 0; i < typedArrays.length; i++) {
      registerTypedArray(typedArrays[i], typedArrayTags[i]);
    }
    mult10 = new Array(147);
    for (let i = 0; i < 256; i++) {
      mult10[i] = +("1e" + Math.floor(45.15 - i * 0.30103));
    }
    defaultDecoder = new Decoder({ useRecords: false });
    decode = defaultDecoder.decode;
    decodeMultiple = defaultDecoder.decodeMultiple;
    FLOAT32_OPTIONS = {
      NEVER: 0,
      ALWAYS: 1,
      DECIMAL_ROUND: 3,
      DECIMAL_FIT: 4
    };
  }
});

// node_modules/cbor-x/encode.js
function writeEntityLength(length, majorValue) {
  if (length < 24)
    target[position2++] = majorValue | length;
  else if (length < 256) {
    target[position2++] = majorValue | 24;
    target[position2++] = length;
  } else if (length < 65536) {
    target[position2++] = majorValue | 25;
    target[position2++] = length >> 8;
    target[position2++] = length & 255;
  } else {
    target[position2++] = majorValue | 26;
    targetView.setUint32(position2, length);
    position2 += 4;
  }
}
function writeArrayHeader(length) {
  if (length < 24)
    target[position2++] = 128 | length;
  else if (length < 256) {
    target[position2++] = 152;
    target[position2++] = length;
  } else if (length < 65536) {
    target[position2++] = 153;
    target[position2++] = length >> 8;
    target[position2++] = length & 255;
  } else {
    target[position2++] = 154;
    targetView.setUint32(position2, length);
    position2 += 4;
  }
}
function isBlob(object) {
  if (object instanceof BlobConstructor)
    return true;
  let tag = object[Symbol.toStringTag];
  return tag === "Blob" || tag === "File";
}
function findRepetitiveStrings(value, packedValues2) {
  switch (typeof value) {
    case "string":
      if (value.length > 3) {
        if (packedValues2.objectMap[value] > -1 || packedValues2.values.length >= packedValues2.maxValues)
          return;
        let packedStatus = packedValues2.get(value);
        if (packedStatus) {
          if (++packedStatus.count == 2) {
            packedValues2.values.push(value);
          }
        } else {
          packedValues2.set(value, {
            count: 1
          });
          if (packedValues2.samplingPackedValues) {
            let status = packedValues2.samplingPackedValues.get(value);
            if (status)
              status.count++;
            else
              packedValues2.samplingPackedValues.set(value, {
                count: 1
              });
          }
        }
      }
      break;
    case "object":
      if (value) {
        if (value instanceof Array) {
          for (let i = 0, l = value.length; i < l; i++) {
            findRepetitiveStrings(value[i], packedValues2);
          }
        } else {
          let includeKeys = !packedValues2.encoder.useRecords;
          for (var key in value) {
            if (value.hasOwnProperty(key)) {
              if (includeKeys)
                findRepetitiveStrings(key, packedValues2);
              findRepetitiveStrings(value[key], packedValues2);
            }
          }
        }
      }
      break;
    case "function":
      console.log(value);
  }
}
function typedArrayEncoder(tag, size) {
  if (!isLittleEndianMachine2 && size > 1)
    tag -= 4;
  return {
    tag,
    encode: function writeExtBuffer(typedArray, encode2) {
      let length = typedArray.byteLength;
      let offset = typedArray.byteOffset || 0;
      let buffer = typedArray.buffer || typedArray;
      encode2(hasNodeBuffer ? Buffer2.from(buffer, offset, length) : new Uint8Array(buffer, offset, length));
    }
  };
}
function writeBuffer(buffer, makeRoom) {
  let length = buffer.byteLength;
  if (length < 24) {
    target[position2++] = 64 + length;
  } else if (length < 256) {
    target[position2++] = 88;
    target[position2++] = length;
  } else if (length < 65536) {
    target[position2++] = 89;
    target[position2++] = length >> 8;
    target[position2++] = length & 255;
  } else {
    target[position2++] = 90;
    targetView.setUint32(position2, length);
    position2 += 4;
  }
  if (position2 + length >= target.length) {
    makeRoom(position2 + length);
  }
  target.set(buffer.buffer ? buffer : new Uint8Array(buffer), position2);
  position2 += length;
}
function insertIds(serialized, idsToInsert) {
  let nextId;
  let distanceToMove = idsToInsert.length * 2;
  let lastEnd = serialized.length - distanceToMove;
  idsToInsert.sort((a, b) => a.offset > b.offset ? 1 : -1);
  for (let id = 0; id < idsToInsert.length; id++) {
    let referee = idsToInsert[id];
    referee.id = id;
    for (let position3 of referee.references) {
      serialized[position3++] = id >> 8;
      serialized[position3] = id & 255;
    }
  }
  while (nextId = idsToInsert.pop()) {
    let offset = nextId.offset;
    serialized.copyWithin(offset + distanceToMove, offset, lastEnd);
    distanceToMove -= 2;
    let position3 = offset + distanceToMove;
    serialized[position3++] = 216;
    serialized[position3++] = 28;
    lastEnd = offset;
  }
  return serialized;
}
function writeBundles(start, encode2) {
  targetView.setUint32(bundledStrings2.position + start, position2 - bundledStrings2.position - start + 1);
  let writeStrings = bundledStrings2;
  bundledStrings2 = null;
  encode2(writeStrings[0]);
  encode2(writeStrings[1]);
}
function addExtension2(extension) {
  if (extension.Class) {
    if (!extension.encode)
      throw new Error("Extension has no encode function");
    extensionClasses.unshift(extension.Class);
    extensions.unshift(extension);
  }
  addExtension(extension);
}
var textEncoder, extensions, extensionClasses, Buffer2, hasNodeBuffer, ByteArrayAllocate, ByteArray, MAX_STRUCTURES, MAX_BUFFER_SIZE, throwOnIterable, target, targetView, position2, safeEnd, bundledStrings2, MAX_BUNDLE_SIZE, hasNonLatin, RECORD_SYMBOL, Encoder, SharedData, BlobConstructor, isLittleEndianMachine2, defaultEncoder, encode, encodeAsIterable, encodeAsAsyncIterable, NEVER, ALWAYS, DECIMAL_ROUND, DECIMAL_FIT, REUSE_BUFFER_MODE, RESET_BUFFER_MODE, THROW_ON_ITERABLE;
var init_encode = __esm({
  "node_modules/cbor-x/encode.js"() {
    init_decode();
    init_decode();
    init_decode();
    try {
      textEncoder = new TextEncoder();
    } catch (error) {
    }
    Buffer2 = typeof globalThis === "object" && globalThis.Buffer;
    hasNodeBuffer = typeof Buffer2 !== "undefined";
    ByteArrayAllocate = hasNodeBuffer ? Buffer2.allocUnsafeSlow : Uint8Array;
    ByteArray = hasNodeBuffer ? Buffer2 : Uint8Array;
    MAX_STRUCTURES = 256;
    MAX_BUFFER_SIZE = hasNodeBuffer ? 4294967296 : 2144337920;
    position2 = 0;
    bundledStrings2 = null;
    MAX_BUNDLE_SIZE = 61440;
    hasNonLatin = /[\u0080-\uFFFF]/;
    RECORD_SYMBOL = /* @__PURE__ */ Symbol("record-id");
    Encoder = class extends Decoder {
      constructor(options) {
        super(options);
        this.offset = 0;
        let typeBuffer;
        let start;
        let sharedStructures;
        let hasSharedUpdate;
        let structures;
        let referenceMap2;
        options = options || {};
        let encodeUtf8 = ByteArray.prototype.utf8Write ? function(string, position3) {
          return target.utf8Write(string, position3, target.byteLength - position3);
        } : textEncoder && textEncoder.encodeInto ? function(string, position3) {
          return textEncoder.encodeInto(string, target.subarray(position3)).written;
        } : false;
        let encoder = this;
        let hasSharedStructures = options.structures || options.saveStructures;
        let maxSharedStructures = options.maxSharedStructures;
        if (maxSharedStructures == null)
          maxSharedStructures = hasSharedStructures ? 128 : 0;
        if (maxSharedStructures > 8190)
          throw new Error("Maximum maxSharedStructure is 8190");
        let isSequential = options.sequential;
        if (isSequential) {
          maxSharedStructures = 0;
        }
        if (!this.structures)
          this.structures = [];
        if (this.saveStructures)
          this.saveShared = this.saveStructures;
        let samplingPackedValues, packedObjectMap2, sharedValues = options.sharedValues;
        let sharedPackedObjectMap2;
        if (sharedValues) {
          sharedPackedObjectMap2 = /* @__PURE__ */ Object.create(null);
          for (let i = 0, l = sharedValues.length; i < l; i++) {
            sharedPackedObjectMap2[sharedValues[i]] = i;
          }
        }
        let recordIdsToRemove = [];
        let transitionsCount = 0;
        let serializationsSinceTransitionRebuild = 0;
        this.mapEncode = function(value, encodeOptions) {
          if (this._keyMap && !this._mapped) {
            switch (value.constructor.name) {
              case "Array":
                value = value.map((r) => this.encodeKeys(r));
                break;
            }
          }
          return this.encode(value, encodeOptions);
        };
        this.encode = function(value, encodeOptions) {
          if (!target) {
            target = new ByteArrayAllocate(8192);
            targetView = new DataView(target.buffer, 0, 8192);
            position2 = 0;
          }
          safeEnd = target.length - 10;
          if (safeEnd - position2 < 2048) {
            target = new ByteArrayAllocate(target.length);
            targetView = new DataView(target.buffer, 0, target.length);
            safeEnd = target.length - 10;
            position2 = 0;
          } else if (encodeOptions === REUSE_BUFFER_MODE)
            position2 = position2 + 7 & 2147483640;
          start = position2;
          if (encoder.useSelfDescribedHeader) {
            targetView.setUint32(position2, 3654940416);
            position2 += 3;
          }
          referenceMap2 = encoder.structuredClone ? /* @__PURE__ */ new Map() : null;
          if (encoder.bundleStrings && typeof value !== "string") {
            bundledStrings2 = [];
            bundledStrings2.size = Infinity;
          } else
            bundledStrings2 = null;
          sharedStructures = encoder.structures;
          if (sharedStructures) {
            if (sharedStructures.uninitialized) {
              let sharedData = encoder.getShared() || {};
              encoder.structures = sharedStructures = sharedData.structures || [];
              encoder.sharedVersion = sharedData.version;
              let sharedValues2 = encoder.sharedValues = sharedData.packedValues;
              if (sharedValues2) {
                sharedPackedObjectMap2 = {};
                for (let i = 0, l = sharedValues2.length; i < l; i++)
                  sharedPackedObjectMap2[sharedValues2[i]] = i;
              }
            }
            let sharedStructuresLength = sharedStructures.length;
            if (sharedStructuresLength > maxSharedStructures && !isSequential)
              sharedStructuresLength = maxSharedStructures;
            if (!sharedStructures.transitions) {
              sharedStructures.transitions = /* @__PURE__ */ Object.create(null);
              for (let i = 0; i < sharedStructuresLength; i++) {
                let keys = sharedStructures[i];
                if (!keys)
                  continue;
                let nextTransition, transition = sharedStructures.transitions;
                for (let j = 0, l = keys.length; j < l; j++) {
                  if (transition[RECORD_SYMBOL] === void 0)
                    transition[RECORD_SYMBOL] = i;
                  let key = keys[j];
                  nextTransition = transition[key];
                  if (!nextTransition) {
                    nextTransition = transition[key] = /* @__PURE__ */ Object.create(null);
                  }
                  transition = nextTransition;
                }
                transition[RECORD_SYMBOL] = i | 1048576;
              }
            }
            if (!isSequential)
              sharedStructures.nextId = sharedStructuresLength;
          }
          if (hasSharedUpdate)
            hasSharedUpdate = false;
          structures = sharedStructures || [];
          packedObjectMap2 = sharedPackedObjectMap2;
          if (options.pack) {
            let packedValues2 = /* @__PURE__ */ new Map();
            packedValues2.values = [];
            packedValues2.encoder = encoder;
            packedValues2.maxValues = options.maxPrivatePackedValues || (sharedPackedObjectMap2 ? 16 : Infinity);
            packedValues2.objectMap = sharedPackedObjectMap2 || false;
            packedValues2.samplingPackedValues = samplingPackedValues;
            findRepetitiveStrings(value, packedValues2);
            if (packedValues2.values.length > 0) {
              target[position2++] = 216;
              target[position2++] = 51;
              writeArrayHeader(4);
              let valuesArray = packedValues2.values;
              encode2(valuesArray);
              writeArrayHeader(0);
              writeArrayHeader(0);
              packedObjectMap2 = Object.create(sharedPackedObjectMap2 || null);
              for (let i = 0, l = valuesArray.length; i < l; i++) {
                packedObjectMap2[valuesArray[i]] = i;
              }
            }
          }
          throwOnIterable = encodeOptions & THROW_ON_ITERABLE;
          try {
            if (throwOnIterable)
              return;
            encode2(value);
            if (bundledStrings2) {
              writeBundles(start, encode2);
            }
            encoder.offset = position2;
            if (referenceMap2 && referenceMap2.idsToInsert) {
              position2 += referenceMap2.idsToInsert.length * 2;
              if (position2 > safeEnd)
                makeRoom(position2);
              encoder.offset = position2;
              let serialized = insertIds(target.subarray(start, position2), referenceMap2.idsToInsert);
              referenceMap2 = null;
              return serialized;
            }
            if (encodeOptions & REUSE_BUFFER_MODE) {
              target.start = start;
              target.end = position2;
              return target;
            }
            return target.subarray(start, position2);
          } finally {
            if (sharedStructures) {
              if (serializationsSinceTransitionRebuild < 10)
                serializationsSinceTransitionRebuild++;
              if (sharedStructures.length > maxSharedStructures)
                sharedStructures.length = maxSharedStructures;
              if (transitionsCount > 1e4) {
                sharedStructures.transitions = null;
                serializationsSinceTransitionRebuild = 0;
                transitionsCount = 0;
                if (recordIdsToRemove.length > 0)
                  recordIdsToRemove = [];
              } else if (recordIdsToRemove.length > 0 && !isSequential) {
                for (let i = 0, l = recordIdsToRemove.length; i < l; i++) {
                  recordIdsToRemove[i][RECORD_SYMBOL] = void 0;
                }
                recordIdsToRemove = [];
              }
            }
            if (hasSharedUpdate && encoder.saveShared) {
              if (encoder.structures.length > maxSharedStructures) {
                encoder.structures = encoder.structures.slice(0, maxSharedStructures);
              }
              let returnBuffer = target.subarray(start, position2);
              if (encoder.updateSharedData() === false)
                return encoder.encode(value);
              return returnBuffer;
            }
            if (encodeOptions & RESET_BUFFER_MODE)
              position2 = start;
          }
        };
        this.findCommonStringsToPack = () => {
          samplingPackedValues = /* @__PURE__ */ new Map();
          if (!sharedPackedObjectMap2)
            sharedPackedObjectMap2 = /* @__PURE__ */ Object.create(null);
          return (options2) => {
            let threshold = options2 && options2.threshold || 4;
            let position3 = this.pack ? options2.maxPrivatePackedValues || 16 : 0;
            if (!sharedValues)
              sharedValues = this.sharedValues = [];
            for (let [key, status] of samplingPackedValues) {
              if (status.count > threshold) {
                sharedPackedObjectMap2[key] = position3++;
                sharedValues.push(key);
                hasSharedUpdate = true;
              }
            }
            while (this.saveShared && this.updateSharedData() === false) {
            }
            samplingPackedValues = null;
          };
        };
        const encode2 = (value) => {
          if (position2 > safeEnd)
            target = makeRoom(position2);
          var type = typeof value;
          var length;
          if (type === "string") {
            if (packedObjectMap2) {
              let packedPosition = packedObjectMap2[value];
              if (packedPosition >= 0) {
                if (packedPosition < 16)
                  target[position2++] = packedPosition + 224;
                else {
                  target[position2++] = 198;
                  if (packedPosition & 1)
                    encode2(15 - packedPosition >> 1);
                  else
                    encode2(packedPosition - 16 >> 1);
                }
                return;
              } else if (samplingPackedValues && !options.pack) {
                let status = samplingPackedValues.get(value);
                if (status)
                  status.count++;
                else
                  samplingPackedValues.set(value, {
                    count: 1
                  });
              }
            }
            let strLength = value.length;
            if (bundledStrings2 && strLength >= 4 && strLength < 1024) {
              if ((bundledStrings2.size += strLength) > MAX_BUNDLE_SIZE) {
                let extStart;
                let maxBytes2 = (bundledStrings2[0] ? bundledStrings2[0].length * 3 + bundledStrings2[1].length : 0) + 10;
                if (position2 + maxBytes2 > safeEnd)
                  target = makeRoom(position2 + maxBytes2);
                target[position2++] = 217;
                target[position2++] = 223;
                target[position2++] = 249;
                target[position2++] = bundledStrings2.position ? 132 : 130;
                target[position2++] = 26;
                extStart = position2 - start;
                position2 += 4;
                if (bundledStrings2.position) {
                  writeBundles(start, encode2);
                }
                bundledStrings2 = ["", ""];
                bundledStrings2.size = 0;
                bundledStrings2.position = extStart;
              }
              let twoByte = hasNonLatin.test(value);
              bundledStrings2[twoByte ? 0 : 1] += value;
              target[position2++] = twoByte ? 206 : 207;
              encode2(strLength);
              return;
            }
            let headerSize;
            if (strLength < 32) {
              headerSize = 1;
            } else if (strLength < 256) {
              headerSize = 2;
            } else if (strLength < 65536) {
              headerSize = 3;
            } else {
              headerSize = 5;
            }
            let maxBytes = strLength * 3;
            if (position2 + maxBytes > safeEnd)
              target = makeRoom(position2 + maxBytes);
            if (strLength < 64 || !encodeUtf8) {
              let i, c1, c2, strPosition = position2 + headerSize;
              for (i = 0; i < strLength; i++) {
                c1 = value.charCodeAt(i);
                if (c1 < 128) {
                  target[strPosition++] = c1;
                } else if (c1 < 2048) {
                  target[strPosition++] = c1 >> 6 | 192;
                  target[strPosition++] = c1 & 63 | 128;
                } else if ((c1 & 64512) === 55296 && ((c2 = value.charCodeAt(i + 1)) & 64512) === 56320) {
                  c1 = 65536 + ((c1 & 1023) << 10) + (c2 & 1023);
                  i++;
                  target[strPosition++] = c1 >> 18 | 240;
                  target[strPosition++] = c1 >> 12 & 63 | 128;
                  target[strPosition++] = c1 >> 6 & 63 | 128;
                  target[strPosition++] = c1 & 63 | 128;
                } else {
                  target[strPosition++] = c1 >> 12 | 224;
                  target[strPosition++] = c1 >> 6 & 63 | 128;
                  target[strPosition++] = c1 & 63 | 128;
                }
              }
              length = strPosition - position2 - headerSize;
            } else {
              length = encodeUtf8(value, position2 + headerSize, maxBytes);
            }
            if (length < 24) {
              target[position2++] = 96 | length;
            } else if (length < 256) {
              if (headerSize < 2) {
                target.copyWithin(position2 + 2, position2 + 1, position2 + 1 + length);
              }
              target[position2++] = 120;
              target[position2++] = length;
            } else if (length < 65536) {
              if (headerSize < 3) {
                target.copyWithin(position2 + 3, position2 + 2, position2 + 2 + length);
              }
              target[position2++] = 121;
              target[position2++] = length >> 8;
              target[position2++] = length & 255;
            } else {
              if (headerSize < 5) {
                target.copyWithin(position2 + 5, position2 + 3, position2 + 3 + length);
              }
              target[position2++] = 122;
              targetView.setUint32(position2, length);
              position2 += 4;
            }
            position2 += length;
          } else if (type === "number") {
            if (!this.alwaysUseFloat && value >>> 0 === value) {
              if (value < 24) {
                target[position2++] = value;
              } else if (value < 256) {
                target[position2++] = 24;
                target[position2++] = value;
              } else if (value < 65536) {
                target[position2++] = 25;
                target[position2++] = value >> 8;
                target[position2++] = value & 255;
              } else {
                target[position2++] = 26;
                targetView.setUint32(position2, value);
                position2 += 4;
              }
            } else if (!this.alwaysUseFloat && value >> 0 === value) {
              if (value >= -24) {
                target[position2++] = 31 - value;
              } else if (value >= -256) {
                target[position2++] = 56;
                target[position2++] = ~value;
              } else if (value >= -65536) {
                target[position2++] = 57;
                targetView.setUint16(position2, ~value);
                position2 += 2;
              } else {
                target[position2++] = 58;
                targetView.setUint32(position2, ~value);
                position2 += 4;
              }
            } else if (!this.alwaysUseFloat && value < 0 && value >= -4294967296 && Math.floor(value) === value) {
              target[position2++] = 58;
              targetView.setUint32(position2, -1 - value);
              position2 += 4;
            } else {
              let useFloat32;
              if ((useFloat32 = this.useFloat32) > 0 && value < 4294967296 && value >= -2147483648) {
                target[position2++] = 250;
                targetView.setFloat32(position2, value);
                let xShifted;
                if (useFloat32 < 4 || // this checks for rounding of numbers that were encoded in 32-bit float to nearest significant decimal digit that could be preserved
                (xShifted = value * mult10[(target[position2] & 127) << 1 | target[position2 + 1] >> 7]) >> 0 === xShifted) {
                  position2 += 4;
                  return;
                } else
                  position2--;
              }
              target[position2++] = 251;
              targetView.setFloat64(position2, value);
              position2 += 8;
            }
          } else if (type === "object") {
            if (!value)
              target[position2++] = 246;
            else {
              if (referenceMap2) {
                let referee = referenceMap2.get(value);
                if (referee) {
                  target[position2++] = 216;
                  target[position2++] = 29;
                  target[position2++] = 25;
                  if (!referee.references) {
                    let idsToInsert = referenceMap2.idsToInsert || (referenceMap2.idsToInsert = []);
                    referee.references = [];
                    idsToInsert.push(referee);
                  }
                  referee.references.push(position2 - start);
                  position2 += 2;
                  return;
                } else
                  referenceMap2.set(value, { offset: position2 - start });
              }
              let constructor = value.constructor;
              if (constructor === Object) {
                if (this.skipFunction === true) {
                  value = Object.fromEntries([...Object.keys(value).filter((x) => typeof value[x] !== "function").map((x) => [x, value[x]])]);
                }
                writeObject(value);
              } else if (constructor === Array) {
                length = value.length;
                if (length < 24) {
                  target[position2++] = 128 | length;
                } else {
                  writeArrayHeader(length);
                }
                for (let i = 0; i < length; i++) {
                  encode2(value[i]);
                }
              } else if (constructor === Map) {
                if (this.mapsAsObjects ? this.useTag259ForMaps !== false : this.useTag259ForMaps) {
                  target[position2++] = 217;
                  target[position2++] = 1;
                  target[position2++] = 3;
                }
                length = value.size;
                if (length < 24) {
                  target[position2++] = 160 | length;
                } else if (length < 256) {
                  target[position2++] = 184;
                  target[position2++] = length;
                } else if (length < 65536) {
                  target[position2++] = 185;
                  target[position2++] = length >> 8;
                  target[position2++] = length & 255;
                } else {
                  target[position2++] = 186;
                  targetView.setUint32(position2, length);
                  position2 += 4;
                }
                if (encoder.keyMap) {
                  for (let [key, entryValue] of value) {
                    encode2(encoder.encodeKey(key));
                    encode2(entryValue);
                  }
                } else {
                  for (let [key, entryValue] of value) {
                    encode2(key);
                    encode2(entryValue);
                  }
                }
              } else {
                for (let i = 0, l = extensions.length; i < l; i++) {
                  let extensionClass = extensionClasses[i];
                  if (value instanceof extensionClass) {
                    let extension = extensions[i];
                    let tag = extension.tag;
                    if (tag == void 0)
                      tag = extension.getTag && extension.getTag.call(this, value);
                    if (tag < 24) {
                      target[position2++] = 192 | tag;
                    } else if (tag < 256) {
                      target[position2++] = 216;
                      target[position2++] = tag;
                    } else if (tag < 65536) {
                      target[position2++] = 217;
                      target[position2++] = tag >> 8;
                      target[position2++] = tag & 255;
                    } else if (tag > -1) {
                      target[position2++] = 218;
                      targetView.setUint32(position2, tag);
                      position2 += 4;
                    }
                    extension.encode.call(this, value, encode2, makeRoom);
                    return;
                  }
                }
                if (value[Symbol.iterator]) {
                  if (throwOnIterable) {
                    let error = new Error("Iterable should be serialized as iterator");
                    error.iteratorNotHandled = true;
                    throw error;
                  }
                  target[position2++] = 159;
                  for (let entry of value) {
                    encode2(entry);
                  }
                  target[position2++] = 255;
                  return;
                }
                if (value[Symbol.asyncIterator] || isBlob(value)) {
                  let error = new Error("Iterable/blob should be serialized as iterator");
                  error.iteratorNotHandled = true;
                  throw error;
                }
                if (this.useToJSON && value.toJSON) {
                  const json = value.toJSON();
                  if (json !== value)
                    return encode2(json);
                }
                writeObject(value);
              }
            }
          } else if (type === "boolean") {
            target[position2++] = value ? 245 : 244;
          } else if (type === "bigint") {
            if (value < BigInt(1) << BigInt(64) && value >= 0) {
              target[position2++] = 27;
              targetView.setBigUint64(position2, value);
            } else if (value > -(BigInt(1) << BigInt(64)) && value < 0) {
              target[position2++] = 59;
              targetView.setBigUint64(position2, -value - BigInt(1));
            } else {
              if (this.largeBigIntToFloat) {
                target[position2++] = 251;
                targetView.setFloat64(position2, Number(value));
              } else {
                if (value >= BigInt(0))
                  target[position2++] = 194;
                else {
                  target[position2++] = 195;
                  value = BigInt(-1) - value;
                }
                let bytes = [];
                while (value) {
                  bytes.push(Number(value & BigInt(255)));
                  value >>= BigInt(8);
                }
                writeBuffer(new Uint8Array(bytes.reverse()), makeRoom);
                return;
              }
            }
            position2 += 8;
          } else if (type === "undefined") {
            target[position2++] = 247;
          } else {
            throw new Error("Unknown type: " + type);
          }
        };
        const writeObject = this.useRecords === false ? this.variableMapSize ? (object) => {
          let keys = Object.keys(object);
          let vals = Object.values(object);
          let length = keys.length;
          if (length < 24) {
            target[position2++] = 160 | length;
          } else if (length < 256) {
            target[position2++] = 184;
            target[position2++] = length;
          } else if (length < 65536) {
            target[position2++] = 185;
            target[position2++] = length >> 8;
            target[position2++] = length & 255;
          } else {
            target[position2++] = 186;
            targetView.setUint32(position2, length);
            position2 += 4;
          }
          let key;
          if (encoder.keyMap) {
            for (let i = 0; i < length; i++) {
              encode2(encoder.encodeKey(keys[i]));
              encode2(vals[i]);
            }
          } else {
            for (let i = 0; i < length; i++) {
              encode2(keys[i]);
              encode2(vals[i]);
            }
          }
        } : (object) => {
          target[position2++] = 185;
          let objectOffset = position2 - start;
          position2 += 2;
          let size = 0;
          if (encoder.keyMap) {
            for (let key in object) if (typeof object.hasOwnProperty !== "function" || object.hasOwnProperty(key)) {
              encode2(encoder.encodeKey(key));
              encode2(object[key]);
              size++;
            }
          } else {
            for (let key in object) if (typeof object.hasOwnProperty !== "function" || object.hasOwnProperty(key)) {
              encode2(key);
              encode2(object[key]);
              size++;
            }
          }
          target[objectOffset++ + start] = size >> 8;
          target[objectOffset + start] = size & 255;
        } : (object, skipValues) => {
          let nextTransition, transition = structures.transitions || (structures.transitions = /* @__PURE__ */ Object.create(null));
          let newTransitions = 0;
          let length = 0;
          let parentRecordId;
          let keys;
          if (this.keyMap) {
            keys = Object.keys(object).map((k) => this.encodeKey(k));
            length = keys.length;
            for (let i = 0; i < length; i++) {
              let key = keys[i];
              nextTransition = transition[key];
              if (!nextTransition) {
                nextTransition = transition[key] = /* @__PURE__ */ Object.create(null);
                newTransitions++;
              }
              transition = nextTransition;
            }
          } else {
            for (let key in object) if (typeof object.hasOwnProperty !== "function" || object.hasOwnProperty(key)) {
              nextTransition = transition[key];
              if (!nextTransition) {
                if (transition[RECORD_SYMBOL] & 1048576) {
                  parentRecordId = transition[RECORD_SYMBOL] & 65535;
                }
                nextTransition = transition[key] = /* @__PURE__ */ Object.create(null);
                newTransitions++;
              }
              transition = nextTransition;
              length++;
            }
          }
          let recordId = transition[RECORD_SYMBOL];
          if (recordId !== void 0) {
            recordId &= 65535;
            target[position2++] = 217;
            target[position2++] = recordId >> 8 | 224;
            target[position2++] = recordId & 255;
          } else {
            if (!keys)
              keys = transition.__keys__ || (transition.__keys__ = Object.keys(object));
            if (parentRecordId === void 0) {
              recordId = structures.nextId++;
              if (!recordId) {
                recordId = 0;
                structures.nextId = 1;
              }
              if (recordId >= MAX_STRUCTURES) {
                structures.nextId = (recordId = maxSharedStructures) + 1;
              }
            } else {
              recordId = parentRecordId;
            }
            structures[recordId] = keys;
            if (recordId < maxSharedStructures) {
              target[position2++] = 217;
              target[position2++] = recordId >> 8 | 224;
              target[position2++] = recordId & 255;
              transition = structures.transitions;
              for (let i = 0; i < length; i++) {
                if (transition[RECORD_SYMBOL] === void 0 || transition[RECORD_SYMBOL] & 1048576)
                  transition[RECORD_SYMBOL] = recordId;
                transition = transition[keys[i]];
              }
              transition[RECORD_SYMBOL] = recordId | 1048576;
              hasSharedUpdate = true;
            } else {
              transition[RECORD_SYMBOL] = recordId;
              targetView.setUint32(position2, 3655335680);
              position2 += 3;
              if (newTransitions)
                transitionsCount += serializationsSinceTransitionRebuild * newTransitions;
              if (recordIdsToRemove.length >= MAX_STRUCTURES - maxSharedStructures)
                recordIdsToRemove.shift()[RECORD_SYMBOL] = void 0;
              recordIdsToRemove.push(transition);
              writeArrayHeader(length + 2);
              encode2(57344 + recordId);
              encode2(keys);
              if (skipValues) return;
              for (let key in object)
                if (typeof object.hasOwnProperty !== "function" || object.hasOwnProperty(key))
                  encode2(object[key]);
              return;
            }
          }
          if (length < 24) {
            target[position2++] = 128 | length;
          } else {
            writeArrayHeader(length);
          }
          if (skipValues) return;
          for (let key in object)
            if (typeof object.hasOwnProperty !== "function" || object.hasOwnProperty(key))
              encode2(object[key]);
        };
        const makeRoom = (end) => {
          let newSize;
          if (end > 16777216) {
            if (end - start > MAX_BUFFER_SIZE)
              throw new Error("Encoded buffer would be larger than maximum buffer size");
            newSize = Math.min(
              MAX_BUFFER_SIZE,
              Math.round(Math.max((end - start) * (end > 67108864 ? 1.25 : 2), 4194304) / 4096) * 4096
            );
          } else
            newSize = (Math.max(end - start << 2, target.length - 1) >> 12) + 1 << 12;
          let newBuffer = new ByteArrayAllocate(newSize);
          targetView = new DataView(newBuffer.buffer, 0, newSize);
          if (target.copy)
            target.copy(newBuffer, 0, start, end);
          else
            newBuffer.set(target.slice(start, end));
          position2 -= start;
          start = 0;
          safeEnd = newBuffer.length - 10;
          return target = newBuffer;
        };
        let chunkThreshold = 100;
        let continuedChunkThreshold = 1e3;
        this.encodeAsIterable = function(value, options2) {
          return startEncoding(value, options2, encodeObjectAsIterable);
        };
        this.encodeAsAsyncIterable = function(value, options2) {
          return startEncoding(value, options2, encodeObjectAsAsyncIterable);
        };
        function* encodeObjectAsIterable(object, iterateProperties, finalIterable) {
          let constructor = object.constructor;
          if (constructor === Object) {
            let useRecords2 = encoder.useRecords !== false;
            if (useRecords2)
              writeObject(object, true);
            else
              writeEntityLength(Object.keys(object).length, 160);
            for (let key in object) {
              let value = object[key];
              if (!useRecords2) encode2(key);
              if (value && typeof value === "object") {
                if (iterateProperties[key])
                  yield* encodeObjectAsIterable(value, iterateProperties[key]);
                else
                  yield* tryEncode(value, iterateProperties, key);
              } else encode2(value);
            }
          } else if (constructor === Array) {
            let length = object.length;
            writeArrayHeader(length);
            for (let i = 0; i < length; i++) {
              let value = object[i];
              if (value && (typeof value === "object" || position2 - start > chunkThreshold)) {
                if (iterateProperties.element)
                  yield* encodeObjectAsIterable(value, iterateProperties.element);
                else
                  yield* tryEncode(value, iterateProperties, "element");
              } else encode2(value);
            }
          } else if (object[Symbol.iterator] && !object.buffer) {
            target[position2++] = 159;
            for (let value of object) {
              if (value && (typeof value === "object" || position2 - start > chunkThreshold)) {
                if (iterateProperties.element)
                  yield* encodeObjectAsIterable(value, iterateProperties.element);
                else
                  yield* tryEncode(value, iterateProperties, "element");
              } else encode2(value);
            }
            target[position2++] = 255;
          } else if (isBlob(object)) {
            writeEntityLength(object.size, 64);
            yield target.subarray(start, position2);
            yield object;
            restartEncoding();
          } else if (object[Symbol.asyncIterator]) {
            target[position2++] = 159;
            yield target.subarray(start, position2);
            yield object;
            restartEncoding();
            target[position2++] = 255;
          } else {
            encode2(object);
          }
          if (finalIterable && position2 > start) yield target.subarray(start, position2);
          else if (position2 - start > chunkThreshold) {
            yield target.subarray(start, position2);
            restartEncoding();
          }
        }
        function* tryEncode(value, iterateProperties, key) {
          let restart = position2 - start;
          try {
            encode2(value);
            if (position2 - start > chunkThreshold) {
              yield target.subarray(start, position2);
              restartEncoding();
            }
          } catch (error) {
            if (error.iteratorNotHandled) {
              iterateProperties[key] = {};
              position2 = start + restart;
              yield* encodeObjectAsIterable.call(this, value, iterateProperties[key]);
            } else throw error;
          }
        }
        function restartEncoding() {
          chunkThreshold = continuedChunkThreshold;
          encoder.encode(null, THROW_ON_ITERABLE);
        }
        function startEncoding(value, options2, encodeIterable) {
          if (options2 && options2.chunkThreshold)
            chunkThreshold = continuedChunkThreshold = options2.chunkThreshold;
          else
            chunkThreshold = 100;
          if (value && typeof value === "object") {
            encoder.encode(null, THROW_ON_ITERABLE);
            return encodeIterable(value, encoder.iterateProperties || (encoder.iterateProperties = {}), true);
          }
          return [encoder.encode(value)];
        }
        async function* encodeObjectAsAsyncIterable(value, iterateProperties) {
          for (let encodedValue of encodeObjectAsIterable(value, iterateProperties, true)) {
            let constructor = encodedValue.constructor;
            if (constructor === ByteArray || constructor === Uint8Array)
              yield encodedValue;
            else if (isBlob(encodedValue)) {
              let reader = encodedValue.stream().getReader();
              let next;
              while (!(next = await reader.read()).done) {
                yield next.value;
              }
            } else if (encodedValue[Symbol.asyncIterator]) {
              for await (let asyncValue of encodedValue) {
                restartEncoding();
                if (asyncValue)
                  yield* encodeObjectAsAsyncIterable(asyncValue, iterateProperties.async || (iterateProperties.async = {}));
                else yield encoder.encode(asyncValue);
              }
            } else {
              yield encodedValue;
            }
          }
        }
      }
      useBuffer(buffer) {
        target = buffer;
        targetView = new DataView(target.buffer, target.byteOffset, target.byteLength);
        position2 = 0;
      }
      clearSharedData() {
        if (this.structures)
          this.structures = [];
        if (this.sharedValues)
          this.sharedValues = void 0;
      }
      updateSharedData() {
        let lastVersion = this.sharedVersion || 0;
        this.sharedVersion = lastVersion + 1;
        let structuresCopy = this.structures.slice(0);
        let sharedData = new SharedData(structuresCopy, this.sharedValues, this.sharedVersion);
        let saveResults = this.saveShared(
          sharedData,
          (existingShared) => (existingShared && existingShared.version || 0) == lastVersion
        );
        if (saveResults === false) {
          sharedData = this.getShared() || {};
          this.structures = sharedData.structures || [];
          this.sharedValues = sharedData.packedValues;
          this.sharedVersion = sharedData.version;
          this.structures.nextId = this.structures.length;
        } else {
          structuresCopy.forEach((structure, i) => this.structures[i] = structure);
        }
        return saveResults;
      }
    };
    SharedData = class {
      constructor(structures, values, version) {
        this.structures = structures;
        this.packedValues = values;
        this.version = version;
      }
    };
    BlobConstructor = typeof Blob === "undefined" ? function() {
    } : Blob;
    isLittleEndianMachine2 = new Uint8Array(new Uint16Array([1]).buffer)[0] == 1;
    extensionClasses = [
      Date,
      Set,
      Error,
      RegExp,
      Tag,
      ArrayBuffer,
      Uint8Array,
      Uint8ClampedArray,
      Uint16Array,
      Uint32Array,
      typeof BigUint64Array == "undefined" ? function() {
      } : BigUint64Array,
      Int8Array,
      Int16Array,
      Int32Array,
      typeof BigInt64Array == "undefined" ? function() {
      } : BigInt64Array,
      Float32Array,
      Float64Array,
      SharedData
    ];
    extensions = [
      {
        // Date
        tag: 1,
        encode(date, encode2) {
          let seconds = date.getTime() / 1e3;
          if ((this.useTimestamp32 || date.getMilliseconds() === 0) && seconds >= 0 && seconds < 4294967296) {
            target[position2++] = 26;
            targetView.setUint32(position2, seconds);
            position2 += 4;
          } else {
            target[position2++] = 251;
            targetView.setFloat64(position2, seconds);
            position2 += 8;
          }
        }
      },
      {
        // Set
        tag: 258,
        // https://github.com/input-output-hk/cbor-sets-spec/blob/master/CBOR_SETS.md
        encode(set, encode2) {
          let array = Array.from(set);
          encode2(array);
        }
      },
      {
        // Error
        tag: 27,
        // http://cbor.schmorp.de/generic-object
        encode(error, encode2) {
          encode2([error.name, error.message]);
        }
      },
      {
        // RegExp
        tag: 27,
        // http://cbor.schmorp.de/generic-object
        encode(regex, encode2) {
          encode2(["RegExp", regex.source, regex.flags]);
        }
      },
      {
        // Tag
        getTag(tag) {
          return tag.tag;
        },
        encode(tag, encode2) {
          encode2(tag.value);
        }
      },
      {
        // ArrayBuffer
        encode(arrayBuffer, encode2, makeRoom) {
          writeBuffer(arrayBuffer, makeRoom);
        }
      },
      {
        // Uint8Array
        getTag(typedArray) {
          if (typedArray.constructor === Uint8Array) {
            if (this.tagUint8Array || hasNodeBuffer && this.tagUint8Array !== false)
              return 64;
          }
        },
        encode(typedArray, encode2, makeRoom) {
          writeBuffer(typedArray, makeRoom);
        }
      },
      typedArrayEncoder(68, 1),
      typedArrayEncoder(69, 2),
      typedArrayEncoder(70, 4),
      typedArrayEncoder(71, 8),
      typedArrayEncoder(72, 1),
      typedArrayEncoder(77, 2),
      typedArrayEncoder(78, 4),
      typedArrayEncoder(79, 8),
      typedArrayEncoder(85, 4),
      typedArrayEncoder(86, 8),
      {
        encode(sharedData, encode2) {
          let packedValues2 = sharedData.packedValues || [];
          let sharedStructures = sharedData.structures || [];
          if (packedValues2.values.length > 0) {
            target[position2++] = 216;
            target[position2++] = 51;
            writeArrayHeader(4);
            let valuesArray = packedValues2.values;
            encode2(valuesArray);
            writeArrayHeader(0);
            writeArrayHeader(0);
            packedObjectMap = Object.create(sharedPackedObjectMap || null);
            for (let i = 0, l = valuesArray.length; i < l; i++) {
              packedObjectMap[valuesArray[i]] = i;
            }
          }
          if (sharedStructures) {
            targetView.setUint32(position2, 3655335424);
            position2 += 3;
            let definitions = sharedStructures.slice(0);
            definitions.unshift(57344);
            definitions.push(new Tag(sharedData.version, 1399353956));
            encode2(definitions);
          } else
            encode2(new Tag(sharedData.version, 1399353956));
        }
      }
    ];
    defaultEncoder = new Encoder({ useRecords: false });
    encode = defaultEncoder.encode;
    encodeAsIterable = defaultEncoder.encodeAsIterable;
    encodeAsAsyncIterable = defaultEncoder.encodeAsAsyncIterable;
    ({ NEVER, ALWAYS, DECIMAL_ROUND, DECIMAL_FIT } = FLOAT32_OPTIONS);
    REUSE_BUFFER_MODE = 512;
    RESET_BUFFER_MODE = 1024;
    THROW_ON_ITERABLE = 2048;
  }
});

// node_modules/cbor-x/stream.js
import { Transform } from "stream";
var EncoderStream, DecoderStream;
var init_stream = __esm({
  "node_modules/cbor-x/stream.js"() {
    init_encode();
    init_decode();
    EncoderStream = class extends Transform {
      constructor(options) {
        if (!options)
          options = {};
        options.writableObjectMode = true;
        super(options);
        options.sequential = true;
        this.encoder = options.encoder || new Encoder(options);
      }
      async _transform(value, encoding, callback) {
        try {
          for await (let chunk of this.encoder.encodeAsAsyncIterable(value)) {
            this.push(chunk);
          }
          callback();
        } catch (error) {
          callback(error);
        }
      }
    };
    DecoderStream = class extends Transform {
      constructor(options) {
        if (!options)
          options = {};
        options.objectMode = true;
        super(options);
        options.structures = [];
        this.decoder = options.decoder || new Decoder(options);
      }
      _transform(chunk, encoding, callback) {
        if (this.incompleteBuffer) {
          chunk = Buffer.concat([this.incompleteBuffer, chunk]);
          this.incompleteBuffer = null;
        }
        let values;
        try {
          values = this.decoder.decodeMultiple(chunk);
        } catch (error) {
          if (error.incomplete) {
            this.incompleteBuffer = chunk.slice(error.lastPosition);
            values = error.values;
          } else {
            return callback(error);
          }
        } finally {
          for (let value of values || []) {
            if (value === null)
              value = this.getNullValue();
            this.push(value);
          }
        }
        callback();
      }
      getNullValue() {
        return /* @__PURE__ */ Symbol.for(null);
      }
    };
  }
});

// node_modules/cbor-x/iterators.js
function encodeIter(objectIterator, options = {}) {
  if (!objectIterator || typeof objectIterator !== "object") {
    throw new Error("first argument must be an Iterable, Async Iterable, or a Promise for an Async Iterable");
  } else if (typeof objectIterator[Symbol.iterator] === "function") {
    return encodeIterSync(objectIterator, options);
  } else if (typeof objectIterator.then === "function" || typeof objectIterator[Symbol.asyncIterator] === "function") {
    return encodeIterAsync(objectIterator, options);
  } else {
    throw new Error("first argument must be an Iterable, Async Iterable, Iterator, Async Iterator, or a Promise");
  }
}
function* encodeIterSync(objectIterator, options) {
  const encoder = new Encoder(options);
  for (const value of objectIterator) {
    yield encoder.encode(value);
  }
}
async function* encodeIterAsync(objectIterator, options) {
  const encoder = new Encoder(options);
  for await (const value of objectIterator) {
    yield encoder.encode(value);
  }
}
function decodeIter(bufferIterator, options = {}) {
  if (!bufferIterator || typeof bufferIterator !== "object") {
    throw new Error("first argument must be an Iterable, Async Iterable, Iterator, Async Iterator, or a promise");
  }
  const decoder2 = new Decoder(options);
  let incomplete;
  const parser = (chunk) => {
    let yields;
    if (incomplete) {
      chunk = Buffer.concat([incomplete, chunk]);
      incomplete = void 0;
    }
    try {
      yields = decoder2.decodeMultiple(chunk);
    } catch (err) {
      if (err.incomplete) {
        incomplete = chunk.slice(err.lastPosition);
        yields = err.values;
      } else {
        throw err;
      }
    }
    return yields;
  };
  if (typeof bufferIterator[Symbol.iterator] === "function") {
    return (function* iter() {
      for (const value of bufferIterator) {
        yield* parser(value);
      }
    })();
  } else if (typeof bufferIterator[Symbol.asyncIterator] === "function") {
    return (async function* iter() {
      for await (const value of bufferIterator) {
        yield* parser(value);
      }
    })();
  }
}
var init_iterators = __esm({
  "node_modules/cbor-x/iterators.js"() {
    init_encode();
    init_decode();
  }
});

// node_modules/detect-libc/lib/process.js
var require_process = __commonJS({
  "node_modules/detect-libc/lib/process.js"(exports, module) {
    "use strict";
    var isLinux = () => process.platform === "linux";
    var report = null;
    var getReport = () => {
      if (!report) {
        if (isLinux() && process.report) {
          const orig = process.report.excludeNetwork;
          process.report.excludeNetwork = true;
          report = process.report.getReport();
          process.report.excludeNetwork = orig;
        } else {
          report = {};
        }
      }
      return report;
    };
    module.exports = { isLinux, getReport };
  }
});

// node_modules/detect-libc/lib/filesystem.js
var require_filesystem = __commonJS({
  "node_modules/detect-libc/lib/filesystem.js"(exports, module) {
    "use strict";
    var fs = __require("fs");
    var LDD_PATH = "/usr/bin/ldd";
    var SELF_PATH = "/proc/self/exe";
    var MAX_LENGTH = 2048;
    var readFileSync2 = (path) => {
      const fd = fs.openSync(path, "r");
      const buffer = Buffer.alloc(MAX_LENGTH);
      const bytesRead = fs.readSync(fd, buffer, 0, MAX_LENGTH, 0);
      fs.close(fd, () => {
      });
      return buffer.subarray(0, bytesRead);
    };
    var readFile = (path) => new Promise((resolve, reject) => {
      fs.open(path, "r", (err, fd) => {
        if (err) {
          reject(err);
        } else {
          const buffer = Buffer.alloc(MAX_LENGTH);
          fs.read(fd, buffer, 0, MAX_LENGTH, 0, (_, bytesRead) => {
            resolve(buffer.subarray(0, bytesRead));
            fs.close(fd, () => {
            });
          });
        }
      });
    });
    module.exports = {
      LDD_PATH,
      SELF_PATH,
      readFileSync: readFileSync2,
      readFile
    };
  }
});

// node_modules/detect-libc/lib/elf.js
var require_elf = __commonJS({
  "node_modules/detect-libc/lib/elf.js"(exports, module) {
    "use strict";
    var interpreterPath = (elf) => {
      if (elf.length < 64) {
        return null;
      }
      if (elf.readUInt32BE(0) !== 2135247942) {
        return null;
      }
      if (elf.readUInt8(4) !== 2) {
        return null;
      }
      if (elf.readUInt8(5) !== 1) {
        return null;
      }
      const offset = elf.readUInt32LE(32);
      const size = elf.readUInt16LE(54);
      const count = elf.readUInt16LE(56);
      for (let i = 0; i < count; i++) {
        const headerOffset = offset + i * size;
        const type = elf.readUInt32LE(headerOffset);
        if (type === 3) {
          const fileOffset = elf.readUInt32LE(headerOffset + 8);
          const fileSize = elf.readUInt32LE(headerOffset + 32);
          return elf.subarray(fileOffset, fileOffset + fileSize).toString().replace(/\0.*$/g, "");
        }
      }
      return null;
    };
    module.exports = {
      interpreterPath
    };
  }
});

// node_modules/detect-libc/lib/detect-libc.js
var require_detect_libc = __commonJS({
  "node_modules/detect-libc/lib/detect-libc.js"(exports, module) {
    "use strict";
    var childProcess = __require("child_process");
    var { isLinux, getReport } = require_process();
    var { LDD_PATH, SELF_PATH, readFile, readFileSync: readFileSync2 } = require_filesystem();
    var { interpreterPath } = require_elf();
    var cachedFamilyInterpreter;
    var cachedFamilyFilesystem;
    var cachedVersionFilesystem;
    var command = "getconf GNU_LIBC_VERSION 2>&1 || true; ldd --version 2>&1 || true";
    var commandOut = "";
    var safeCommand = () => {
      if (!commandOut) {
        return new Promise((resolve) => {
          childProcess.exec(command, (err, out) => {
            commandOut = err ? " " : out;
            resolve(commandOut);
          });
        });
      }
      return commandOut;
    };
    var safeCommandSync = () => {
      if (!commandOut) {
        try {
          commandOut = childProcess.execSync(command, { encoding: "utf8" });
        } catch (_err) {
          commandOut = " ";
        }
      }
      return commandOut;
    };
    var GLIBC = "glibc";
    var RE_GLIBC_VERSION = /LIBC[a-z0-9 \-).]*?(\d+\.\d+)/i;
    var MUSL = "musl";
    var isFileMusl = (f) => f.includes("libc.musl-") || f.includes("ld-musl-");
    var familyFromReport = () => {
      const report = getReport();
      if (report.header && report.header.glibcVersionRuntime) {
        return GLIBC;
      }
      if (Array.isArray(report.sharedObjects)) {
        if (report.sharedObjects.some(isFileMusl)) {
          return MUSL;
        }
      }
      return null;
    };
    var familyFromCommand = (out) => {
      const [getconf, ldd1] = out.split(/[\r\n]+/);
      if (getconf && getconf.includes(GLIBC)) {
        return GLIBC;
      }
      if (ldd1 && ldd1.includes(MUSL)) {
        return MUSL;
      }
      return null;
    };
    var familyFromInterpreterPath = (path) => {
      if (path) {
        if (path.includes("/ld-musl-")) {
          return MUSL;
        } else if (path.includes("/ld-linux-")) {
          return GLIBC;
        }
      }
      return null;
    };
    var getFamilyFromLddContent = (content) => {
      content = content.toString();
      if (content.includes("musl")) {
        return MUSL;
      }
      if (content.includes("GNU C Library")) {
        return GLIBC;
      }
      return null;
    };
    var familyFromFilesystem = async () => {
      if (cachedFamilyFilesystem !== void 0) {
        return cachedFamilyFilesystem;
      }
      cachedFamilyFilesystem = null;
      try {
        const lddContent = await readFile(LDD_PATH);
        cachedFamilyFilesystem = getFamilyFromLddContent(lddContent);
      } catch (e) {
      }
      return cachedFamilyFilesystem;
    };
    var familyFromFilesystemSync = () => {
      if (cachedFamilyFilesystem !== void 0) {
        return cachedFamilyFilesystem;
      }
      cachedFamilyFilesystem = null;
      try {
        const lddContent = readFileSync2(LDD_PATH);
        cachedFamilyFilesystem = getFamilyFromLddContent(lddContent);
      } catch (e) {
      }
      return cachedFamilyFilesystem;
    };
    var familyFromInterpreter = async () => {
      if (cachedFamilyInterpreter !== void 0) {
        return cachedFamilyInterpreter;
      }
      cachedFamilyInterpreter = null;
      try {
        const selfContent = await readFile(SELF_PATH);
        const path = interpreterPath(selfContent);
        cachedFamilyInterpreter = familyFromInterpreterPath(path);
      } catch (e) {
      }
      return cachedFamilyInterpreter;
    };
    var familyFromInterpreterSync = () => {
      if (cachedFamilyInterpreter !== void 0) {
        return cachedFamilyInterpreter;
      }
      cachedFamilyInterpreter = null;
      try {
        const selfContent = readFileSync2(SELF_PATH);
        const path = interpreterPath(selfContent);
        cachedFamilyInterpreter = familyFromInterpreterPath(path);
      } catch (e) {
      }
      return cachedFamilyInterpreter;
    };
    var family = async () => {
      let family2 = null;
      if (isLinux()) {
        family2 = await familyFromInterpreter();
        if (!family2) {
          family2 = await familyFromFilesystem();
          if (!family2) {
            family2 = familyFromReport();
          }
          if (!family2) {
            const out = await safeCommand();
            family2 = familyFromCommand(out);
          }
        }
      }
      return family2;
    };
    var familySync = () => {
      let family2 = null;
      if (isLinux()) {
        family2 = familyFromInterpreterSync();
        if (!family2) {
          family2 = familyFromFilesystemSync();
          if (!family2) {
            family2 = familyFromReport();
          }
          if (!family2) {
            const out = safeCommandSync();
            family2 = familyFromCommand(out);
          }
        }
      }
      return family2;
    };
    var isNonGlibcLinux = async () => isLinux() && await family() !== GLIBC;
    var isNonGlibcLinuxSync = () => isLinux() && familySync() !== GLIBC;
    var versionFromFilesystem = async () => {
      if (cachedVersionFilesystem !== void 0) {
        return cachedVersionFilesystem;
      }
      cachedVersionFilesystem = null;
      try {
        const lddContent = await readFile(LDD_PATH);
        const versionMatch = lddContent.match(RE_GLIBC_VERSION);
        if (versionMatch) {
          cachedVersionFilesystem = versionMatch[1];
        }
      } catch (e) {
      }
      return cachedVersionFilesystem;
    };
    var versionFromFilesystemSync = () => {
      if (cachedVersionFilesystem !== void 0) {
        return cachedVersionFilesystem;
      }
      cachedVersionFilesystem = null;
      try {
        const lddContent = readFileSync2(LDD_PATH);
        const versionMatch = lddContent.match(RE_GLIBC_VERSION);
        if (versionMatch) {
          cachedVersionFilesystem = versionMatch[1];
        }
      } catch (e) {
      }
      return cachedVersionFilesystem;
    };
    var versionFromReport = () => {
      const report = getReport();
      if (report.header && report.header.glibcVersionRuntime) {
        return report.header.glibcVersionRuntime;
      }
      return null;
    };
    var versionSuffix = (s) => s.trim().split(/\s+/)[1];
    var versionFromCommand = (out) => {
      const [getconf, ldd1, ldd2] = out.split(/[\r\n]+/);
      if (getconf && getconf.includes(GLIBC)) {
        return versionSuffix(getconf);
      }
      if (ldd1 && ldd2 && ldd1.includes(MUSL)) {
        return versionSuffix(ldd2);
      }
      return null;
    };
    var version = async () => {
      let version2 = null;
      if (isLinux()) {
        version2 = await versionFromFilesystem();
        if (!version2) {
          version2 = versionFromReport();
        }
        if (!version2) {
          const out = await safeCommand();
          version2 = versionFromCommand(out);
        }
      }
      return version2;
    };
    var versionSync = () => {
      let version2 = null;
      if (isLinux()) {
        version2 = versionFromFilesystemSync();
        if (!version2) {
          version2 = versionFromReport();
        }
        if (!version2) {
          const out = safeCommandSync();
          version2 = versionFromCommand(out);
        }
      }
      return version2;
    };
    module.exports = {
      GLIBC,
      MUSL,
      family,
      familySync,
      isNonGlibcLinux,
      isNonGlibcLinuxSync,
      version,
      versionSync
    };
  }
});

// node_modules/node-gyp-build-optional-packages/index.js
var require_node_gyp_build_optional_packages = __commonJS({
  "node_modules/node-gyp-build-optional-packages/index.js"(exports, module) {
    var fs = __require("fs");
    var path = __require("path");
    var url = __require("url");
    var vars = process.config && process.config.variables || {};
    var prebuildsOnly = !!process.env.PREBUILDS_ONLY;
    var versions = process.versions;
    var abi = versions.modules;
    if (versions.deno || process.isBun) {
      abi = "unsupported";
    }
    var runtime = isElectron() ? "electron" : "node";
    var arch = process.arch;
    var platform = process.platform;
    var libc = process.env.LIBC || (isMusl(platform) ? "musl" : "glibc");
    var armv = process.env.ARM_VERSION || (arch === "arm64" ? "8" : vars.arm_version) || "";
    var uv = (versions.uv || "").split(".")[0];
    module.exports = load;
    function load(dir) {
      if (typeof __webpack_require__ === "function")
        return __non_webpack_require__(load.path(dir));
      else
        return __require(load.path(dir));
    }
    load.path = function(dir) {
      dir = path.resolve(dir || ".");
      var packageName = "";
      try {
        if (typeof __webpack_require__ === "function")
          packageName = __non_webpack_require__(path.join(dir, "package.json")).name;
        else
          packageName = __require(path.join(dir, "package.json")).name;
        var varName = packageName.toUpperCase().replace(/-/g, "_") + "_PREBUILD";
        if (process.env[varName]) dir = process.env[varName];
      } catch (err) {
      }
      if (!prebuildsOnly) {
        var release = getFirst(path.join(dir, "build/Release"), matchBuild);
        if (release) return release;
        var debug = getFirst(path.join(dir, "build/Debug"), matchBuild);
        if (debug) return debug;
      }
      var prebuild = resolve(dir);
      if (prebuild) return prebuild;
      var nearby = resolve(path.dirname(process.execPath));
      if (nearby) return nearby;
      var platformPackage = (packageName[0] == "@" ? "" : "@" + packageName + "/") + packageName + "-" + platform + "-" + arch;
      try {
        var prebuildPackage = path.dirname(__require("module").createRequire(url.pathToFileURL(path.join(dir, "package.json"))).resolve(platformPackage));
        return resolveFile(prebuildPackage);
      } catch (error) {
      }
      var target2 = [
        "platform=" + platform,
        "arch=" + arch,
        "runtime=" + runtime,
        "abi=" + abi,
        "uv=" + uv,
        armv ? "armv=" + armv : "",
        "libc=" + libc,
        "node=" + process.versions.node,
        process.versions.electron ? "electron=" + process.versions.electron : "",
        typeof __webpack_require__ === "function" ? "webpack=true" : ""
        // eslint-disable-line
      ].filter(Boolean).join(" ");
      throw new Error("No native build was found for " + target2 + "\n    attempted loading from: " + dir + " and package: " + platformPackage + "\n");
      function resolve(dir2) {
        var tuples = readdirSync(path.join(dir2, "prebuilds")).map(parseTuple);
        var tuple = tuples.filter(matchTuple(platform, arch)).sort(compareTuples)[0];
        if (!tuple) return;
        return resolveFile(path.join(dir2, "prebuilds", tuple.name));
      }
      function resolveFile(prebuilds) {
        var parsed = readdirSync(prebuilds).map(parseTags);
        var candidates = parsed.filter(matchTags(runtime, abi));
        var winner = candidates.sort(compareTags(runtime))[0];
        if (winner) return path.join(prebuilds, winner.file);
      }
    };
    function readdirSync(dir) {
      try {
        return fs.readdirSync(dir);
      } catch (err) {
        return [];
      }
    }
    function getFirst(dir, filter) {
      var files = readdirSync(dir).filter(filter);
      return files[0] && path.join(dir, files[0]);
    }
    function matchBuild(name) {
      return /\.node$/.test(name);
    }
    function parseTuple(name) {
      var arr = name.split("-");
      if (arr.length !== 2) return;
      var platform2 = arr[0];
      var architectures = arr[1].split("+");
      if (!platform2) return;
      if (!architectures.length) return;
      if (!architectures.every(Boolean)) return;
      return { name, platform: platform2, architectures };
    }
    function matchTuple(platform2, arch2) {
      return function(tuple) {
        if (tuple == null) return false;
        if (tuple.platform !== platform2) return false;
        return tuple.architectures.includes(arch2);
      };
    }
    function compareTuples(a, b) {
      return a.architectures.length - b.architectures.length;
    }
    function parseTags(file) {
      var arr = file.split(".");
      var extension = arr.pop();
      var tags = { file, specificity: 0 };
      if (extension !== "node") return;
      for (var i = 0; i < arr.length; i++) {
        var tag = arr[i];
        if (tag === "node" || tag === "electron" || tag === "node-webkit") {
          tags.runtime = tag;
        } else if (tag === "napi") {
          tags.napi = true;
        } else if (tag.slice(0, 3) === "abi") {
          tags.abi = tag.slice(3);
        } else if (tag.slice(0, 2) === "uv") {
          tags.uv = tag.slice(2);
        } else if (tag.slice(0, 4) === "armv") {
          tags.armv = tag.slice(4);
        } else if (tag === "glibc" || tag === "musl") {
          tags.libc = tag;
        } else {
          continue;
        }
        tags.specificity++;
      }
      return tags;
    }
    function matchTags(runtime2, abi2) {
      return function(tags) {
        if (tags == null) return false;
        if (tags.runtime !== runtime2 && !runtimeAgnostic(tags)) return false;
        if (tags.abi !== abi2 && !tags.napi) return false;
        if (tags.uv && tags.uv !== uv) return false;
        if (tags.armv && tags.armv !== armv) return false;
        if (tags.libc && tags.libc !== libc) return false;
        return true;
      };
    }
    function runtimeAgnostic(tags) {
      return tags.runtime === "node" && tags.napi;
    }
    function compareTags(runtime2) {
      return function(a, b) {
        if (a.runtime !== b.runtime) {
          return a.runtime === runtime2 ? -1 : 1;
        } else if (a.abi !== b.abi) {
          return a.abi ? -1 : 1;
        } else if (a.specificity !== b.specificity) {
          return a.specificity > b.specificity ? -1 : 1;
        } else {
          return 0;
        }
      };
    }
    function isElectron() {
      if (process.versions && process.versions.electron) return true;
      if (process.env.ELECTRON_RUN_AS_NODE) return true;
      return typeof window !== "undefined" && window.process && window.process.type === "renderer";
    }
    function isMusl(platform2) {
      if (platform2 !== "linux") return false;
      const { familySync, MUSL } = require_detect_libc();
      return familySync() === MUSL;
    }
    load.parseTags = parseTags;
    load.matchTags = matchTags;
    load.compareTags = compareTags;
    load.parseTuple = parseTuple;
    load.matchTuple = matchTuple;
    load.compareTuples = compareTuples;
  }
});

// node_modules/cbor-extract/index.js
var require_cbor_extract = __commonJS({
  "node_modules/cbor-extract/index.js"(exports, module) {
    module.exports = require_node_gyp_build_optional_packages()(__dirname);
  }
});

// node_modules/cbor-x/node-index.js
var node_index_exports = {};
__export(node_index_exports, {
  ALWAYS: () => ALWAYS,
  DECIMAL_FIT: () => DECIMAL_FIT,
  DECIMAL_ROUND: () => DECIMAL_ROUND,
  Decoder: () => Decoder,
  DecoderStream: () => DecoderStream,
  Encoder: () => Encoder,
  EncoderStream: () => EncoderStream,
  FLOAT32_OPTIONS: () => FLOAT32_OPTIONS,
  NEVER: () => NEVER,
  REUSE_BUFFER_MODE: () => REUSE_BUFFER_MODE,
  Tag: () => Tag,
  addExtension: () => addExtension2,
  clearSource: () => clearSource,
  decode: () => decode,
  decodeIter: () => decodeIter,
  decodeMultiple: () => decodeMultiple,
  encode: () => encode,
  encodeAsAsyncIterable: () => encodeAsAsyncIterable,
  encodeAsIterable: () => encodeAsIterable,
  encodeIter: () => encodeIter,
  isNativeAccelerationEnabled: () => isNativeAccelerationEnabled,
  mapsAsObjects: () => mapsAsObjects,
  roundFloat32: () => roundFloat32,
  setSizeLimits: () => setSizeLimits,
  useRecords: () => useRecords
});
import { createRequire } from "module";
var useRecords, mapsAsObjects, nativeAccelerationDisabled;
var init_node_index = __esm({
  "node_modules/cbor-x/node-index.js"() {
    init_encode();
    init_decode();
    init_stream();
    init_iterators();
    init_decode();
    useRecords = false;
    mapsAsObjects = true;
    nativeAccelerationDisabled = process.env.CBOR_NATIVE_ACCELERATION_DISABLED !== void 0 && process.env.CBOR_NATIVE_ACCELERATION_DISABLED.toLowerCase() === "true";
    if (!nativeAccelerationDisabled) {
      let extractor;
      try {
        if (typeof __require == "function")
          extractor = require_cbor_extract();
        else
          extractor = createRequire(import.meta.url)("cbor-extract");
        if (extractor)
          setExtractor(extractor.extractStrings);
      } catch (error) {
      }
    }
  }
});

// src/cli.ts
import { readFileSync } from "node:fs";

// src/canonical.ts
function canonicalStringify(value) {
  return JSON.stringify(value, sortedReplacer);
}
function sortedReplacer(_key, value) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return value;
  }
  const sorted = {};
  for (const k of Object.keys(value).sort()) {
    sorted[k] = value[k];
  }
  return sorted;
}
function buildCanonicalPayload(receipt, options) {
  const citations = receipt.evidence.filter((e) => e.role === "support").map((e) => ({
    id: e.sourceId,
    quoteHash: normaliseHashPrefix(e.quoteHash)
  }));
  const counterfactualEvidence = receipt.evidence.filter(
    (e) => e.role === "counterfactual"
  );
  const counterfactual = counterfactualEvidence.length > 0 ? counterfactualEvidence.map((e) => ({
    id: e.sourceId,
    quoteHash: normaliseHashPrefix(e.quoteHash)
  })) : null;
  const payload = {
    answerId: receipt.answerId,
    citations,
    counterfactual,
    fusion: receipt.fusion,
    generatedAt: receipt.generatedAt ?? null,
    // LLM metadata: undefined = schema 1.0 (omit from hash), null = schema 1.1 light mode (include).
    ...receipt.llmModel !== void 0 ? { llmModel: receipt.llmModel } : {},
    ...receipt.llmRequestId !== void 0 ? { llmRequestId: receipt.llmRequestId } : {},
    mode: receipt.mode,
    modeRequested: receipt.modeRequested ?? receipt.mode,
    queryHash: receipt.queryHash,
    retrieval: receipt.retrieval,
    selection: receipt.selection,
    timings: receipt.timings
  };
  return payload;
}
function normaliseHashPrefix(hash) {
  if (hash.startsWith("blake3:") || hash.startsWith("sha256:")) {
    return hash;
  }
  if (/^[0-9a-f]{64}$/i.test(hash)) {
    return `sha256:${hash}`;
  }
  return hash;
}

// node_modules/@noble/hashes/esm/cryptoNode.js
import * as nc from "node:crypto";
var crypto = nc && typeof nc === "object" && "webcrypto" in nc ? nc.webcrypto : nc && typeof nc === "object" && "randomBytes" in nc ? nc : void 0;

// node_modules/@noble/hashes/esm/utils.js
/*! noble-hashes - MIT License (c) 2022 Paul Miller (paulmillr.com) */
function isBytes(a) {
  return a instanceof Uint8Array || ArrayBuffer.isView(a) && a.constructor.name === "Uint8Array";
}
function anumber(n) {
  if (!Number.isSafeInteger(n) || n < 0)
    throw new Error("positive integer expected, got " + n);
}
function abytes(b, ...lengths) {
  if (!isBytes(b))
    throw new Error("Uint8Array expected");
  if (lengths.length > 0 && !lengths.includes(b.length))
    throw new Error("Uint8Array expected of length " + lengths + ", got length=" + b.length);
}
function aexists(instance, checkFinished = true) {
  if (instance.destroyed)
    throw new Error("Hash instance has been destroyed");
  if (checkFinished && instance.finished)
    throw new Error("Hash#digest() has already been called");
}
function aoutput(out, instance) {
  abytes(out);
  const min = instance.outputLen;
  if (out.length < min) {
    throw new Error("digestInto() expects output buffer of length at least " + min);
  }
}
function u8(arr) {
  return new Uint8Array(arr.buffer, arr.byteOffset, arr.byteLength);
}
function u32(arr) {
  return new Uint32Array(arr.buffer, arr.byteOffset, Math.floor(arr.byteLength / 4));
}
function clean(...arrays) {
  for (let i = 0; i < arrays.length; i++) {
    arrays[i].fill(0);
  }
}
function createView(arr) {
  return new DataView(arr.buffer, arr.byteOffset, arr.byteLength);
}
function rotr(word, shift) {
  return word << 32 - shift | word >>> shift;
}
var isLE = /* @__PURE__ */ (() => new Uint8Array(new Uint32Array([287454020]).buffer)[0] === 68)();
function byteSwap(word) {
  return word << 24 & 4278190080 | word << 8 & 16711680 | word >>> 8 & 65280 | word >>> 24 & 255;
}
var swap8IfBE = isLE ? (n) => n : (n) => byteSwap(n);
function byteSwap32(arr) {
  for (let i = 0; i < arr.length; i++) {
    arr[i] = byteSwap(arr[i]);
  }
  return arr;
}
var swap32IfBE = isLE ? (u) => u : byteSwap32;
var hasHexBuiltin = /* @__PURE__ */ (() => (
  // @ts-ignore
  typeof Uint8Array.from([]).toHex === "function" && typeof Uint8Array.fromHex === "function"
))();
var hexes = /* @__PURE__ */ Array.from({ length: 256 }, (_, i) => i.toString(16).padStart(2, "0"));
function bytesToHex(bytes) {
  abytes(bytes);
  if (hasHexBuiltin)
    return bytes.toHex();
  let hex = "";
  for (let i = 0; i < bytes.length; i++) {
    hex += hexes[bytes[i]];
  }
  return hex;
}
var asciis = { _0: 48, _9: 57, A: 65, F: 70, a: 97, f: 102 };
function asciiToBase16(ch) {
  if (ch >= asciis._0 && ch <= asciis._9)
    return ch - asciis._0;
  if (ch >= asciis.A && ch <= asciis.F)
    return ch - (asciis.A - 10);
  if (ch >= asciis.a && ch <= asciis.f)
    return ch - (asciis.a - 10);
  return;
}
function hexToBytes(hex) {
  if (typeof hex !== "string")
    throw new Error("hex string expected, got " + typeof hex);
  if (hasHexBuiltin)
    return Uint8Array.fromHex(hex);
  const hl = hex.length;
  const al = hl / 2;
  if (hl % 2)
    throw new Error("hex string expected, got unpadded hex of length " + hl);
  const array = new Uint8Array(al);
  for (let ai = 0, hi = 0; ai < al; ai++, hi += 2) {
    const n1 = asciiToBase16(hex.charCodeAt(hi));
    const n2 = asciiToBase16(hex.charCodeAt(hi + 1));
    if (n1 === void 0 || n2 === void 0) {
      const char = hex[hi] + hex[hi + 1];
      throw new Error('hex string expected, got non-hex character "' + char + '" at index ' + hi);
    }
    array[ai] = n1 * 16 + n2;
  }
  return array;
}
function utf8ToBytes(str) {
  if (typeof str !== "string")
    throw new Error("string expected");
  return new Uint8Array(new TextEncoder().encode(str));
}
function toBytes(data) {
  if (typeof data === "string")
    data = utf8ToBytes(data);
  abytes(data);
  return data;
}
function concatBytes(...arrays) {
  let sum = 0;
  for (let i = 0; i < arrays.length; i++) {
    const a = arrays[i];
    abytes(a);
    sum += a.length;
  }
  const res = new Uint8Array(sum);
  for (let i = 0, pad = 0; i < arrays.length; i++) {
    const a = arrays[i];
    res.set(a, pad);
    pad += a.length;
  }
  return res;
}
var Hash = class {
};
function createHasher(hashCons) {
  const hashC = (msg) => hashCons().update(toBytes(msg)).digest();
  const tmp = hashCons();
  hashC.outputLen = tmp.outputLen;
  hashC.blockLen = tmp.blockLen;
  hashC.create = () => hashCons();
  return hashC;
}
function createXOFer(hashCons) {
  const hashC = (msg, opts) => hashCons(opts).update(toBytes(msg)).digest();
  const tmp = hashCons({});
  hashC.outputLen = tmp.outputLen;
  hashC.blockLen = tmp.blockLen;
  hashC.create = (opts) => hashCons(opts);
  return hashC;
}
function randomBytes(bytesLength = 32) {
  if (crypto && typeof crypto.getRandomValues === "function") {
    return crypto.getRandomValues(new Uint8Array(bytesLength));
  }
  if (crypto && typeof crypto.randomBytes === "function") {
    return Uint8Array.from(crypto.randomBytes(bytesLength));
  }
  throw new Error("crypto.getRandomValues must be defined");
}

// node_modules/@noble/hashes/esm/_md.js
function setBigUint64(view, byteOffset, value, isLE2) {
  if (typeof view.setBigUint64 === "function")
    return view.setBigUint64(byteOffset, value, isLE2);
  const _32n2 = BigInt(32);
  const _u32_max = BigInt(4294967295);
  const wh = Number(value >> _32n2 & _u32_max);
  const wl = Number(value & _u32_max);
  const h = isLE2 ? 4 : 0;
  const l = isLE2 ? 0 : 4;
  view.setUint32(byteOffset + h, wh, isLE2);
  view.setUint32(byteOffset + l, wl, isLE2);
}
function Chi(a, b, c) {
  return a & b ^ ~a & c;
}
function Maj(a, b, c) {
  return a & b ^ a & c ^ b & c;
}
var HashMD = class extends Hash {
  constructor(blockLen, outputLen, padOffset, isLE2) {
    super();
    this.finished = false;
    this.length = 0;
    this.pos = 0;
    this.destroyed = false;
    this.blockLen = blockLen;
    this.outputLen = outputLen;
    this.padOffset = padOffset;
    this.isLE = isLE2;
    this.buffer = new Uint8Array(blockLen);
    this.view = createView(this.buffer);
  }
  update(data) {
    aexists(this);
    data = toBytes(data);
    abytes(data);
    const { view, buffer, blockLen } = this;
    const len = data.length;
    for (let pos = 0; pos < len; ) {
      const take = Math.min(blockLen - this.pos, len - pos);
      if (take === blockLen) {
        const dataView2 = createView(data);
        for (; blockLen <= len - pos; pos += blockLen)
          this.process(dataView2, pos);
        continue;
      }
      buffer.set(data.subarray(pos, pos + take), this.pos);
      this.pos += take;
      pos += take;
      if (this.pos === blockLen) {
        this.process(view, 0);
        this.pos = 0;
      }
    }
    this.length += data.length;
    this.roundClean();
    return this;
  }
  digestInto(out) {
    aexists(this);
    aoutput(out, this);
    this.finished = true;
    const { buffer, view, blockLen, isLE: isLE2 } = this;
    let { pos } = this;
    buffer[pos++] = 128;
    clean(this.buffer.subarray(pos));
    if (this.padOffset > blockLen - pos) {
      this.process(view, 0);
      pos = 0;
    }
    for (let i = pos; i < blockLen; i++)
      buffer[i] = 0;
    setBigUint64(view, blockLen - 8, BigInt(this.length * 8), isLE2);
    this.process(view, 0);
    const oview = createView(out);
    const len = this.outputLen;
    if (len % 4)
      throw new Error("_sha2: outputLen should be aligned to 32bit");
    const outLen = len / 4;
    const state = this.get();
    if (outLen > state.length)
      throw new Error("_sha2: outputLen bigger than state");
    for (let i = 0; i < outLen; i++)
      oview.setUint32(4 * i, state[i], isLE2);
  }
  digest() {
    const { buffer, outputLen } = this;
    this.digestInto(buffer);
    const res = buffer.slice(0, outputLen);
    this.destroy();
    return res;
  }
  _cloneInto(to) {
    to || (to = new this.constructor());
    to.set(...this.get());
    const { blockLen, buffer, length, finished, destroyed, pos } = this;
    to.destroyed = destroyed;
    to.finished = finished;
    to.length = length;
    to.pos = pos;
    if (length % blockLen)
      to.buffer.set(buffer);
    return to;
  }
  clone() {
    return this._cloneInto();
  }
};
var SHA256_IV = /* @__PURE__ */ Uint32Array.from([
  1779033703,
  3144134277,
  1013904242,
  2773480762,
  1359893119,
  2600822924,
  528734635,
  1541459225
]);
var SHA512_IV = /* @__PURE__ */ Uint32Array.from([
  1779033703,
  4089235720,
  3144134277,
  2227873595,
  1013904242,
  4271175723,
  2773480762,
  1595750129,
  1359893119,
  2917565137,
  2600822924,
  725511199,
  528734635,
  4215389547,
  1541459225,
  327033209
]);

// node_modules/@noble/hashes/esm/_u64.js
var U32_MASK64 = /* @__PURE__ */ BigInt(2 ** 32 - 1);
var _32n = /* @__PURE__ */ BigInt(32);
function fromBig(n, le = false) {
  if (le)
    return { h: Number(n & U32_MASK64), l: Number(n >> _32n & U32_MASK64) };
  return { h: Number(n >> _32n & U32_MASK64) | 0, l: Number(n & U32_MASK64) | 0 };
}
function split(lst, le = false) {
  const len = lst.length;
  let Ah = new Uint32Array(len);
  let Al = new Uint32Array(len);
  for (let i = 0; i < len; i++) {
    const { h, l } = fromBig(lst[i], le);
    [Ah[i], Al[i]] = [h, l];
  }
  return [Ah, Al];
}
var shrSH = (h, _l, s) => h >>> s;
var shrSL = (h, l, s) => h << 32 - s | l >>> s;
var rotrSH = (h, l, s) => h >>> s | l << 32 - s;
var rotrSL = (h, l, s) => h << 32 - s | l >>> s;
var rotrBH = (h, l, s) => h << 64 - s | l >>> s - 32;
var rotrBL = (h, l, s) => h >>> s - 32 | l << 64 - s;
function add(Ah, Al, Bh, Bl) {
  const l = (Al >>> 0) + (Bl >>> 0);
  return { h: Ah + Bh + (l / 2 ** 32 | 0) | 0, l: l | 0 };
}
var add3L = (Al, Bl, Cl) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0);
var add3H = (low, Ah, Bh, Ch) => Ah + Bh + Ch + (low / 2 ** 32 | 0) | 0;
var add4L = (Al, Bl, Cl, Dl) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0) + (Dl >>> 0);
var add4H = (low, Ah, Bh, Ch, Dh) => Ah + Bh + Ch + Dh + (low / 2 ** 32 | 0) | 0;
var add5L = (Al, Bl, Cl, Dl, El) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0) + (Dl >>> 0) + (El >>> 0);
var add5H = (low, Ah, Bh, Ch, Dh, Eh) => Ah + Bh + Ch + Dh + Eh + (low / 2 ** 32 | 0) | 0;

// node_modules/@noble/hashes/esm/_blake.js
function G1s(a, b, c, d, x) {
  a = a + b + x | 0;
  d = rotr(d ^ a, 16);
  c = c + d | 0;
  b = rotr(b ^ c, 12);
  return { a, b, c, d };
}
function G2s(a, b, c, d, x) {
  a = a + b + x | 0;
  d = rotr(d ^ a, 8);
  c = c + d | 0;
  b = rotr(b ^ c, 7);
  return { a, b, c, d };
}

// node_modules/@noble/hashes/esm/blake2.js
var BLAKE2 = class extends Hash {
  constructor(blockLen, outputLen) {
    super();
    this.finished = false;
    this.destroyed = false;
    this.length = 0;
    this.pos = 0;
    anumber(blockLen);
    anumber(outputLen);
    this.blockLen = blockLen;
    this.outputLen = outputLen;
    this.buffer = new Uint8Array(blockLen);
    this.buffer32 = u32(this.buffer);
  }
  update(data) {
    aexists(this);
    data = toBytes(data);
    abytes(data);
    const { blockLen, buffer, buffer32 } = this;
    const len = data.length;
    const offset = data.byteOffset;
    const buf = data.buffer;
    for (let pos = 0; pos < len; ) {
      if (this.pos === blockLen) {
        swap32IfBE(buffer32);
        this.compress(buffer32, 0, false);
        swap32IfBE(buffer32);
        this.pos = 0;
      }
      const take = Math.min(blockLen - this.pos, len - pos);
      const dataOffset = offset + pos;
      if (take === blockLen && !(dataOffset % 4) && pos + take < len) {
        const data32 = new Uint32Array(buf, dataOffset, Math.floor((len - pos) / 4));
        swap32IfBE(data32);
        for (let pos32 = 0; pos + blockLen < len; pos32 += buffer32.length, pos += blockLen) {
          this.length += blockLen;
          this.compress(data32, pos32, false);
        }
        swap32IfBE(data32);
        continue;
      }
      buffer.set(data.subarray(pos, pos + take), this.pos);
      this.pos += take;
      this.length += take;
      pos += take;
    }
    return this;
  }
  digestInto(out) {
    aexists(this);
    aoutput(out, this);
    const { pos, buffer32 } = this;
    this.finished = true;
    clean(this.buffer.subarray(pos));
    swap32IfBE(buffer32);
    this.compress(buffer32, 0, true);
    swap32IfBE(buffer32);
    const out32 = u32(out);
    this.get().forEach((v, i) => out32[i] = swap8IfBE(v));
  }
  digest() {
    const { buffer, outputLen } = this;
    this.digestInto(buffer);
    const res = buffer.slice(0, outputLen);
    this.destroy();
    return res;
  }
  _cloneInto(to) {
    const { buffer, length, finished, destroyed, outputLen, pos } = this;
    to || (to = new this.constructor({ dkLen: outputLen }));
    to.set(...this.get());
    to.buffer.set(buffer);
    to.destroyed = destroyed;
    to.finished = finished;
    to.length = length;
    to.pos = pos;
    to.outputLen = outputLen;
    return to;
  }
  clone() {
    return this._cloneInto();
  }
};
function compress(s, offset, msg, rounds, v0, v1, v2, v3, v4, v5, v6, v7, v8, v9, v10, v11, v12, v13, v14, v15) {
  let j = 0;
  for (let i = 0; i < rounds; i++) {
    ({ a: v0, b: v4, c: v8, d: v12 } = G1s(v0, v4, v8, v12, msg[offset + s[j++]]));
    ({ a: v0, b: v4, c: v8, d: v12 } = G2s(v0, v4, v8, v12, msg[offset + s[j++]]));
    ({ a: v1, b: v5, c: v9, d: v13 } = G1s(v1, v5, v9, v13, msg[offset + s[j++]]));
    ({ a: v1, b: v5, c: v9, d: v13 } = G2s(v1, v5, v9, v13, msg[offset + s[j++]]));
    ({ a: v2, b: v6, c: v10, d: v14 } = G1s(v2, v6, v10, v14, msg[offset + s[j++]]));
    ({ a: v2, b: v6, c: v10, d: v14 } = G2s(v2, v6, v10, v14, msg[offset + s[j++]]));
    ({ a: v3, b: v7, c: v11, d: v15 } = G1s(v3, v7, v11, v15, msg[offset + s[j++]]));
    ({ a: v3, b: v7, c: v11, d: v15 } = G2s(v3, v7, v11, v15, msg[offset + s[j++]]));
    ({ a: v0, b: v5, c: v10, d: v15 } = G1s(v0, v5, v10, v15, msg[offset + s[j++]]));
    ({ a: v0, b: v5, c: v10, d: v15 } = G2s(v0, v5, v10, v15, msg[offset + s[j++]]));
    ({ a: v1, b: v6, c: v11, d: v12 } = G1s(v1, v6, v11, v12, msg[offset + s[j++]]));
    ({ a: v1, b: v6, c: v11, d: v12 } = G2s(v1, v6, v11, v12, msg[offset + s[j++]]));
    ({ a: v2, b: v7, c: v8, d: v13 } = G1s(v2, v7, v8, v13, msg[offset + s[j++]]));
    ({ a: v2, b: v7, c: v8, d: v13 } = G2s(v2, v7, v8, v13, msg[offset + s[j++]]));
    ({ a: v3, b: v4, c: v9, d: v14 } = G1s(v3, v4, v9, v14, msg[offset + s[j++]]));
    ({ a: v3, b: v4, c: v9, d: v14 } = G2s(v3, v4, v9, v14, msg[offset + s[j++]]));
  }
  return { v0, v1, v2, v3, v4, v5, v6, v7, v8, v9, v10, v11, v12, v13, v14, v15 };
}

// node_modules/@noble/hashes/esm/blake3.js
var B3_Flags = {
  CHUNK_START: 1,
  CHUNK_END: 2,
  PARENT: 4,
  ROOT: 8,
  KEYED_HASH: 16,
  DERIVE_KEY_CONTEXT: 32,
  DERIVE_KEY_MATERIAL: 64
};
var B3_IV = SHA256_IV.slice();
var B3_SIGMA = /* @__PURE__ */ (() => {
  const Id = Array.from({ length: 16 }, (_, i) => i);
  const permute = (arr) => [2, 6, 3, 10, 7, 0, 4, 13, 1, 11, 12, 5, 9, 14, 15, 8].map((i) => arr[i]);
  const res = [];
  for (let i = 0, v = Id; i < 7; i++, v = permute(v))
    res.push(...v);
  return Uint8Array.from(res);
})();
var BLAKE3 = class _BLAKE3 extends BLAKE2 {
  constructor(opts = {}, flags = 0) {
    super(64, opts.dkLen === void 0 ? 32 : opts.dkLen);
    this.chunkPos = 0;
    this.chunksDone = 0;
    this.flags = 0 | 0;
    this.stack = [];
    this.posOut = 0;
    this.bufferOut32 = new Uint32Array(16);
    this.chunkOut = 0;
    this.enableXOF = true;
    const { key, context } = opts;
    const hasContext = context !== void 0;
    if (key !== void 0) {
      if (hasContext)
        throw new Error('Only "key" or "context" can be specified at same time');
      const k = toBytes(key).slice();
      abytes(k, 32);
      this.IV = u32(k);
      swap32IfBE(this.IV);
      this.flags = flags | B3_Flags.KEYED_HASH;
    } else if (hasContext) {
      const ctx = toBytes(context);
      const contextKey = new _BLAKE3({ dkLen: 32 }, B3_Flags.DERIVE_KEY_CONTEXT).update(ctx).digest();
      this.IV = u32(contextKey);
      swap32IfBE(this.IV);
      this.flags = flags | B3_Flags.DERIVE_KEY_MATERIAL;
    } else {
      this.IV = B3_IV.slice();
      this.flags = flags;
    }
    this.state = this.IV.slice();
    this.bufferOut = u8(this.bufferOut32);
  }
  // Unused
  get() {
    return [];
  }
  set() {
  }
  b2Compress(counter, flags, buf, bufPos = 0) {
    const { state: s, pos } = this;
    const { h, l } = fromBig(BigInt(counter), true);
    const { v0, v1, v2, v3, v4, v5, v6, v7, v8, v9, v10, v11, v12, v13, v14, v15 } = compress(B3_SIGMA, bufPos, buf, 7, s[0], s[1], s[2], s[3], s[4], s[5], s[6], s[7], B3_IV[0], B3_IV[1], B3_IV[2], B3_IV[3], h, l, pos, flags);
    s[0] = v0 ^ v8;
    s[1] = v1 ^ v9;
    s[2] = v2 ^ v10;
    s[3] = v3 ^ v11;
    s[4] = v4 ^ v12;
    s[5] = v5 ^ v13;
    s[6] = v6 ^ v14;
    s[7] = v7 ^ v15;
  }
  compress(buf, bufPos = 0, isLast = false) {
    let flags = this.flags;
    if (!this.chunkPos)
      flags |= B3_Flags.CHUNK_START;
    if (this.chunkPos === 15 || isLast)
      flags |= B3_Flags.CHUNK_END;
    if (!isLast)
      this.pos = this.blockLen;
    this.b2Compress(this.chunksDone, flags, buf, bufPos);
    this.chunkPos += 1;
    if (this.chunkPos === 16 || isLast) {
      let chunk = this.state;
      this.state = this.IV.slice();
      for (let last, chunks = this.chunksDone + 1; isLast || !(chunks & 1); chunks >>= 1) {
        if (!(last = this.stack.pop()))
          break;
        this.buffer32.set(last, 0);
        this.buffer32.set(chunk, 8);
        this.pos = this.blockLen;
        this.b2Compress(0, this.flags | B3_Flags.PARENT, this.buffer32, 0);
        chunk = this.state;
        this.state = this.IV.slice();
      }
      this.chunksDone++;
      this.chunkPos = 0;
      this.stack.push(chunk);
    }
    this.pos = 0;
  }
  _cloneInto(to) {
    to = super._cloneInto(to);
    const { IV, flags, state, chunkPos, posOut, chunkOut, stack, chunksDone } = this;
    to.state.set(state.slice());
    to.stack = stack.map((i) => Uint32Array.from(i));
    to.IV.set(IV);
    to.flags = flags;
    to.chunkPos = chunkPos;
    to.chunksDone = chunksDone;
    to.posOut = posOut;
    to.chunkOut = chunkOut;
    to.enableXOF = this.enableXOF;
    to.bufferOut32.set(this.bufferOut32);
    return to;
  }
  destroy() {
    this.destroyed = true;
    clean(this.state, this.buffer32, this.IV, this.bufferOut32);
    clean(...this.stack);
  }
  // Same as b2Compress, but doesn't modify state and returns 16 u32 array (instead of 8)
  b2CompressOut() {
    const { state: s, pos, flags, buffer32, bufferOut32: out32 } = this;
    const { h, l } = fromBig(BigInt(this.chunkOut++));
    swap32IfBE(buffer32);
    const { v0, v1, v2, v3, v4, v5, v6, v7, v8, v9, v10, v11, v12, v13, v14, v15 } = compress(B3_SIGMA, 0, buffer32, 7, s[0], s[1], s[2], s[3], s[4], s[5], s[6], s[7], B3_IV[0], B3_IV[1], B3_IV[2], B3_IV[3], l, h, pos, flags);
    out32[0] = v0 ^ v8;
    out32[1] = v1 ^ v9;
    out32[2] = v2 ^ v10;
    out32[3] = v3 ^ v11;
    out32[4] = v4 ^ v12;
    out32[5] = v5 ^ v13;
    out32[6] = v6 ^ v14;
    out32[7] = v7 ^ v15;
    out32[8] = s[0] ^ v8;
    out32[9] = s[1] ^ v9;
    out32[10] = s[2] ^ v10;
    out32[11] = s[3] ^ v11;
    out32[12] = s[4] ^ v12;
    out32[13] = s[5] ^ v13;
    out32[14] = s[6] ^ v14;
    out32[15] = s[7] ^ v15;
    swap32IfBE(buffer32);
    swap32IfBE(out32);
    this.posOut = 0;
  }
  finish() {
    if (this.finished)
      return;
    this.finished = true;
    clean(this.buffer.subarray(this.pos));
    let flags = this.flags | B3_Flags.ROOT;
    if (this.stack.length) {
      flags |= B3_Flags.PARENT;
      swap32IfBE(this.buffer32);
      this.compress(this.buffer32, 0, true);
      swap32IfBE(this.buffer32);
      this.chunksDone = 0;
      this.pos = this.blockLen;
    } else {
      flags |= (!this.chunkPos ? B3_Flags.CHUNK_START : 0) | B3_Flags.CHUNK_END;
    }
    this.flags = flags;
    this.b2CompressOut();
  }
  writeInto(out) {
    aexists(this, false);
    abytes(out);
    this.finish();
    const { blockLen, bufferOut } = this;
    for (let pos = 0, len = out.length; pos < len; ) {
      if (this.posOut >= blockLen)
        this.b2CompressOut();
      const take = Math.min(blockLen - this.posOut, len - pos);
      out.set(bufferOut.subarray(this.posOut, this.posOut + take), pos);
      this.posOut += take;
      pos += take;
    }
    return out;
  }
  xofInto(out) {
    if (!this.enableXOF)
      throw new Error("XOF is not possible after digest call");
    return this.writeInto(out);
  }
  xof(bytes) {
    anumber(bytes);
    return this.xofInto(new Uint8Array(bytes));
  }
  digestInto(out) {
    aoutput(out, this);
    if (this.finished)
      throw new Error("digest() was already called");
    this.enableXOF = false;
    this.writeInto(out);
    this.destroy();
    return out;
  }
  digest() {
    return this.digestInto(new Uint8Array(this.outputLen));
  }
};
var blake3 = /* @__PURE__ */ createXOFer((opts) => new BLAKE3(opts));

// node_modules/@noble/hashes/esm/sha2.js
var SHA256_K = /* @__PURE__ */ Uint32Array.from([
  1116352408,
  1899447441,
  3049323471,
  3921009573,
  961987163,
  1508970993,
  2453635748,
  2870763221,
  3624381080,
  310598401,
  607225278,
  1426881987,
  1925078388,
  2162078206,
  2614888103,
  3248222580,
  3835390401,
  4022224774,
  264347078,
  604807628,
  770255983,
  1249150122,
  1555081692,
  1996064986,
  2554220882,
  2821834349,
  2952996808,
  3210313671,
  3336571891,
  3584528711,
  113926993,
  338241895,
  666307205,
  773529912,
  1294757372,
  1396182291,
  1695183700,
  1986661051,
  2177026350,
  2456956037,
  2730485921,
  2820302411,
  3259730800,
  3345764771,
  3516065817,
  3600352804,
  4094571909,
  275423344,
  430227734,
  506948616,
  659060556,
  883997877,
  958139571,
  1322822218,
  1537002063,
  1747873779,
  1955562222,
  2024104815,
  2227730452,
  2361852424,
  2428436474,
  2756734187,
  3204031479,
  3329325298
]);
var SHA256_W = /* @__PURE__ */ new Uint32Array(64);
var SHA256 = class extends HashMD {
  constructor(outputLen = 32) {
    super(64, outputLen, 8, false);
    this.A = SHA256_IV[0] | 0;
    this.B = SHA256_IV[1] | 0;
    this.C = SHA256_IV[2] | 0;
    this.D = SHA256_IV[3] | 0;
    this.E = SHA256_IV[4] | 0;
    this.F = SHA256_IV[5] | 0;
    this.G = SHA256_IV[6] | 0;
    this.H = SHA256_IV[7] | 0;
  }
  get() {
    const { A, B, C, D, E, F, G, H } = this;
    return [A, B, C, D, E, F, G, H];
  }
  // prettier-ignore
  set(A, B, C, D, E, F, G, H) {
    this.A = A | 0;
    this.B = B | 0;
    this.C = C | 0;
    this.D = D | 0;
    this.E = E | 0;
    this.F = F | 0;
    this.G = G | 0;
    this.H = H | 0;
  }
  process(view, offset) {
    for (let i = 0; i < 16; i++, offset += 4)
      SHA256_W[i] = view.getUint32(offset, false);
    for (let i = 16; i < 64; i++) {
      const W15 = SHA256_W[i - 15];
      const W2 = SHA256_W[i - 2];
      const s0 = rotr(W15, 7) ^ rotr(W15, 18) ^ W15 >>> 3;
      const s1 = rotr(W2, 17) ^ rotr(W2, 19) ^ W2 >>> 10;
      SHA256_W[i] = s1 + SHA256_W[i - 7] + s0 + SHA256_W[i - 16] | 0;
    }
    let { A, B, C, D, E, F, G, H } = this;
    for (let i = 0; i < 64; i++) {
      const sigma1 = rotr(E, 6) ^ rotr(E, 11) ^ rotr(E, 25);
      const T1 = H + sigma1 + Chi(E, F, G) + SHA256_K[i] + SHA256_W[i] | 0;
      const sigma0 = rotr(A, 2) ^ rotr(A, 13) ^ rotr(A, 22);
      const T2 = sigma0 + Maj(A, B, C) | 0;
      H = G;
      G = F;
      F = E;
      E = D + T1 | 0;
      D = C;
      C = B;
      B = A;
      A = T1 + T2 | 0;
    }
    A = A + this.A | 0;
    B = B + this.B | 0;
    C = C + this.C | 0;
    D = D + this.D | 0;
    E = E + this.E | 0;
    F = F + this.F | 0;
    G = G + this.G | 0;
    H = H + this.H | 0;
    this.set(A, B, C, D, E, F, G, H);
  }
  roundClean() {
    clean(SHA256_W);
  }
  destroy() {
    this.set(0, 0, 0, 0, 0, 0, 0, 0);
    clean(this.buffer);
  }
};
var K512 = /* @__PURE__ */ (() => split([
  "0x428a2f98d728ae22",
  "0x7137449123ef65cd",
  "0xb5c0fbcfec4d3b2f",
  "0xe9b5dba58189dbbc",
  "0x3956c25bf348b538",
  "0x59f111f1b605d019",
  "0x923f82a4af194f9b",
  "0xab1c5ed5da6d8118",
  "0xd807aa98a3030242",
  "0x12835b0145706fbe",
  "0x243185be4ee4b28c",
  "0x550c7dc3d5ffb4e2",
  "0x72be5d74f27b896f",
  "0x80deb1fe3b1696b1",
  "0x9bdc06a725c71235",
  "0xc19bf174cf692694",
  "0xe49b69c19ef14ad2",
  "0xefbe4786384f25e3",
  "0x0fc19dc68b8cd5b5",
  "0x240ca1cc77ac9c65",
  "0x2de92c6f592b0275",
  "0x4a7484aa6ea6e483",
  "0x5cb0a9dcbd41fbd4",
  "0x76f988da831153b5",
  "0x983e5152ee66dfab",
  "0xa831c66d2db43210",
  "0xb00327c898fb213f",
  "0xbf597fc7beef0ee4",
  "0xc6e00bf33da88fc2",
  "0xd5a79147930aa725",
  "0x06ca6351e003826f",
  "0x142929670a0e6e70",
  "0x27b70a8546d22ffc",
  "0x2e1b21385c26c926",
  "0x4d2c6dfc5ac42aed",
  "0x53380d139d95b3df",
  "0x650a73548baf63de",
  "0x766a0abb3c77b2a8",
  "0x81c2c92e47edaee6",
  "0x92722c851482353b",
  "0xa2bfe8a14cf10364",
  "0xa81a664bbc423001",
  "0xc24b8b70d0f89791",
  "0xc76c51a30654be30",
  "0xd192e819d6ef5218",
  "0xd69906245565a910",
  "0xf40e35855771202a",
  "0x106aa07032bbd1b8",
  "0x19a4c116b8d2d0c8",
  "0x1e376c085141ab53",
  "0x2748774cdf8eeb99",
  "0x34b0bcb5e19b48a8",
  "0x391c0cb3c5c95a63",
  "0x4ed8aa4ae3418acb",
  "0x5b9cca4f7763e373",
  "0x682e6ff3d6b2b8a3",
  "0x748f82ee5defb2fc",
  "0x78a5636f43172f60",
  "0x84c87814a1f0ab72",
  "0x8cc702081a6439ec",
  "0x90befffa23631e28",
  "0xa4506cebde82bde9",
  "0xbef9a3f7b2c67915",
  "0xc67178f2e372532b",
  "0xca273eceea26619c",
  "0xd186b8c721c0c207",
  "0xeada7dd6cde0eb1e",
  "0xf57d4f7fee6ed178",
  "0x06f067aa72176fba",
  "0x0a637dc5a2c898a6",
  "0x113f9804bef90dae",
  "0x1b710b35131c471b",
  "0x28db77f523047d84",
  "0x32caab7b40c72493",
  "0x3c9ebe0a15c9bebc",
  "0x431d67c49c100d4c",
  "0x4cc5d4becb3e42b6",
  "0x597f299cfc657e2a",
  "0x5fcb6fab3ad6faec",
  "0x6c44198c4a475817"
].map((n) => BigInt(n))))();
var SHA512_Kh = /* @__PURE__ */ (() => K512[0])();
var SHA512_Kl = /* @__PURE__ */ (() => K512[1])();
var SHA512_W_H = /* @__PURE__ */ new Uint32Array(80);
var SHA512_W_L = /* @__PURE__ */ new Uint32Array(80);
var SHA512 = class extends HashMD {
  constructor(outputLen = 64) {
    super(128, outputLen, 16, false);
    this.Ah = SHA512_IV[0] | 0;
    this.Al = SHA512_IV[1] | 0;
    this.Bh = SHA512_IV[2] | 0;
    this.Bl = SHA512_IV[3] | 0;
    this.Ch = SHA512_IV[4] | 0;
    this.Cl = SHA512_IV[5] | 0;
    this.Dh = SHA512_IV[6] | 0;
    this.Dl = SHA512_IV[7] | 0;
    this.Eh = SHA512_IV[8] | 0;
    this.El = SHA512_IV[9] | 0;
    this.Fh = SHA512_IV[10] | 0;
    this.Fl = SHA512_IV[11] | 0;
    this.Gh = SHA512_IV[12] | 0;
    this.Gl = SHA512_IV[13] | 0;
    this.Hh = SHA512_IV[14] | 0;
    this.Hl = SHA512_IV[15] | 0;
  }
  // prettier-ignore
  get() {
    const { Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl } = this;
    return [Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl];
  }
  // prettier-ignore
  set(Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl) {
    this.Ah = Ah | 0;
    this.Al = Al | 0;
    this.Bh = Bh | 0;
    this.Bl = Bl | 0;
    this.Ch = Ch | 0;
    this.Cl = Cl | 0;
    this.Dh = Dh | 0;
    this.Dl = Dl | 0;
    this.Eh = Eh | 0;
    this.El = El | 0;
    this.Fh = Fh | 0;
    this.Fl = Fl | 0;
    this.Gh = Gh | 0;
    this.Gl = Gl | 0;
    this.Hh = Hh | 0;
    this.Hl = Hl | 0;
  }
  process(view, offset) {
    for (let i = 0; i < 16; i++, offset += 4) {
      SHA512_W_H[i] = view.getUint32(offset);
      SHA512_W_L[i] = view.getUint32(offset += 4);
    }
    for (let i = 16; i < 80; i++) {
      const W15h = SHA512_W_H[i - 15] | 0;
      const W15l = SHA512_W_L[i - 15] | 0;
      const s0h = rotrSH(W15h, W15l, 1) ^ rotrSH(W15h, W15l, 8) ^ shrSH(W15h, W15l, 7);
      const s0l = rotrSL(W15h, W15l, 1) ^ rotrSL(W15h, W15l, 8) ^ shrSL(W15h, W15l, 7);
      const W2h = SHA512_W_H[i - 2] | 0;
      const W2l = SHA512_W_L[i - 2] | 0;
      const s1h = rotrSH(W2h, W2l, 19) ^ rotrBH(W2h, W2l, 61) ^ shrSH(W2h, W2l, 6);
      const s1l = rotrSL(W2h, W2l, 19) ^ rotrBL(W2h, W2l, 61) ^ shrSL(W2h, W2l, 6);
      const SUMl = add4L(s0l, s1l, SHA512_W_L[i - 7], SHA512_W_L[i - 16]);
      const SUMh = add4H(SUMl, s0h, s1h, SHA512_W_H[i - 7], SHA512_W_H[i - 16]);
      SHA512_W_H[i] = SUMh | 0;
      SHA512_W_L[i] = SUMl | 0;
    }
    let { Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl } = this;
    for (let i = 0; i < 80; i++) {
      const sigma1h = rotrSH(Eh, El, 14) ^ rotrSH(Eh, El, 18) ^ rotrBH(Eh, El, 41);
      const sigma1l = rotrSL(Eh, El, 14) ^ rotrSL(Eh, El, 18) ^ rotrBL(Eh, El, 41);
      const CHIh = Eh & Fh ^ ~Eh & Gh;
      const CHIl = El & Fl ^ ~El & Gl;
      const T1ll = add5L(Hl, sigma1l, CHIl, SHA512_Kl[i], SHA512_W_L[i]);
      const T1h = add5H(T1ll, Hh, sigma1h, CHIh, SHA512_Kh[i], SHA512_W_H[i]);
      const T1l = T1ll | 0;
      const sigma0h = rotrSH(Ah, Al, 28) ^ rotrBH(Ah, Al, 34) ^ rotrBH(Ah, Al, 39);
      const sigma0l = rotrSL(Ah, Al, 28) ^ rotrBL(Ah, Al, 34) ^ rotrBL(Ah, Al, 39);
      const MAJh = Ah & Bh ^ Ah & Ch ^ Bh & Ch;
      const MAJl = Al & Bl ^ Al & Cl ^ Bl & Cl;
      Hh = Gh | 0;
      Hl = Gl | 0;
      Gh = Fh | 0;
      Gl = Fl | 0;
      Fh = Eh | 0;
      Fl = El | 0;
      ({ h: Eh, l: El } = add(Dh | 0, Dl | 0, T1h | 0, T1l | 0));
      Dh = Ch | 0;
      Dl = Cl | 0;
      Ch = Bh | 0;
      Cl = Bl | 0;
      Bh = Ah | 0;
      Bl = Al | 0;
      const All = add3L(T1l, sigma0l, MAJl);
      Ah = add3H(All, T1h, sigma0h, MAJh);
      Al = All | 0;
    }
    ({ h: Ah, l: Al } = add(this.Ah | 0, this.Al | 0, Ah | 0, Al | 0));
    ({ h: Bh, l: Bl } = add(this.Bh | 0, this.Bl | 0, Bh | 0, Bl | 0));
    ({ h: Ch, l: Cl } = add(this.Ch | 0, this.Cl | 0, Ch | 0, Cl | 0));
    ({ h: Dh, l: Dl } = add(this.Dh | 0, this.Dl | 0, Dh | 0, Dl | 0));
    ({ h: Eh, l: El } = add(this.Eh | 0, this.El | 0, Eh | 0, El | 0));
    ({ h: Fh, l: Fl } = add(this.Fh | 0, this.Fl | 0, Fh | 0, Fl | 0));
    ({ h: Gh, l: Gl } = add(this.Gh | 0, this.Gl | 0, Gh | 0, Gl | 0));
    ({ h: Hh, l: Hl } = add(this.Hh | 0, this.Hl | 0, Hh | 0, Hl | 0));
    this.set(Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl);
  }
  roundClean() {
    clean(SHA512_W_H, SHA512_W_L);
  }
  destroy() {
    clean(this.buffer);
    this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
  }
};
var sha256 = /* @__PURE__ */ createHasher(() => new SHA256());
var sha512 = /* @__PURE__ */ createHasher(() => new SHA512());

// node_modules/@noble/hashes/esm/sha256.js
var sha2562 = sha256;

// src/hash.ts
function computeHash(input, algorithm = "blake3") {
  const bytes = new TextEncoder().encode(input);
  if (algorithm === "sha256") {
    return `sha256:${bytesToHex(sha2562(bytes))}`;
  }
  return `blake3:${bytesToHex(blake3(bytes))}`;
}
function detectAlgorithm(prefixedHash) {
  if (prefixedHash.startsWith("blake3:")) return "blake3";
  if (prefixedHash.startsWith("sha256:")) return "sha256";
  return "unknown";
}

// node_modules/@noble/curves/esm/utils.js
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
var _0n = /* @__PURE__ */ BigInt(0);
var _1n = /* @__PURE__ */ BigInt(1);
function _abool2(value, title = "") {
  if (typeof value !== "boolean") {
    const prefix = title && `"${title}"`;
    throw new Error(prefix + "expected boolean, got type=" + typeof value);
  }
  return value;
}
function _abytes2(value, length, title = "") {
  const bytes = isBytes(value);
  const len = value?.length;
  const needsLen = length !== void 0;
  if (!bytes || needsLen && len !== length) {
    const prefix = title && `"${title}" `;
    const ofLen = needsLen ? ` of length ${length}` : "";
    const got = bytes ? `length=${len}` : `type=${typeof value}`;
    throw new Error(prefix + "expected Uint8Array" + ofLen + ", got " + got);
  }
  return value;
}
function hexToNumber(hex) {
  if (typeof hex !== "string")
    throw new Error("hex string expected, got " + typeof hex);
  return hex === "" ? _0n : BigInt("0x" + hex);
}
function bytesToNumberBE(bytes) {
  return hexToNumber(bytesToHex(bytes));
}
function bytesToNumberLE(bytes) {
  abytes(bytes);
  return hexToNumber(bytesToHex(Uint8Array.from(bytes).reverse()));
}
function numberToBytesBE(n, len) {
  return hexToBytes(n.toString(16).padStart(len * 2, "0"));
}
function numberToBytesLE(n, len) {
  return numberToBytesBE(n, len).reverse();
}
function ensureBytes(title, hex, expectedLength) {
  let res;
  if (typeof hex === "string") {
    try {
      res = hexToBytes(hex);
    } catch (e) {
      throw new Error(title + " must be hex string or Uint8Array, cause: " + e);
    }
  } else if (isBytes(hex)) {
    res = Uint8Array.from(hex);
  } else {
    throw new Error(title + " must be hex string or Uint8Array");
  }
  const len = res.length;
  if (typeof expectedLength === "number" && len !== expectedLength)
    throw new Error(title + " of length " + expectedLength + " expected, got " + len);
  return res;
}
function equalBytes(a, b) {
  if (a.length !== b.length)
    return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++)
    diff |= a[i] ^ b[i];
  return diff === 0;
}
function copyBytes(bytes) {
  return Uint8Array.from(bytes);
}
var isPosBig = (n) => typeof n === "bigint" && _0n <= n;
function inRange(n, min, max) {
  return isPosBig(n) && isPosBig(min) && isPosBig(max) && min <= n && n < max;
}
function aInRange(title, n, min, max) {
  if (!inRange(n, min, max))
    throw new Error("expected valid " + title + ": " + min + " <= n < " + max + ", got " + n);
}
function bitLen(n) {
  let len;
  for (len = 0; n > _0n; n >>= _1n, len += 1)
    ;
  return len;
}
var bitMask = (n) => (_1n << BigInt(n)) - _1n;
function _validateObject(object, fields, optFields = {}) {
  if (!object || typeof object !== "object")
    throw new Error("expected valid options object");
  function checkField(fieldName, expectedType, isOpt) {
    const val = object[fieldName];
    if (isOpt && val === void 0)
      return;
    const current = typeof val;
    if (current !== expectedType || val === null)
      throw new Error(`param "${fieldName}" is invalid: expected ${expectedType}, got ${current}`);
  }
  Object.entries(fields).forEach(([k, v]) => checkField(k, v, false));
  Object.entries(optFields).forEach(([k, v]) => checkField(k, v, true));
}
var notImplemented = () => {
  throw new Error("not implemented");
};
function memoized(fn) {
  const map = /* @__PURE__ */ new WeakMap();
  return (arg, ...args) => {
    const val = map.get(arg);
    if (val !== void 0)
      return val;
    const computed = fn(arg, ...args);
    map.set(arg, computed);
    return computed;
  };
}

// node_modules/@noble/curves/esm/abstract/modular.js
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
var _0n2 = BigInt(0);
var _1n2 = BigInt(1);
var _2n = /* @__PURE__ */ BigInt(2);
var _3n = /* @__PURE__ */ BigInt(3);
var _4n = /* @__PURE__ */ BigInt(4);
var _5n = /* @__PURE__ */ BigInt(5);
var _7n = /* @__PURE__ */ BigInt(7);
var _8n = /* @__PURE__ */ BigInt(8);
var _9n = /* @__PURE__ */ BigInt(9);
var _16n = /* @__PURE__ */ BigInt(16);
function mod(a, b) {
  const result = a % b;
  return result >= _0n2 ? result : b + result;
}
function pow2(x, power, modulo) {
  let res = x;
  while (power-- > _0n2) {
    res *= res;
    res %= modulo;
  }
  return res;
}
function invert(number, modulo) {
  if (number === _0n2)
    throw new Error("invert: expected non-zero number");
  if (modulo <= _0n2)
    throw new Error("invert: expected positive modulus, got " + modulo);
  let a = mod(number, modulo);
  let b = modulo;
  let x = _0n2, y = _1n2, u = _1n2, v = _0n2;
  while (a !== _0n2) {
    const q = b / a;
    const r = b % a;
    const m = x - u * q;
    const n = y - v * q;
    b = a, a = r, x = u, y = v, u = m, v = n;
  }
  const gcd = b;
  if (gcd !== _1n2)
    throw new Error("invert: does not exist");
  return mod(x, modulo);
}
function assertIsSquare(Fp2, root, n) {
  if (!Fp2.eql(Fp2.sqr(root), n))
    throw new Error("Cannot find square root");
}
function sqrt3mod4(Fp2, n) {
  const p1div4 = (Fp2.ORDER + _1n2) / _4n;
  const root = Fp2.pow(n, p1div4);
  assertIsSquare(Fp2, root, n);
  return root;
}
function sqrt5mod8(Fp2, n) {
  const p5div8 = (Fp2.ORDER - _5n) / _8n;
  const n2 = Fp2.mul(n, _2n);
  const v = Fp2.pow(n2, p5div8);
  const nv = Fp2.mul(n, v);
  const i = Fp2.mul(Fp2.mul(nv, _2n), v);
  const root = Fp2.mul(nv, Fp2.sub(i, Fp2.ONE));
  assertIsSquare(Fp2, root, n);
  return root;
}
function sqrt9mod16(P) {
  const Fp_ = Field(P);
  const tn = tonelliShanks(P);
  const c1 = tn(Fp_, Fp_.neg(Fp_.ONE));
  const c2 = tn(Fp_, c1);
  const c3 = tn(Fp_, Fp_.neg(c1));
  const c4 = (P + _7n) / _16n;
  return (Fp2, n) => {
    let tv1 = Fp2.pow(n, c4);
    let tv2 = Fp2.mul(tv1, c1);
    const tv3 = Fp2.mul(tv1, c2);
    const tv4 = Fp2.mul(tv1, c3);
    const e1 = Fp2.eql(Fp2.sqr(tv2), n);
    const e2 = Fp2.eql(Fp2.sqr(tv3), n);
    tv1 = Fp2.cmov(tv1, tv2, e1);
    tv2 = Fp2.cmov(tv4, tv3, e2);
    const e3 = Fp2.eql(Fp2.sqr(tv2), n);
    const root = Fp2.cmov(tv1, tv2, e3);
    assertIsSquare(Fp2, root, n);
    return root;
  };
}
function tonelliShanks(P) {
  if (P < _3n)
    throw new Error("sqrt is not defined for small field");
  let Q = P - _1n2;
  let S = 0;
  while (Q % _2n === _0n2) {
    Q /= _2n;
    S++;
  }
  let Z = _2n;
  const _Fp = Field(P);
  while (FpLegendre(_Fp, Z) === 1) {
    if (Z++ > 1e3)
      throw new Error("Cannot find square root: probably non-prime P");
  }
  if (S === 1)
    return sqrt3mod4;
  let cc = _Fp.pow(Z, Q);
  const Q1div2 = (Q + _1n2) / _2n;
  return function tonelliSlow(Fp2, n) {
    if (Fp2.is0(n))
      return n;
    if (FpLegendre(Fp2, n) !== 1)
      throw new Error("Cannot find square root");
    let M = S;
    let c = Fp2.mul(Fp2.ONE, cc);
    let t = Fp2.pow(n, Q);
    let R = Fp2.pow(n, Q1div2);
    while (!Fp2.eql(t, Fp2.ONE)) {
      if (Fp2.is0(t))
        return Fp2.ZERO;
      let i = 1;
      let t_tmp = Fp2.sqr(t);
      while (!Fp2.eql(t_tmp, Fp2.ONE)) {
        i++;
        t_tmp = Fp2.sqr(t_tmp);
        if (i === M)
          throw new Error("Cannot find square root");
      }
      const exponent = _1n2 << BigInt(M - i - 1);
      const b = Fp2.pow(c, exponent);
      M = i;
      c = Fp2.sqr(b);
      t = Fp2.mul(t, c);
      R = Fp2.mul(R, b);
    }
    return R;
  };
}
function FpSqrt(P) {
  if (P % _4n === _3n)
    return sqrt3mod4;
  if (P % _8n === _5n)
    return sqrt5mod8;
  if (P % _16n === _9n)
    return sqrt9mod16(P);
  return tonelliShanks(P);
}
var isNegativeLE = (num, modulo) => (mod(num, modulo) & _1n2) === _1n2;
var FIELD_FIELDS = [
  "create",
  "isValid",
  "is0",
  "neg",
  "inv",
  "sqrt",
  "sqr",
  "eql",
  "add",
  "sub",
  "mul",
  "pow",
  "div",
  "addN",
  "subN",
  "mulN",
  "sqrN"
];
function validateField(field) {
  const initial = {
    ORDER: "bigint",
    MASK: "bigint",
    BYTES: "number",
    BITS: "number"
  };
  const opts = FIELD_FIELDS.reduce((map, val) => {
    map[val] = "function";
    return map;
  }, initial);
  _validateObject(field, opts);
  return field;
}
function FpPow(Fp2, num, power) {
  if (power < _0n2)
    throw new Error("invalid exponent, negatives unsupported");
  if (power === _0n2)
    return Fp2.ONE;
  if (power === _1n2)
    return num;
  let p = Fp2.ONE;
  let d = num;
  while (power > _0n2) {
    if (power & _1n2)
      p = Fp2.mul(p, d);
    d = Fp2.sqr(d);
    power >>= _1n2;
  }
  return p;
}
function FpInvertBatch(Fp2, nums, passZero = false) {
  const inverted = new Array(nums.length).fill(passZero ? Fp2.ZERO : void 0);
  const multipliedAcc = nums.reduce((acc, num, i) => {
    if (Fp2.is0(num))
      return acc;
    inverted[i] = acc;
    return Fp2.mul(acc, num);
  }, Fp2.ONE);
  const invertedAcc = Fp2.inv(multipliedAcc);
  nums.reduceRight((acc, num, i) => {
    if (Fp2.is0(num))
      return acc;
    inverted[i] = Fp2.mul(acc, inverted[i]);
    return Fp2.mul(acc, num);
  }, invertedAcc);
  return inverted;
}
function FpLegendre(Fp2, n) {
  const p1mod2 = (Fp2.ORDER - _1n2) / _2n;
  const powered = Fp2.pow(n, p1mod2);
  const yes = Fp2.eql(powered, Fp2.ONE);
  const zero = Fp2.eql(powered, Fp2.ZERO);
  const no = Fp2.eql(powered, Fp2.neg(Fp2.ONE));
  if (!yes && !zero && !no)
    throw new Error("invalid Legendre symbol result");
  return yes ? 1 : zero ? 0 : -1;
}
function nLength(n, nBitLength) {
  if (nBitLength !== void 0)
    anumber(nBitLength);
  const _nBitLength = nBitLength !== void 0 ? nBitLength : n.toString(2).length;
  const nByteLength = Math.ceil(_nBitLength / 8);
  return { nBitLength: _nBitLength, nByteLength };
}
function Field(ORDER, bitLenOrOpts, isLE2 = false, opts = {}) {
  if (ORDER <= _0n2)
    throw new Error("invalid field: expected ORDER > 0, got " + ORDER);
  let _nbitLength = void 0;
  let _sqrt = void 0;
  let modFromBytes = false;
  let allowedLengths = void 0;
  if (typeof bitLenOrOpts === "object" && bitLenOrOpts != null) {
    if (opts.sqrt || isLE2)
      throw new Error("cannot specify opts in two arguments");
    const _opts = bitLenOrOpts;
    if (_opts.BITS)
      _nbitLength = _opts.BITS;
    if (_opts.sqrt)
      _sqrt = _opts.sqrt;
    if (typeof _opts.isLE === "boolean")
      isLE2 = _opts.isLE;
    if (typeof _opts.modFromBytes === "boolean")
      modFromBytes = _opts.modFromBytes;
    allowedLengths = _opts.allowedLengths;
  } else {
    if (typeof bitLenOrOpts === "number")
      _nbitLength = bitLenOrOpts;
    if (opts.sqrt)
      _sqrt = opts.sqrt;
  }
  const { nBitLength: BITS, nByteLength: BYTES } = nLength(ORDER, _nbitLength);
  if (BYTES > 2048)
    throw new Error("invalid field: expected ORDER of <= 2048 bytes");
  let sqrtP;
  const f = Object.freeze({
    ORDER,
    isLE: isLE2,
    BITS,
    BYTES,
    MASK: bitMask(BITS),
    ZERO: _0n2,
    ONE: _1n2,
    allowedLengths,
    create: (num) => mod(num, ORDER),
    isValid: (num) => {
      if (typeof num !== "bigint")
        throw new Error("invalid field element: expected bigint, got " + typeof num);
      return _0n2 <= num && num < ORDER;
    },
    is0: (num) => num === _0n2,
    // is valid and invertible
    isValidNot0: (num) => !f.is0(num) && f.isValid(num),
    isOdd: (num) => (num & _1n2) === _1n2,
    neg: (num) => mod(-num, ORDER),
    eql: (lhs, rhs) => lhs === rhs,
    sqr: (num) => mod(num * num, ORDER),
    add: (lhs, rhs) => mod(lhs + rhs, ORDER),
    sub: (lhs, rhs) => mod(lhs - rhs, ORDER),
    mul: (lhs, rhs) => mod(lhs * rhs, ORDER),
    pow: (num, power) => FpPow(f, num, power),
    div: (lhs, rhs) => mod(lhs * invert(rhs, ORDER), ORDER),
    // Same as above, but doesn't normalize
    sqrN: (num) => num * num,
    addN: (lhs, rhs) => lhs + rhs,
    subN: (lhs, rhs) => lhs - rhs,
    mulN: (lhs, rhs) => lhs * rhs,
    inv: (num) => invert(num, ORDER),
    sqrt: _sqrt || ((n) => {
      if (!sqrtP)
        sqrtP = FpSqrt(ORDER);
      return sqrtP(f, n);
    }),
    toBytes: (num) => isLE2 ? numberToBytesLE(num, BYTES) : numberToBytesBE(num, BYTES),
    fromBytes: (bytes, skipValidation = true) => {
      if (allowedLengths) {
        if (!allowedLengths.includes(bytes.length) || bytes.length > BYTES) {
          throw new Error("Field.fromBytes: expected " + allowedLengths + " bytes, got " + bytes.length);
        }
        const padded = new Uint8Array(BYTES);
        padded.set(bytes, isLE2 ? 0 : padded.length - bytes.length);
        bytes = padded;
      }
      if (bytes.length !== BYTES)
        throw new Error("Field.fromBytes: expected " + BYTES + " bytes, got " + bytes.length);
      let scalar = isLE2 ? bytesToNumberLE(bytes) : bytesToNumberBE(bytes);
      if (modFromBytes)
        scalar = mod(scalar, ORDER);
      if (!skipValidation) {
        if (!f.isValid(scalar))
          throw new Error("invalid field element: outside of range 0..ORDER");
      }
      return scalar;
    },
    // TODO: we don't need it here, move out to separate fn
    invertBatch: (lst) => FpInvertBatch(f, lst),
    // We can't move this out because Fp6, Fp12 implement it
    // and it's unclear what to return in there.
    cmov: (a, b, c) => c ? b : a
  });
  return Object.freeze(f);
}

// node_modules/@noble/curves/esm/abstract/curve.js
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
var _0n3 = BigInt(0);
var _1n3 = BigInt(1);
function negateCt(condition, item) {
  const neg = item.negate();
  return condition ? neg : item;
}
function normalizeZ(c, points) {
  const invertedZs = FpInvertBatch(c.Fp, points.map((p) => p.Z));
  return points.map((p, i) => c.fromAffine(p.toAffine(invertedZs[i])));
}
function validateW(W, bits) {
  if (!Number.isSafeInteger(W) || W <= 0 || W > bits)
    throw new Error("invalid window size, expected [1.." + bits + "], got W=" + W);
}
function calcWOpts(W, scalarBits) {
  validateW(W, scalarBits);
  const windows = Math.ceil(scalarBits / W) + 1;
  const windowSize = 2 ** (W - 1);
  const maxNumber = 2 ** W;
  const mask = bitMask(W);
  const shiftBy = BigInt(W);
  return { windows, windowSize, mask, maxNumber, shiftBy };
}
function calcOffsets(n, window2, wOpts) {
  const { windowSize, mask, maxNumber, shiftBy } = wOpts;
  let wbits = Number(n & mask);
  let nextN = n >> shiftBy;
  if (wbits > windowSize) {
    wbits -= maxNumber;
    nextN += _1n3;
  }
  const offsetStart = window2 * windowSize;
  const offset = offsetStart + Math.abs(wbits) - 1;
  const isZero = wbits === 0;
  const isNeg = wbits < 0;
  const isNegF = window2 % 2 !== 0;
  const offsetF = offsetStart;
  return { nextN, offset, isZero, isNeg, isNegF, offsetF };
}
function validateMSMPoints(points, c) {
  if (!Array.isArray(points))
    throw new Error("array expected");
  points.forEach((p, i) => {
    if (!(p instanceof c))
      throw new Error("invalid point at index " + i);
  });
}
function validateMSMScalars(scalars, field) {
  if (!Array.isArray(scalars))
    throw new Error("array of scalars expected");
  scalars.forEach((s, i) => {
    if (!field.isValid(s))
      throw new Error("invalid scalar at index " + i);
  });
}
var pointPrecomputes = /* @__PURE__ */ new WeakMap();
var pointWindowSizes = /* @__PURE__ */ new WeakMap();
function getW(P) {
  return pointWindowSizes.get(P) || 1;
}
function assert0(n) {
  if (n !== _0n3)
    throw new Error("invalid wNAF");
}
var wNAF = class {
  // Parametrized with a given Point class (not individual point)
  constructor(Point, bits) {
    this.BASE = Point.BASE;
    this.ZERO = Point.ZERO;
    this.Fn = Point.Fn;
    this.bits = bits;
  }
  // non-const time multiplication ladder
  _unsafeLadder(elm, n, p = this.ZERO) {
    let d = elm;
    while (n > _0n3) {
      if (n & _1n3)
        p = p.add(d);
      d = d.double();
      n >>= _1n3;
    }
    return p;
  }
  /**
   * Creates a wNAF precomputation window. Used for caching.
   * Default window size is set by `utils.precompute()` and is equal to 8.
   * Number of precomputed points depends on the curve size:
   * 2^(𝑊−1) * (Math.ceil(𝑛 / 𝑊) + 1), where:
   * - 𝑊 is the window size
   * - 𝑛 is the bitlength of the curve order.
   * For a 256-bit curve and window size 8, the number of precomputed points is 128 * 33 = 4224.
   * @param point Point instance
   * @param W window size
   * @returns precomputed point tables flattened to a single array
   */
  precomputeWindow(point, W) {
    const { windows, windowSize } = calcWOpts(W, this.bits);
    const points = [];
    let p = point;
    let base = p;
    for (let window2 = 0; window2 < windows; window2++) {
      base = p;
      points.push(base);
      for (let i = 1; i < windowSize; i++) {
        base = base.add(p);
        points.push(base);
      }
      p = base.double();
    }
    return points;
  }
  /**
   * Implements ec multiplication using precomputed tables and w-ary non-adjacent form.
   * More compact implementation:
   * https://github.com/paulmillr/noble-secp256k1/blob/47cb1669b6e506ad66b35fe7d76132ae97465da2/index.ts#L502-L541
   * @returns real and fake (for const-time) points
   */
  wNAF(W, precomputes, n) {
    if (!this.Fn.isValid(n))
      throw new Error("invalid scalar");
    let p = this.ZERO;
    let f = this.BASE;
    const wo = calcWOpts(W, this.bits);
    for (let window2 = 0; window2 < wo.windows; window2++) {
      const { nextN, offset, isZero, isNeg, isNegF, offsetF } = calcOffsets(n, window2, wo);
      n = nextN;
      if (isZero) {
        f = f.add(negateCt(isNegF, precomputes[offsetF]));
      } else {
        p = p.add(negateCt(isNeg, precomputes[offset]));
      }
    }
    assert0(n);
    return { p, f };
  }
  /**
   * Implements ec unsafe (non const-time) multiplication using precomputed tables and w-ary non-adjacent form.
   * @param acc accumulator point to add result of multiplication
   * @returns point
   */
  wNAFUnsafe(W, precomputes, n, acc = this.ZERO) {
    const wo = calcWOpts(W, this.bits);
    for (let window2 = 0; window2 < wo.windows; window2++) {
      if (n === _0n3)
        break;
      const { nextN, offset, isZero, isNeg } = calcOffsets(n, window2, wo);
      n = nextN;
      if (isZero) {
        continue;
      } else {
        const item = precomputes[offset];
        acc = acc.add(isNeg ? item.negate() : item);
      }
    }
    assert0(n);
    return acc;
  }
  getPrecomputes(W, point, transform) {
    let comp = pointPrecomputes.get(point);
    if (!comp) {
      comp = this.precomputeWindow(point, W);
      if (W !== 1) {
        if (typeof transform === "function")
          comp = transform(comp);
        pointPrecomputes.set(point, comp);
      }
    }
    return comp;
  }
  cached(point, scalar, transform) {
    const W = getW(point);
    return this.wNAF(W, this.getPrecomputes(W, point, transform), scalar);
  }
  unsafe(point, scalar, transform, prev) {
    const W = getW(point);
    if (W === 1)
      return this._unsafeLadder(point, scalar, prev);
    return this.wNAFUnsafe(W, this.getPrecomputes(W, point, transform), scalar, prev);
  }
  // We calculate precomputes for elliptic curve point multiplication
  // using windowed method. This specifies window size and
  // stores precomputed values. Usually only base point would be precomputed.
  createCache(P, W) {
    validateW(W, this.bits);
    pointWindowSizes.set(P, W);
    pointPrecomputes.delete(P);
  }
  hasCache(elm) {
    return getW(elm) !== 1;
  }
};
function pippenger(c, fieldN, points, scalars) {
  validateMSMPoints(points, c);
  validateMSMScalars(scalars, fieldN);
  const plength = points.length;
  const slength = scalars.length;
  if (plength !== slength)
    throw new Error("arrays of points and scalars must have equal length");
  const zero = c.ZERO;
  const wbits = bitLen(BigInt(plength));
  let windowSize = 1;
  if (wbits > 12)
    windowSize = wbits - 3;
  else if (wbits > 4)
    windowSize = wbits - 2;
  else if (wbits > 0)
    windowSize = 2;
  const MASK = bitMask(windowSize);
  const buckets = new Array(Number(MASK) + 1).fill(zero);
  const lastBits = Math.floor((fieldN.BITS - 1) / windowSize) * windowSize;
  let sum = zero;
  for (let i = lastBits; i >= 0; i -= windowSize) {
    buckets.fill(zero);
    for (let j = 0; j < slength; j++) {
      const scalar = scalars[j];
      const wbits2 = Number(scalar >> BigInt(i) & MASK);
      buckets[wbits2] = buckets[wbits2].add(points[j]);
    }
    let resI = zero;
    for (let j = buckets.length - 1, sumI = zero; j > 0; j--) {
      sumI = sumI.add(buckets[j]);
      resI = resI.add(sumI);
    }
    sum = sum.add(resI);
    if (i !== 0)
      for (let j = 0; j < windowSize; j++)
        sum = sum.double();
  }
  return sum;
}
function createField(order, field, isLE2) {
  if (field) {
    if (field.ORDER !== order)
      throw new Error("Field.ORDER must match order: Fp == p, Fn == n");
    validateField(field);
    return field;
  } else {
    return Field(order, { isLE: isLE2 });
  }
}
function _createCurveFields(type, CURVE, curveOpts = {}, FpFnLE) {
  if (FpFnLE === void 0)
    FpFnLE = type === "edwards";
  if (!CURVE || typeof CURVE !== "object")
    throw new Error(`expected valid ${type} CURVE object`);
  for (const p of ["p", "n", "h"]) {
    const val = CURVE[p];
    if (!(typeof val === "bigint" && val > _0n3))
      throw new Error(`CURVE.${p} must be positive bigint`);
  }
  const Fp2 = createField(CURVE.p, curveOpts.Fp, FpFnLE);
  const Fn2 = createField(CURVE.n, curveOpts.Fn, FpFnLE);
  const _b = type === "weierstrass" ? "b" : "d";
  const params = ["Gx", "Gy", "a", _b];
  for (const p of params) {
    if (!Fp2.isValid(CURVE[p]))
      throw new Error(`CURVE.${p} must be valid field element of CURVE.Fp`);
  }
  CURVE = Object.freeze(Object.assign({}, CURVE));
  return { CURVE, Fp: Fp2, Fn: Fn2 };
}

// node_modules/@noble/curves/esm/abstract/edwards.js
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
var _0n4 = BigInt(0);
var _1n4 = BigInt(1);
var _2n2 = BigInt(2);
var _8n2 = BigInt(8);
function isEdValidXY(Fp2, CURVE, x, y) {
  const x2 = Fp2.sqr(x);
  const y2 = Fp2.sqr(y);
  const left = Fp2.add(Fp2.mul(CURVE.a, x2), y2);
  const right = Fp2.add(Fp2.ONE, Fp2.mul(CURVE.d, Fp2.mul(x2, y2)));
  return Fp2.eql(left, right);
}
function edwards(params, extraOpts = {}) {
  const validated = _createCurveFields("edwards", params, extraOpts, extraOpts.FpFnLE);
  const { Fp: Fp2, Fn: Fn2 } = validated;
  let CURVE = validated.CURVE;
  const { h: cofactor } = CURVE;
  _validateObject(extraOpts, {}, { uvRatio: "function" });
  const MASK = _2n2 << BigInt(Fn2.BYTES * 8) - _1n4;
  const modP = (n) => Fp2.create(n);
  const uvRatio2 = extraOpts.uvRatio || ((u, v) => {
    try {
      return { isValid: true, value: Fp2.sqrt(Fp2.div(u, v)) };
    } catch (e) {
      return { isValid: false, value: _0n4 };
    }
  });
  if (!isEdValidXY(Fp2, CURVE, CURVE.Gx, CURVE.Gy))
    throw new Error("bad curve params: generator point");
  function acoord(title, n, banZero = false) {
    const min = banZero ? _1n4 : _0n4;
    aInRange("coordinate " + title, n, min, MASK);
    return n;
  }
  function aextpoint(other) {
    if (!(other instanceof Point))
      throw new Error("ExtendedPoint expected");
  }
  const toAffineMemo = memoized((p, iz) => {
    const { X, Y, Z } = p;
    const is0 = p.is0();
    if (iz == null)
      iz = is0 ? _8n2 : Fp2.inv(Z);
    const x = modP(X * iz);
    const y = modP(Y * iz);
    const zz = Fp2.mul(Z, iz);
    if (is0)
      return { x: _0n4, y: _1n4 };
    if (zz !== _1n4)
      throw new Error("invZ was invalid");
    return { x, y };
  });
  const assertValidMemo = memoized((p) => {
    const { a, d } = CURVE;
    if (p.is0())
      throw new Error("bad point: ZERO");
    const { X, Y, Z, T } = p;
    const X2 = modP(X * X);
    const Y2 = modP(Y * Y);
    const Z2 = modP(Z * Z);
    const Z4 = modP(Z2 * Z2);
    const aX2 = modP(X2 * a);
    const left = modP(Z2 * modP(aX2 + Y2));
    const right = modP(Z4 + modP(d * modP(X2 * Y2)));
    if (left !== right)
      throw new Error("bad point: equation left != right (1)");
    const XY = modP(X * Y);
    const ZT = modP(Z * T);
    if (XY !== ZT)
      throw new Error("bad point: equation left != right (2)");
    return true;
  });
  class Point {
    constructor(X, Y, Z, T) {
      this.X = acoord("x", X);
      this.Y = acoord("y", Y);
      this.Z = acoord("z", Z, true);
      this.T = acoord("t", T);
      Object.freeze(this);
    }
    static CURVE() {
      return CURVE;
    }
    static fromAffine(p) {
      if (p instanceof Point)
        throw new Error("extended point not allowed");
      const { x, y } = p || {};
      acoord("x", x);
      acoord("y", y);
      return new Point(x, y, _1n4, modP(x * y));
    }
    // Uses algo from RFC8032 5.1.3.
    static fromBytes(bytes, zip215 = false) {
      const len = Fp2.BYTES;
      const { a, d } = CURVE;
      bytes = copyBytes(_abytes2(bytes, len, "point"));
      _abool2(zip215, "zip215");
      const normed = copyBytes(bytes);
      const lastByte = bytes[len - 1];
      normed[len - 1] = lastByte & ~128;
      const y = bytesToNumberLE(normed);
      const max = zip215 ? MASK : Fp2.ORDER;
      aInRange("point.y", y, _0n4, max);
      const y2 = modP(y * y);
      const u = modP(y2 - _1n4);
      const v = modP(d * y2 - a);
      let { isValid, value: x } = uvRatio2(u, v);
      if (!isValid)
        throw new Error("bad point: invalid y coordinate");
      const isXOdd = (x & _1n4) === _1n4;
      const isLastByteOdd = (lastByte & 128) !== 0;
      if (!zip215 && x === _0n4 && isLastByteOdd)
        throw new Error("bad point: x=0 and x_0=1");
      if (isLastByteOdd !== isXOdd)
        x = modP(-x);
      return Point.fromAffine({ x, y });
    }
    static fromHex(bytes, zip215 = false) {
      return Point.fromBytes(ensureBytes("point", bytes), zip215);
    }
    get x() {
      return this.toAffine().x;
    }
    get y() {
      return this.toAffine().y;
    }
    precompute(windowSize = 8, isLazy = true) {
      wnaf.createCache(this, windowSize);
      if (!isLazy)
        this.multiply(_2n2);
      return this;
    }
    // Useful in fromAffine() - not for fromBytes(), which always created valid points.
    assertValidity() {
      assertValidMemo(this);
    }
    // Compare one point to another.
    equals(other) {
      aextpoint(other);
      const { X: X1, Y: Y1, Z: Z1 } = this;
      const { X: X2, Y: Y2, Z: Z2 } = other;
      const X1Z2 = modP(X1 * Z2);
      const X2Z1 = modP(X2 * Z1);
      const Y1Z2 = modP(Y1 * Z2);
      const Y2Z1 = modP(Y2 * Z1);
      return X1Z2 === X2Z1 && Y1Z2 === Y2Z1;
    }
    is0() {
      return this.equals(Point.ZERO);
    }
    negate() {
      return new Point(modP(-this.X), this.Y, this.Z, modP(-this.T));
    }
    // Fast algo for doubling Extended Point.
    // https://hyperelliptic.org/EFD/g1p/auto-twisted-extended.html#doubling-dbl-2008-hwcd
    // Cost: 4M + 4S + 1*a + 6add + 1*2.
    double() {
      const { a } = CURVE;
      const { X: X1, Y: Y1, Z: Z1 } = this;
      const A = modP(X1 * X1);
      const B = modP(Y1 * Y1);
      const C = modP(_2n2 * modP(Z1 * Z1));
      const D = modP(a * A);
      const x1y1 = X1 + Y1;
      const E = modP(modP(x1y1 * x1y1) - A - B);
      const G = D + B;
      const F = G - C;
      const H = D - B;
      const X3 = modP(E * F);
      const Y3 = modP(G * H);
      const T3 = modP(E * H);
      const Z3 = modP(F * G);
      return new Point(X3, Y3, Z3, T3);
    }
    // Fast algo for adding 2 Extended Points.
    // https://hyperelliptic.org/EFD/g1p/auto-twisted-extended.html#addition-add-2008-hwcd
    // Cost: 9M + 1*a + 1*d + 7add.
    add(other) {
      aextpoint(other);
      const { a, d } = CURVE;
      const { X: X1, Y: Y1, Z: Z1, T: T1 } = this;
      const { X: X2, Y: Y2, Z: Z2, T: T2 } = other;
      const A = modP(X1 * X2);
      const B = modP(Y1 * Y2);
      const C = modP(T1 * d * T2);
      const D = modP(Z1 * Z2);
      const E = modP((X1 + Y1) * (X2 + Y2) - A - B);
      const F = D - C;
      const G = D + C;
      const H = modP(B - a * A);
      const X3 = modP(E * F);
      const Y3 = modP(G * H);
      const T3 = modP(E * H);
      const Z3 = modP(F * G);
      return new Point(X3, Y3, Z3, T3);
    }
    subtract(other) {
      return this.add(other.negate());
    }
    // Constant-time multiplication.
    multiply(scalar) {
      if (!Fn2.isValidNot0(scalar))
        throw new Error("invalid scalar: expected 1 <= sc < curve.n");
      const { p, f } = wnaf.cached(this, scalar, (p2) => normalizeZ(Point, p2));
      return normalizeZ(Point, [p, f])[0];
    }
    // Non-constant-time multiplication. Uses double-and-add algorithm.
    // It's faster, but should only be used when you don't care about
    // an exposed private key e.g. sig verification.
    // Does NOT allow scalars higher than CURVE.n.
    // Accepts optional accumulator to merge with multiply (important for sparse scalars)
    multiplyUnsafe(scalar, acc = Point.ZERO) {
      if (!Fn2.isValid(scalar))
        throw new Error("invalid scalar: expected 0 <= sc < curve.n");
      if (scalar === _0n4)
        return Point.ZERO;
      if (this.is0() || scalar === _1n4)
        return this;
      return wnaf.unsafe(this, scalar, (p) => normalizeZ(Point, p), acc);
    }
    // Checks if point is of small order.
    // If you add something to small order point, you will have "dirty"
    // point with torsion component.
    // Multiplies point by cofactor and checks if the result is 0.
    isSmallOrder() {
      return this.multiplyUnsafe(cofactor).is0();
    }
    // Multiplies point by curve order and checks if the result is 0.
    // Returns `false` is the point is dirty.
    isTorsionFree() {
      return wnaf.unsafe(this, CURVE.n).is0();
    }
    // Converts Extended point to default (x, y) coordinates.
    // Can accept precomputed Z^-1 - for example, from invertBatch.
    toAffine(invertedZ) {
      return toAffineMemo(this, invertedZ);
    }
    clearCofactor() {
      if (cofactor === _1n4)
        return this;
      return this.multiplyUnsafe(cofactor);
    }
    toBytes() {
      const { x, y } = this.toAffine();
      const bytes = Fp2.toBytes(y);
      bytes[bytes.length - 1] |= x & _1n4 ? 128 : 0;
      return bytes;
    }
    toHex() {
      return bytesToHex(this.toBytes());
    }
    toString() {
      return `<Point ${this.is0() ? "ZERO" : this.toHex()}>`;
    }
    // TODO: remove
    get ex() {
      return this.X;
    }
    get ey() {
      return this.Y;
    }
    get ez() {
      return this.Z;
    }
    get et() {
      return this.T;
    }
    static normalizeZ(points) {
      return normalizeZ(Point, points);
    }
    static msm(points, scalars) {
      return pippenger(Point, Fn2, points, scalars);
    }
    _setWindowSize(windowSize) {
      this.precompute(windowSize);
    }
    toRawBytes() {
      return this.toBytes();
    }
  }
  Point.BASE = new Point(CURVE.Gx, CURVE.Gy, _1n4, modP(CURVE.Gx * CURVE.Gy));
  Point.ZERO = new Point(_0n4, _1n4, _1n4, _0n4);
  Point.Fp = Fp2;
  Point.Fn = Fn2;
  const wnaf = new wNAF(Point, Fn2.BITS);
  Point.BASE.precompute(8);
  return Point;
}
var PrimeEdwardsPoint = class {
  constructor(ep) {
    this.ep = ep;
  }
  // Static methods that must be implemented by subclasses
  static fromBytes(_bytes) {
    notImplemented();
  }
  static fromHex(_hex) {
    notImplemented();
  }
  get x() {
    return this.toAffine().x;
  }
  get y() {
    return this.toAffine().y;
  }
  // Common implementations
  clearCofactor() {
    return this;
  }
  assertValidity() {
    this.ep.assertValidity();
  }
  toAffine(invertedZ) {
    return this.ep.toAffine(invertedZ);
  }
  toHex() {
    return bytesToHex(this.toBytes());
  }
  toString() {
    return this.toHex();
  }
  isTorsionFree() {
    return true;
  }
  isSmallOrder() {
    return false;
  }
  add(other) {
    this.assertSame(other);
    return this.init(this.ep.add(other.ep));
  }
  subtract(other) {
    this.assertSame(other);
    return this.init(this.ep.subtract(other.ep));
  }
  multiply(scalar) {
    return this.init(this.ep.multiply(scalar));
  }
  multiplyUnsafe(scalar) {
    return this.init(this.ep.multiplyUnsafe(scalar));
  }
  double() {
    return this.init(this.ep.double());
  }
  negate() {
    return this.init(this.ep.negate());
  }
  precompute(windowSize, isLazy) {
    return this.init(this.ep.precompute(windowSize, isLazy));
  }
  /** @deprecated use `toBytes` */
  toRawBytes() {
    return this.toBytes();
  }
};
function eddsa(Point, cHash, eddsaOpts = {}) {
  if (typeof cHash !== "function")
    throw new Error('"hash" function param is required');
  _validateObject(eddsaOpts, {}, {
    adjustScalarBytes: "function",
    randomBytes: "function",
    domain: "function",
    prehash: "function",
    mapToCurve: "function"
  });
  const { prehash } = eddsaOpts;
  const { BASE, Fp: Fp2, Fn: Fn2 } = Point;
  const randomBytes2 = eddsaOpts.randomBytes || randomBytes;
  const adjustScalarBytes2 = eddsaOpts.adjustScalarBytes || ((bytes) => bytes);
  const domain = eddsaOpts.domain || ((data, ctx, phflag) => {
    _abool2(phflag, "phflag");
    if (ctx.length || phflag)
      throw new Error("Contexts/pre-hash are not supported");
    return data;
  });
  function modN_LE(hash) {
    return Fn2.create(bytesToNumberLE(hash));
  }
  function getPrivateScalar(key) {
    const len = lengths.secretKey;
    key = ensureBytes("private key", key, len);
    const hashed = ensureBytes("hashed private key", cHash(key), 2 * len);
    const head = adjustScalarBytes2(hashed.slice(0, len));
    const prefix = hashed.slice(len, 2 * len);
    const scalar = modN_LE(head);
    return { head, prefix, scalar };
  }
  function getExtendedPublicKey(secretKey) {
    const { head, prefix, scalar } = getPrivateScalar(secretKey);
    const point = BASE.multiply(scalar);
    const pointBytes = point.toBytes();
    return { head, prefix, scalar, point, pointBytes };
  }
  function getPublicKey(secretKey) {
    return getExtendedPublicKey(secretKey).pointBytes;
  }
  function hashDomainToScalar(context = Uint8Array.of(), ...msgs) {
    const msg = concatBytes(...msgs);
    return modN_LE(cHash(domain(msg, ensureBytes("context", context), !!prehash)));
  }
  function sign(msg, secretKey, options = {}) {
    msg = ensureBytes("message", msg);
    if (prehash)
      msg = prehash(msg);
    const { prefix, scalar, pointBytes } = getExtendedPublicKey(secretKey);
    const r = hashDomainToScalar(options.context, prefix, msg);
    const R = BASE.multiply(r).toBytes();
    const k = hashDomainToScalar(options.context, R, pointBytes, msg);
    const s = Fn2.create(r + k * scalar);
    if (!Fn2.isValid(s))
      throw new Error("sign failed: invalid s");
    const rs = concatBytes(R, Fn2.toBytes(s));
    return _abytes2(rs, lengths.signature, "result");
  }
  const verifyOpts = { zip215: true };
  function verify(sig, msg, publicKey, options = verifyOpts) {
    const { context, zip215 } = options;
    const len = lengths.signature;
    sig = ensureBytes("signature", sig, len);
    msg = ensureBytes("message", msg);
    publicKey = ensureBytes("publicKey", publicKey, lengths.publicKey);
    if (zip215 !== void 0)
      _abool2(zip215, "zip215");
    if (prehash)
      msg = prehash(msg);
    const mid = len / 2;
    const r = sig.subarray(0, mid);
    const s = bytesToNumberLE(sig.subarray(mid, len));
    let A, R, SB;
    try {
      A = Point.fromBytes(publicKey, zip215);
      R = Point.fromBytes(r, zip215);
      SB = BASE.multiplyUnsafe(s);
    } catch (error) {
      return false;
    }
    if (!zip215 && A.isSmallOrder())
      return false;
    const k = hashDomainToScalar(context, R.toBytes(), A.toBytes(), msg);
    const RkA = R.add(A.multiplyUnsafe(k));
    return RkA.subtract(SB).clearCofactor().is0();
  }
  const _size = Fp2.BYTES;
  const lengths = {
    secretKey: _size,
    publicKey: _size,
    signature: 2 * _size,
    seed: _size
  };
  function randomSecretKey(seed = randomBytes2(lengths.seed)) {
    return _abytes2(seed, lengths.seed, "seed");
  }
  function keygen(seed) {
    const secretKey = utils.randomSecretKey(seed);
    return { secretKey, publicKey: getPublicKey(secretKey) };
  }
  function isValidSecretKey(key) {
    return isBytes(key) && key.length === Fn2.BYTES;
  }
  function isValidPublicKey(key, zip215) {
    try {
      return !!Point.fromBytes(key, zip215);
    } catch (error) {
      return false;
    }
  }
  const utils = {
    getExtendedPublicKey,
    randomSecretKey,
    isValidSecretKey,
    isValidPublicKey,
    /**
     * Converts ed public key to x public key. Uses formula:
     * - ed25519:
     *   - `(u, v) = ((1+y)/(1-y), sqrt(-486664)*u/x)`
     *   - `(x, y) = (sqrt(-486664)*u/v, (u-1)/(u+1))`
     * - ed448:
     *   - `(u, v) = ((y-1)/(y+1), sqrt(156324)*u/x)`
     *   - `(x, y) = (sqrt(156324)*u/v, (1+u)/(1-u))`
     */
    toMontgomery(publicKey) {
      const { y } = Point.fromBytes(publicKey);
      const size = lengths.publicKey;
      const is25519 = size === 32;
      if (!is25519 && size !== 57)
        throw new Error("only defined for 25519 and 448");
      const u = is25519 ? Fp2.div(_1n4 + y, _1n4 - y) : Fp2.div(y - _1n4, y + _1n4);
      return Fp2.toBytes(u);
    },
    toMontgomerySecret(secretKey) {
      const size = lengths.secretKey;
      _abytes2(secretKey, size);
      const hashed = cHash(secretKey.subarray(0, size));
      return adjustScalarBytes2(hashed).subarray(0, size);
    },
    /** @deprecated */
    randomPrivateKey: randomSecretKey,
    /** @deprecated */
    precompute(windowSize = 8, point = Point.BASE) {
      return point.precompute(windowSize, false);
    }
  };
  return Object.freeze({
    keygen,
    getPublicKey,
    sign,
    verify,
    utils,
    Point,
    lengths
  });
}
function _eddsa_legacy_opts_to_new(c) {
  const CURVE = {
    a: c.a,
    d: c.d,
    p: c.Fp.ORDER,
    n: c.n,
    h: c.h,
    Gx: c.Gx,
    Gy: c.Gy
  };
  const Fp2 = c.Fp;
  const Fn2 = Field(CURVE.n, c.nBitLength, true);
  const curveOpts = { Fp: Fp2, Fn: Fn2, uvRatio: c.uvRatio };
  const eddsaOpts = {
    randomBytes: c.randomBytes,
    adjustScalarBytes: c.adjustScalarBytes,
    domain: c.domain,
    prehash: c.prehash,
    mapToCurve: c.mapToCurve
  };
  return { CURVE, curveOpts, hash: c.hash, eddsaOpts };
}
function _eddsa_new_output_to_legacy(c, eddsa2) {
  const Point = eddsa2.Point;
  const legacy = Object.assign({}, eddsa2, {
    ExtendedPoint: Point,
    CURVE: c,
    nBitLength: Point.Fn.BITS,
    nByteLength: Point.Fn.BYTES
  });
  return legacy;
}
function twistedEdwards(c) {
  const { CURVE, curveOpts, hash, eddsaOpts } = _eddsa_legacy_opts_to_new(c);
  const Point = edwards(CURVE, curveOpts);
  const EDDSA = eddsa(Point, hash, eddsaOpts);
  return _eddsa_new_output_to_legacy(c, EDDSA);
}

// node_modules/@noble/curves/esm/ed25519.js
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
var _0n5 = /* @__PURE__ */ BigInt(0);
var _1n5 = BigInt(1);
var _2n3 = BigInt(2);
var _3n2 = BigInt(3);
var _5n2 = BigInt(5);
var _8n3 = BigInt(8);
var ed25519_CURVE_p = BigInt("0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffed");
var ed25519_CURVE = /* @__PURE__ */ (() => ({
  p: ed25519_CURVE_p,
  n: BigInt("0x1000000000000000000000000000000014def9dea2f79cd65812631a5cf5d3ed"),
  h: _8n3,
  a: BigInt("0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffec"),
  d: BigInt("0x52036cee2b6ffe738cc740797779e89800700a4d4141d8ab75eb4dca135978a3"),
  Gx: BigInt("0x216936d3cd6e53fec0a4e231fdd6dc5c692cc7609525a7b2c9562d608f25d51a"),
  Gy: BigInt("0x6666666666666666666666666666666666666666666666666666666666666658")
}))();
function ed25519_pow_2_252_3(x) {
  const _10n = BigInt(10), _20n = BigInt(20), _40n = BigInt(40), _80n = BigInt(80);
  const P = ed25519_CURVE_p;
  const x2 = x * x % P;
  const b2 = x2 * x % P;
  const b4 = pow2(b2, _2n3, P) * b2 % P;
  const b5 = pow2(b4, _1n5, P) * x % P;
  const b10 = pow2(b5, _5n2, P) * b5 % P;
  const b20 = pow2(b10, _10n, P) * b10 % P;
  const b40 = pow2(b20, _20n, P) * b20 % P;
  const b80 = pow2(b40, _40n, P) * b40 % P;
  const b160 = pow2(b80, _80n, P) * b80 % P;
  const b240 = pow2(b160, _80n, P) * b80 % P;
  const b250 = pow2(b240, _10n, P) * b10 % P;
  const pow_p_5_8 = pow2(b250, _2n3, P) * x % P;
  return { pow_p_5_8, b2 };
}
function adjustScalarBytes(bytes) {
  bytes[0] &= 248;
  bytes[31] &= 127;
  bytes[31] |= 64;
  return bytes;
}
var ED25519_SQRT_M1 = /* @__PURE__ */ BigInt("19681161376707505956807079304988542015446066515923890162744021073123829784752");
function uvRatio(u, v) {
  const P = ed25519_CURVE_p;
  const v3 = mod(v * v * v, P);
  const v7 = mod(v3 * v3 * v, P);
  const pow = ed25519_pow_2_252_3(u * v7).pow_p_5_8;
  let x = mod(u * v3 * pow, P);
  const vx2 = mod(v * x * x, P);
  const root1 = x;
  const root2 = mod(x * ED25519_SQRT_M1, P);
  const useRoot1 = vx2 === u;
  const useRoot2 = vx2 === mod(-u, P);
  const noRoot = vx2 === mod(-u * ED25519_SQRT_M1, P);
  if (useRoot1)
    x = root1;
  if (useRoot2 || noRoot)
    x = root2;
  if (isNegativeLE(x, P))
    x = mod(-x, P);
  return { isValid: useRoot1 || useRoot2, value: x };
}
var Fp = /* @__PURE__ */ (() => Field(ed25519_CURVE.p, { isLE: true }))();
var Fn = /* @__PURE__ */ (() => Field(ed25519_CURVE.n, { isLE: true }))();
var ed25519Defaults = /* @__PURE__ */ (() => ({
  ...ed25519_CURVE,
  Fp,
  hash: sha512,
  adjustScalarBytes,
  // dom2
  // Ratio of u to v. Allows us to combine inversion and square root. Uses algo from RFC8032 5.1.3.
  // Constant-time, u/√v
  uvRatio
}))();
var ed25519 = /* @__PURE__ */ (() => twistedEdwards(ed25519Defaults))();
var SQRT_M1 = ED25519_SQRT_M1;
var SQRT_AD_MINUS_ONE = /* @__PURE__ */ BigInt("25063068953384623474111414158702152701244531502492656460079210482610430750235");
var INVSQRT_A_MINUS_D = /* @__PURE__ */ BigInt("54469307008909316920995813868745141605393597292927456921205312896311721017578");
var ONE_MINUS_D_SQ = /* @__PURE__ */ BigInt("1159843021668779879193775521855586647937357759715417654439879720876111806838");
var D_MINUS_ONE_SQ = /* @__PURE__ */ BigInt("40440834346308536858101042469323190826248399146238708352240133220865137265952");
var invertSqrt = (number) => uvRatio(_1n5, number);
var MAX_255B = /* @__PURE__ */ BigInt("0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff");
var bytes255ToNumberLE = (bytes) => ed25519.Point.Fp.create(bytesToNumberLE(bytes) & MAX_255B);
function calcElligatorRistrettoMap(r0) {
  const { d } = ed25519_CURVE;
  const P = ed25519_CURVE_p;
  const mod2 = (n) => Fp.create(n);
  const r = mod2(SQRT_M1 * r0 * r0);
  const Ns = mod2((r + _1n5) * ONE_MINUS_D_SQ);
  let c = BigInt(-1);
  const D = mod2((c - d * r) * mod2(r + d));
  let { isValid: Ns_D_is_sq, value: s } = uvRatio(Ns, D);
  let s_ = mod2(s * r0);
  if (!isNegativeLE(s_, P))
    s_ = mod2(-s_);
  if (!Ns_D_is_sq)
    s = s_;
  if (!Ns_D_is_sq)
    c = r;
  const Nt = mod2(c * (r - _1n5) * D_MINUS_ONE_SQ - D);
  const s2 = s * s;
  const W0 = mod2((s + s) * D);
  const W1 = mod2(Nt * SQRT_AD_MINUS_ONE);
  const W2 = mod2(_1n5 - s2);
  const W3 = mod2(_1n5 + s2);
  return new ed25519.Point(mod2(W0 * W3), mod2(W2 * W1), mod2(W1 * W3), mod2(W0 * W2));
}
function ristretto255_map(bytes) {
  abytes(bytes, 64);
  const r1 = bytes255ToNumberLE(bytes.subarray(0, 32));
  const R1 = calcElligatorRistrettoMap(r1);
  const r2 = bytes255ToNumberLE(bytes.subarray(32, 64));
  const R2 = calcElligatorRistrettoMap(r2);
  return new _RistrettoPoint(R1.add(R2));
}
var _RistrettoPoint = class __RistrettoPoint extends PrimeEdwardsPoint {
  constructor(ep) {
    super(ep);
  }
  static fromAffine(ap) {
    return new __RistrettoPoint(ed25519.Point.fromAffine(ap));
  }
  assertSame(other) {
    if (!(other instanceof __RistrettoPoint))
      throw new Error("RistrettoPoint expected");
  }
  init(ep) {
    return new __RistrettoPoint(ep);
  }
  /** @deprecated use `import { ristretto255_hasher } from '@noble/curves/ed25519.js';` */
  static hashToCurve(hex) {
    return ristretto255_map(ensureBytes("ristrettoHash", hex, 64));
  }
  static fromBytes(bytes) {
    abytes(bytes, 32);
    const { a, d } = ed25519_CURVE;
    const P = ed25519_CURVE_p;
    const mod2 = (n) => Fp.create(n);
    const s = bytes255ToNumberLE(bytes);
    if (!equalBytes(Fp.toBytes(s), bytes) || isNegativeLE(s, P))
      throw new Error("invalid ristretto255 encoding 1");
    const s2 = mod2(s * s);
    const u1 = mod2(_1n5 + a * s2);
    const u2 = mod2(_1n5 - a * s2);
    const u1_2 = mod2(u1 * u1);
    const u2_2 = mod2(u2 * u2);
    const v = mod2(a * d * u1_2 - u2_2);
    const { isValid, value: I } = invertSqrt(mod2(v * u2_2));
    const Dx = mod2(I * u2);
    const Dy = mod2(I * Dx * v);
    let x = mod2((s + s) * Dx);
    if (isNegativeLE(x, P))
      x = mod2(-x);
    const y = mod2(u1 * Dy);
    const t = mod2(x * y);
    if (!isValid || isNegativeLE(t, P) || y === _0n5)
      throw new Error("invalid ristretto255 encoding 2");
    return new __RistrettoPoint(new ed25519.Point(x, y, _1n5, t));
  }
  /**
   * Converts ristretto-encoded string to ristretto point.
   * Described in [RFC9496](https://www.rfc-editor.org/rfc/rfc9496#name-decode).
   * @param hex Ristretto-encoded 32 bytes. Not every 32-byte string is valid ristretto encoding
   */
  static fromHex(hex) {
    return __RistrettoPoint.fromBytes(ensureBytes("ristrettoHex", hex, 32));
  }
  static msm(points, scalars) {
    return pippenger(__RistrettoPoint, ed25519.Point.Fn, points, scalars);
  }
  /**
   * Encodes ristretto point to Uint8Array.
   * Described in [RFC9496](https://www.rfc-editor.org/rfc/rfc9496#name-encode).
   */
  toBytes() {
    let { X, Y, Z, T } = this.ep;
    const P = ed25519_CURVE_p;
    const mod2 = (n) => Fp.create(n);
    const u1 = mod2(mod2(Z + Y) * mod2(Z - Y));
    const u2 = mod2(X * Y);
    const u2sq = mod2(u2 * u2);
    const { value: invsqrt } = invertSqrt(mod2(u1 * u2sq));
    const D1 = mod2(invsqrt * u1);
    const D2 = mod2(invsqrt * u2);
    const zInv = mod2(D1 * D2 * T);
    let D;
    if (isNegativeLE(T * zInv, P)) {
      let _x = mod2(Y * SQRT_M1);
      let _y = mod2(X * SQRT_M1);
      X = _x;
      Y = _y;
      D = mod2(D1 * INVSQRT_A_MINUS_D);
    } else {
      D = D2;
    }
    if (isNegativeLE(X * zInv, P))
      Y = mod2(-Y);
    let s = mod2((Z - Y) * D);
    if (isNegativeLE(s, P))
      s = mod2(-s);
    return Fp.toBytes(s);
  }
  /**
   * Compares two Ristretto points.
   * Described in [RFC9496](https://www.rfc-editor.org/rfc/rfc9496#name-equals).
   */
  equals(other) {
    this.assertSame(other);
    const { X: X1, Y: Y1 } = this.ep;
    const { X: X2, Y: Y2 } = other.ep;
    const mod2 = (n) => Fp.create(n);
    const one = mod2(X1 * Y2) === mod2(Y1 * X2);
    const two = mod2(Y1 * Y2) === mod2(X1 * X2);
    return one || two;
  }
  is0() {
    return this.equals(__RistrettoPoint.ZERO);
  }
};
_RistrettoPoint.BASE = /* @__PURE__ */ (() => new _RistrettoPoint(ed25519.Point.BASE))();
_RistrettoPoint.ZERO = /* @__PURE__ */ (() => new _RistrettoPoint(ed25519.Point.ZERO))();
_RistrettoPoint.Fp = /* @__PURE__ */ (() => Fp)();
_RistrettoPoint.Fn = /* @__PURE__ */ (() => Fn)();

// src/signature.ts
function verifySignature(signatureB64, message, publicKeyB64) {
  try {
    const signature = base64ToBytes(signatureB64);
    const publicKey = base64ToBytes(publicKeyB64);
    const messageBytes = new TextEncoder().encode(message);
    return ed25519.verify(signature, messageBytes, publicKey);
  } catch {
    return false;
  }
}
function base64ToBytes(b64) {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// src/verify.ts
function verifyReceipt(receipt) {
  const breaks = [];
  const payload = buildCanonicalPayload(receipt);
  const canonicalJson = canonicalStringify(payload);
  const algorithm = detectAlgorithm(receipt.receiptHash);
  let computedHash;
  if (algorithm === "unknown") {
    breaks.push({
      receiptId: receipt.receiptId,
      snapshotId: receipt.snapshotId,
      reason: `Unknown hash algorithm prefix in receiptHash: ${receipt.receiptHash}`
    });
    computedHash = "";
  } else {
    computedHash = computeHash(canonicalJson, algorithm);
  }
  const hashMatch = computedHash === receipt.receiptHash;
  if (!hashMatch && algorithm !== "unknown") {
    breaks.push({
      receiptId: receipt.receiptId,
      snapshotId: receipt.snapshotId,
      reason: "Hash mismatch: recomputed hash does not match stored receiptHash",
      expected: receipt.receiptHash,
      actual: computedHash
    });
  }
  let signatureValid = null;
  if (receipt.signature) {
    signatureValid = verifySignature(
      receipt.signature.sigB64,
      receipt.receiptHash,
      receipt.signature.pubB64
    );
    if (!signatureValid) {
      breaks.push({
        receiptId: receipt.receiptId,
        snapshotId: receipt.snapshotId,
        reason: "Signature verification failed"
      });
    }
  }
  return {
    valid: breaks.length === 0,
    receiptId: receipt.receiptId,
    hashMatch,
    signatureValid,
    breaks
  };
}
function verifyChain(input) {
  const receipts = Array.isArray(input) ? input : input.chain;
  const allBreaks = [];
  const results = [];
  for (const receipt of receipts) {
    const result = verifyReceipt(receipt);
    results.push(result);
    allBreaks.push(...result.breaks);
  }
  for (let i = 1; i < receipts.length; i++) {
    const current = receipts[i];
    const previous = receipts[i - 1];
    if (current.parentSnapId !== previous.snapshotId) {
      const linkBreak = {
        receiptId: current.receiptId,
        snapshotId: current.snapshotId,
        reason: `Chain linkage broken: parentSnapId "${current.parentSnapId}" does not match previous receipt snapshotId "${previous.snapshotId}"`,
        expected: previous.snapshotId,
        actual: current.parentSnapId ?? "null"
      };
      allBreaks.push(linkBreak);
    }
  }
  if (receipts.length > 0 && receipts[0].parentSnapId != null) {
    allBreaks.push({
      receiptId: receipts[0].receiptId,
      snapshotId: receipts[0].snapshotId,
      reason: `Chain root has non-null parentSnapId: "${receipts[0].parentSnapId}"`
    });
  }
  return {
    valid: allBreaks.length === 0,
    depth: receipts.length,
    receipts: results,
    breaks: allBreaks
  };
}

// src/cose.ts
var COSE_HEADER_CONTENT_TYPE = 3;
var COSE_HEADER_KID = 4;
function mapGet(mapOrObj, key) {
  if (mapOrObj instanceof Map) return mapOrObj.get(key);
  if (mapOrObj && typeof mapOrObj === "object") return mapOrObj[key];
  return void 0;
}
async function verifyCoseSign1(envelope, publicKeyB64) {
  try {
    const { decode: cborDecode, encode: cborEncode } = await Promise.resolve().then(() => (init_node_index(), node_index_exports));
    let decoded = cborDecode(envelope);
    if (decoded && typeof decoded === "object" && !Array.isArray(decoded) && "value" in decoded) {
      decoded = decoded.value;
    }
    if (!Array.isArray(decoded) || decoded.length !== 4) {
      return {
        valid: false,
        signatureValid: false,
        payloadBytes: null,
        kid: null,
        contentType: null,
        issuer: null,
        subject: null,
        error: `Invalid COSE_Sign1: expected 4-element array, got ${Array.isArray(decoded) ? decoded.length : typeof decoded}`
      };
    }
    const [protectedRaw, unprotectedRaw, payloadRaw, signatureRaw] = decoded;
    const protectedBytes = protectedRaw instanceof Uint8Array ? protectedRaw : new Uint8Array(protectedRaw);
    const payload = payloadRaw instanceof Uint8Array ? payloadRaw : new Uint8Array(payloadRaw);
    const signature = signatureRaw instanceof Uint8Array ? signatureRaw : new Uint8Array(signatureRaw);
    const protectedHeader = cborDecode(protectedBytes);
    const contentType = mapGet(protectedHeader, COSE_HEADER_CONTENT_TYPE);
    let kid = null;
    const protectedKidBuf = mapGet(protectedHeader, COSE_HEADER_KID);
    if (protectedKidBuf instanceof Uint8Array) {
      kid = new TextDecoder().decode(protectedKidBuf);
    } else if (typeof protectedKidBuf === "string") {
      kid = protectedKidBuf;
    } else {
      const unprotectedKidBuf = mapGet(unprotectedRaw, COSE_HEADER_KID);
      if (unprotectedKidBuf instanceof Uint8Array) {
        kid = new TextDecoder().decode(unprotectedKidBuf);
      } else if (typeof unprotectedKidBuf === "string") {
        kid = unprotectedKidBuf;
      }
    }
    let issuer = null;
    let subject = null;
    const cwtClaims = mapGet(protectedHeader, 15);
    if (cwtClaims && typeof cwtClaims === "object") {
      const iss = mapGet(cwtClaims, 1);
      if (typeof iss === "string") issuer = iss;
      const sub = mapGet(cwtClaims, 2);
      if (typeof sub === "string") subject = sub;
    }
    const sigStructure = [
      "Signature1",
      Buffer.from(protectedBytes),
      Buffer.alloc(0),
      // external_aad: empty
      Buffer.from(payload)
    ];
    const sigStructureBytes = cborEncode(sigStructure);
    const publicKey = base64ToBytes2(publicKeyB64);
    const signatureValid = ed25519.verify(
      signature,
      new Uint8Array(sigStructureBytes),
      publicKey
    );
    return {
      valid: signatureValid,
      signatureValid,
      payloadBytes: payload,
      kid,
      contentType: typeof contentType === "string" ? contentType : null,
      issuer,
      subject
    };
  } catch (err) {
    return {
      valid: false,
      signatureValid: false,
      payloadBytes: null,
      kid: null,
      contentType: null,
      issuer: null,
      subject: null,
      error: err instanceof Error ? err.message : String(err)
    };
  }
}
function base64ToBytes2(b64) {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// src/cli.ts
function usage() {
  console.error("Usage: crown-verify <receipt.json> [receipt2.json ...]");
  console.error("       cat receipt.json | crown-verify -");
  process.exit(2);
}
function readInput(path) {
  if (path === "-") {
    return readFileSync(0, "utf-8");
  }
  return readFileSync(path, "utf-8");
}
function printResult(result) {
  const status = result.valid ? "PASS" : "FAIL";
  const sig = result.signatureValid === null ? "unsigned" : result.signatureValid ? "sig:valid" : "sig:INVALID";
  const hash = result.hashMatch ? "hash:ok" : "hash:MISMATCH";
  console.log(`  ${status}  ${result.receiptId}  [${hash}, ${sig}]`);
  for (const b of result.breaks) {
    console.log(`         ${b.reason}`);
    if (b.expected) console.log(`         expected: ${b.expected}`);
    if (b.actual) console.log(`         actual:   ${b.actual}`);
  }
}
function printChainResult(result, label) {
  const status = result.valid ? "PASS" : "FAIL";
  console.log(`${status}  ${label}  (depth: ${result.depth})`);
  for (const r of result.receipts) {
    printResult(r);
  }
  const chainBreaks = result.breaks.filter(
    (b) => b.reason.includes("Chain linkage") || b.reason.includes("Chain root")
  );
  for (const b of chainBreaks) {
    console.log(`  FAIL  ${b.reason}`);
  }
}
async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) usage();
  const coseIdx = args.indexOf("--cose");
  if (coseIdx !== -1) {
    const cosePath = args[coseIdx + 1];
    const pubIdx = args.indexOf("--pub");
    const pubKey = pubIdx !== -1 ? args[pubIdx + 1] : void 0;
    if (!cosePath || !pubKey) {
      console.error("Usage: crown-verify --cose <envelope.cbor> --pub <base64_pubkey>");
      process.exit(2);
    }
    const envelopeBytes = readFileSync(cosePath);
    const result = await verifyCoseSign1(new Uint8Array(envelopeBytes), pubKey);
    const status = result.valid ? "PASS" : "FAIL";
    console.log(`${status}  ${cosePath}  [cose:${result.signatureValid ? "valid" : "INVALID"}]`);
    if (result.kid) console.log(`  kid: ${result.kid}`);
    if (result.contentType) console.log(`  content-type: ${result.contentType}`);
    if (result.issuer) console.log(`  issuer: ${result.issuer}`);
    if (result.subject) console.log(`  subject: ${result.subject}`);
    if (result.error) console.log(`  error: ${result.error}`);
    if (result.valid && result.payloadBytes) {
      try {
        const payloadStr = new TextDecoder().decode(result.payloadBytes);
        const receipt = JSON.parse(payloadStr);
        if (receipt.receiptHash || receipt.snapshotId) {
          console.log("  Embedded receipt (JSON) \u2014 verifying hash integrity...");
          const receiptResult = verifyReceipt({
            ...receipt,
            receiptId: receipt.receiptId ?? `cose_${cosePath}`,
            signature: { sigB64: "", kid: result.kid ?? "", pubB64: pubKey }
          });
          const hashStatus = receiptResult.hashMatch ? "ok" : "MISMATCH";
          console.log(`  hash: ${hashStatus}`);
        }
      } catch {
        try {
          const { decode: cborDecode } = await Promise.resolve().then(() => (init_node_index(), node_index_exports));
          const cborPayload = cborDecode(result.payloadBytes);
          const receiptHash = cborPayload["receipt-hash"];
          const snapId = cborPayload["snap-id"];
          console.log("  Embedded receipt (CBOR, kebab-case keys)");
          if (typeof receiptHash === "string") console.log(`  receipt-hash: ${receiptHash}`);
          if (typeof snapId === "string") console.log(`  snap-id: ${snapId}`);
          const tenantId = cborPayload["tenant-id"];
          if (typeof tenantId === "string") console.log(`  tenant-id: ${tenantId}`);
        } catch {
          console.log("  Payload is opaque (not JSON or CBOR)");
        }
      }
    }
    console.log(`
1 envelope checked, ${result.valid ? 0 : 1} issue(s)`);
    process.exit(result.valid ? 0 : 1);
  }
  let failures = 0;
  let total = 0;
  for (const path of args) {
    const raw = readInput(path);
    const data = JSON.parse(raw);
    if (data.chain && Array.isArray(data.chain)) {
      const receipts = data.chain.map(
        (item) => item.receipt ? item.receipt : item
      );
      const result = verifyChain(receipts);
      printChainResult(result, path);
      total += result.depth;
      failures += result.breaks.length;
    } else if (Array.isArray(data)) {
      const result = verifyChain(data);
      printChainResult(result, path);
      total += result.depth;
      failures += result.breaks.length;
    } else {
      const receipt = data.receipt ? data.receipt : data;
      const result = verifyReceipt(receipt);
      const label = path === "-" ? "stdin" : path;
      console.log(
        `${result.valid ? "PASS" : "FAIL"}  ${label}`
      );
      printResult(result);
      total++;
      if (!result.valid) failures++;
    }
  }
  console.log(`
${total} receipt(s) checked, ${failures} issue(s)`);
  process.exit(failures > 0 ? 1 : 0);
}
main();
