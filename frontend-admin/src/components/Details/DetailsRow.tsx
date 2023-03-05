import { classNames } from 'primereact/utils';

interface DetailsRowProps {
  button?: JSX.Element;
  content: string | JSX.Element;
  firstElement?: boolean;
  lastElement?: boolean;
  multipleLines?: boolean;
  title: string;
}

const DetailsRow = ({
  button,
  content,
  firstElement,
  lastElement,
  multipleLines,
  title,
}: DetailsRowProps) => {
  return (
    <li
      className={classNames(
        'align-items-center flex flex-wrap px-2',
        lastElement ? '' : 'border-bottom-1 surface-border',
        firstElement ? 'md:pt-3 pb-3 pt-1 sm:pt-2' : 'py-3'
      )}
    >
      <div className="font-medium md:pb-0 md:w-2 pb-1 pr-3 text-500 w-6">
        {title}
      </div>
      <div
        className={classNames(
          'flex-order-1 md:flex-order-0 text-900 w-full',
          button ? 'md:w-8' : 'md:w-10',
          multipleLines ? 'line-height-3' : ''
        )}
      >
        {content}
      </div>
      {button && (
        <div className="flex justify-content-end md:w-2 w-6">{button}</div>
      )}
    </li>
  );
};

export default DetailsRow;
