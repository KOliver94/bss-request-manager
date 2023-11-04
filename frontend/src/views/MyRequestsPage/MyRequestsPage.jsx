import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
// nodejs library that concatenates classes
import classNames from 'classnames';
// @mui components
import CircularProgress from '@mui/material/CircularProgress';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Pagination from '@mui/material/Pagination';
// background
import background from 'src/assets/img/BSS_csoportkep_2019osz.jpg';
// core components
import Header from 'src/components/material-kit-react/Header/Header';
import Footer from 'src/components/material-kit-react/Footer/Footer';
import GridContainer from 'src/components/material-kit-react/Grid/GridContainer';
import GridItem from 'src/components/material-kit-react/Grid/GridItem';
import HeaderLinks from 'src/components/material-kit-react/Header/HeaderLinks';
import Parallax from 'src/components/material-kit-react/Parallax/Parallax';
import Badge from 'src/components/material-kit-react/Badge/Badge';
// Notistack
import { useSnackbar } from 'notistack';
// Date format
import { format, isAfter, sub } from 'date-fns';
import { hu } from 'date-fns/locale';
// API calls
import { listRequests } from 'src/api/requestApi';
import { requestStatuses } from 'src/helpers/enumConstants';
import handleError from 'src/helpers/errorHandler';
import changePageTitle from 'src/helpers/pageTitleHelper';

import stylesModule from './MyRequestsPage.module.scss';

export default function MyRequestsPage({
  isAuthenticated,
  setIsAuthenticated,
}) {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ results: [], total_pages: 0 });
  const [ordering, setOrdering] = useState('-start_datetime');

  const loadData = useCallback(
    async (pageNumber) => {
      await listRequests(pageNumber, ordering)
        .then((response) => {
          setData(response.data);
          setLoading(false);
        })
        .catch((e) => {
          enqueueSnackbar(handleError(e), {
            variant: 'error',
          });
        });
    },
    [enqueueSnackbar, ordering],
  );

  const handlePageChange = (event, page) => {
    loadData(page);
  };

  const handleRowClick = (id) => {
    navigate(`/my-requests/${id}`);
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
    changePageTitle('Felkéréseim');
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
        <div className={stylesModule.container}>
          <GridContainer justifyContent="center">
            <GridItem
              xs={12}
              sm={12}
              md={6}
              className={stylesModule.textCenter}
            >
              <h1 className={stylesModule.title}>Felkéréseim</h1>
            </GridItem>
          </GridContainer>
        </div>
      </Parallax>
      <div className={classNames(stylesModule.main, stylesModule.mainRaised)}>
        <div
          className={classNames(stylesModule.container, stylesModule.section)}
        >
          {loading ? (
            <GridContainer justifyContent="center">
              <CircularProgress
                className={stylesModule.circularProgress}
                size={60}
              />
            </GridContainer>
          ) : (
            <>
              {data.results.length > 0 ? (
                <>
                  <GridContainer justifyContent="center">
                    <TableContainer
                      component={Paper}
                      className={stylesModule.table}
                    >
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
                                {`${item.title} `}
                                {isAfter(
                                  new Date(item.created),
                                  sub(new Date(), { days: 5 }),
                                ) && <Badge color="info">Új</Badge>}
                              </TableCell>
                              <TableCell align="center">
                                {format(
                                  new Date(item.start_datetime),
                                  'yyyy. MMMM d. (eeee) | H:mm',
                                  { locale: hu },
                                )}
                              </TableCell>
                              <TableCell align="center">
                                <Badge color="primary">
                                  {
                                    requestStatuses.find(
                                      (x) => x.id === item.status,
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
                  <GridContainer justifyContent="center">
                    <Pagination
                      count={data.total_pages}
                      onChange={handlePageChange}
                      className={stylesModule.pagination}
                    />
                  </GridContainer>
                </>
              ) : (
                <GridContainer justifyContent="center">
                  <Typography
                    variant="h5"
                    className={stylesModule.notFound}
                    gutterBottom
                  >
                    Nincs beküldött felkérésed{' '}
                    <i className="fa-regular fa-face-sad-tear" />
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
};
