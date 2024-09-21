require ("@nomicfoundation/hardhat-toolbox")
require("dotenv").config();
const infuraurl=process.env.infuraurl;
const privatekey=process.env.metamaskprivatekey;
const hardhatlocalhost=process.env.hardhatlocalhost;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {

  defaultNetwork : "infurasep",
  networks: {
    localhost:  {
      url: hardhatlocalhost

    },
    infurasep : {
      //infura url example : https://sepolia.infura.io/v3/infura-api
      url: infuraurl,   
      accounts: [privatekey] //add metamask private key
    }
  },
  solidity: "0.8.20",
}