import {Button, Container, Heading, Spinner, Table, Tooltip, Text, Callout} from "@radix-ui/themes";
import {useSignAndExecuteTransaction, useSuiClientQuery} from "@mysten/dapp-kit";
import {ReceiptObject} from "@/features/Deposit/Deposit.interface";
import {useNetworkVariable} from "@/configs/networkConfig.ts";
import {tsToDate} from "@/static/date.helper.ts";
import {amountToUsdc} from "@/static/crypto.helper.ts";
import {TESTNET_USDC_TOKEN} from "@/static/constants.ts";
import { Transaction } from "@mysten/sui/transactions";
import {useMemo} from "react";
import {copyToClipboard, truncateHex} from "@/static/string.helper.ts";
import {InfoCircledIcon} from "@radix-ui/react-icons";

export function DepositList({ owner }: { owner: string }) {
  const depositPackageId = useNetworkVariable("depositPackageId");
  const {mutate: signAndExecute} = useSignAndExecuteTransaction();

  const { data, isLoading, isSuccess, refetch } = useSuiClientQuery('getOwnedObjects', {
    owner: owner,
    options: {
      showContent: true,
      showOwner: true,
      showType: true,
    },
    filter: {
      StructType: `${depositPackageId}::timedeposit::DepositReceipt`
    }
  })

  const depositReceipts: ReceiptObject[] | undefined = useMemo(() => data && data.data.map((item) => (item!.data!.content as any).fields as ReceiptObject), [data])

  const handleWithdraw = async (depositId: string, receiptId: string) => {
    const tx = new Transaction()

    tx.moveCall({
      target: `${depositPackageId}::timedeposit::withdraw`,
      typeArguments: [TESTNET_USDC_TOKEN],
      arguments: [
        tx.object(depositId),
        tx.object(receiptId),
        tx.object('0x6')
      ]
    })

    signAndExecute({transaction: tx},
      {
        onSuccess: async ({ digest }) => {
          console.log("Transaction successful! Digest:", digest);
          await refetch()
        },
      },
    );
  }

  const handleCopy = async (value: string) => {
    copyToClipboard(value)
  }

  return (
    <Container>
      <Heading mb="5">Your deposits</Heading>

      {isLoading && <Spinner />}

      {isSuccess && depositReceipts && depositReceipts?.length > 0 && (
        <Table.Root>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>Deposit ID</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Title</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Amount</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Release date</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Whitelisted wallet</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell></Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {depositReceipts.map((receipt) => (
                <Table.Row key={receipt.deposit_id} align="center">
                  <Table.RowHeaderCell>
                    <Tooltip onClick={() => handleCopy(receipt.deposit_id)} content={receipt.deposit_id}>
                      <Text>{truncateHex(receipt.deposit_id)}</Text>
                    </Tooltip>
                  </Table.RowHeaderCell>
                  <Table.Cell>{receipt.title}</Table.Cell>
                  <Table.Cell>{amountToUsdc(receipt.amount, true)}</Table.Cell>
                  <Table.Cell>{tsToDate(receipt.release_date)}</Table.Cell>
                  <Table.Cell>
                    <Tooltip onClick={() => handleCopy(receipt.available_wallet)} content={receipt.available_wallet}>
                      <Text>{truncateHex(receipt.available_wallet)}</Text>
                    </Tooltip>
                  </Table.Cell>
                  <Table.Cell>
                    <Button onClick={() => handleWithdraw(receipt.deposit_id, receipt.id.id)}>Withdraw</Button>
                  </Table.Cell>
                </Table.Row>
              ))}
          </Table.Body>
        </Table.Root>
      )}

      {depositReceipts?.length === 0 && (
        <Callout.Root>
          <Callout.Icon>
            <InfoCircledIcon />
          </Callout.Icon>
          <Callout.Text>
            No deposits found.
          </Callout.Text>
        </Callout.Root>
      )}

    </Container>
  );
}
