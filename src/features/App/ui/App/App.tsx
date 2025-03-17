import {ConnectButton, useCurrentAccount} from "@mysten/dapp-kit";
import {Box, Container, Flex, Heading, Text} from "@radix-ui/themes";
import {DepositCreate} from "@/features/Deposit/ui/DepositCreate/DepositCreate.tsx";
import {DepositList} from "@/features/Deposit/ui/DepositList/DepositList.tsx";

function App() {
  const currentAccount = useCurrentAccount();

  return (
    <>
      <Flex
        position="sticky"
        px="8"
        py="4"
        justify="between"
        align="center"
        style={{borderBottom: "1px solid var(--gray-a2)"}}
      >
        <Box><Heading>TimeDeposit</Heading></Box>
        <Box><ConnectButton /></Box>
      </Flex>
      <Container mt="10">
        {!currentAccount && (
          <Flex direction="column" gap="5" mt="9">
            <Heading size="7" as="h1">Secure Your Future with Time-Locked Crypto</Heading>
            <Text>Unlock the power of delayed gratification with our state-of-the-art crypto holding application. Whether you're saving for a special occasion or planning your financial future, our platform ensures your cryptocurrency is securely held until the predetermined release date. Experience peace of mind knowing your digital assets are safe and will only be accessible when you decide it's time.</Text>
            <Box>
              <ConnectButton />
            </Box>
          </Flex>
        )}
        {currentAccount && (
          <Flex direction="column" gap="9" mt="9">
            <DepositList owner={currentAccount.address}/>
            <DepositCreate owner={currentAccount.address} />
          </Flex>
        )}
      </Container>
    </>
  );
}

export default App;
