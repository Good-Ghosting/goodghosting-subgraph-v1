// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.

import {
  Address,
  DataSourceTemplate,
  DataSourceContext
} from "@graphprotocol/graph-ts";

export class Contract extends DataSourceTemplate {
  static create(address: Address): void {
    DataSourceTemplate.create("Contract", [address.toHex()]);
  }

  static createWithContext(address: Address, context: DataSourceContext): void {
    DataSourceTemplate.createWithContext(
      "Contract",
      [address.toHex()],
      context
    );
  }
}