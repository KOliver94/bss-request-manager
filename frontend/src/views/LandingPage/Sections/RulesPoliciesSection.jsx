// @material-ui/core components
import { makeStyles } from '@material-ui/core/styles';

// @material-ui/icons
import ScheduleIcon from '@material-ui/icons/Schedule';
import VerifiedUser from '@material-ui/icons/VerifiedUser';
import CancelIcon from '@material-ui/icons/Cancel';
// core components
import GridContainer from 'components/material-kit-react/Grid/GridContainer';
import GridItem from 'components/material-kit-react/Grid/GridItem';
import InfoArea from 'components/material-kit-react/InfoArea/InfoArea';

import styles from 'assets/jss/material-kit-react/views/landingPageSections/productStyle';

const useStyles = makeStyles(styles);

export default function RulesPoliciesSection() {
  const classes = useStyles();
  return (
    <div className={classes.section}>
      <GridContainer justifyContent="center">
        <GridItem xs={12} sm={12} md={8}>
          <h2 className={classes.title}>Irányelvek és szabályzat</h2>
          <h5 className={classes.description}>
            Az alábbi pontok segítenek eligazodni hogyan használd az oldalt és
            mit kell tenned ha szeretnéd, hogy megörökítsük az általad
            szervezett eseményt.
          </h5>
        </GridItem>
      </GridContainer>
      <div>
        <GridContainer>
          <GridItem xs={12} sm={12} md={4}>
            <InfoArea
              title="Legyél időben"
              description="Késedelmes, vagy hiányos felkéréseket nem biztos, hogy el tudunk vállalni. Gyűléseink hétfőn este vannak, ekkor tudunk dönteni a felkérések sorsáról, ezért felkérési igényedet a rendezvényt megelőző hétfőig feltétlenül jelezd."
              icon={ScheduleIcon}
              iconColor="info"
              vertical
            />
          </GridItem>
          <GridItem xs={12} sm={12} md={4}>
            <InfoArea
              title="Bejelentkezett felhasználók"
              description="Az oldalra lehetőséged van bejelentkezni Google, Facebook valamint AuthSCH segítségével. Ekkor a rendszer a személyes adataidat kitölti helyetted, valamint megtekintheted az összes korábbi általad beküldött felkérést, értékelheted az elkészült videókat és írhatsz hozzászólást."
              icon={VerifiedUser}
              iconColor="success"
              vertical
            />
          </GridItem>
          <GridItem xs={12} sm={12} md={4}>
            <InfoArea
              title="Felkérések elutasítása"
              description="Mi is egyetemi hallgatók vagyunk. Amennyiben a Stúdiónak nincs megfelelő emberi és/vagy technikai erőforrása egy anyag elkészítéséhez, akkor azt nem áll módunkban elvállalni."
              icon={CancelIcon}
              iconColor="danger"
              vertical
            />
          </GridItem>
        </GridContainer>
      </div>
    </div>
  );
}
