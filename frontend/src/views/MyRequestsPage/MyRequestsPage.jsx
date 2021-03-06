import { useState, useEffect, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import PropTypes from 'prop-types';
// nodejs library that concatenates classes
import classNames from 'classnames';
// @material-ui/core components
import { makeStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Pagination from '@material-ui/lab/Pagination';
// background
import background from 'assets/img/BSS_csoportkep_2019osz.jpg';
// core components
import Header from 'components/material-kit-react/Header/Header';
import Footer from 'components/material-kit-react/Footer/Footer';
import GridContainer from 'components/material-kit-react/Grid/GridContainer';
import GridItem from 'components/material-kit-react/Grid/GridItem';
import HeaderLinks from 'components/material-kit-react/Header/HeaderLinks';
import Parallax from 'components/material-kit-react/Parallax/Parallax';
import Badge from 'components/material-kit-react/Badge/Badge';
// Notistack
import { useSnackbar } from 'notistack';
// Date format
import { format } from 'date-fns';
import { hu } from 'date-fns/locale';
// API calls
import { listRequests } from 'api/requestApi';
import { listRequestsAdmin } from 'api/requestAdminApi';
import { requestStatuses } from 'helpers/enumConstants';
import handleError from 'helpers/errorHandler';

import styles from 'assets/jss/material-kit-react/views/myRequestsPage';

const useStyles = makeStyles(styles);

export default function MyRequestsPage({
  isAuthenticated,
  setIsAuthenticated,
  isPrivileged,
}) {
  const classes = useStyles();
  const history = useHistory();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ results: [], total_pages: 0 });
  const [ordering, setOrdering] = useState('-created');

  const loadData = useCallback(
    async (pageNumber) => {
      try {
        let result;
        if (isPrivileged) {
          result = await listRequestsAdmin(pageNumber, ordering);
        } else {
          result = await listRequests(pageNumber, ordering);
        }
        setData(result.data);
        setLoading(false);
      } catch (e) {
        enqueueSnackbar(handleError(e), {
          variant: 'error',
          autoHideDuration: 5000,
        });
      }
    },
    [enqueueSnackbar, isPrivileged, ordering]
  );

  const handlePageChange = (page) => {
    loadData(page);
  };

  const handleRowClick = (id) => {
    history.push(isPrivileged ? `/admin/requests/${id}` : `/my-requests/${id}`);
  };

  const handleOrderingChange = (orderBy) => {
    if (ordering.endsWith(orderBy)) {
      if (ordering === orderBy) {
        setOrdering(`-${ordering}`);
      } else {
        setOrdering('-created');
      }
    } else {
      setOrdering(orderBy);
    }
  };

  useEffect(() => {
    loadData(1);
  }, [loadData]);

  return (
    <div>
      <Header
        color="transparent"
        brand="BSS Felkéréskezelő"
        rightLinks={
          <HeaderLinks
            isAuthenticated={isAuthenticated}
            setIsAuthenticated={setIsAuthenticated}
          />
        }
        fixed
        changeColorOnScroll={{
          height: 200,
          color: 'white',
        }}
      />
      <Parallax small filter image={background}>
        <div className={classes.container}>
          <GridContainer justify="center">
            <GridItem xs={12} sm={12} md={6} className={classes.textCenter}>
              <h1 className={classes.title}>
                {isPrivileged ? 'Felkérések' : 'Felkéréseim'}
              </h1>
            </GridItem>
          </GridContainer>
        </div>
      </Parallax>
      <div className={classNames(classes.main, classes.mainRaised)}>
        <div className={classNames(classes.container, classes.section)}>
          {loading ? (
            <GridContainer justify="center">
              <CircularProgress
                className={classes.circularProgress}
                size={60}
              />
            </GridContainer>
          ) : (
            <>
              {data.results.length > 0 ? (
                <>
                  <GridContainer justify="center">
                    <TableContainer component={Paper} className={classes.table}>
                      <Table aria-label="simple table">
                        <TableHead>
                          <TableRow>
                            <TableCell>
                              Esemény neve
                              <TableSortLabel
                                active={ordering.endsWith('title')}
                                direction={
                                  ordering.startsWith('-') ? 'desc' : 'asc'
                                }
                                onClick={() => handleOrderingChange('title')}
                              />
                            </TableCell>
                            <TableCell align="center">
                              Időpont
                              <TableSortLabel
                                active={ordering.endsWith('start_datetime')}
                                direction={
                                  ordering.startsWith('-') ? 'desc' : 'asc'
                                }
                                onClick={() =>
                                  handleOrderingChange('start_datetime')
                                }
                              />
                            </TableCell>
                            <TableCell align="center">
                              Státusz
                              <TableSortLabel
                                active={ordering.endsWith('status')}
                                direction={
                                  ordering.startsWith('-') ? 'desc' : 'asc'
                                }
                                onClick={() => handleOrderingChange('status')}
                              />
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {data.results.map((item) => (
                            <TableRow
                              onClick={() => handleRowClick(item.id)}
                              key={item.id}
                              hover
                            >
                              <TableCell component="th" scope="row">
                                {item.title}
                              </TableCell>
                              <TableCell align="center">
                                {format(
                                  new Date(item.start_datetime),
                                  'yyyy. MMMM d. (eeee) | H:mm',
                                  { locale: hu }
                                )}
                              </TableCell>
                              <TableCell align="center">
                                <Badge color="primary">
                                  {
                                    requestStatuses.find(
                                      (x) => x.id === item.status
                                    ).text
                                  }
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </GridContainer>
                  <GridContainer justify="center">
                    <Pagination
                      count={data.total_pages}
                      onChange={handlePageChange}
                      className={classes.pagination}
                    />
                  </GridContainer>
                </>
              ) : (
                <GridContainer justify="center">
                  <Typography
                    variant="h5"
                    className={classes.notFound}
                    gutterBottom
                  >
                    Nincs beküldött felkérésed <i className="far fa-sad-tear" />
                  </Typography>
                </GridContainer>
              )}
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

MyRequestsPage.propTypes = {
  isAuthenticated: PropTypes.bool.isRequired,
  setIsAuthenticated: PropTypes.func.isRequired,
  isPrivileged: PropTypes.bool,
};

MyRequestsPage.defaultProps = {
  isPrivileged: false,
};
