// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.

import {
  ethereum,
  JSONValue,
  TypedMap,
  Entity,
  Bytes,
  Address,
  BigInt
} from "@graphprotocol/graph-ts";

export class OwnershipTransferred extends ethereum.Event {
  get params(): OwnershipTransferred__Params {
    return new OwnershipTransferred__Params(this);
  }
}

export class OwnershipTransferred__Params {
  _event: OwnershipTransferred;

  constructor(event: OwnershipTransferred) {
    this._event = event;
  }

  get previousOwner(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get newOwner(): Address {
    return this._event.parameters[1].value.toAddress();
  }
}

export class PoolAdded extends ethereum.Event {
  get params(): PoolAdded__Params {
    return new PoolAdded__Params(this);
  }
}

export class PoolAdded__Params {
  _event: PoolAdded;

  constructor(event: PoolAdded) {
    this._event = event;
  }

  get contracts(): Address {
    return this._event.parameters[0].value.toAddress();
  }
}

export class PoolRemoved extends ethereum.Event {
  get params(): PoolRemoved__Params {
    return new PoolRemoved__Params(this);
  }
}

export class PoolRemoved__Params {
  _event: PoolRemoved;

  constructor(event: PoolRemoved) {
    this._event = event;
  }

  get contracts(): Address {
    return this._event.parameters[0].value.toAddress();
  }
}

export class RegistryInitialized extends ethereum.Event {
  get params(): RegistryInitialized__Params {
    return new RegistryInitialized__Params(this);
  }
}

export class RegistryInitialized__Params {
  _event: RegistryInitialized;

  constructor(event: RegistryInitialized) {
    this._event = event;
  }

  get contracts(): Array<Address> {
    return this._event.parameters[0].value.toAddressArray();
  }
}

export class Registry extends ethereum.SmartContract {
  static bind(address: Address): Registry {
    return new Registry("Registry", address);
  }

  owner(): Address {
    let result = super.call("owner", "owner():(address)", []);

    return result[0].toAddress();
  }

  try_owner(): ethereum.CallResult<Address> {
    let result = super.tryCall("owner", "owner():(address)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toAddress());
  }

  pools(param0: Address): boolean {
    let result = super.call("pools", "pools(address):(bool)", [
      ethereum.Value.fromAddress(param0)
    ]);

    return result[0].toBoolean();
  }

  try_pools(param0: Address): ethereum.CallResult<boolean> {
    let result = super.tryCall("pools", "pools(address):(bool)", [
      ethereum.Value.fromAddress(param0)
    ]);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBoolean());
  }
}

export class ConstructorCall extends ethereum.Call {
  get inputs(): ConstructorCall__Inputs {
    return new ConstructorCall__Inputs(this);
  }

  get outputs(): ConstructorCall__Outputs {
    return new ConstructorCall__Outputs(this);
  }
}

export class ConstructorCall__Inputs {
  _call: ConstructorCall;

  constructor(call: ConstructorCall) {
    this._call = call;
  }

  get _contracts(): Array<Address> {
    return this._call.inputValues[0].value.toAddressArray();
  }
}

export class ConstructorCall__Outputs {
  _call: ConstructorCall;

  constructor(call: ConstructorCall) {
    this._call = call;
  }
}

export class RenounceOwnershipCall extends ethereum.Call {
  get inputs(): RenounceOwnershipCall__Inputs {
    return new RenounceOwnershipCall__Inputs(this);
  }

  get outputs(): RenounceOwnershipCall__Outputs {
    return new RenounceOwnershipCall__Outputs(this);
  }
}

export class RenounceOwnershipCall__Inputs {
  _call: RenounceOwnershipCall;

  constructor(call: RenounceOwnershipCall) {
    this._call = call;
  }
}

export class RenounceOwnershipCall__Outputs {
  _call: RenounceOwnershipCall;

  constructor(call: RenounceOwnershipCall) {
    this._call = call;
  }
}

export class TransferOwnershipCall extends ethereum.Call {
  get inputs(): TransferOwnershipCall__Inputs {
    return new TransferOwnershipCall__Inputs(this);
  }

  get outputs(): TransferOwnershipCall__Outputs {
    return new TransferOwnershipCall__Outputs(this);
  }
}

export class TransferOwnershipCall__Inputs {
  _call: TransferOwnershipCall;

  constructor(call: TransferOwnershipCall) {
    this._call = call;
  }

  get newOwner(): Address {
    return this._call.inputValues[0].value.toAddress();
  }
}

export class TransferOwnershipCall__Outputs {
  _call: TransferOwnershipCall;

  constructor(call: TransferOwnershipCall) {
    this._call = call;
  }
}

export class AddContractCall extends ethereum.Call {
  get inputs(): AddContractCall__Inputs {
    return new AddContractCall__Inputs(this);
  }

  get outputs(): AddContractCall__Outputs {
    return new AddContractCall__Outputs(this);
  }
}

export class AddContractCall__Inputs {
  _call: AddContractCall;

  constructor(call: AddContractCall) {
    this._call = call;
  }

  get _contract(): Address {
    return this._call.inputValues[0].value.toAddress();
  }
}

export class AddContractCall__Outputs {
  _call: AddContractCall;

  constructor(call: AddContractCall) {
    this._call = call;
  }
}

export class RemoveContractCall extends ethereum.Call {
  get inputs(): RemoveContractCall__Inputs {
    return new RemoveContractCall__Inputs(this);
  }

  get outputs(): RemoveContractCall__Outputs {
    return new RemoveContractCall__Outputs(this);
  }
}

export class RemoveContractCall__Inputs {
  _call: RemoveContractCall;

  constructor(call: RemoveContractCall) {
    this._call = call;
  }

  get _contract(): Address {
    return this._call.inputValues[0].value.toAddress();
  }
}

export class RemoveContractCall__Outputs {
  _call: RemoveContractCall;

  constructor(call: RemoveContractCall) {
    this._call = call;
  }
}