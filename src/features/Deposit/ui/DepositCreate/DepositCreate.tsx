import { Transaction } from "@mysten/sui/transactions";
import {Button, Container, Flex, Heading, TextField, Text} from "@radix-ui/themes";
import {useNetworkVariable} from "@/configs/networkConfig";
import {useSignAndExecuteTransaction, useSuiClient, useSuiClientQuery} from "@mysten/dapp-kit";
import {useEffect, useState} from "react";
import {TESTNET_USDC_TOKEN} from "@/static/constants";
import {parseNumberInput} from "@/static/number.helper";
import {usdcToBaseUnits} from "@/static/crypto.helper";
import {SubmitHandler, useForm} from "react-hook-form";
import {DepositCreateInputs} from "@/features/Deposit/Deposit.interface.ts";

export function DepositCreate ({ owner }: { owner: string }) {
  const depositPackageId = useNetworkVariable("depositPackageId");
  const suiClient = useSuiClient();
  const [txStatus, setTxStatus] = useState('');

  const { refetch } = useSuiClientQuery('getOwnedObjects', {
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

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<DepositCreateInputs>({
    defaultValues: {
      amount: '',
      releaseDate: '',
      title: '',
      walletToWithdraw: '',
    }
  })

  const {mutate: signAndExecute} = useSignAndExecuteTransaction();

  // TODO: @adil - add zod to validate
  const onSubmit: SubmitHandler<DepositCreateInputs> = async (inputsData) => {
    if(!owner) return

    const tx = new Transaction();

    const { data: coins} = await suiClient.getCoins({
      owner: owner,
      coinType: TESTNET_USDC_TOKEN,
    })

    if (coins.length === 0) {
      setTxStatus('No USDC coins found in your wallet')
      return
    }

    const amountInBaseUnits = usdcToBaseUnits(inputsData.amount)
    const [coin] = tx.splitCoins(coins[0].coinObjectId, [
      tx.pure.u64(amountInBaseUnits),
    ])

    const dateVal = parseNumberInput(inputsData.releaseDate, 'Release date')

    tx.moveCall({
      target: `${depositPackageId}::timedeposit::create_deposit`,
      typeArguments: [TESTNET_USDC_TOKEN],
      arguments: [
        tx.pure.address(owner),
        tx.pure.string(inputsData.title),
        coin,
        tx.pure.u64(dateVal),
        tx.pure.address(inputsData.walletToWithdraw),
        tx.object('0x6'),
      ],
    });

    signAndExecute({transaction: tx},
      {
        onSuccess: async ({ digest }) => {
          console.log("Transaction successful! Digest:", digest);
          await refetch()
          setValue('amount', '')
          setValue('title', '')
          setValue('releaseDate', '')
        },
      },
    );
  }

  const handleTimeStamp = async (secondsToAdd: number) => {
    const currentTime = new Date();
    const newTime = new Date(currentTime.getTime() + secondsToAdd * 1000);
    setValue('releaseDate', Math.floor(newTime.getTime()).toString())
  }

  useEffect(() => {
    if(owner) setValue('walletToWithdraw', owner)
  }, [owner]);

  return (
    <Container>
      <Heading mb="5">Create deposit</Heading>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Flex direction="column" gap="3">
          <div>
            <TextField.Root aria-invalid={errors.title ? "true" : "false"} placeholder="Title" {...register('title', { required: true })} />
            {errors.title?.type === "required" && (<Text color="red" size="1">Title is required</Text>)}
          </div>
          <div>
            <TextField.Root placeholder="Amount" {...register('amount', { required: true })} />
            {errors.amount?.type === "required" && (<Text color="red" size="1">Amount is required</Text>)}
          </div>
          <div>
            <TextField.Root placeholder="Release date (timestamp)" {...register('releaseDate', { required: true })}  />
            {errors.releaseDate?.type === "required" && (<Text color="red" size="1">Release date is required</Text>)}
            <Flex mt="2" mb="2" gap="2">
              <Button type="button" size="1" onClick={() => handleTimeStamp(30)}>30 sec</Button>
              <Button type="button" size="1" onClick={() => handleTimeStamp(60)}>1 min</Button>
              <Button type="button" size="1" onClick={() => handleTimeStamp(600)}>10 min</Button>
            </Flex>
          </div>
          <div>
            <TextField.Root placeholder="Available wallet to withdraw" {...register('walletToWithdraw', { required: true })}  />
            {errors.walletToWithdraw?.type === "required" && (<Text color="red" size="1">Release date is required</Text>)}
          </div>
          <Button type="submit">Deposit</Button>
        </Flex>
      </form>
      {txStatus}
    </Container>
  )
}
