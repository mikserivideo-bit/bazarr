import { FunctionComponent, useMemo } from "react";
import { AppColumnDef as ColumnDef } from "@/components/tables/features";
import SimpleTable from "@/components/tables/SimpleTable";

interface Props {
  providers: System.Provider[];
}

const Table: FunctionComponent<Props> = (props) => {
  const columns = useMemo<ColumnDef<System.Provider>[]>(
    () => [
      {
        header: "Name",
        accessorKey: "name",
      },
      {
        header: "Status",
        accessorKey: "status",
      },
      {
        header: "Next Retry",
        accessorKey: "retry",
      },
      {
        header: "OpenSubtitles Account",
        accessorKey: "active_username",
        cell: (info) => {
          const account = info.row.original.active_username;
          if (!account) {
            return "-";
          }
          const count = info.row.original.account_count;
          const index = info.row.original.account_index;
          return `${account}${count ? ` (${typeof index === "number" ? index + 1 : 1}/${count})` : ""}`;
        },
      },
    ],
    [],
  );

  return <SimpleTable columns={columns} data={props.providers}></SimpleTable>;
};

export default Table;
