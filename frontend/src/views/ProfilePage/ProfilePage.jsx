import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
// nodejs library that concatenates classes
import classNames from 'classnames';
// @mui components
import Accordion from '@mui/material/Accordion';
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
import Switch from '@mui/material/Switch';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
// core components
import Button from 'src/components/material-kit-react/CustomButtons/Button';
import GridContainer from 'src/components/material-kit-react/Grid/GridContainer';
import GridItem from 'src/components/material-kit-react/Grid/GridItem';
import Parallax from 'src/components/material-kit-react/Parallax/Parallax';
import Badge from 'src/components/material-kit-react/Badge/Badge';
// React Hook Form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// Date fields
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import sub from 'date-fns/sub';
import { hu } from 'date-fns/locale';
// Yup validations
import * as Yup from 'yup';
import isValidPhone from 'src/helpers/yupPhoneNumberValidator';
// Notistack
import { useSnackbar } from 'notistack';
// API calls
import {
  connectSocial,
  disconnectSocial,
  getMe,
  updateMe,
} from 'src/api/meApi';
import { isPrivileged } from 'src/api/loginApi';
import handleError from 'src/helpers/errorHandler';
import { userRoles, avatarProviders, groups } from 'src/helpers/enumConstants';
import {
  getOauthUrlAuthSch,
  getOauthUrlFacebook,
  getOauthUrlGoogle,
} from 'src/helpers/oauthConstants';
import changePageTitle from 'src/helpers/pageTitleHelper';
// Sections
import PersonalDetailsNormal from './Sections/PersonalDetails/PersonalDetailsNormal';
import PersonalDetailsMobile from './Sections/PersonalDetails/PersonalDetailsMobile';
import WorkedOnDialog from './Sections/WorkedOnDialog/WorkedOnDialog';

import stylesModule from './ProfilePage.module.scss';

