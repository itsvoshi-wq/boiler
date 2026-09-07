// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Ownable2Step} from "@openzeppelin/contracts/access/Ownable2Step.sol";

/**
 * @title BoilerRegistry
 * @notice One address the front end has to know. Everything else is read from
 *         here, on chain, so the deployment is discoverable by anyone rather
 *         than living in a config file only the operator can see.
 *
 * @dev Keys are short ascii names hashed to bytes32: "feeController",
 *      "router", "revenueRouter", "staking", "boil", "treasury".
 *
 *      NOT AUDITED. It is a mapping with an owner.
 */
contract BoilerRegistry is Ownable2Step {
    mapping(bytes32 key => address value) private _entries;
    bytes32[] private _keys;
    mapping(bytes32 key => bool known) private _known;

    event EntrySet(bytes32 indexed key, string name, address indexed previous, address indexed next);

    constructor(address owner_) Ownable(owner_) {}

    function keyOf(string memory name) public pure returns (bytes32) {
        return keccak256(bytes(name));
    }

    function get(string calldata name) external view returns (address) {
        return _entries[keyOf(name)];
    }

    function getByKey(bytes32 key) external view returns (address) {
        return _entries[key];
    }

    function keys() external view returns (bytes32[] memory) {
        return _keys;
    }

    /// @notice Everything at once, so the front end reads the deployment in one call.
    function snapshot() external view returns (bytes32[] memory outKeys, address[] memory outValues) {
        uint256 n = _keys.length;
        outKeys = new bytes32[](n);
        outValues = new address[](n);
        for (uint256 i = 0; i < n; i++) {
            outKeys[i] = _keys[i];
            outValues[i] = _entries[_keys[i]];
        }
    }

    function set(string calldata name, address value) public onlyOwner {
        bytes32 key = keyOf(name);
        emit EntrySet(key, name, _entries[key], value);
        _entries[key] = value;
        if (!_known[key]) {
            _known[key] = true;
            _keys.push(key);
        }
    }

    function setMany(string[] calldata names, address[] calldata values) external onlyOwner {
        require(names.length == values.length, "length mismatch");
        for (uint256 i = 0; i < names.length; i++) {
            set(names[i], values[i]);
        }
    }
}
