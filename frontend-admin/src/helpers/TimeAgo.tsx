import { ComponentProps, JSX, PureComponent } from 'react';

import { format, cancel, render } from 'timeago.js';
import { Opts, TDate } from 'timeago.js/lib/interface';

/**
 * Convert input to a valid datetime string of <time> tag
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Element/time
 * @param input
 * @returns datetime string
 */
const toDateTime = (input: TDate): string => {
  return '' + (input instanceof Date ? input.getTime() : input);
};

export interface TimeAgoProps extends ComponentProps<'time'> {
  readonly datetime: TDate;
  readonly live?: boolean;
  readonly opts?: Opts;
  readonly locale?: string;
}

export default class TimeAgo extends PureComponent<TimeAgoProps> {
  static defaultProps = {
    className: '',
    live: true,
  };

  dom: HTMLTimeElement = new HTMLTimeElement();

  componentDidMount(): void {
    this.renderTimeAgo();
  }

  componentDidUpdate(): void {
    this.renderTimeAgo();
  }

  renderTimeAgo(): void {
    const { live, datetime, locale, opts } = this.props;
    cancel(this.dom);

    if (live !== false) {
      this.dom.setAttribute('datetime', toDateTime(datetime));
      render(this.dom, locale, opts);
    }
  }

  componentWillUnmount(): void {
    cancel(this.dom);
  }

  render(): JSX.Element {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { datetime, live, locale, opts, ...others } = this.props;
    return (
      <time
        ref={(c): void => {
          this.dom = c as HTMLTimeElement;
        }}
        {...others}
      >
        {format(datetime, locale, opts)}
      </time>
    );
  }
}
