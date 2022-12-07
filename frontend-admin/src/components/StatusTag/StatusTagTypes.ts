import { TagProps } from 'primereact/tag';

export type Status = {
  [key: number]: StatusStyle;
};

export type StatusStyle = {
  color:
    | 'blue'
    | 'bluegray'
    | 'cyan'
    | 'green'
    | 'indigo'
    | 'orange'
    | 'pink'
    | 'purple'
    | 'red'
    | 'teal'
    | 'yellow';
  icon: string;
  text: string;
};

export interface RequestStatusTagProps extends TagProps {
  modified?: boolean;
  statusNum: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 9 | 10;
}

export interface StatusTagProps extends TagProps {
  modified?: boolean;
  status: StatusStyle;
}

export interface VideoStatusTagProps extends TagProps {
  modified?: boolean;
  statusNum: 1 | 2 | 3 | 4 | 5 | 6;
}
