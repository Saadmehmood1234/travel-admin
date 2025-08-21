import { ColumnDef } from "@tanstack/react-table";

export interface DynamicTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}


export interface ContentTitleBarProps {
  title: string;
  subTitle: string;
  buttons?: Array<{
    text: string;
    color?: string;
    bgColor?: string;
  }>;
}

export interface DynamicPageProps<TData> {
  contentTitleBarContent: ContentTitleBarProps;
  tableContent: {
    columns: ColumnDef<TData, any>[];
    data: TData[];
  };
}