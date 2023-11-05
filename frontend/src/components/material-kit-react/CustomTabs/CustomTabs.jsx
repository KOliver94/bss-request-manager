import { useState } from 'react';
// nodejs library that concatenates classes
import classNames from 'classnames';
// nodejs library to set properties for components
import PropTypes from 'prop-types';

// @mui components
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Icon from '@mui/material/Icon';
// core components
import Card from 'src/components/material-kit-react/Card/Card';
import CardBody from 'src/components/material-kit-react/Card/CardBody';
import CardHeader from 'src/components/material-kit-react/Card/CardHeader';

import stylesModule from './CustomTabs.module.scss';

export default function CustomTabs(props) {
  const { headerColor, plainTabs, tabs, title, rtlActive, activeTab } = props;
  const [value, setValue] = useState(activeTab);

  const handleChange = (event, value) => {
    setValue(value);
  };
  const cardTitle = classNames({
    [stylesModule.cardTitle]: true,
    [stylesModule.cardTitleRTL]: rtlActive,
  });
  return (
    <Card plain={plainTabs} className={stylesModule.card}>
      <CardHeader color={headerColor} plain={plainTabs}>
        {title !== undefined ? <div className={cardTitle}>{title}</div> : null}
        <Tabs
          value={value}
          onChange={handleChange}
          classes={{
            root: stylesModule.tabsRoot,
            indicator: stylesModule.displayNone,
          }}
          textColor="inherit"
        >
          {tabs.map((prop, key) => {
            let icon = {};
            if (prop.tabIcon) {
              icon = {
                icon:
                  typeof prop.tabIcon === 'string' ? (
                    <Icon>{prop.tabIcon}</Icon>
                  ) : (
                    <prop.tabIcon />
                  ),
              };
            }
            return (
              <Tab
                classes={{
                  root: stylesModule.tabRootButton,
                  selected: stylesModule.tabSelected,
                  wrapper: stylesModule.tabWrapper,
                  iconWrapper: stylesModule.tabIconWrapper,
                  textColorInherit: stylesModule.tabTextColorInherit,
                }}
                key={key}
                label={prop.tabName}
                iconPosition="start"
                {...icon}
              />
            );
          })}
        </Tabs>
      </CardHeader>
      <CardBody>
        {tabs.map((prop, key) => {
          if (key === value) {
            return <div key={key}>{prop.tabContent}</div>;
          }
          return null;
        })}
      </CardBody>
    </Card>
  );
}

CustomTabs.propTypes = {
  headerColor: PropTypes.oneOf([
    'warning',
    'success',
    'error',
    'info',
    'primary',
    'secondary',
  ]),
  title: PropTypes.string,
  tabs: PropTypes.arrayOf(
    PropTypes.shape({
      tabName: PropTypes.string.isRequired,
      tabIcon: PropTypes.object,
      tabContent: PropTypes.node.isRequired,
    }),
  ),
  rtlActive: PropTypes.bool,
  plainTabs: PropTypes.bool,
  activeTab: PropTypes.number,
};

CustomTabs.defaultProps = {
  activeTab: 0,
};
