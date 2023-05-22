# Noir with Nextjs and Hardhat


This example uses [Next.js](https://nextjs.org/) as the frontend framework, and
[Hardhat](https://hardhat.org/) to deploy.

## Getting Started

1. Install dependencies with

```bash
npm i
```

⚠️ The examples install specific versions of the required `@noir-lang` npm pacakges. Different
versions are not cross compatible. Do not use `yarn` as it fails to grab the NPM specific versions
we need. Noir is being actively developed, so the latest versions of various packages are often
incompatible with each other. ⚠️

2. Write circuits in `./circuits/src`.

You can read more about writing circuits in Noir on the [Noir docs](https://noir-lang.org/).

3. Create the verifier contract

Although the `npm build` already generates and compiles the circuits before deploying, you can
manually create the Solidity verifier contract:

- natively by navigating to the `.circuits/` directory and running `nargo codegen-verifier`. If you
  generate the verifier contract via this method, you may need to copy the file created at
  `./circuits/contract/plonk_vk.sol` to the hardhat contract directory at `./contract`.
- with wasm by running the `genContract.ts` script:

```bash
npx ts-node scripts/genContract.ts
```

4. Create proofs

**Natively**

In `./circuits`:

- Compile your circuits if you haven't already with `nargo compile <CIRCUIT_NAME>`.
- Populate the inputs in `Prover.toml`
- Generate proof with `nargo prove <proof_name>`

**With Typescript and WASM**

- See an example React component in [`./components/component.tsx`](./components/component.tsx)

5. Verify proofs

**Natively**

In `./circuits`:

- Verify proof with `nargo verify <proof_name>`

**With Typescript and WASM**

- See the example in [`./components/component.tsx`](./components/component.tsx)

6. Deploy

- Start a local development EVM at <http://localhost:8545>, for example with `npx hardhat node`.
- Copy `./.env.example` to `./.env` and add keys for alchemy (to act as a node) and the deployer's
  private key. Make sure you have funds in this account.
- Run `NETWORK=localhost npm build` to build the project and deploy contracts to the local
  development chain

You can choose any other network in `hardhat.config.ts` and deploy there using this `NETWORK`
environment variable. For example, `NETWORK=mumbai npm build` or `NETWORK=sepoia npm build`. Feel
free to contribute with other networks in `hardhat.config.ts`

## Estimate gas

There is a [script](./scripts/verificationGas.ts) to easily check how much gas ethers estimates a
call to the `verify` function will cost.

```sh
npm run verify_gas
```