export default function ProfilePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { code, provider } = { ...location.state };
  const theme = useTheme();
  const isMobileView = !useMediaQuery(theme.breakpoints.up('md'));
  const isXsView = !useMediaQuery(theme.breakpoints.up('sm'));
  const avatarClasses = classNames(
    stylesModule.imgRaised,
    stylesModule.imgRoundedCircle,
    stylesModule.avatar,
  );
  const { enqueueSnackbar } = useSnackbar();

  const [loading, setLoading] = useState(true);
  const [profileConnecting, setProfileConnecting] = useState(false);
  const [workedOnDialogOpen, setWorkedOnDialogOpen] = useState(false);
  const [userData, setUserData] = useState({});
  const [selectedStartDate, setSelectedStartDate] = useState(
    sub(new Date(), { weeks: 20 }),
  );
  const [selectedEndDate, setSelectedEndDate] = useState(new Date());
  const [includeResponsible, setIncludeResponsible] = useState(true);
  const [headerDataChange, setHeaderDataChange] = useState(false);
  const [tooltipOpen, setTooltipOpen] = useState(null);

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
    profile: Yup.object({
      phone_number: Yup.string()
        .phone('Érvénytelen telefonszám!')
        .required('A telefonszám megadása kötelező!'),
    }),
  });

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: yupResolver(validationSchema),
  });

  const handleCloseTooltip = (tooltip) =>
    tooltipOpen === tooltip && setTooltipOpen(null);

  const handleDisconnect = async (val) => {
    setProfileConnecting(true);
    try {
      await disconnectSocial(val);
      setUserData((prevUserData) => ({
        ...prevUserData,
        social_accounts: prevUserData.social_accounts.filter(
          (account) => account.provider !== val,
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
        const result = await getMe();
        setUserData(result.data);
        setLoading(false);
        reset({
          ...result.data,
        });
      } catch (e) {
        enqueueSnackbar(handleError(e), {
          variant: 'error',
        });
      }
    }
    setLoading(true);
    loadData();
  }, [reset, enqueueSnackbar]);

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

  const onSubmit = async (data) => {
    const values = data;
    try {
      const result = await updateMe(values);
      setUserData(result.data);
      localStorage.setItem(
        'name',
        `${result.data.last_name} ${result.data.first_name}`,
      );
      localStorage.setItem('avatar', result.data.profile.avatar_url);
      window.dispatchEvent(new Event('storage'));
      setHeaderDataChange(!headerDataChange);
      reset({
        ...result.data,
      });
    } catch (e) {
      enqueueSnackbar(handleError(e), {
        variant: 'error',
      });
    }
  };

  return (
    <>
      <Parallax small filter />
      <div className={classNames(stylesModule.main, stylesModule.mainRaised)}>
        <div
          className={classNames(stylesModule.container, stylesModule.section)}
        >
          <GridContainer justifyContent="center">
            <GridItem xs={12} sm={12} md={6}>
              <div className={stylesModule.profile}>
                <div>
                  <Avatar
                    className={avatarClasses}
                    src={
                      loading
                        ? localStorage.getItem('avatar')
                        : userData.profile.avatar_url
                    }
                  />
                </div>
                <div className={stylesModule.name}>
                  <h3 className={stylesModule.title}>
                    <>
                      {loading
                        ? localStorage.getItem('name')
                        : `${userData.last_name} ${userData.first_name}`}
                    </>
                  </h3>
                  {!loading && (
                    <>
                      <h6>
                        <Badge color="primary">
                          {userRoles(userData.role)}
                        </Badge>
                        {userData.ban && <Badge color="error">Kitiltva</Badge>}
                      </h6>
                      {userData.groups && (
                        <h6>
                          {userData.groups.map((group) => {
                            return (
                              <Badge color="secondary" key={group}>
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
                className={stylesModule.circularProgress}
                size={60}
              />
            ) : (
              <form onSubmit={handleSubmit(onSubmit)}>
                <GridContainer
                  justifyContent="center"
                  className={stylesModule.field}
                >
                  {!isMobileView && (
                    <PersonalDetailsNormal
                      control={control}
                      errors={errors}
                      disabled={userData.role !== 'user'}
                      isUser={userData.role === 'user'}
                    />
                  )}
                  <GridItem xs={12} sm={12} md={6}>
                    {isMobileView && (
                      <PersonalDetailsMobile
                        control={control}
                        errors={errors}
                        disabled={userData.role !== 'user'}
                        isUser={userData.role === 'user'}
                      />
                    )}
                    <Accordion
                      classes={
                        !isMobileView
                          ? {
                              rounded: stylesModule.accordion,
                              expanded: stylesModule.accordion,
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
                      <AccordionDetails
                        className={stylesModule.accordionAvatar}
                      >
                        {!Object.entries(userData.profile.avatar).length ? (
                          <Alert
                            severity="warning"
                            className={stylesModule.alertAvatar}
                          >
                            <AlertTitle>Nincs elérhető kép</AlertTitle>
                            Tölts fel egy képet{' '}
                            <a href="https://gravatar.com">Gravatar</a>-ra vagy
                            kapcsold össze profilod Facebook vagy Google
                            fiókoddal a lenti menüpont segítségével.
                            <br />
                            <em>
                              <small className={stylesModule.smallAvatar}>
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
                                  avatar[0] !== 'provider' && avatar[1],
                              )
                              .map((avatar) => {
                                return (
                                  <GridItem
                                    key={avatar[0]}
                                    xs={12}
                                    sm={4}
                                    md={4}
                                    className={
                                      isXsView
                                        ? stylesModule.gridItemMobile
                                        : ''
                                    }
                                  >
                                    <Card>
                                      <CardActionArea
                                        onClick={() =>
                                          onSubmit({
                                            profile: {
                                              avatar_provider: avatar[0],
                                            },
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
                                              stylesModule.cardMediaAvatar,
                                          }}
                                        />
                                        <CardContent>
                                          <Typography
                                            variant="h6"
                                            component="h2"
                                            display="block"
                                            className={stylesModule.textAvatar}
                                          >
                                            {avatarProviders(avatar[0])}{' '}
                                            {avatar[1] ===
                                              userData.profile.avatar_url && (
                                              <small
                                                className={
                                                  stylesModule.selectedIconAvatar
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
                              (x) => x.provider === 'facebook',
                            ) ? (
                              <Button
                                color="facebook"
                                fullWidth
                                disabled={profileConnecting}
                                onClick={() => handleDisconnect('facebook')}
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
                              (x) => x.provider === 'google-oauth2',
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
                              (x) => x.provider === 'authsch',
                            ) ? (
                              <Button
                                color="authsch"
                                fullWidth
                                disabled={profileConnecting}
                                onClick={() => handleDisconnect('authsch')}
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
                              justifyContent="center"
                              alignItems="center"
                            >
                              <LocalizationProvider
                                dateAdapter={AdapterDateFns}
                                adapterLocale={hu}
                              >
                                <>
                                  <GridItem
                                    xs={12}
                                    sm={6}
                                    className={
                                      isXsView
                                        ? stylesModule.gridItemMobile
                                        : ''
                                    }
                                  >
                                    <DatePicker
                                      label="Kezdő dátum"
                                      maxDate={new Date()}
                                      value={selectedStartDate}
                                      onChange={setSelectedStartDate}
                                      slotProps={{
                                        textField: {
                                          fullWidth: true,
                                        },
                                      }}
                                    />
                                  </GridItem>
                                  <GridItem
                                    xs={12}
                                    sm={6}
                                    className={
                                      isXsView
                                        ? stylesModule.gridItemMobile
                                        : ''
                                    }
                                  >
                                    <DatePicker
                                      label="Vége dátum"
                                      maxDate={new Date()}
                                      value={selectedEndDate}
                                      onChange={setSelectedEndDate}
                                      slotProps={{
                                        textField: {
                                          fullWidth: true,
                                        },
                                      }}
                                    />
                                  </GridItem>
                                </>
                              </LocalizationProvider>
                              <GridItem
                                className={
                                  isXsView
                                    ? stylesModule.gridItemMobileNoTopPadding
                                    : stylesModule.gridItemMobile
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
                                    className={stylesModule.gridEnd}
                                  >
                                    <Switch
                                      checked={includeResponsible}
                                      onChange={(event) =>
                                        setIncludeResponsible(
                                          event.target.checked,
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
                                  onClick={() => setWorkedOnDialogOpen(true)}
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
                          selectedDateRange={[
                            selectedStartDate,
                            selectedEndDate,
                          ]}
                          includeResponsible={includeResponsible}
                        />
                      </>
                    )}
                  </GridItem>
                </GridContainer>
                {userData.role === 'user' && (
                  <GridContainer justifyContent="center">
                    <GridItem className={stylesModule.textCenter}>
                      <Button
                        color="error"
                        className={stylesModule.button}
                        onClick={() => reset()}
                        disabled={isSubmitting}
                      >
                        Mégsem
                      </Button>
                      <Button
                        color="success"
                        className={stylesModule.button}
                        type="submit"
                        disabled={isSubmitting}
                      >
                        Mentés
                      </Button>
                    </GridItem>
                  </GridContainer>
                )}
              </form>
            )}
          </GridContainer>
        </div>
      </div>
    </>
  );
}
