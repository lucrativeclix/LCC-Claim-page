import { ethers } from "ethers";

export const contractAddress = process.env.LCC_ADDRESS;

const abi = [
  "function mint(address to, uint256 amount) public",
  "function decimals() public view returns (uint8)"
];

export function getSigner() {
  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
  return new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
}

export async function mintTo(to: string, amount: number) {
  const signer = getSigner();
  const contract = new ethers.Contract(contractAddress!, abi, signer);
  const decimals = await contract.decimals();
  const units = ethers.parseUnits(amount.toString(), decimals);
  const tx = await contract.mint(to, units);
  return tx.wait();
}
