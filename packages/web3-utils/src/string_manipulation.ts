﻿/*
This file is part of web3.js.

web3.js is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

web3.js is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with web3.js.  If not, see <http://www.gnu.org/licenses/>.
*/

import { NibbleWidthError } from 'web3-errors';
import { isHexStrict, validator, utils as validatorUtils } from 'web3-validator';
import { numberToHex, toHex, toNumber } from './converters';
import { Numbers } from './types';

/**
 * Adds a padding on the left of a string, if value is a integer or bigInt will be converted to a hex string.
 */
export const padLeft = (value: Numbers, characterAmount: number, sign = '0'): string => {
	// To avoid duplicate code and circular dependency we will
	// use `padLeft` implementation from `web3-validator`

	if (typeof value === 'string' && !isHexStrict(value)) {
		return value.padStart(characterAmount, sign);
	}

	validator.validate(['int'], [value]);

	return validatorUtils.padLeft(value, characterAmount, sign);
};

/**
 * Adds a padding on the right of a string, if value is a integer or bigInt will be converted to a hex string.
 */
export const padRight = (value: Numbers, characterAmount: number, sign = '0'): string => {
	if (typeof value === 'string' && !isHexStrict(value)) {
		return value.padEnd(characterAmount, sign);
	}

	validator.validate(['int'], [value]);

	const hexString = typeof value === 'string' && isHexStrict(value) ? value : numberToHex(value);

	const prefixLength = hexString.startsWith('-') ? 3 : 2;
	return hexString.padEnd(characterAmount + prefixLength, sign);
};

/**
 * Adds a padding on the right of a string, if value is a integer or bigInt will be converted to a hex string. @alias `padRight`
 */
export const rightPad = padRight;

/**
 * Adds a padding on the left of a string, if value is a integer or bigInt will be converted to a hex string. @alias `padLeft`
 */
export const leftPad = padLeft;

/**
 * Converts a negative number into the two’s complement and return a hexstring of 64 nibbles.
 */
export const toTwosComplement = (value: Numbers, nibbleWidth = 64): string => {
	validator.validate(['int'], [value]);

	const val = toNumber(value);

	if (val >= 0) return padLeft(toHex(val), nibbleWidth);

	const largestBit = 2n ** BigInt(nibbleWidth * 4);
	if (-val >= largestBit) {
		throw new NibbleWidthError(`value: ${value}, nibbleWidth: ${nibbleWidth}`);
	}
	const updatedVal = BigInt(val);

	const complement = updatedVal + largestBit;

	return padLeft(numberToHex(complement), nibbleWidth);
};

/**
 * Converts the twos complement into a decimal number or big int.
 */
export const fromTwosComplement = (value: Numbers, nibbleWidth = 64): number | bigint => {
	validator.validate(['int'], [value]);

	const val = toNumber(value);

	if (val < 0) return val;

	const largestBit = Math.ceil(Math.log(Number(val)) / Math.log(2));

	if (largestBit > nibbleWidth * 4)
		throw new NibbleWidthError(`value: "${value}", nibbleWidth: "${nibbleWidth}"`);

	// check the largest bit to see if negative
	if (nibbleWidth * 4 !== largestBit) return val;

	const complement = 2n ** (BigInt(nibbleWidth) * 4n);

	return toNumber(BigInt(val) - complement);
};