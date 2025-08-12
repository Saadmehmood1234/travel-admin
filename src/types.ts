import { ColumnDef } from "@tanstack/react-table";

export interface ContentTitleBarProps {
  title: string;
  subTitle: string;
  buttons?: {
    text: string;
    color?: string;
    bgColor?: string;
  }[];
}

export interface DynamicTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}