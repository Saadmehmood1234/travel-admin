import { ColumnDef } from "@tanstack/react-table";

// For DynamicTable
export interface DynamicTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

// For ContentTitleBar
export interface ContentTitleBarProps {
  title: string;
  subTitle: string;
  buttons?: Array<{
    text: string;
    color?: string;
    bgColor?: string;
  }>;
}

// For DynamicPage
export interface DynamicPageProps<TData> {
  contentTitleBarContent: ContentTitleBarProps;
  tableContent: {
    columns: ColumnDef<TData, any>[];
    data: TData[];
  };
}