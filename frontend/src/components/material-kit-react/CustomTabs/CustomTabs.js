import { useState } from 'react';
// nodejs library that concatenates classes
import classNames from 'classnames';
// nodejs library to set properties for components
import PropTypes from 'prop-types';

// material-ui components
import { makeStyles } from '@material-ui/core/styles';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Icon from '@material-ui/core/Icon';
// core components
import Card from 'components/material-kit-react/Card/Card.js';
import CardBody from 'components/material-kit-react/Card/CardBody.js';
import CardHeader from 'components/material-kit-react/Card/CardHeader.js';

import styles from 'assets/jss/material-kit-react/components/customTabsStyle.js';

const useStyles = makeStyles(styles);

export default function CustomTabs(props) {
  const { headerColor, plainTabs, tabs, title, rtlActive, activeTab } = props;
  const [value, setValue] = useState(activeTab);

  const handleChange = (event, value) => {
    setValue(value);
  };
  const classes = useStyles();
  const cardTitle = classNames({
    [classes.cardTitle]: true,
    [classes.cardTitleRTL]: rtlActive,
  });
  return (
    <Card plain={plainTabs} className={classes.card}>
      <CardHeader color={headerColor} plain={plainTabs}>
        {title !== undefined ? <div className={cardTitle}>{title}</div> : null}
        <Tabs
          value={value}
          onChange={handleChange}
          classes={{
            root: classes.tabsRoot,
            indicator: classes.displayNone,
          }}
        >
          {tabs.map((prop, key) => {
            var icon = {};
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
                  root: classes.tabRootButton,
                  label: classes.tabLabel,
                  selected: classes.tabSelected,
                  wrapper: classes.tabWrapper,
                }}
                key={key}
                label={prop.tabName}
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
    'danger',
    'info',
    'primary',
    'rose',
  ]),
  title: PropTypes.string,
  tabs: PropTypes.arrayOf(
    PropTypes.shape({
      tabName: PropTypes.string.isRequired,
      tabIcon: PropTypes.object,
      tabContent: PropTypes.node.isRequired,
    })
  ),
  rtlActive: PropTypes.bool,
  plainTabs: PropTypes.bool,
  activeTab: PropTypes.number,
};

CustomTabs.defaultProps = {
  activeTab: 0,
};
