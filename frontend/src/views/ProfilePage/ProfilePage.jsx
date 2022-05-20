import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
// nodejs library that concatenates classes
import classNames from 'classnames';
// @mui components
import Accordion from '@mui/material/Accordion';
import AccordionActions from '@mui/material/AccordionActions';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import CircularProgress from '@mui/material/CircularProgress';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MUIButton from '@mui/material/Button';
import Skeleton from '@mui/material/Skeleton';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import makeStyles from '@mui/styles/makeStyles';
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
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import sub from 'date-fns/sub';
import { format } from 'date-fns';
import { hu } from 'date-fns/locale';
// Yup validations
import * as Yup from 'yup';
import isValidPhone from 'helpers/yupPhoneNumberValidator';
// Notistack
import { useSnackbar } from 'notistack';
// background
import background from 'assets/img/BSS_csoportkep_2019osz.jpg';
// API calls
import {
  getUser,
  updateUser,
  banUser,
  unbanUser,
  connectSocial,
  disconnectSocial,
} from 'api/userApi';
import { isAdmin, isPrivileged, isSelf } from 'api/loginApi';
import handleError from 'helpers/errorHandler';
import { userRoles, avatarProviders, groups } from 'helpers/enumConstants';
import {
  getOauthUrlAuthSch,
  getOauthUrlFacebook,
  getOauthUrlGoogle,
} from 'helpers/oauthConstants';
import changePageTitle from 'helpers/pageTitleHelper';
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
  const navigate = useNavigate();
  const { code, provider } = { ...location.state };
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
  const [banReason, setBanReason] = useState('');
  const [banLoading, setBanLoading] = useState(false);
  const [banChanged, setBanChanged] = useState(false);

  const handleCloseTooltip = (tooltip) =>
    tooltipOpen === tooltip && setTooltipOpen(null);

  const handleSubmit = async (val) => {
    const values = val;
    try {
      const result = id
        ? await updateUser(id, values)
        : await updateUser('me', values);
      setUserData(result.data);
      if (!id || isSelf(id)) {
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
      });
    }
  };

  const handleBan = async () => {
    setBanLoading(true);
    try {
      if (userData.ban) {
        await unbanUser(id).then(setBanChanged(!banChanged));
      } else {
        await banUser(id, banReason).then(setBanChanged(!banChanged));
      }
    } catch (e) {
      enqueueSnackbar(handleError(e), {
        variant: 'error',
      });
    } finally {
      setBanLoading(false);
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
      });
    } finally {
      setProfileConnecting(false);
      navigate({ replace: true });
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
        });
      }
    }
    setLoading(true);
    loadData();
  }, [id, enqueueSnackbar, banChanged]);

  useEffect(() => {
    changePageTitle(!loading && `${userData.last_name} ${userData.first_name}`);
  }, [loading, userData]);

  useEffect(() => {
    async function connectSocialProfile() {
      try {
        const result = await connectSocial(provider, code);
        setUserData(result.data);
      } catch (e) {
        enqueueSnackbar(handleError(e), {
          variant: 'error',
        });
      } finally {
        setProfileConnecting(false);
        navigate({ replace: true });
      }
    }

    if (code && provider) {
      setProfileConnecting(true);
      connectSocialProfile();
    }
  }, [code, provider, navigate, enqueueSnackbar]);

  Yup.addMethod(Yup.string, 'phone', isValidPhone);
  const validationSchema = Yup.object({
    first_name: Yup.string()
      .min(2, 'Túl rövid keresztnév!')
      .max(30, 'Túl hosszú keresztnév!')
      .trim()
      .required('A keresztnév megadása kötelező!'),
    last_name: Yup.string()
      .min(2, 'Túl rövid vezetéknév!')
      .max(150, 'Túl hosszú vezetéknév!')
      .trim()
      .required('A vezetéknév megadása kötelező!'),
    email: Yup.string()
      .email('Érvénytelen e-mail cím!')
      .required('Az e-mail cím megadása kötelező!'),
    phone_number: Yup.string()
      .phone('Érvénytelen telefonszám!')
      .required('A telefonszám megadása kötelező!'),
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
          <GridContainer justifyContent="center">
            <GridItem xs={12} sm={12} md={6}>
              <div className={classes.profile}>
                <div>
                  {loading && id ? (
                    <Skeleton
                      variant="circular"
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
                        {userData.ban && <Badge color="danger">Kitiltva</Badge>}
                      </h6>
                      {userData.groups && (
                        <h6>
                          {userData.groups.map((group) => {
                            return (
                              <Badge color="rose" key={group}>
                                {groups(group)}
                              </Badge>
                            );
                          })}
                        </h6>
                      )}
                      {userData.social_accounts.map((account) => {
                        let icon;
                        switch (account.provider) {
                          case 'authsch':
                            icon = 'fa-brands icon-sch';
                            break;
                          case 'facebook':
                            icon = 'fa-brands fa-facebook';
                            break;
                          case 'google-oauth2':
                            icon = 'fa-brands fa-google';
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
          <GridContainer justifyContent="center">
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
                    <GridContainer
                      justifyContent="center"
                      className={classes.field}
                    >
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
                                justifyContent="center"
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
                                                userData.profile.avatar_url ||
                                              (id && !isSelf(id))
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
                                                    <i className="fa-solid fa-circle-check" />
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
                        {(!id || isSelf(id)) && (
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
                                      <i className="fa-brands fa-facebook" />{' '}
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
                                      <i className="fa-brands fa-facebook" />{' '}
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
                                      <i className="fa-brands fa-google" />{' '}
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
                                      <i className="fa-brands fa-google" />{' '}
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
                                      <i className="fa-brands icon-sch" />{' '}
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
                                      <i className="fa-brands icon-sch" />{' '}
                                      Bejelenetkezés
                                    </Button>
                                  )}
                                </GridItem>
                              </GridContainer>
                            </AccordionDetails>
                          </Accordion>
                        )}
                        {(((!id || isSelf(id)) && isPrivileged()) ||
                          isAdmin()) && (
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
                                  justifyContent="center"
                                  alignItems="center"
                                >
                                  <LocalizationProvider
                                    dateAdapter={AdapterDateFns}
                                    locale={hu}
                                  >
                                    <>
                                      <GridItem
                                        xs={12}
                                        sm={6}
                                        className={
                                          isXsView ? classes.gridItemMobile : ''
                                        }
                                      >
                                        <DatePicker
                                          label="Kezdő dátum"
                                          toolbarTitle="Válaszd ki az időszak elejét"
                                          okText="Rendben"
                                          cancelText="Mégsem"
                                          mask="____. __. __."
                                          maxDate={new Date()}
                                          value={selectedStartDate}
                                          onChange={setSelectedStartDate}
                                          renderInput={(params) => (
                                            <TextField {...params} fullWidth />
                                          )}
                                        />
                                      </GridItem>
                                      <GridItem
                                        xs={12}
                                        sm={6}
                                        className={
                                          isXsView ? classes.gridItemMobile : ''
                                        }
                                      >
                                        <DatePicker
                                          label="Vége dátum"
                                          toolbarTitle="Válaszd ki az időszak végét"
                                          okText="Rendben"
                                          cancelText="Mégsem"
                                          mask="____. __. __."
                                          maxDate={new Date()}
                                          value={selectedEndDate}
                                          onChange={setSelectedEndDate}
                                          renderInput={(params) => (
                                            <TextField {...params} fullWidth />
                                          )}
                                        />
                                      </GridItem>
                                    </>
                                  </LocalizationProvider>
                                  <GridItem
                                    className={
                                      isXsView
                                        ? classes.gridItemMobileNoTopPadding
                                        : classes.gridItemMobile
                                    }
                                  >
                                    <GridContainer
                                      justifyContent="space-between"
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
                                          color="secondary"
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
                                </GridContainer>
                              </AccordionDetails>
                            </Accordion>
                            <WorkedOnDialog
                              workedOnDialogOpen={workedOnDialogOpen}
                              setWorkedOnDialogOpen={setWorkedOnDialogOpen}
                              userId={id || 'me'}
                              selectedDateRange={[
                                selectedStartDate,
                                selectedEndDate,
                              ]}
                              includeResponsible={includeResponsible}
                            />
                          </>
                        )}
                        {id && !isSelf(id) && isAdmin() && (
                          <Accordion>
                            <AccordionSummary
                              expandIcon={<ExpandMoreIcon />}
                              id="ban-header"
                            >
                              <Typography>Felhasználó kitiltása</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                              <TextField
                                label="Indoklás"
                                fullWidth
                                multiline
                                rows={5}
                                value={
                                  (userData.ban && userData.ban.reason) ||
                                  banReason
                                }
                                onChange={(event) =>
                                  setBanReason(event.target.value)
                                }
                                disabled={!!userData.ban}
                                helperText={
                                  userData.ban &&
                                  `Létrehozva: ${format(
                                    new Date(userData.ban.created),
                                    'yyyy. MMMM d. H:mm',
                                    {
                                      locale: hu,
                                    }
                                  )}`
                                }
                              />
                            </AccordionDetails>
                            <AccordionActions>
                              <MUIButton
                                size="small"
                                color={userData.ban ? 'warning' : 'error'}
                                onClick={() => handleBan()}
                                disabled={banLoading}
                              >
                                {userData.ban ? 'Feloldás' : 'Kitiltás'}
                              </MUIButton>
                            </AccordionActions>
                          </Accordion>
                        )}
                      </GridItem>
                    </GridContainer>
                    {userData.role === 'user' && (!id || isAdmin()) && (
                      <GridContainer justifyContent="center">
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
