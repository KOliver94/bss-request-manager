import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
// nodejs library that concatenates classes
import classNames from 'classnames';
// @material-ui/core components
import Accordion from '@material-ui/core/Accordion';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import Alert from '@material-ui/lab/Alert';
import AlertTitle from '@material-ui/lab/AlertTitle';
import Avatar from '@material-ui/core/Avatar';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import CircularProgress from '@material-ui/core/CircularProgress';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Skeleton from '@material-ui/lab/Skeleton';
import Switch from '@material-ui/core/Switch';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { makeStyles, useTheme } from '@material-ui/core/styles';
// core components
import Header from 'components/material-kit-react/Header/Header';
import Footer from 'components/material-kit-react/Footer/Footer';
import Button from 'components/material-kit-react/CustomButtons/Button';
import GridContainer from 'components/material-kit-react/Grid/GridContainer';
import GridItem from 'components/material-kit-react/Grid/GridItem';
import HeaderLinks from 'components/material-kit-react/Header/HeaderLinks';
import Parallax from 'components/material-kit-react/Parallax/Parallax';
import Badge from 'components/material-kit-react/Badge/Badge';
// Formik
import { Formik, Form } from 'formik';
// Date fields
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import sub from 'date-fns/sub';
import { hu } from 'date-fns/locale';
// Yup validations
import * as Yup from 'yup';
import 'yup-phone';
// Notistack
import { useSnackbar } from 'notistack';
// background
import background from 'assets/img/BSS_csoportkep_2019osz.jpg';
// API calls
import {
  getUser,
  updateUser,
  connectSocial,
  disconnectSocial,
} from 'api/userApi';
import { isAdmin, isPrivileged } from 'api/loginApi';
import handleError from 'helpers/errorHandler';
import { userRoles, avatarProviders } from 'helpers/enumConstants';
import {
  getOauthUrlAuthSch,
  getOauthUrlFacebook,
  getOauthUrlGoogle,
} from 'helpers/oauthConstants';
// Style
import styles from 'assets/jss/material-kit-react/views/profilePage';
// Sections
import PersonalDetailsNormal from './Sections/PersonalDetails/PersonalDetailsNormal';
import PersonalDetailsMobile from './Sections/PersonalDetails/PersonalDetailsMobile';
import WorkedOnDialog from './Sections/WorkedOnDialog/WorkedOnDialog';

const useStyles = makeStyles(styles);

