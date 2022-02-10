# GoodGhosting
This subgraph dynamically tracks the new players joining the game, the interest generated in the game, if an player performs an early withdraw etc.

## Setup
Till we have support for unified subgraph use the ```subgraph/v1``` branch for Aave and Moola pools. For Curve pools, use the branch `feat/curve-integration`





After cloning the repository run ```yarn install```

Chnage the network name and the contract addres in the [YAML](https://github.com/Good-Ghosting/graph/blob/master/subgraph.yaml) file.

Run ```yarn codegen```

If everything compiles sucessfully then run ```yarn build```

Now, you are ready for the network deployment.

Run ```graph auth https://api.thegraph.com/deploy/ <ACCESS_TOKEN_IN_THE_GRAPH_DASHBOARD>```

Now, let's suppose the subgraph that is created on the graph ui has a name Maticgoodghosting.

then the deployment command would be like and make sure in your local the root folder name is ```Maticgoodghosting```

```graph deploy \
    --debug \
    --node https://api.thegraph.com/deploy/ \
    --ipfs https://api.thegraph.com/ipfs/ \
    Good-Ghosting/Maticgoodghosting```
