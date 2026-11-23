import { FunctionComponent } from "react";
import { Container, Group } from "@mantine/core";
import { useDocumentTitle } from "@mantine/hooks";
import {
  faRightLeft,
  faSync,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import {
  useResetProvider,
  useSwitchOpenSubtitlesAccount,
  useSystemProviders,
} from "@/apis/hooks";
import { useInstanceName } from "@/apis/hooks/site";
import { Toolbox } from "@/components";
import { QueryOverlay } from "@/components/async";
import Table from "./table";

const SystemProvidersView: FunctionComponent = () => {
  const providers = useSystemProviders();

  const { isFetching, data, refetch } = providers;

  const { mutate: reset, isPending: isResetting } = useResetProvider();
  const { mutate: switchAccount, isPending: isSwitchingAccount } =
    useSwitchOpenSubtitlesAccount();

  useDocumentTitle(`Providers - ${useInstanceName()} (System)`);

  return (
    <QueryOverlay result={providers}>
      <Container fluid px={0}>
        <Toolbox>
          <Group>
            <Toolbox.Button
              loading={isFetching}
              icon={faSync}
              onClick={() => refetch()}
            >
              Refresh
            </Toolbox.Button>
            <Toolbox.Button
              icon={faTrash}
              loading={isResetting}
              onClick={() => reset()}
            >
              Reset
            </Toolbox.Button>
            <Toolbox.Button
              icon={faRightLeft}
              loading={isSwitchingAccount}
              onClick={() => switchAccount()}
            >
              Switch OpenSubtitles account
            </Toolbox.Button>
          </Group>
        </Toolbox>
        <Table providers={data ?? []}></Table>
      </Container>
    </QueryOverlay>
  );
};

export default SystemProvidersView;
