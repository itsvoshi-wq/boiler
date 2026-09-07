/**
 * GENERATED FILE. Do not edit by hand.
 *
 * Produced by scripts/compile.mjs from the Solidity in contracts/ with
 * solc 0.8.28+commit.7893614a.Emscripten.clang, optimizer on, 200 runs, viaIR, evmVersion paris.
 * Regenerate with: npm run contracts:build
 */

export const SOLC_VERSION = "0.8.28+commit.7893614a.Emscripten.clang";

export const ARTIFACTS = {
  "BoilerRegistry": {
    "abi": [
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "owner_",
            "type": "address"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "owner",
            "type": "address"
          }
        ],
        "name": "OwnableInvalidOwner",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "account",
            "type": "address"
          }
        ],
        "name": "OwnableUnauthorizedAccount",
        "type": "error"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "bytes32",
            "name": "key",
            "type": "bytes32"
          },
          {
            "indexed": false,
            "internalType": "string",
            "name": "name",
            "type": "string"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "previous",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "next",
            "type": "address"
          }
        ],
        "name": "EntrySet",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "previousOwner",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "newOwner",
            "type": "address"
          }
        ],
        "name": "OwnershipTransferStarted",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "previousOwner",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "newOwner",
            "type": "address"
          }
        ],
        "name": "OwnershipTransferred",
        "type": "event"
      },
      {
        "inputs": [],
        "name": "acceptOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "string",
            "name": "name",
            "type": "string"
          }
        ],
        "name": "get",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "bytes32",
            "name": "key",
            "type": "bytes32"
          }
        ],
        "name": "getByKey",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "string",
            "name": "name",
            "type": "string"
          }
        ],
        "name": "keyOf",
        "outputs": [
          {
            "internalType": "bytes32",
            "name": "",
            "type": "bytes32"
          }
        ],
        "stateMutability": "pure",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "keys",
        "outputs": [
          {
            "internalType": "bytes32[]",
            "name": "",
            "type": "bytes32[]"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "owner",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "pendingOwner",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "renounceOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "string",
            "name": "name",
            "type": "string"
          },
          {
            "internalType": "address",
            "name": "value",
            "type": "address"
          }
        ],
        "name": "set",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "string[]",
            "name": "names",
            "type": "string[]"
          },
          {
            "internalType": "address[]",
            "name": "values",
            "type": "address[]"
          }
        ],
        "name": "setMany",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "snapshot",
        "outputs": [
          {
            "internalType": "bytes32[]",
            "name": "outKeys",
            "type": "bytes32[]"
          },
          {
            "internalType": "address[]",
            "name": "outValues",
            "type": "address[]"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "newOwner",
            "type": "address"
          }
        ],
        "name": "transferOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      }
    ],
    "bytecode": "0x60803460c557601f610b3638819003918201601f19168301916001600160401b0383118484101760ca5780849260209460405283398101031260c557516001600160a01b0381169081900360c557801560af57600180546001600160a01b0319908116909155600080549182168317815560405192916001600160a01b0316907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e09080a3610a5590816100e18239f35b631e4fbdf760e01b600052600060045260246000fd5b600080fd5b634e487b7160e01b600052604160045260246000fdfe608080604052600436101561001357600080fd5b60003560e01c908163307540f614610827575080634a91da90146107f35780634ed31319146105a3578063693ec85e14610541578063715018a6146104dc57806379ba5097146104535780638da5cb5b1461042a5780639711715a146102fd578063a815ff1514610197578063c57c8cdb14610145578063e30c39781461011c5763f2fde38b146100a357600080fd5b34610117576020366003190112610117576004356001600160a01b03811690819003610117576100d1610a0b565b600180546001600160a01b03191682179055600080546001600160a01b0316907f38d16b8cac22d99fc7c124b9cd0de2d3fa1faef420bfe791d8c362d765e227009080a3005b600080fd5b34610117576000366003190112610117576001546040516001600160a01b039091168152602090f35b346101175760203660031901126101175760043567ffffffffffffffff81116101175736602382011215610117576101896020913690602481600401359101610967565b818151910120604051908152f35b346101175760403660031901126101175760043567ffffffffffffffff8111610117576101c8903690600401610917565b6024356001600160a01b0381169190829003610117577fdbf077cd8b32ed06c4bc1e7a97ee696f4b64f684dc23d89e90b318bb64830c6a92829161020a610a0b565b610215368284610967565b60208151910120948591826000526002602052604060018060a01b038160002054169482825193849260208452816020850152848401376000828201840152601f01601f19168101030190a4600082815260026020908152604080832080546001600160a01b03191690941790935560049052205460ff161561029457005b8060005260046020526040600020600160ff19825416179055600354600160401b8110156102e7578060016102cc92016003556109c6565b819291549060031b91821b91600019901b1916179055600080f35b634e487b7160e01b600052604160045260246000fd5b346101175760003660031901126101175760035461031a816109ae565b906103286040519283610945565b808252601f19610337826109ae565b01366020840137610347816109ae565b6103546040519182610945565b818152610360826109ae565b602082019290601f190136843760005b8181106103d65761039385858560206040519485946040865260408601906108b2565b9184830382860152519182815201919060005b8181106103b4575050500390f35b82516001600160a01b03168452859450602093840193909201916001016103a6565b806103e26001926109c6565b90549060031b1c6103f382886109f7565b526103fd816109c6565b90549060031b1c6000526002602052818060a01b036040600020541661042382866109f7565b5201610370565b34610117576000366003190112610117576000546040516001600160a01b039091168152602090f35b3461011757600036600319011261011757600154336001600160a01b03909116036104c757600180546001600160a01b03199081169091556000805433928116831782556001600160a01b0316907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e09080a3005b63118cdaa760e01b6000523360045260246000fd5b34610117576000366003190112610117576104f5610a0b565b600180546001600160a01b0319908116909155600080549182168155906001600160a01b03167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e08280a3005b346101175760203660031901126101175760043567ffffffffffffffff81116101175761057561057c913690600401610917565b3691610967565b602081519101206000526002602052602060018060a01b0360406000205416604051908152f35b346101175760403660031901126101175760043567ffffffffffffffff8111610117576105d49036906004016108e6565b9060243567ffffffffffffffff8111610117576105f59036906004016108e6565b906105fe610a0b565b8184036107bc5736839003601e1901939260005b848110156107ba5760008160051b80840135888112156107b65784019081359167ffffffffffffffff831161079e5760200190823603821361079e57878510156107a2578601356001600160a01b038116929083900361079e579180917fdbf077cd8b32ed06c4bc1e7a97ee696f4b64f684dc23d89e90b318bb64830c6a949361069a610a0b565b6106a5368284610967565b602081519101209586918287526002602052604060018060a01b03818920541694828251938492602084528160208501528484013781810183018a9052601f01601f19168101030190a4828252600260205260408220906bffffffffffffffffffffffff60a01b825416179055818152600460205260ff60408220541615610732575b5050600101610612565b818152600460205260408120805460ff1916600117905560035490600160401b82101561078a57509061076d826001809594016003556109c6565b819291549060031b91821b91600019901b19161790559087610728565b634e487b7160e01b81526041600452602490fd5b8380fd5b634e487b7160e01b84526032600452602484fd5b8280fd5b005b60405162461bcd60e51b815260206004820152600f60248201526e0d8cadccee8d040dad2e6dac2e8c6d608b1b6044820152606490fd5b34610117576020366003190112610117576004356000526002602052602060018060a01b0360406000205416604051908152f35b3461011757600036600319011261011757600354808252602082019060036000527fc2575a0e9e593c00f959f8c92f12db2869c3395a3b0502d05e2516446f71f85b9060005b81811061089c576108988561088481870382610945565b6040519182916020835260208301906108b2565b0390f35b825484526020909301926001928301920161086d565b906020808351928381520192019060005b8181106108d05750505090565b82518452602093840193909201916001016108c3565b9181601f840112156101175782359167ffffffffffffffff8311610117576020808501948460051b01011161011757565b9181601f840112156101175782359167ffffffffffffffff8311610117576020838186019501011161011757565b90601f8019910116810190811067ffffffffffffffff8211176102e757604052565b92919267ffffffffffffffff82116102e75760405191610991601f8201601f191660200184610945565b829481845281830111610117578281602093846000960137010152565b67ffffffffffffffff81116102e75760051b60200190565b6003548110156109e157600360005260206000200190600090565b634e487b7160e01b600052603260045260246000fd5b80518210156109e15760209160051b010190565b6000546001600160a01b031633036104c75756fea2646970667358221220bd6a0d40b3850cdd62b2577c6b7119d1dcab0dbc837de4ddae1b473b70438c9664736f6c634300081c0033",
    "deployedSize": 2645
  },
  "BoilerFeeController": {
    "abi": [
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "owner_",
            "type": "address"
          },
          {
            "components": [
              {
                "internalType": "uint16",
                "name": "protocolSwapBps",
                "type": "uint16"
              },
              {
                "internalType": "uint16",
                "name": "creatorMinBps",
                "type": "uint16"
              },
              {
                "internalType": "uint16",
                "name": "creatorDefaultBps",
                "type": "uint16"
              },
              {
                "internalType": "uint16",
                "name": "creatorMaxBps",
                "type": "uint16"
              },
              {
                "internalType": "uint16",
                "name": "brokerShareOfProtocolBps",
                "type": "uint16"
              },
              {
                "internalType": "uint16",
                "name": "automationActionBps",
                "type": "uint16"
              },
              {
                "internalType": "uint16",
                "name": "strategyExecutionBps",
                "type": "uint16"
              }
            ],
            "internalType": "struct BoilerFeeController.Schedule",
            "name": "initial",
            "type": "tuple"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
      },
      {
        "inputs": [
          {
            "internalType": "uint16",
            "name": "requested",
            "type": "uint16"
          },
          {
            "internalType": "uint16",
            "name": "cap",
            "type": "uint16"
          }
        ],
        "name": "AboveHardCap",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "string",
            "name": "reason",
            "type": "string"
          }
        ],
        "name": "BadSchedule",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "uint16",
            "name": "requested",
            "type": "uint16"
          },
          {
            "internalType": "uint16",
            "name": "min",
            "type": "uint16"
          },
          {
            "internalType": "uint16",
            "name": "max",
            "type": "uint16"
          }
        ],
        "name": "OutOfBounds",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "owner",
            "type": "address"
          }
        ],
        "name": "OwnableInvalidOwner",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "account",
            "type": "address"
          }
        ],
        "name": "OwnableUnauthorizedAccount",
        "type": "error"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "desk",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint16",
            "name": "bps",
            "type": "uint16"
          }
        ],
        "name": "DeskFeeSet",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "previousOwner",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "newOwner",
            "type": "address"
          }
        ],
        "name": "OwnershipTransferStarted",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "previousOwner",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "newOwner",
            "type": "address"
          }
        ],
        "name": "OwnershipTransferred",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "components": [
              {
                "internalType": "uint16",
                "name": "protocolSwapBps",
                "type": "uint16"
              },
              {
                "internalType": "uint16",
                "name": "creatorMinBps",
                "type": "uint16"
              },
              {
                "internalType": "uint16",
                "name": "creatorDefaultBps",
                "type": "uint16"
              },
              {
                "internalType": "uint16",
                "name": "creatorMaxBps",
                "type": "uint16"
              },
              {
                "internalType": "uint16",
                "name": "brokerShareOfProtocolBps",
                "type": "uint16"
              },
              {
                "internalType": "uint16",
                "name": "automationActionBps",
                "type": "uint16"
              },
              {
                "internalType": "uint16",
                "name": "strategyExecutionBps",
                "type": "uint16"
              }
            ],
            "indexed": false,
            "internalType": "struct BoilerFeeController.Schedule",
            "name": "previous",
            "type": "tuple"
          },
          {
            "components": [
              {
                "internalType": "uint16",
                "name": "protocolSwapBps",
                "type": "uint16"
              },
              {
                "internalType": "uint16",
                "name": "creatorMinBps",
                "type": "uint16"
              },
              {
                "internalType": "uint16",
                "name": "creatorDefaultBps",
                "type": "uint16"
              },
              {
                "internalType": "uint16",
                "name": "creatorMaxBps",
                "type": "uint16"
              },
              {
                "internalType": "uint16",
                "name": "brokerShareOfProtocolBps",
                "type": "uint16"
              },
              {
                "internalType": "uint16",
                "name": "automationActionBps",
                "type": "uint16"
              },
              {
                "internalType": "uint16",
                "name": "strategyExecutionBps",
                "type": "uint16"
              }
            ],
            "indexed": false,
            "internalType": "struct BoilerFeeController.Schedule",
            "name": "next",
            "type": "tuple"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "by",
            "type": "address"
          }
        ],
        "name": "ScheduleUpdated",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "previous",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "next",
            "type": "address"
          }
        ],
        "name": "StakingUpdated",
        "type": "event"
      },
      {
        "inputs": [],
        "name": "BPS_DENOMINATOR",
        "outputs": [
          {
            "internalType": "uint16",
            "name": "",
            "type": "uint16"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "HARD_CAP_BPS",
        "outputs": [
          {
            "internalType": "uint16",
            "name": "",
            "type": "uint16"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "acceptOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "desk",
            "type": "address"
          }
        ],
        "name": "bpsFor",
        "outputs": [
          {
            "internalType": "uint16",
            "name": "protocolBps",
            "type": "uint16"
          },
          {
            "internalType": "uint16",
            "name": "creatorBps",
            "type": "uint16"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "brokerShareOfProtocolBps",
        "outputs": [
          {
            "internalType": "uint16",
            "name": "",
            "type": "uint16"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "desk",
            "type": "address"
          }
        ],
        "name": "deskFeeBps",
        "outputs": [
          {
            "internalType": "uint16",
            "name": "bps",
            "type": "uint16"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "desk",
            "type": "address"
          }
        ],
        "name": "deskFeeSet",
        "outputs": [
          {
            "internalType": "bool",
            "name": "set",
            "type": "bool"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "owner",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "pendingOwner",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "trader",
            "type": "address"
          }
        ],
        "name": "protocolBpsFor",
        "outputs": [
          {
            "internalType": "uint16",
            "name": "",
            "type": "uint16"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "notional",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "desk",
            "type": "address"
          },
          {
            "internalType": "bool",
            "name": "hasBroker",
            "type": "bool"
          }
        ],
        "name": "quote",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "protocolFee",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "creatorFee",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "brokerFee",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "totalFee",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "renounceOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "schedule",
        "outputs": [
          {
            "components": [
              {
                "internalType": "uint16",
                "name": "protocolSwapBps",
                "type": "uint16"
              },
              {
                "internalType": "uint16",
                "name": "creatorMinBps",
                "type": "uint16"
              },
              {
                "internalType": "uint16",
                "name": "creatorDefaultBps",
                "type": "uint16"
              },
              {
                "internalType": "uint16",
                "name": "creatorMaxBps",
                "type": "uint16"
              },
              {
                "internalType": "uint16",
                "name": "brokerShareOfProtocolBps",
                "type": "uint16"
              },
              {
                "internalType": "uint16",
                "name": "automationActionBps",
                "type": "uint16"
              },
              {
                "internalType": "uint16",
                "name": "strategyExecutionBps",
                "type": "uint16"
              }
            ],
            "internalType": "struct BoilerFeeController.Schedule",
            "name": "",
            "type": "tuple"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "desk",
            "type": "address"
          },
          {
            "internalType": "uint16",
            "name": "bps",
            "type": "uint16"
          }
        ],
        "name": "setDeskFee",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "components": [
              {
                "internalType": "uint16",
                "name": "protocolSwapBps",
                "type": "uint16"
              },
              {
                "internalType": "uint16",
                "name": "creatorMinBps",
                "type": "uint16"
              },
              {
                "internalType": "uint16",
                "name": "creatorDefaultBps",
                "type": "uint16"
              },
              {
                "internalType": "uint16",
                "name": "creatorMaxBps",
                "type": "uint16"
              },
              {
                "internalType": "uint16",
                "name": "brokerShareOfProtocolBps",
                "type": "uint16"
              },
              {
                "internalType": "uint16",
                "name": "automationActionBps",
                "type": "uint16"
              },
              {
                "internalType": "uint16",
                "name": "strategyExecutionBps",
                "type": "uint16"
              }
            ],
            "internalType": "struct BoilerFeeController.Schedule",
            "name": "next",
            "type": "tuple"
          }
        ],
        "name": "setSchedule",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "next",
            "type": "address"
          }
        ],
        "name": "setStaking",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "staking",
        "outputs": [
          {
            "internalType": "contract IBoilStaking",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "newOwner",
            "type": "address"
          }
        ],
        "name": "transferOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      }
    ],
    "bytecode": "0x60806040523461047a576040516111b038819003601f8101601f191683016001600160401b0381118482101761046457839282916040528339810103610100811261047a5781516001600160a01b038116919082900361047a5760e090601f19011261047a576040519160e083016001600160401b038111848210176104645760405261008e6020820161047f565b835261009c6040820161047f565b92602081019384526100b06060830161047f565b90604081019182526100c46080840161047f565b90606081019182526100d860a0850161047f565b91608082019283526100ff60e06100f160c0880161047f565b9660a085019788520161047f565b9560c08301968752801561044e57600180546001600160a01b0319908116909155600080549182168317815560405192916001600160a01b0316907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e09080a361ffff88511661ffff8351161061041b575061ffff84511661ffff885116811090811561040c575b506103c657606461ffff6101a181855116828551169061048e565b16116103975761271061ffff8451161161035157604051916002549261ffff841681528360101c61ffff1660208201528360201c61ffff1660408201528360301c61ffff1660608201528360401c61ffff1660808201528360501c61ffff1660a08201528360601c61ffff1660c0820152815161ffff1660e0820152885161ffff16610100820152855161ffff16610120820152825161ffff16610140820152845161ffff16610160820152865161ffff16610180820152875161ffff166101a082015233906101c07f952c82690c76c96325be7aeba52e837ee55d523392f38bb98cb7bc9ccf1e014391a25161ffff16965160101b63ffff000016935160201b65ffff0000000016905160301b67ffff00000000000016925160401b69ffff000000000000000016945160501b6bffff0000000000000000000016955160601b6dffff00000000000000000000000016966dffff00000000000000000000000019946bffff00000000000000000000199369ffff0000000000000000199267ffff000000000000199165ffffffffffff19161716171617161716171717600255604051610cf590816104bb8239f35b60405163ac1f2fad60e01b815260206004820152601760248201527f62726f6b65722073686172652061626f766520313030250000000000000000006044820152606490fd5b6103ac9061ffff80809451169151169061048e565b630d8c205160e21b60005216600452606460245260446000fd5b60405163ac1f2fad60e01b815260206004820152601660248201527f64656661756c74206f75747369646520626f756e6473000000000000000000006044820152606490fd5b905061ffff8251161038610186565b63ac1f2fad60e01b815260206004820152600d60248201526c0dad2dc40c2c4deecca40dac2f609b1b6044820152606490fd5b631e4fbdf760e01b600052600060045260246000fd5b634e487b7160e01b600052604160045260246000fd5b600080fd5b519061ffff8216820361047a57565b9061ffff8091169116019061ffff82116104a457565b634e487b7160e01b600052601160045260246000fdfe6080604052600436101561001257600080fd5b60003560e01c806305b4b99b146109795780631d97e9541461094a578063388719b51461092557806339f5acff146109095780634cf088d9146108e0578063715018a61461087b57806379ba5097146107f2578063803759b2146106a55780638da5cb5b1461067c5780638ff3909914610613578063b0604a2614610567578063b29af13914610528578063b2b4a69614610216578063c409b751146101df578063d6807458146101a1578063e1a4521814610184578063e30c39781461015b5763f2fde38b146100e257600080fd5b34610156576020366003190112610156576100fb610a37565b610103610cab565b60018060a01b0316806bffffffffffffffffffffffff60a01b600154161760015560018060a01b03600054167f38d16b8cac22d99fc7c124b9cd0de2d3fa1faef420bfe791d8c362d765e22700600080a3005b600080fd5b34610156576000366003190112610156576001546040516001600160a01b039091168152602090f35b346101565760003660031901126101565760206040516127108152f35b34610156576020366003190112610156576001600160a01b036101c2610a37565b166000526003602052602061ffff60406000205416604051908152f35b3461015657602036600319011261015657604061ffff610205610200610a37565b610c1c565b835191831682529091166020820152f35b346101565760e03660031901126101565761022f610cab565b60405161023b81610ac2565b60043561ffff81168103610156578152610253610a4d565b6020820181815260443561ffff8116810361015657604084019081526064359361ffff85169283860361015657606082019586526084359161ffff83168303610156576080810192835260a4359461ffff861686036101565760a0820195865260c4359661ffff881688036101565760c0830197885261ffff16116104f25761ffff84511661ffff83511681109081156104e3575b506104a457606461ffff61030381845116828b511690610c06565b16116104755761271061ffff8451161161042f5761ffff90604051826002548181168352818160101c166020840152818160201c166040840152818160301c166060840152818160401c166080840152818160501c1660a084015260601c1660c082015261037460e0820183610a5e565b7f952c82690c76c96325be7aeba52e837ee55d523392f38bb98cb7bc9ccf1e01436101c03392a2511661ffff196002541617600255519161ffff60401b67ffff00000000000065ffff00000000600254935160201b16975160301b16925160401b169361ffff60501b905160501b169461ffff60601b905160601b169561ffff60601b199361ffff60501b199263ffff000061ffff60401b199260101b169067ffffffffffff00001916171617161716171717600255600080f35b60405163ac1f2fad60e01b815260206004820152601760248201527f62726f6b65722073686172652061626f766520313030250000000000000000006044820152606490fd5b61048a8761ffff808094511691511690610c06565b630d8c205160e21b60005216600452606460245260446000fd5b60405163ac1f2fad60e01b815260206004820152601660248201527564656661756c74206f75747369646520626f756e647360501b6044820152606490fd5b905061ffff88511610886102e8565b60405163ac1f2fad60e01b815260206004820152600d60248201526c0dad2dc40c2c4deecca40dac2f609b1b6044820152606490fd5b34610156576020366003190112610156576001600160a01b03610549610a37565b166000526004602052602060ff604060002054166040519015158152f35b3461015657600036600319011261015657600060c060405161058881610ac2565b8281528260208201528260408201528260608201528260808201528260a0820152015260e06040516105b981610ac2565b61ffff6002548181168352818160101c166020840152818160201c166040840152818160301c166060840152818160401c166080840152818160501c1660a084015260601c1660c08201526106116040518092610a5e565bf35b346101565760203660031901126101565761062c610a37565b610634610cab565b6005546001600160a01b0391821691829082167fcfa056eb826b2a28817aa38ccb94f12ba8a1309598f7ea19bef6fd67fe04b61e600080a36001600160a01b03191617600555005b34610156576000366003190112610156576000546040516001600160a01b039091168152602090f35b34610156576040366003190112610156576106be610a37565b6106c6610a4d565b6001600160a01b039091169033821415806107dd575b6107ba576002549061ffff8260101c169161ffff82169280841080156107aa575b610786575061ffff16606461ffff6107158484610c06565b161161077957837f69a96372cddc62f037b40645538e30086d983e319356b44706a457588fd4d04e602085836000526003825260406000208161ffff1982541617905583600052600482526040600020600160ff19825416179055604051908152a2005b61ffff9161048a91610c06565b61ffff925083631ef3ad1360e11b60005260045260245260301c1660445260646000fd5b5061ffff8260301c1684116106fd565b61ffff90631ef3ad1360e11b600052166004526000602452600060445260646000fd5b506000546001600160a01b03163314156106dc565b3461015657600036600319011261015657600154336001600160a01b039091160361086657600180546001600160a01b03199081169091556000805433928116831782556001600160a01b0316907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e09080a3005b63118cdaa760e01b6000523360045260246000fd5b3461015657600036600319011261015657610894610cab565b600180546001600160a01b0319908116909155600080549182168155906001600160a01b03167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e08280a3005b34610156576000366003190112610156576005546040516001600160a01b039091168152602090f35b3461015657600036600319011261015657602060405160648152f35b3461015657600036600319011261015657602061ffff60025460401c16604051908152f35b3461015657602036600319011261015657602061096d610968610a37565b610af4565b61ffff60405191168152f35b34610156576060366003190112610156576004356024356001600160a01b038116810361015657604435918215158303610156576109d66127109161ffff836109cd6109c58397610c1c565b971684610aaf565b04941690610aaf565b049115610a30576127106109f361ffff60025460401c1683610aaf565b045b82820190818311610a1a57608093604051938452602084015260408301526060820152f35b634e487b7160e01b600052601160045260246000fd5b60006109f5565b600435906001600160a01b038216820361015657565b6024359061ffff8216820361015657565b61ffff60c080928281511685528260208201511660208601528260408201511660408601528260608201511660608601528260808201511660808601528260a08201511660a0860152015116910152565b81810292918115918404141715610a1a57565b60e0810190811067ffffffffffffffff821117610ade57604052565b634e487b7160e01b600052604160045260246000fd5b61ffff600254169060018060a01b0360055416908115610c0157604051634794669360e01b81526001600160a01b03909116600482015290602090829060249082905afa908115610bf557600091610b85575b5061ffff1660009180821015600014610b6257505050600090565b039061ffff8211610b71575090565b634e487b7160e01b81526011600452602490fd5b60203d602011610bee575b601f8101601f1916820167ffffffffffffffff811183821017610bda57602091839160405281010312610bd657519061ffff82168203610bd3575061ffff610b47565b80fd5b5080fd5b634e487b7160e01b84526041600452602484fd5b503d610b90565b6040513d6000823e3d90fd5b505090565b9061ffff8091169116019061ffff8211610a1a57565b9061ffff600254169160018060a01b03169081600052600460205260ff60406000205416600014610ca45781600052600360205261ffff604060002054165b9115610c9b575b606461ffff610c718486610c06565b1611610c7957565b905081606411600014610c96578160640361ffff8111610a1a5790565b600090565b60009150610c62565b6000610c5b565b6000546001600160a01b031633036108665756fea26469706673582212200a3c8ba65868ab8f73901c0acd22836a8c96846e7a39d44b9091dd69725f730164736f6c634300081c0033",
    "deployedSize": 3317
  },
  "BoilerRevenueRouter": {
    "abi": [
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "owner_",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "treasury_",
            "type": "address"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "got",
            "type": "uint256"
          }
        ],
        "name": "AllocationMustTotal10000",
        "type": "error"
      },
      {
        "inputs": [],
        "name": "NothingToRoute",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "owner",
            "type": "address"
          }
        ],
        "name": "OwnableInvalidOwner",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "account",
            "type": "address"
          }
        ],
        "name": "OwnableUnauthorizedAccount",
        "type": "error"
      },
      {
        "inputs": [],
        "name": "ReentrancyGuardReentrantCall",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "token",
            "type": "address"
          }
        ],
        "name": "SafeERC20FailedOperation",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "enum BoilerRevenueRouter.Destination",
            "name": "destination",
            "type": "uint8"
          }
        ],
        "name": "SinkMissing",
        "type": "error"
      },
      {
        "inputs": [],
        "name": "StakerDistributionDisabled",
        "type": "error"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "components": [
              {
                "internalType": "enum BoilerRevenueRouter.Destination",
                "name": "destination",
                "type": "uint8"
              },
              {
                "internalType": "uint16",
                "name": "bps",
                "type": "uint16"
              }
            ],
            "indexed": false,
            "internalType": "struct BoilerRevenueRouter.Allocation[]",
            "name": "previous",
            "type": "tuple[]"
          },
          {
            "components": [
              {
                "internalType": "enum BoilerRevenueRouter.Destination",
                "name": "destination",
                "type": "uint8"
              },
              {
                "internalType": "uint16",
                "name": "bps",
                "type": "uint16"
              }
            ],
            "indexed": false,
            "internalType": "struct BoilerRevenueRouter.Allocation[]",
            "name": "next",
            "type": "tuple[]"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "by",
            "type": "address"
          }
        ],
        "name": "AllocationUpdated",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "previousOwner",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "newOwner",
            "type": "address"
          }
        ],
        "name": "OwnershipTransferStarted",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "previousOwner",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "newOwner",
            "type": "address"
          }
        ],
        "name": "OwnershipTransferred",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "token",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "enum BoilerRevenueRouter.Destination",
            "name": "destination",
            "type": "uint8"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          }
        ],
        "name": "Paid",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "token",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "destinations",
            "type": "uint256"
          }
        ],
        "name": "Routed",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "enum BoilerRevenueRouter.Destination",
            "name": "destination",
            "type": "uint8"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "previous",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "next",
            "type": "address"
          }
        ],
        "name": "SinkUpdated",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "by",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "string",
            "name": "legalReference",
            "type": "string"
          }
        ],
        "name": "StakerDistributionEnabled",
        "type": "event"
      },
      {
        "inputs": [],
        "name": "BPS_TOTAL",
        "outputs": [
          {
            "internalType": "uint16",
            "name": "",
            "type": "uint16"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "BURN_ADDRESS",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "acceptOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "allocation",
        "outputs": [
          {
            "components": [
              {
                "internalType": "enum BoilerRevenueRouter.Destination",
                "name": "destination",
                "type": "uint8"
              },
              {
                "internalType": "uint16",
                "name": "bps",
                "type": "uint16"
              }
            ],
            "internalType": "struct BoilerRevenueRouter.Allocation[]",
            "name": "",
            "type": "tuple[]"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "allocationLength",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "string",
            "name": "legalReference",
            "type": "string"
          }
        ],
        "name": "enableStakerDistribution",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "owner",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "pendingOwner",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          }
        ],
        "name": "preview",
        "outputs": [
          {
            "internalType": "enum BoilerRevenueRouter.Destination[]",
            "name": "destinations",
            "type": "uint8[]"
          },
          {
            "internalType": "address[]",
            "name": "sinks",
            "type": "address[]"
          },
          {
            "internalType": "uint256[]",
            "name": "amounts",
            "type": "uint256[]"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "readyToRoute",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "renounceOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "token",
            "type": "address"
          }
        ],
        "name": "route",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "routed",
            "type": "uint256"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "components": [
              {
                "internalType": "enum BoilerRevenueRouter.Destination",
                "name": "destination",
                "type": "uint8"
              },
              {
                "internalType": "uint16",
                "name": "bps",
                "type": "uint16"
              }
            ],
            "internalType": "struct BoilerRevenueRouter.Allocation[]",
            "name": "next",
            "type": "tuple[]"
          }
        ],
        "name": "setAllocation",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "enum BoilerRevenueRouter.Destination",
            "name": "destination",
            "type": "uint8"
          },
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          }
        ],
        "name": "setSink",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "enum BoilerRevenueRouter.Destination",
            "name": "",
            "type": "uint8"
          }
        ],
        "name": "sink",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "stakerDistributionEnabled",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "stakerDistributionLegalReference",
        "outputs": [
          {
            "internalType": "string",
            "name": "",
            "type": "string"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "token",
            "type": "address"
          }
        ],
        "name": "totalRouted",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "enum BoilerRevenueRouter.Destination",
            "name": "",
            "type": "uint8"
          },
          {
            "internalType": "address",
            "name": "token",
            "type": "address"
          }
        ],
        "name": "totalTo",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "newOwner",
            "type": "address"
          }
        ],
        "name": "transferOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      }
    ],
    "bytecode": "0x60806040523461054c576119ee6040813803918261001c81610570565b93849283398101031261054c5761003e602061003783610595565b9201610595565b6001600160a01b0390911690811561053657600180546001600160a01b0319908116909155600080549182168417815560405193916001600160a01b0316907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e09080a360016002556001600160a01b0316908115610504575060046020527f17ef568e3e12ab5b9c7254a8d58478811de00f9e6eb34345acd53bf8fd09d3ec80546001600160a01b0319908116909217905560026000527f91da3fd0782e51c6b3986e9e672fd566868e71f3dbc2d6c2cd6fbb3e361af2a7805490911661dead17905561012b60e0610570565b6006815260c060005b8181106104e35782610144610551565b60018152610bb86020820152610159826105a9565b52610163816105a9565b5061016c610551565b600281526103e86020820152610181826105b6565b5261018b816105b6565b50610194610551565b600381526105dc60208201526101a9826105c6565b526101b3816105c6565b506101bc610551565b600481526107d060208201526101d1826105d6565b526101db816105d6565b506101e4610551565b600581526103e860208201526101f9826105e6565b52610203816105e6565b5061020c610551565b600081526105dc6020820152610221826105f6565b5261022b816105f6565b50600090815b81518310156102ef5761ffff60206102498585610606565b5101511681018091116102d957916102618183610606565b515160078110156102c357600660009114806102a8575b8061029b575b61028c575060010191610231565b63051ec7bd60e31b8152600490fd5b5060ff600554161561027e565b5061ffff60206102b88486610606565b510151161515610278565b634e487b7160e01b600052602160045260246000fd5b634e487b7160e01b600052601160045260246000fd5b61271081036104cf575060405160408101906040815260035480925260608101906003600052602060002060005b8481106104a2575050808203602082015260208451928381520191602085019060005b81811061047557505050807fb2409aeba65695fa3d23582d03bc4cc193406cfebbe9f4dfacf84235edc7e5ef9133930390a2600060035580610431575b5060005b8151811015610422576103948183610606565b51906003546801000000000000000081101561040c5760018101806003558110156103f6576003600052602060002001825160078110156102c35760019360ff62ffff006020855493015160081b1692169062ffffff19161717905501610381565b634e487b7160e01b600052603260045260246000fd5b634e487b7160e01b600052604160045260246000fd5b6040516113c690816106288239f35b60036000527fc2575a0e9e593c00f959f8c92f12db2869c3395a3b0502d05e2516446f71f85b908101905b818110610469575061037d565b6000815560010161045c565b9091936020604060019261ffff83895161049084825161061a565b01511681840152019501929101610340565b909260016040819261ffff87546104bc8360ff831661061a565b60081c166020820152019401910161031d565b63b2803c8360e01b60005260045260246000fd5b6020906104ee610551565b6000815260008382015282828601015201610134565b62461bcd60e51b815260206004820152600d60248201526c7a65726f20747265617375727960981b6044820152606490fd5b631e4fbdf760e01b600052600060045260246000fd5b600080fd5b60408051919082016001600160401b0381118382101761040c57604052565b6040519190601f01601f191682016001600160401b0381118382101761040c57604052565b51906001600160a01b038216820361054c57565b8051156103f65760200190565b8051600110156103f65760400190565b8051600210156103f65760600190565b8051600310156103f65760800190565b8051600410156103f65760a00190565b8051600510156103f65760c00190565b80518210156103f65760209160051b010190565b9060078210156102c3575256fe608080604052600436101561001357600080fd5b60003560e01c90816307e9caea14610dfa575080632bbc59db14610ddd5780634594629014610cd957806346ce9f0a14610cb657806351f4a71d14610c7c57806360a42f5514610c40578063715018a614610bdb57806379ba509714610b5257806388a17bde14610aca5780638da5cb5b14610aa15780639673a64a14610a6a578063acdddf6b14610a4c578063b8d3903e146107fc578063c317c377146105b5578063c79373fd14610274578063df91239f146101df578063e1ccfc39146101ba578063e30c397814610191578063f2fde38b1461011d5763fccc2813146100fb57600080fd5b3461011857600036600319011261011857602060405161dead8152f35b600080fd5b3461011857602036600319011261011857610136611062565b61013e61133c565b60018060a01b0316806bffffffffffffffffffffffff60a01b600154161760015560018060a01b03600054167f38d16b8cac22d99fc7c124b9cd0de2d3fa1faef420bfe791d8c362d765e22700600080a3005b34610118576000366003190112610118576001546040516001600160a01b039091168152602090f35b346101185760003660031901126101185760206101d5611289565b6040519015158152f35b34610118576101ed36611190565b6101f561133c565b6001600160a01b036102068361111f565b541691600781101561025e5761024b9160018060a01b03168093827f782b32cf3763e7c5f3deeb7064325fc833c84e9103c4efb39e7e5923ce0d225f600080a461111f565b80546001600160a01b0319169091179055005b634e487b7160e01b600052602160045260246000fd5b346101185760203660031901126101185760043567ffffffffffffffff811161011857366023820112156101185780600401359067ffffffffffffffff82116101185760248260061b820101368111610118576102cf61133c565b6102d88361125d565b926102e660405194856110e4565b835260009160240190602084015b81831061056457505050809181925b81518410156103a6576103299061ffff602061031f8786611275565b5101511690611250565b926103348183611275565b515160078110156103925760061480610377575b8061036a575b61035b5760010192610303565b63051ec7bd60e31b8352600483fd5b5060ff600554161561034e565b5061ffff60206103878385611275565b510151161515610348565b634e487b7160e01b84526021600452602484fd5b61271081036105525750604051604081019060408152600354809252606081019060038552600080516020611351833981519152855b848110610525575050807fb2409aeba65695fa3d23582d03bc4cc193406cfebbe9f4dfacf84235edc7e5ef91830360208201528061041b339487611145565b0390a282600355806104e9575b5081905b80518310156104e55761043f8382611275565b5192600354680100000000000000008110156104d15780600161046592016003556111bf565b6104bd57845160078110156104a957815460209096015162ffffff1990961660ff919091161760089590951b62ffff0016949094179093556001929092019161042c565b634e487b7160e01b85526021600452602485fd5b634e487b7160e01b84526004849052602484fd5b634e487b7160e01b84526041600452602484fd5b5080f35b60038352600080516020611351833981519152016000805160206113518339815191525b81811061051a5750610428565b83815560010161050d565b909260016040819261ffff875461053f8360ff8316611138565b60081c16602082015201940191016103dc565b63b2803c8360e01b8352600452602482fd5b6040833603126105b15760405161057a816110b2565b833560078110156105ad578152602084013561ffff811681036105ad5791816040936020809401528152019201916102f4565b8580fd5b8380fd5b34610118576020366003190112610118576003546004356105d58261125d565b906105e360405192836110e4565b8282526105ef8361125d565b6020830190601f19013682376106048461125d565b9361061260405195866110e4565b80855261061e8161125d565b602086019290601f19013684376106348261125d565b9161064260405193846110e4565b80835261064e8161125d565b602084019590601f190136873760005b828110610737575050506040519586956060870190606088525180915260808701929060005b81811061070c5750505060209086830382880152519182815201929060005b8181106106ea575050506020908483036040860152519182815201919060005b8181106106d1575050500390f35b82518452859450602093840193909201916001016106c3565b82516001600160a01b03168552879650602094850194909201916001016106a3565b9194959697509192602080826107256001948951611138565b01950191019188979695949392610684565b60ff610749829a95969798999a6111bf565b505416906107608261075b838d611275565b6111f0565b6001600160a01b036107718361111f565b541615806107e9575b60019290156107d3575061dead5b6107928287611275565b90838060a01b031690526127106107ba61ffff6107ae846111bf565b505460081c1685611227565b046107c58289611275565b52019796959493929761065e565b6107e2838060a01b039161111f565b5416610788565b50600782101561025e576002821461077a565b346101185760203660031901126101185760043567ffffffffffffffff8111610118573660238201121561011857806004013567ffffffffffffffff81116101185736602482840101116101185761085261133c565b8015610a1257600160ff196005541617600555600091610873600654611078565b601f81116109a7575b50829082601f811160011461090b577fbdab8916cafa44b4a4ec5e7cba6492d0c14e3bb4f5665f9f7c0557ae83b816299285916108fd575b508360011b906000198560031b1c1916176006555b826024604051926020845282602085015201604083013783604084830101526040813394601f80199101168101030190a280f35b6024915082010135856108b4565b506006845283916000805160206113718339815191529084601f1981165b808610610986577fbdab8916cafa44b4a4ec5e7cba6492d0c14e3bb4f5665f9f7c0557ae83b81629955010610969575b5050600183811b016006556108c9565b820160240135600019600386901b60f8161c191690558480610959565b84830160240135845560209586019560019094019390920191869150610929565b60068452601f830160051c6000805160206113718339815191520190602084106109fc575b601f0160051c60008051602061137183398151915201905b8181106109f1575061087c565b8481556001016109e4565b60008051602061137183398151915291506109cc565b60405162461bcd60e51b81526020600482015260126024820152711c9959995c995b98d9481c995c5d5a5c995960721b6044820152606490fd5b34610118576000366003190112610118576020600354604051908152f35b3461011857610a82610a7b36611190565b9190611106565b9060018060a01b03166000526020526020604060002054604051908152f35b34610118576000366003190112610118576000546040516001600160a01b039091168152602090f35b3461011857600036600319011261011857600354610ae78161125d565b90610af560405192836110e4565b8082526020820160036000526000805160206113518339815191526000915b838310610b355760405160208082528190610b3190820188611145565b0390f35b600160208192610b44856111fc565b815201920192019190610b14565b3461011857600036600319011261011857600154336001600160a01b0390911603610bc657600180546001600160a01b03199081169091556000805433928116831782556001600160a01b0316907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e09080a3005b63118cdaa760e01b6000523360045260246000fd5b3461011857600036600319011261011857610bf461133c565b600180546001600160a01b0319908116909155600080549182168155906001600160a01b03167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e08280a3005b34610118576020366003190112610118576004356007811015610118576020906001600160a01b0390610c729061111f565b5416604051908152f35b34610118576020366003190112610118576001600160a01b03610c9d611062565b1660005260076020526020604060002054604051908152f35b3461011857600036600319011261011857602060ff600554166040519015158152f35b3461011857600036600319011261011857604051600654816000610cfc83611078565b8083529260018116908115610dbe5750600114610d6f575b610d20925003826110e4565b60405190602082528181519182602083015260005b838110610d575750508160006040809484010152601f80199101168101030190f35b60208282018101516040878401015285935001610d35565b50906006600052600080516020611371833981519152906000915b818310610da2575050906020610d2092820101610d14565b6020919350806001915483858801015201910190918392610d8a565b60209250610d2094915060ff191682840152151560051b820101610d14565b346101185760003660031901126101185760206040516127108152f35b3461011857602036600319011261011857610e13611062565b600280541461105157600280556370a0823160e01b82523060048301526001600160a01b031690600090602081602481865afa908115610ff75760009161101f575b50801561100e57600354906000905b828210610ec457602084867fd49198af970bb625d94b0e3a02bac355d62b15e618c09c1cf5afcf66a0470da6604087836000526007865281600020610eaa868254611250565b905581519085825286820152a26001600255604051908152f35b9092610ed8610ed2856111bf565b506111fc565b93612710610eee61ffff60208801511685611227565b04918215611003578551600781101561025e57610f0a906112ef565b9060206000604051938285019063a9059cbb60e01b825260018060a01b03169485602482015287604482015260448152610f456064826110e4565b5190828c5af115610ff7576000513d610fee5750873b155b610fd9578651600781101561025e57610f98916040610f7c8793611106565b6000908c825260205220610f91838254611250565b9055611250565b9551600781101561025e57877f3f11c44e37637f8642eb1a848d3ceaea1494e02f6b2bc4610b519f8f8781bf366020600196604051908152a45b0190610e64565b87635274afe760e01b60005260045260246000fd5b60011415610f5d565b6040513d6000823e3d90fd5b945060019150610fd2565b6337f4322d60e01b60005260046000fd5b90506020813d602011611049575b8161103a602093836110e4565b81010312610118575183610e55565b3d915061102d565b633ee5aeb560e01b60005260046000fd5b600435906001600160a01b038216820361011857565b90600182811c921680156110a8575b602083101461109257565b634e487b7160e01b600052602260045260246000fd5b91607f1691611087565b6040810190811067ffffffffffffffff8211176110ce57604052565b634e487b7160e01b600052604160045260246000fd5b90601f8019910116810190811067ffffffffffffffff8211176110ce57604052565b600781101561025e576000526008602052604060002090565b600781101561025e576000526004602052604060002090565b90600782101561025e5752565b906020808351928381520192019060005b8181106111635750505090565b9091926020604060019261ffff83885161117e848251611138565b01511681840152019401929101611156565b604090600319011261011857600435600781101561011857906024356001600160a01b03811681036101185790565b6003548110156111da57600360005260206000200190600090565b634e487b7160e01b600052603260045260246000fd5b600782101561025e5752565b90604051611209816110b2565b602061ffff82945461121e60ff8216856111f0565b60081c16910152565b8181029291811591840414171561123a57565b634e487b7160e01b600052601160045260246000fd5b9190820180921161123a57565b67ffffffffffffffff81116110ce5760051b60200190565b80518210156111da5760209160051b010190565b60035460005b81811061129d575050600190565b60ff6112a8826111bf565b5054166001600160a01b036112bc8261111f565b54161590816112da575b506112d35760010161128f565b5050600090565b9050600781101561025e5760021415386112c6565b906001600160a01b036113018361111f565b541691821561130d5750565b9150600782101561025e57600282146113355750633bdd97b960e21b60005260045260246000fd5b61dead9150565b6000546001600160a01b03163303610bc65756fec2575a0e9e593c00f959f8c92f12db2869c3395a3b0502d05e2516446f71f85bf652222313e28459528d920b65115c16c04f3efc82aaedc97be59f3f377c0d3fa26469706673582212204a101872f83bd629ea601f894227da2dadb5728aab410d05441205c4b53dfe2464736f6c634300081c0033",
    "deployedSize": 5062
  },
  "BoilerRouter": {
    "abi": [
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "owner_",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "swapRouter_",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "feeController_",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "revenueSink_",
            "type": "address"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
      },
      {
        "inputs": [],
        "name": "EnforcedPause",
        "type": "error"
      },
      {
        "inputs": [],
        "name": "ExpectedPause",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "deadline",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "nowTs",
            "type": "uint256"
          }
        ],
        "name": "Expired",
        "type": "error"
      },
      {
        "inputs": [],
        "name": "NoMinimumOut",
        "type": "error"
      },
      {
        "inputs": [],
        "name": "NothingReceived",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "owner",
            "type": "address"
          }
        ],
        "name": "OwnableInvalidOwner",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "account",
            "type": "address"
          }
        ],
        "name": "OwnableUnauthorizedAccount",
        "type": "error"
      },
      {
        "inputs": [],
        "name": "ReentrancyGuardReentrantCall",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "token",
            "type": "address"
          }
        ],
        "name": "SafeERC20FailedOperation",
        "type": "error"
      },
      {
        "inputs": [],
        "name": "SinkNotSet",
        "type": "error"
      },
      {
        "inputs": [],
        "name": "ZeroAmount",
        "type": "error"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "trader",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "tokenIn",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "tokenOut",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "amountIn",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "amountSwapped",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "amountOut",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "protocolFee",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "deskFee",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "brokerFee",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "address",
            "name": "desk",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "address",
            "name": "broker",
            "type": "address"
          }
        ],
        "name": "BoilerSwap",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "previous",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "next",
            "type": "address"
          }
        ],
        "name": "FeeControllerUpdated",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "previousOwner",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "newOwner",
            "type": "address"
          }
        ],
        "name": "OwnershipTransferStarted",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "previousOwner",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "newOwner",
            "type": "address"
          }
        ],
        "name": "OwnershipTransferred",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "internalType": "address",
            "name": "account",
            "type": "address"
          }
        ],
        "name": "Paused",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "previous",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "next",
            "type": "address"
          }
        ],
        "name": "RevenueSinkUpdated",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "token",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "to",
            "type": "address"
          }
        ],
        "name": "Swept",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "internalType": "address",
            "name": "account",
            "type": "address"
          }
        ],
        "name": "Unpaused",
        "type": "event"
      },
      {
        "inputs": [],
        "name": "BPS_DENOMINATOR",
        "outputs": [
          {
            "internalType": "uint16",
            "name": "",
            "type": "uint16"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "acceptOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "components": [
              {
                "internalType": "address",
                "name": "tokenIn",
                "type": "address"
              },
              {
                "internalType": "address",
                "name": "tokenOut",
                "type": "address"
              },
              {
                "internalType": "uint24",
                "name": "poolFee",
                "type": "uint24"
              },
              {
                "internalType": "uint256",
                "name": "amountIn",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "amountOutMinimum",
                "type": "uint256"
              },
              {
                "internalType": "uint160",
                "name": "sqrtPriceLimitX96",
                "type": "uint160"
              },
              {
                "internalType": "address",
                "name": "desk",
                "type": "address"
              },
              {
                "internalType": "address",
                "name": "broker",
                "type": "address"
              },
              {
                "internalType": "uint256",
                "name": "deadline",
                "type": "uint256"
              }
            ],
            "internalType": "struct BoilerRouter.SwapParams",
            "name": "p",
            "type": "tuple"
          }
        ],
        "name": "exactInputSingle",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "amountOut",
            "type": "uint256"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "feeController",
        "outputs": [
          {
            "internalType": "contract IBoilerFeeController",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "owner",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "pause",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "paused",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "pendingOwner",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "amountIn",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "desk",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "broker",
            "type": "address"
          }
        ],
        "name": "quote",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "protocolFee",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "deskFee",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "brokerFee",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "amountToSwap",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "renounceOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "revenueSink",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "next",
            "type": "address"
          }
        ],
        "name": "setFeeController",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "next",
            "type": "address"
          }
        ],
        "name": "setRevenueSink",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "swapRouter",
        "outputs": [
          {
            "internalType": "contract ISwapRouter02",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "token",
            "type": "address"
          }
        ],
        "name": "sweep",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "newOwner",
            "type": "address"
          }
        ],
        "name": "transferOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "unpause",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      }
    ],
    "bytecode": "0x60a0346101b257601f61139e38819003918201601f19168301916001600160401b038311848410176101b7578084926080946040528339810103126101b257610047816101cd565b90610054602082016101cd565b61006c6060610065604085016101cd565b93016101cd565b926001600160a01b031690811561019c57600154600080546001600160a01b031981168517825560405194916001600160a01b03909116907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e09080a36001600160a81b03191660019081556002556001600160a01b0316908115158061018a575b80610178575b1561014a5750608052600380546001600160a01b039283166001600160a01b031991821617909155600480549390921692169190911790556040516111bc90816101e282396080518181816101ac01526106d00152f35b62461bcd60e51b81526020600482015260096024820152683d32b9379030b2323960b91b6044820152606490fd5b506001600160a01b03841615156100f3565b506001600160a01b03831615156100ed565b631e4fbdf760e01b600052600060045260246000fd5b600080fd5b634e487b7160e01b600052604160045260246000fd5b51906001600160a01b03821682036101b25756fe6080604052600436101561001257600080fd5b60003560e01c806301681a6214610e7d57806313c97f4b14610e055780633ed4c67814610d8d5780633f4ba83a14610d1c5780635c975abb14610cf657806368493d6714610ccd5780636999b37714610ca4578063715018a614610c3f57806374967dea146104e757806379ba50971461045e57806380ee43f5146102665780638456cb59146102045780638da5cb5b146101db578063c31c9c0714610196578063e1a4521814610179578063e30c3978146101505763f2fde38b146100d757600080fd5b3461014b57602036600319011261014b576100f0610ea8565b6100f86110b9565b60018060a01b0316806bffffffffffffffffffffffff60a01b600154161760015560018060a01b03600054167f38d16b8cac22d99fc7c124b9cd0de2d3fa1faef420bfe791d8c362d765e22700600080a3005b600080fd5b3461014b57600036600319011261014b576001546040516001600160a01b039091168152602090f35b3461014b57600036600319011261014b5760206040516127108152f35b3461014b57600036600319011261014b576040517f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03168152602090f35b3461014b57600036600319011261014b576000546040516001600160a01b039091168152602090f35b3461014b57600036600319011261014b5761021d6110b9565b61022561110b565b6001805460ff60a01b1916600160a01b1790556040513381527f62e78cea01bee320cd4e420270b5ea74000d11b0c9f74754ebdbfc544b05a25890602090a1005b3461014b57606036600319011261014b576004356024356001600160a01b0381169081900361014b576044356001600160a01b0381169081900361014b576003546040805163c409b75160e01b815260048101949094526000916001600160a01b031690829085602481855afa9485156104515781908296610411575b50906102f661ffff6127109316886110a6565b9050049061271061030c61ffff849716886110a6565b0493151580610408575b61034e575b5050610336816103318461033187608099611050565b611050565b91604051938452602084015260408301526060820152f35b600495945060209192506040519586809263388719b560e01b82525afa9384156103fc576000946103b0575b5061033661271061039161ffff60809716846110a6565b0491610331846103316103a5868795611050565b97985050505061031b565b93506020843d6020116103f4575b816103cb60209383610ebe565b8101031261014b5761033661271061039161ffff6103ea608098611073565b975050505061037a565b3d91506103be565b6040513d6000823e3d90fd5b50811515610316565b61ffff96506127109291506104406102f69160403d60401161044a575b6104388183610ebe565b810190611082565b97509192506102e3565b503d61042e565b50604051903d90823e3d90fd5b3461014b57600036600319011261014b57600154336001600160a01b03909116036104d257600180546001600160a01b03199081169091556000805433928116831782556001600160a01b0316907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e09080a3005b63118cdaa760e01b6000523360045260246000fd5b3461014b5761012036600319011261014b5760006002805414610c30576002805561051061110b565b61010435804211610c1a57506064358015610c0b57608435918215610bfc576004546001600160a01b031615610bed576001600160a01b03610550610ff8565b16916040516370a0823160e01b8152306004820152602081602481875afa908115610b1e578391610bbb575b506105b76040516323b872dd60e01b6020820152336024820152306044820152836064820152606481526105b1608482610ebe565b8561112b565b6040516370a0823160e01b815230600482015290602082602481885afa8015610bb0578490610b7a575b6105eb9250611050565b8015610b6b576003546001600160a01b03169261060661100e565b6040805163c409b75160e01b81526001600160a01b03909216600483015281602481885afa908115610b605782908392610b32575b5061064d61ffff6127109216856110a6565b049261271061066161ffff869416836110a6565b939693049386936001600160a01b03610678611024565b16151580610b29575b610a73575b505085610331856103318561069a95611050565b918215610a645781610a47575b83610a36575b85610a1f575b60405163095ea7b360e01b60208083019182526001600160a01b037f00000000000000000000000000000000000000000000000000000000000000001660248401819052604480850188905284529392918390610711606485610ebe565b835190828d5af182513d82610a03575b5050156109bf575b50610732610ff8565b61073a61103a565b9960443562ffffff81168091036109bb5760a4356001600160a01b03811693908490036109b7576040519060e0820182811067ffffffffffffffff8211176109a35760409081526001600160a01b0391821683529d811660208301908152828f019384523360608401908152608084018b815260a0850196875260c085019788529f516304e45aaf60e01b8152935183166004850152905182166024840152925162ffffff1660448301529151821660648201529b5160848d0152905160a48c015290511660c48a0152808983815a9360e492602095f1978815610451578198610968575b60209950604051918a8181850163095ea7b360e01b815286602487015281604487015260448652610851606487610ebe565b85519082865af181513d8261094c575b505015610907575b50505050610875610ff8565b9461087e61103a565b9361088761100e565b92610890611024565b604080519889528b8901969096529487018990526060870152608086015260a08501526001600160a01b0390811660c085015290811660e084015290811692169033907fa49e7b692efed714c7f2447dbc6811cdce8152f294bbab2726e705a7279546099061010090a46001600255604051908152f35b6109439361093e916040519163095ea7b360e01b8e8401526024830152604482015260448152610938606482610ebe565b8261112b565b61112b565b87808080610869565b9091506109605750813b15155b8c80610861565b600114610959565b9750976020813d60201161099b575b8161098460209383610ebe565b810103126109975797602098519761081f565b8880fd5b3d9150610977565b634e487b7160e01b87526041600452602487fd5b8480fd5b8380fd5b6109fd906109f760405163095ea7b360e01b6020820152856024820152846044820152604481526109f1606482610ebe565b8b61112b565b8961112b565b89610729565b909150610a175750883b15155b8b80610721565b600114610a10565b610a3186610a2b611024565b896110cd565b6106b3565b610a4284610a2b61100e565b6106ad565b600454610a5f9083906001600160a01b0316896110cd565b6106a7565b631f2a200560e01b8152600490fd5b602091975060049293506040519283809263388719b560e01b82525afa908115610b1e578391610ad1575b50612710610ab361ffff61069a9316886110a6565b049561033185610331610ac78a8b95611050565b9594505050610686565b90506020813d602011610b16575b81610aec60209383610ebe565b81010312610b1257612710610ab361ffff610b0961069a94611073565b93505050610a9e565b8280fd5b3d9150610adf565b6040513d85823e3d90fd5b50811515610681565b61ffff92506127109150610b5761064d9160403d60401161044a576104388183610ebe565b9350915061063b565b6040513d84823e3d90fd5b63b5c74a2760e01b8352600483fd5b50906020813d602011610ba8575b81610b9560209383610ebe565b810103126109bb57906105eb91516105e1565b3d9150610b88565b6040513d86823e3d90fd5b90506020813d602011610be5575b81610bd660209383610ebe565b81010312610b1257518561057c565b3d9150610bc9565b634a1112cb60e01b8152600490fd5b63013f32eb60e61b8152600490fd5b631f2a200560e01b8252600482fd5b63aa2fd92560e01b825260045242602452604490fd5b633ee5aeb560e01b8152600490fd5b3461014b57600036600319011261014b57610c586110b9565b600180546001600160a01b0319908116909155600080549182168155906001600160a01b03167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e08280a3005b3461014b57600036600319011261014b576003546040516001600160a01b039091168152602090f35b3461014b57600036600319011261014b576004546040516001600160a01b039091168152602090f35b3461014b57600036600319011261014b57602060ff60015460a01c166040519015158152f35b3461014b57600036600319011261014b57610d356110b9565b60015460ff8160a01c1615610d7c5760ff60a01b19166001556040513381527f5db9ee0a495bf2e6ff9c91a7834c1ba4fdd244a5e8aa4e537bd38aeae4b073aa90602090a1005b638dfc202b60e01b60005260046000fd5b3461014b57602036600319011261014b57610da6610ea8565b610dae6110b9565b6001600160a01b0316610dc2811515610fc0565b600354816001600160a01b0382167f7e68652a0c587783e92a04abfe196d3265a14d40871971ac7903c9878f60745e600080a36001600160a01b03191617600355005b3461014b57602036600319011261014b57610e1e610ea8565b610e266110b9565b6001600160a01b0316610e3a811515610fc0565b600454816001600160a01b0382167f1d2905fbf964179619d5fa494512e36c501ab4b531f6fe53421899ad34ff5d1c600080a36001600160a01b03191617600455005b3461014b57602036600319011261014b57610ea6610e99610ea8565b610ea16110b9565b610ef6565b005b600435906001600160a01b038216820361014b57565b90601f8019910116810190811067ffffffffffffffff821117610ee057604052565b634e487b7160e01b600052604160045260246000fd5b6040516370a0823160e01b8152306004820152906001600160a01b0316602082602481845afa9182156103fc57600092610f89575b508115610f8557600454610f4a9083906001600160a01b0316836110cd565b6004546040519283526001600160a01b0316917fbb3f74f3539ea7725781ff6810125a75c183f5c944318fc94873d1324f0482ae90602090a3565b5050565b90916020823d602011610fb8575b81610fa460209383610ebe565b81010312610fb55750519038610f2b565b80fd5b3d9150610f97565b15610fc757565b60405162461bcd60e51b81526020600482015260096024820152683d32b9379030b2323960b91b6044820152606490fd5b6004356001600160a01b038116810361014b5790565b60c4356001600160a01b038116810361014b5790565b60e4356001600160a01b038116810361014b5790565b6024356001600160a01b038116810361014b5790565b9190820391821161105d57565b634e487b7160e01b600052601160045260246000fd5b519061ffff8216820361014b57565b919082604091031261014b576110a3602061109c84611073565b9301611073565b90565b8181029291811591840414171561105d57565b6000546001600160a01b031633036104d257565b60405163a9059cbb60e01b60208201526001600160a01b039290921660248301526044808301939093529181526111099161093e606483610ebe565b565b60ff60015460a01c1661111a57565b63d93c066560e01b60005260046000fd5b906000602091828151910182855af1156103fc576000513d61117d57506001600160a01b0381163b155b61115c5750565b635274afe760e01b60009081526001600160a01b0391909116600452602490fd5b6001141561115556fea26469706673582212206d61f8c5660b00a8fe02f85811923a523942e632da9452e2cbaf84159c21fa5664736f6c634300081c0033",
    "deployedSize": 4540
  },
  "BoilStaking": {
    "abi": [
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "owner_",
            "type": "address"
          },
          {
            "internalType": "uint256[4]",
            "name": "thresholds",
            "type": "uint256[4]"
          },
          {
            "internalType": "uint16[4]",
            "name": "discounts",
            "type": "uint16[4]"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "requested",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "max",
            "type": "uint256"
          }
        ],
        "name": "LockTooLong",
        "type": "error"
      },
      {
        "inputs": [],
        "name": "NothingStaked",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "owner",
            "type": "address"
          }
        ],
        "name": "OwnableInvalidOwner",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "account",
            "type": "address"
          }
        ],
        "name": "OwnableUnauthorizedAccount",
        "type": "error"
      },
      {
        "inputs": [],
        "name": "ReentrancyGuardReentrantCall",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "token",
            "type": "address"
          }
        ],
        "name": "SafeERC20FailedOperation",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "uint64",
            "name": "until",
            "type": "uint64"
          }
        ],
        "name": "StillLocked",
        "type": "error"
      },
      {
        "inputs": [],
        "name": "ThresholdsNotAscending",
        "type": "error"
      },
      {
        "inputs": [],
        "name": "TokenAlreadySet",
        "type": "error"
      },
      {
        "inputs": [],
        "name": "TokenNotSet",
        "type": "error"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "previousOwner",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "newOwner",
            "type": "address"
          }
        ],
        "name": "OwnershipTransferStarted",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "previousOwner",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "newOwner",
            "type": "address"
          }
        ],
        "name": "OwnershipTransferred",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "account",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint64",
            "name": "lockedUntil",
            "type": "uint64"
          },
          {
            "indexed": false,
            "internalType": "uint8",
            "name": "tier",
            "type": "uint8"
          }
        ],
        "name": "Staked",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "internalType": "uint256[4]",
            "name": "thresholds",
            "type": "uint256[4]"
          },
          {
            "indexed": false,
            "internalType": "uint16[4]",
            "name": "discounts",
            "type": "uint16[4]"
          }
        ],
        "name": "TiersUpdated",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "token",
            "type": "address"
          }
        ],
        "name": "TokenSet",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "account",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          }
        ],
        "name": "Unstaked",
        "type": "event"
      },
      {
        "inputs": [],
        "name": "MAX_LOCK",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "acceptOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "boil",
        "outputs": [
          {
            "internalType": "contract IERC20",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "account",
            "type": "address"
          }
        ],
        "name": "feeDiscountBpsOf",
        "outputs": [
          {
            "internalType": "uint16",
            "name": "",
            "type": "uint16"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "owner",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "pendingOwner",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "account",
            "type": "address"
          }
        ],
        "name": "positionOf",
        "outputs": [
          {
            "components": [
              {
                "internalType": "uint128",
                "name": "amount",
                "type": "uint128"
              },
              {
                "internalType": "uint64",
                "name": "lockedUntil",
                "type": "uint64"
              }
            ],
            "internalType": "struct BoilStaking.Position",
            "name": "",
            "type": "tuple"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "account",
            "type": "address"
          }
        ],
        "name": "positions",
        "outputs": [
          {
            "internalType": "uint128",
            "name": "amount",
            "type": "uint128"
          },
          {
            "internalType": "uint64",
            "name": "lockedUntil",
            "type": "uint64"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "renounceOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256[4]",
            "name": "thresholds",
            "type": "uint256[4]"
          },
          {
            "internalType": "uint16[4]",
            "name": "discounts",
            "type": "uint16[4]"
          }
        ],
        "name": "setTiers",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "token",
            "type": "address"
          }
        ],
        "name": "setToken",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          },
          {
            "internalType": "uint64",
            "name": "lockSeconds",
            "type": "uint64"
          }
        ],
        "name": "stake",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "name": "tierFeeDiscountBps",
        "outputs": [
          {
            "internalType": "uint16",
            "name": "",
            "type": "uint16"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "account",
            "type": "address"
          }
        ],
        "name": "tierOf",
        "outputs": [
          {
            "internalType": "uint8",
            "name": "tier",
            "type": "uint8"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "name": "tierThresholds",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "tokenFrozen",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "totalStaked",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "newOwner",
            "type": "address"
          }
        ],
        "name": "transferOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          }
        ],
        "name": "unstake",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      }
    ],
    "bytecode": "0x608060405234610270576110498038038061001981610285565b928339810190610120818303126102705780516001600160a01b038116908190036102705782603f830112156102705760809061005582610285565b809460a08501918183116102705760208601905b8382106102755750508060bf860112156102705761008684610285565b9161012083960191821161027057915b81831061025557505050801561023f57600180546001600160a01b031990811690915560008054918216831781556001600160a01b03909116907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e09080a3600160025560015b600481106101e857508260005b600481106101d35750508160009060005b600481106101ad575050600a55604051926000845b600482106101975750505082016000905b6004821061017d577fdd8844fa360b48b97e3c9942bec8d0c84c4875020e5d5688dbc196e162ece2f961010085a1604051610d6190816102e88239f35b60208060019261ffff865116815201930191019091610140565b602080600192855181520193019101909161012f565b9091602060019161ffff8551169061ffff8560041b92831b921b1916179301910161011a565b60019060208351930192816006015501610109565b6101f281856102c0565b5160001982018281116102295761020990866102c0565b511015610218576001016100fc565b630f9c532160e41b60005260046000fd5b634e487b7160e01b600052601160045260246000fd5b631e4fbdf760e01b600052600060045260246000fd5b825161ffff8116810361027057815260209283019201610096565b600080fd5b8151815260209182019101610069565b6040519190601f01601f191682016001600160401b038111838210176102aa57604052565b634e487b7160e01b600052604160045260246000fd5b9060048110156102d15760051b0190565b634e487b7160e01b600052603260045260246000fdfe6080604052600436101561001257600080fd5b60003560e01c8063144fa6d714610ada5780632e17de78146109a5578063308f58f71461097a5780633135b71414610951578063479466931461090757806355f57510146108af57806365a5d5f014610890578063715018a61461082b57806379ba5097146107a2578063817b1cd2146107845780638da5cb5b1461075b578063952e68cf1461046a578063a100d69d1461043e578063afc361bc14610418578063c8f74bb8146103de578063d87444d214610215578063e30c3978146101ec578063f2fde38b146101785763fd2d39c5146100ed57600080fd5b34610173576020366003190112610173576004356001600160a01b03811690819003610173576000602060405161012381610bd9565b8281520152600052600460205260408060002067ffffffffffffffff82519161014b83610bd9565b548160206001600160801b03831694858152019160801c168152835192835251166020820152f35b600080fd5b34610173576020366003190112610173576004356001600160a01b03811690819003610173576101a6610c8b565b600180546001600160a01b03191682179055600080546001600160a01b0316907f38d16b8cac22d99fc7c124b9cd0de2d3fa1faef420bfe791d8c362d765e227009080a3005b34610173576000366003190112610173576001546040516001600160a01b039091168152602090f35b3461017357610100366003190112610173573660841161017357366101041161017357610240610c8b565b608060405161024f8282610c0b565b6000916004825b608482106103ce5750506040519061026e8183610c0b565b6084825b61010482106103af57505060015b6004811061035c575082845b60048110610347575050818490855b60048110610321575050600a556040519284845b6004821061030b57505050820183905b600482106102f157847fdd8844fa360b48b97e3c9942bec8d0c84c4875020e5d5688dbc196e162ece2f961010086a180f35b60208060019261ffff8651168152019301910190916102bf565b60208060019285518152019301910190916102af565b9091602060019161ffff8551169061ffff8560041b92831b921b1916179301910161029b565b6001906020835193019281600601550161028c565b6103668185610cbf565b51600019820182811161039b5761037d9086610cbf565b51101561038c57600101610280565b630f9c532160e41b8552600485fd5b634e487b7160e01b87526011600452602487fd5b813561ffff811681036103ca57815260209182019101610272565b8680fd5b8135815260209182019101610256565b34610173576020366003190112610173576004356001600160a01b03811681036101735761040d602091610c2d565b60ff60405191168152f35b3461017357600036600319011261017357602060ff60035460a01c166040519015158152f35b346101735760203660031901126101735760043560048110156101735760209060060154604051908152f35b34610173576040366003190112610173576004356024359067ffffffffffffffff82168092036101735761049c610c9f565b6003546001600160a01b0316801561074a5781156106a7576301e13380831161072d576040516370a0823160e01b815230600482015290602082602481845afa9182156106ec576000926106f8575b5060249261052891604051916323b872dd60e01b60208401523386840152306044840152606483015260648252610523608483610c0b565b610cd0565b6003546040516370a0823160e01b81523060048201529260209184919082906001600160a01b03165afa80156106ec576000906106b8575b61056a9250610bcc565b9081156106a7573360005260046020526040600020906001600160801b0383166001600160801b03835416016001600160801b038111610664576001600160801b03166001600160801b031983541617825567ffffffffffffffff42160167ffffffffffffffff81116106645781549067ffffffffffffffff8260801c1667ffffffffffffffff82161161067a575b5050600554828101809111610664576005555460ff9060801c67ffffffffffffffff1661062533610c2d565b9060405193845260208401521660408201527fc347a64e994ed4905457c73922466a9df2989e55f53c1fc9eb2940ac05a2a11060603392a26001600255005b634e487b7160e01b600052601160045260246000fd5b67ffffffffffffffff60801b1990911660809190911b67ffffffffffffffff60801b1617815582806105f9565b639fe7bfd960e01b60005260046000fd5b506020823d6020116106e4575b816106d260209383610c0b565b810103126101735761056a9151610560565b3d91506106c5565b6040513d6000823e3d90fd5b9091506020813d602011610725575b8161071460209383610c0b565b8101031261017357519060246104eb565b3d9150610707565b8263cdd02da560e01b6000526004526301e1338060245260446000fd5b634b62f01360e01b60005260046000fd5b34610173576000366003190112610173576000546040516001600160a01b039091168152602090f35b34610173576000366003190112610173576020600554604051908152f35b3461017357600036600319011261017357600154336001600160a01b039091160361081657600180546001600160a01b03199081169091556000805433928116831782556001600160a01b0316907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e09080a3005b63118cdaa760e01b6000523360045260246000fd5b3461017357600036600319011261017357610844610c8b565b600180546001600160a01b0319908116909155600080549182168155906001600160a01b03167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e08280a3005b346101735760003660031901126101735760206040516301e133808152f35b34610173576020366003190112610173576004356001600160a01b038116908190036101735760005260046020526040806000205467ffffffffffffffff8251916001600160801b038116835260801c166020820152f35b34610173576020366003190112610173576004356001600160a01b03811681036101735761ffff61094161093c602093610c2d565b610b9b565b90549060031b1c16604051908152f35b34610173576000366003190112610173576003546040516001600160a01b039091168152602090f35b346101735760203660031901126101735760043560048110156101735761ffff610941602092610b9b565b34610173576020366003190112610173576004356109c1610c9f565b336000526004602052604060002080546001600160801b0381169081158015610ad2575b8015610ac9575b6106a75767ffffffffffffffff9060801c16804210610ab557506001600160801b03831690036001600160801b038111610664576001600160801b03166001600160801b0319825416179055610a4481600554610bcc565b60055560035460405163a9059cbb60e01b602082015233602482015260448082018490528152610a82916001600160a01b0316610523606483610c0b565b6040519081527f0f5bb82176feb1b5e747e28471aa92156a04d9f3ab9f45f28e2d704232b93f7560203392a26001600255005b634a51c20f60e11b60005260045260246000fd5b508184116109ec565b5083156109e5565b34610173576020366003190112610173576004356001600160a01b0381169081900361017357610b08610c8b565b60035460ff8160a01c16610b8a578115610b58576001600160a81b0319168117600160a01b176003557fa07c91c183e42229e705a9795a1c06d76528b673788b849597364528c96eefb7600080a2005b60405162461bcd60e51b815260206004820152600a6024820152693d32b937903a37b5b2b760b11b6044820152606490fd5b6371168e4f60e11b60005260046000fd5b906004821015610bb657601e8260041c600a019260011b1690565b634e487b7160e01b600052603260045260246000fd5b9190820391821161066457565b6040810190811067ffffffffffffffff821117610bf557604052565b634e487b7160e01b600052604160045260246000fd5b90601f8019910116810190811067ffffffffffffffff821117610bf557604052565b6001600160a01b03166000908152600460205260408120549091906001600160801b0316825b600460ff821610610c62575050565b6004811015610bb6578060060154821015610c83575b60010160ff16610c53565b925082610c78565b6000546001600160a01b0316330361081657565b6002805414610cae5760028055565b633ee5aeb560e01b60005260046000fd5b906004811015610bb65760051b0190565b906000602091828151910182855af1156106ec576000513d610d2257506001600160a01b0381163b155b610d015750565b635274afe760e01b60009081526001600160a01b0391909116600452602490fd5b60011415610cfa56fea2646970667358221220ee1d36da107c413dd9e0622437bdeb08b7077df25b16e4b36f08d3131f81919864736f6c634300081c0033",
    "deployedSize": 3425
  }
} as const;

export type ArtifactName = keyof typeof ARTIFACTS;
