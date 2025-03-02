import CancelIcon from '@mui/icons-material/Cancel';
import ScheduleIcon from '@mui/icons-material/Schedule';
import VerifiedUser from '@mui/icons-material/VerifiedUser';

import GridContainer from 'components/material-kit-react/Grid/GridContainer';
import GridItem from 'components/material-kit-react/Grid/GridItem';
import InfoArea from 'components/material-kit-react/InfoArea/InfoArea';

import stylesModule from './RulesPoliciesSection.module.scss';

export default function RulesPoliciesSection() {
  return (
    <div className={stylesModule.section}>
      <GridContainer justifyContent="center">
        <GridItem xs={12} sm={12} md={8}>
          <h2 className={stylesModule.title}>Irányelvek és szabályzat</h2>
          <h5 className={stylesModule.description}>
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
              description="Az oldalra lehetőséged van bejelentkezni AuthSCH, Google, valamint Microsoft fiók segítségével. Ekkor a rendszer a személyes adataidat kitölti helyetted, valamint megtekintheted az összes korábbi általad beküldött felkérést, értékelheted az elkészült videókat és írhatsz hozzászólást."
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
              iconColor="error"
              vertical
            />
          </GridItem>
        </GridContainer>
      </div>
    </div>
  );
}
