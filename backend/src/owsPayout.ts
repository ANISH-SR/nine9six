import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";

type SendResult = { signature: string } | { error: string };

/**
 * Sends SOL from the platform treasury using OWS when
 * OWS_PLATFORM_WALLET_NAME + OWS_WALLET_PASSPHRASE (+ optional OWS_VAULT_PATH) are set.
 * Falls back to legacy bs58 hot wallet when OWS is not configured.
 */
export async function sendTreasuryTransfer(params: {
  connection: Connection;
  fromPublicKey: string;
  toAddress: string;
  lamports: number;
  rpcUrl: string;
}): Promise<SendResult> {
  const walletName = process.env.OWS_PLATFORM_WALLET_NAME;
  const passphrase = process.env.OWS_WALLET_PASSPHRASE;
  const vaultPath = process.env.OWS_VAULT_PATH;

  if (walletName && passphrase) {
    try {
      const ows = await import("@open-wallet-standard/core");
      const { blockhash } = await params.connection.getLatestBlockhash();
      const fromPubkey = new PublicKey(params.fromPublicKey);
      const toPubkey = new PublicKey(params.toAddress);
      const tx = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey,
          toPubkey,
          lamports: params.lamports,
        })
      );
      tx.feePayer = fromPubkey;
      tx.recentBlockhash = blockhash;
      const serialized = tx.serialize({
        requireAllSignatures: false,
        verifySignatures: false,
      });
      const txHex = Buffer.from(serialized as Uint8Array).toString("hex");
      const result = await ows.signAndSend(
        walletName,
        "solana",
        txHex,
        passphrase,
        0,
        params.rpcUrl,
        vaultPath
      );
      return { signature: result.txHash };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      return { error: `OWS payout failed: ${msg}` };
    }
  }

  return { error: "OWS_NOT_CONFIGURED" };
}
