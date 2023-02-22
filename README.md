# BOOKSTORE APP DEPLOYED ON GOERLI NETWORK

**SET UP THE APP**

- You need `keys.json`

        {
                <!-- you need your infura endpoint -->
        "INFURA_PROJECT_ID": "",
        "MNEMONIC": ""
        }

- Once your configuration is done

  ```
  truffle migrate --network goerli
  ```

- save the contract address and transaction hash

        > transaction hash:    0x28e4c044ea4974d3272c5dd626fe6bd929621108f760032f848419cf5c298f9d
        > contract address:    0xF7E4E95fFb580caBA106FE5993a306CDb76E6434

- contracts will be in `public/contracts` folder

- `npm install`
- `npm run dev`