export default function ProfilePage({ isAuthenticated, setIsAuthenticated }) {
  const { id } = useParams();
  const location = useLocation();
  const { code, provider } = { ...location.state };
  const ownUserId = parseInt(localStorage.getItem('user_id'), 10);
  const classes = useStyles();
  const theme = useTheme();
  const isMobileView = !useMediaQuery(theme.breakpoints.up('md'));
  const isXsView = !useMediaQuery(theme.breakpoints.up('sm'));
  const avatarClasses = classNames(
    classes.imgRaised,
    classes.imgRoundedCircle,
    classes.avatar
  );
  const { enqueueSnackbar } = useSnackbar();

  const [loading, setLoading] = useState(true);
  const [profileConnecting, setProfileConnecting] = useState(false);
  const [workedOnDialogOpen, setWorkedOnDialogOpen] = useState(false);
  const [userData, setUserData] = useState({});
  const [selectedStartDate, setSelectedStartDate] = useState(
    sub(new Date(), { weeks: 20 })
  );
  const [selectedEndDate, setSelectedEndDate] = useState(new Date());
  const [includeResponsible, setIncludeResponsible] = useState(true);
  const [headerDataChange, setHeaderDataChange] = useState(false);
  const [tooltipOpen, setTooltipOpen] = useState(null);

  const handleCloseTooltip = (tooltip) =>
    tooltipOpen === tooltip && setTooltipOpen(null);

  const handleSubmit = async (val) => {
    const values = val;
    try {
      const result = id
        ? await updateUser(id, values)
        : await updateUser('me', values);
      setUserData(result.data);
      if (!id || id === ownUserId) {
        localStorage.setItem(
          'name',
          `${result.data.last_name} ${result.data.first_name}`
        );
        localStorage.setItem('avatar', result.data.profile.avatar_url);
        setHeaderDataChange(!headerDataChange);
      }
    } catch (e) {
      enqueueSnackbar(handleError(e), {
        variant: 'error',
        autoHideDuration: 5000,
      });
    }
  };

  const handleDisconnect = async (val) => {
    setProfileConnecting(true);
    try {
      await disconnectSocial(val);
      setUserData((prevUserData) => ({
        ...prevUserData,
        social_accounts: prevUserData.social_accounts.filter(
          (account) => account.provider !== val
        ),
        profile: {
          ...prevUserData.profile,
          avatar: {
            ...prevUserData.profile.avatar,
            [val]: null,
          },
        },
      }));
    } catch (e) {
      enqueueSnackbar(handleError(e), {
        variant: 'error',
        autoHideDuration: 5000,
      });
    } finally {
      setProfileConnecting(false);
    }
  };

  useEffect(() => {
    async function loadData() {
      try {
        const result = id ? await getUser(id) : await getUser('me');
        setUserData(result.data);
        setLoading(false);
      } catch (e) {
        enqueueSnackbar(handleError(e), {
          variant: 'error',
          autoHideDuration: 5000,
        });
      }
    }
    loadData();
  }, [id, enqueueSnackbar]);

  useEffect(() => {
    async function connectSocialProfile() {
      try {
        const result = await connectSocial(provider, code);
        setUserData(result.data);
      } catch (e) {
        enqueueSnackbar(handleError(e), {
          variant: 'error',
          autoHideDuration: 5000,
        });
      } finally {
        setProfileConnecting(false);
      }
    }

    if (code && provider) {
      setProfileConnecting(true);
      connectSocialProfile();
    }
  }, [code, provider, enqueueSnackbar]);

  const validationSchema = Yup.object({
    first_name: Yup.string()
      .min(2, 'Túl rövid keresztnév!')
      .max(30, 'Túl hosszú keresztnév!')
      .trim()
      .required('A keresztnév megadása kötelező'),
    last_name: Yup.string()
      .min(2, 'Túl rövid vezetéknév!')
      .max(150, 'Túl hosszú vezetéknév!')
      .trim()
      .required('A vezetéknév megadása kötelező'),
    email: Yup.string()
      .email('Érvénytelen e-mail cím')
      .required('Az e-mail cím megadása kötelező'),
    phone_number: Yup.string()
      .phone('', false, 'Érvénytelen telefonszám')
      .required('A telefonszám megadása kötelező'),
  });

  return (
    <div>
      <Header
        color="transparent"
        brand="BSS Felkéréskezelő"
        rightLinks={
          <HeaderLinks
            isAuthenticated={isAuthenticated}
            setIsAuthenticated={setIsAuthenticated}
            dataChangeTrigger={headerDataChange}
          />
        }
        fixed
        changeColorOnScroll={{
          height: 200,
          color: 'white',
        }}
      />
      <Parallax small filter image={background} />
      <div className={classNames(classes.main, classes.mainRaised)}>
        <div className={classNames(classes.container, classes.section)}>
          <GridContainer justify="center">
            <GridItem xs={12} sm={12} md={6}>
              <div className={classes.profile}>
                <div>
                  {loading && id ? (
                    <Skeleton
                      variant="circle"
                      className={avatarClasses}
                      width={160}
                      height={160}
                    />
                  ) : (
                    <Avatar
                      className={avatarClasses}
                      src={
                        loading
                          ? localStorage.getItem('avatar')
                          : userData.profile.avatar_url
                      }
                    />
                  )}
                </div>
                <div className={classes.name}>
                  <h3 className={classes.title}>
                    {loading && id ? (
                      <Skeleton width={200} />
                    ) : (
                      <>
                        {loading
                          ? localStorage.getItem('name')
                          : `${userData.last_name} ${userData.first_name}`}
                      </>
                    )}
                  </h3>
                  {!loading && (
                    <>
                      <h6>
                        <Badge color="primary">
                          {userRoles(userData.role)}
                        </Badge>
                        {userData.groups.includes('Banned') && (
                          <Badge color="danger">Kitiltva</Badge>
                        )}
                      </h6>
                      {userData.groups && (
                        <h6>
                          {userData.groups
                            .filter((x) => x !== 'Banned')
                            .map((group) => {
                              return (
                                <Badge color="rose" key={group}>
                                  {group}
                                </Badge>
                              );
                            })}
                        </h6>
                      )}
                      {userData.social_accounts.map((account) => {
                        let icon;
                        switch (account.provider) {
                          case 'authsch':
                            icon = 'fab icon-sch';
                            break;
                          case 'facebook':
                            icon = 'fab fa-facebook';
                            break;
                          case 'google-oauth2':
                            icon = 'fab fa-google';
                            break;
                          default:
                            break;
                        }
                        return (
                          <ClickAwayListener
                            onClickAway={() =>
                              handleCloseTooltip(account.provider)
                            }
                            key={`${account.provider}-clickListener`}
                          >
                            <Tooltip
                              PopperProps={{
                                disablePortal: true,
                              }}
                              onClose={() =>
                                handleCloseTooltip(account.provider)
                              }
                              open={account.provider === tooltipOpen}
                              disableFocusListener
                              disableHoverListener
                              disableTouchListener
                              title={account.uid}
                              key={`${account.provider}-tooltip`}
                              arrow
                            >
                              <Button
                                justIcon
                                link
                                key={`${account.provider}-button`}
                                onClick={() => setTooltipOpen(account.provider)}
                              >
                                <i className={icon} />
                              </Button>
                            </Tooltip>
                          </ClickAwayListener>
                        );
                      })}
                    </>
                  )}
                </div>
              </div>
            </GridItem>
          </GridContainer>
          <GridContainer justify="center">
            {loading ? (
              <CircularProgress
                className={classes.circularProgress}
                size={60}
              />
            ) : (
              <Formik
                enableReinitialize
                initialValues={{
                  ...userData,
                  phone_number: userData.profile.phone_number,
                }}
                onSubmit={(values) => handleSubmit(values)}
                validationSchema={validationSchema}
              >
                {({ submitForm, resetForm, isSubmitting, errors, touched }) => (
                  <Form>
                    <GridContainer justify="center" className={classes.field}>
                      {!isMobileView && (
                        <PersonalDetailsNormal
                          errors={errors}
                          touched={touched}
                          disabled={
                            userData.role !== 'user' || (id && !isAdmin())
                          }
                          isUser={userData.role === 'user'}
                        />
                      )}
                      <GridItem xs={12} sm={12} md={6}>
                        {isMobileView && (
                          <PersonalDetailsMobile
                            errors={errors}
                            touched={touched}
                            disabled={
                              userData.role !== 'user' || (id && !isAdmin())
                            }
                            isUser={userData.role === 'user'}
                          />
                        )}
                        <Accordion
                          classes={
                            !isMobileView
                              ? {
                                  rounded: classes.accordion,
                                  expanded: classes.accordion,
                                }
                              : {}
                          }
                        >
                          <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            id="profile-picture-header"
                          >
                            <Typography>Profilkép beállítások</Typography>
                          </AccordionSummary>
                          <AccordionDetails className={classes.accordionAvatar}>
                            {!Object.entries(userData.profile.avatar).length ? (
                              <Alert
                                severity="warning"
                                className={classes.alertAvatar}
                              >
                                <AlertTitle>Nincs elérhető kép</AlertTitle>
                                Tölts fel egy képet{' '}
                                <a href="https://gravatar.com">Gravatar</a>-ra
                                vagy kapcsold össze profilod Facebook vagy
                                Google fiókoddal a lenti menüpont segítségével.
                                <br />
                                <em>
                                  <small className={classes.smallAvatar}>
                                    A Gravatarra feltöltött kép a következő
                                    bejelentkezés után lesz elérhető.
                                  </small>
                                </em>
                              </Alert>
                            ) : (
                              <GridContainer
                                justify="center"
                                alignItems="center"
                              >
                                {Object.entries(userData.profile.avatar)
                                  .filter(
                                    (avatar) =>
                                      avatar[0] !== 'provider' && avatar[1]
                                  )
                                  .map((avatar) => {
                                    return (
                                      <GridItem
                                        key={avatar[0]}
                                        xs={12}
                                        sm={4}
                                        md={4}
                                        className={
                                          isXsView ? classes.gridItemMobile : ''
                                        }
                                      >
                                        <Card>
                                          <CardActionArea
                                            onClick={() =>
                                              handleSubmit({
                                                avatar_provider: avatar[0],
                                              })
                                            }
                                            disabled={
                                              avatar[1] ===
                                              userData.profile.avatar_url
                                            }
                                          >
                                            <CardMedia
                                              component="img"
                                              alt={avatar[0]}
                                              image={avatar[1]}
                                              title={avatar[0]}
                                              height="140"
                                              classes={{
                                                media:
                                                  isXsView &&
                                                  classes.cardMediaAvatar,
                                              }}
                                            />
                                            <CardContent>
                                              <Typography
                                                variant="h6"
                                                component="h2"
                                                display="block"
                                                className={classes.textAvatar}
                                              >
                                                {avatarProviders(avatar[0])}{' '}
                                                {avatar[1] ===
                                                  userData.profile
                                                    .avatar_url && (
                                                  <small
                                                    className={
                                                      classes.selectedIconAvatar
                                                    }
                                                  >
                                                    <i className="fas fa-check-circle" />
                                                  </small>
                                                )}
                                              </Typography>
                                            </CardContent>
                                          </CardActionArea>
                                        </Card>
                                      </GridItem>
                                    );
                                  })}
                              </GridContainer>
                            )}
                          </AccordionDetails>
                        </Accordion>
                        {!id && (
                          <Accordion>
                            <AccordionSummary
                              expandIcon={<ExpandMoreIcon />}
                              id="social-profile-header"
                            >
                              <Typography>
                                Közösségi profilok összekapcsolása
                              </Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                              <GridContainer>
                                <GridItem>
                                  {userData.social_accounts.some(
                                    (x) => x.provider === 'facebook'
                                  ) ? (
                                    <Button
                                      color="facebook"
                                      fullWidth
                                      disabled={profileConnecting}
                                      onClick={() =>
                                        handleDisconnect('facebook')
                                      }
                                    >
                                      <i className="fab fa-facebook" />{' '}
                                      Kijelentkezés
                                    </Button>
                                  ) : (
                                    <Button
                                      color="facebook"
                                      fullWidth
                                      href={getOauthUrlFacebook({
                                        operation: 'profile',
                                      })}
                                      target="_self"
                                      disabled={profileConnecting}
                                    >
                                      <i className="fab fa-facebook" />{' '}
                                      Bejelenetkezés
                                    </Button>
                                  )}
                                </GridItem>
                                <GridItem>
                                  {userData.social_accounts.some(
                                    (x) => x.provider === 'google-oauth2'
                                  ) ? (
                                    <Button
                                      color="google"
                                      fullWidth
                                      disabled={profileConnecting}
                                      onClick={() =>
                                        handleDisconnect('google-oauth2')
                                      }
                                    >
                                      <i className="fab fa-google" />{' '}
                                      Kijelentkezés
                                    </Button>
                                  ) : (
                                    <Button
                                      color="google"
                                      fullWidth
                                      href={getOauthUrlGoogle({
                                        operation: 'profile',
                                      })}
                                      target="_self"
                                      disabled={profileConnecting}
                                    >
                                      <i className="fab fa-google" />{' '}
                                      Bejelenetkezés
                                    </Button>
                                  )}
                                </GridItem>
                                <GridItem>
                                  {userData.social_accounts.some(
                                    (x) => x.provider === 'authsch'
                                  ) ? (
                                    <Button
                                      color="authsch"
                                      fullWidth
                                      disabled={profileConnecting}
                                      onClick={() =>
                                        handleDisconnect('authsch')
                                      }
                                    >
                                      <i className="fab icon-sch" />{' '}
                                      Kijelentkezés
                                    </Button>
                                  ) : (
                                    <Button
                                      color="authsch"
                                      fullWidth
                                      href={getOauthUrlAuthSch({
                                        operation: 'profile',
                                      })}
                                      target="_self"
                                      disabled={profileConnecting}
                                    >
                                      <i className="fab icon-sch" />{' '}
                                      Bejelenetkezés
                                    </Button>
                                  )}
                                </GridItem>
                              </GridContainer>
                            </AccordionDetails>
                          </Accordion>
                        )}
                        {isPrivileged() && (
                          <>
                            <Accordion>
                              <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                id="worked-on-header"
                              >
                                <Typography>
                                  Készített anyagok kilistázása
                                </Typography>
                              </AccordionSummary>
                              <AccordionDetails>
                                <GridContainer
                                  justify="center"
                                  alignItems="center"
                                >
                                  <MuiPickersUtilsProvider
                                    utils={DateFnsUtils}
                                    locale={hu}
                                  >
                                    <GridItem
                                      xs={12}
                                      sm={6}
                                      className={
                                        isXsView ? classes.gridItemMobile : ''
                                      }
                                    >
                                      <KeyboardDatePicker
                                        label="Kezdő dátum"
                                        value={selectedStartDate}
                                        onChange={setSelectedStartDate}
                                        format="yyyy.MM.dd"
                                        disableFuture
                                        maxDate={selectedEndDate}
                                        inputVariant="outlined"
                                        fullWidth
                                      />
                                    </GridItem>
                                    <GridItem
                                      xs={12}
                                      sm={6}
                                      className={
                                        isXsView ? classes.gridItemMobile : ''
                                      }
                                    >
                                      <KeyboardDatePicker
                                        label="Vége dátum"
                                        value={selectedEndDate}
                                        onChange={setSelectedEndDate}
                                        format="yyyy.MM.dd"
                                        disableFuture
                                        inputVariant="outlined"
                                        fullWidth
                                      />
                                    </GridItem>
                                    <GridItem
                                      className={
                                        isXsView
                                          ? classes.gridItemMobileNoTopPadding
                                          : classes.gridItemMobile
                                      }
                                    >
                                      <GridContainer
                                        justify="space-between"
                                        alignItems="center"
                                      >
                                        <GridItem xs={6}>
                                          <Typography variant="body2">
                                            Felelős pozíciók
                                          </Typography>
                                        </GridItem>
                                        <GridItem
                                          xs={6}
                                          className={classes.gridEnd}
                                        >
                                          <Switch
                                            checked={includeResponsible}
                                            onChange={(event) =>
                                              setIncludeResponsible(
                                                event.target.checked
                                              )
                                            }
                                            name="includeResponsible"
                                          />
                                        </GridItem>
                                      </GridContainer>
                                    </GridItem>
                                    <GridItem>
                                      <Button
                                        color="primary"
                                        fullWidth
                                        onClick={() =>
                                          setWorkedOnDialogOpen(true)
                                        }
                                      >
                                        Kilistázás
                                      </Button>
                                    </GridItem>
                                  </MuiPickersUtilsProvider>
                                </GridContainer>
                              </AccordionDetails>
                            </Accordion>
                            <WorkedOnDialog
                              workedOnDialogOpen={workedOnDialogOpen}
                              setWorkedOnDialogOpen={setWorkedOnDialogOpen}
                              userId={id || 'me'}
                              selectedStartDate={selectedStartDate}
                              selectedEndDate={selectedEndDate}
                              includeResponsible={includeResponsible}
                            />
                          </>
                        )}
                      </GridItem>
                    </GridContainer>
                    {userData.role === 'user' && (!id || isAdmin()) && (
                      <GridContainer justify="center">
                        <GridItem className={classes.textCenter}>
                          <Button
                            color="danger"
                            className={classes.button}
                            onClick={resetForm}
                            disabled={isSubmitting}
                          >
                            Mégsem
                          </Button>
                          <Button
                            color="success"
                            className={classes.button}
                            onClick={submitForm}
                            disabled={isSubmitting}
                          >
                            Mentés
                          </Button>
                        </GridItem>
                      </GridContainer>
                    )}
                  </Form>
                )}
              </Formik>
            )}
          </GridContainer>
        </div>
      </div>
      <Footer />
    </div>
  );
}

ProfilePage.propTypes = {
  isAuthenticated: PropTypes.bool.isRequired,
  setIsAuthenticated: PropTypes.func.isRequired,
};
