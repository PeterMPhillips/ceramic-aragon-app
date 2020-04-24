/*
 * These hooks are called by the Aragon Buidler plugin during the start task's lifecycle. Use them to perform custom tasks at certain entry points of the development build process, like deploying a token before a proxy is initialized, etc.
 *
 * Link them to the main buidler config file (buidler.config.js) in the `aragon.hooks` property.
 *
 * All hooks receive two parameters:
 * 1) A params object that may contain other objects that pertain to the particular hook.
 * 2) A "bre" or BuidlerRuntimeEnvironment object that contains enviroment objects like web3, Truffle artifacts, etc.
 *
 * Please see AragonConfigHooks, in the plugin's types for further details on these interfaces.
 * https://github.com/aragon/buidler-aragon/blob/develop/src/types.ts#L31
 */

 let voting, accounts, aclAddress

 const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
 const ANY_ADDRESS = '0xffffffffffffffffffffffffffffffffffffffff'

module.exports = {
  // Called before a dao is deployed.
  preDao: async ({ log }, { web3, artifacts }) => {},

  // Called after a dao is deployed.
  postDao: async (
    { dao, _experimentalAppInstaller, log },
    { web3, artifacts }
  ) => {
    console.log('DAO Object: ', dao)
    aclAddress = await dao.acl()
    const bigExp = (x, y) =>
      web3.utils
        .toBN(x)
        .mul(web3.utils.toBN(10).pow(web3.utils.toBN(y)))
    const pct16 = (x) => bigExp(x, 16)

    // Retrieve accounts.
    accounts = await web3.eth.getAccounts()

    // Deploy a minime token an generate tokens to root account
    const minime = await _deployMinimeToken(artifacts)
    await minime.generateTokens(accounts[0], pct16(100))
    log(`> Minime token deployed: ${minime.address}`)

    const tokens = await _experimentalAppInstaller('token-manager', {
      skipInitialize: true,
    })

    await minime.changeController(tokens.address)
    log(`> Change minime controller to tokens app`)
    await tokens.initialize([minime.address, true, 0])
    log(`> Tokens app installed: ${tokens.address}`)

    voting = await _experimentalAppInstaller('voting', {
      initializeArgs: [
        minime.address,
        pct16(50), // support 50%
        pct16(25), // quorum 15%
        300 // 5 minutes
      ],
    })
    log(`> Voting app installed: ${voting.address}`)

    await tokens.createPermission('MINT_ROLE', voting.address)
    await voting.createPermission('CREATE_VOTES_ROLE', tokens.address)
  },

  // Called after the app's proxy is created, but before it's initialized.
  preInit: async (
    { proxy, _experimentalAppInstaller, log },
    { web3, artifacts }
  ) => {

  },

  // Called after the app's proxy is initialized.
  postInit: async (
    { proxy, _experimentalAppInstaller, log },
    { web3, artifacts }
  ) => {

  },

  // Called when the start task needs to know the app proxy's init parameters.
  // Must return an array with the proxy's init parameters.
  getInitParams: async ({ log }, { web3, artifacts }) => {
    return []
  },

  // Called to setup app permissions
  setupPermissions: async (
    { dao, proxy, createPermission, log},
    { web3, artifacts }
  ) => {
    const role = await proxy.UPDATE_ROLE()
    await createPermission(voting.address, role)
  },

  // Called after the app's proxy is updated with a new implementation.
  postUpdate: async ({ proxy, log }, { web3, artifacts }) => {},
}

async function _deployMinimeToken(artifacts) {
  const MiniMeTokenFactory = await artifacts.require('MiniMeTokenFactory')
  const MiniMeToken = await artifacts.require('MiniMeToken')
  const factory = await MiniMeTokenFactory.new()
  const token = await MiniMeToken.new(
    factory.address,
    ZERO_ADDRESS,
    0,
    'Ceramic Network Token',
    18,
    'CNT',
    true
  )
  return token
}
