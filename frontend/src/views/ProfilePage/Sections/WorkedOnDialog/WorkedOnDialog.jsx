import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
// Material UI components
import Box from '@material-ui/core/Box';
import CloseIcon from '@material-ui/icons/Close';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import IconButton from '@material-ui/core/IconButton';
import Paper from '@material-ui/core/Paper';
import Skeleton from '@material-ui/lab/Skeleton';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { useTheme } from '@material-ui/core/styles';
// Notistack
import { useSnackbar } from 'notistack';
// Date format
import { format } from 'date-fns';
// API calls
import { getUserWorkedOn } from 'api/userApi';
import compareValues from 'helpers/objectComperator';
import handleError from 'helpers/errorHandler';

export default function WorkedOnDialog({
  workedOnDialogOpen,
  setWorkedOnDialogOpen,
  userId,
  selectedStartDate,
  selectedEndDate,
  includeResponsible,
}) {
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [orderBy, setOrderBy] = useState({
    field: 'start_datetime',
    direction: 'asc',
    field2: null,
  });

  const headCells = [
    { id: 'title', label: 'Felkérés' },
    { id: 'position', label: 'Pozíció' },
    { id: 'start_datetime', label: 'Kezdés időpontja' },
    { id: 'end_datetime', label: 'Befejezetés időpontja' },
  ];

  const closeDialog = () => {
    setWorkedOnDialogOpen(false);
  };

  const changeOrderBy = (field) => {
    let direction = 'asc';
    if (orderBy.field === field) {
      if (orderBy.direction === 'asc') {
        direction = 'desc';
      }
    }
    if (field !== 'position') {
      setOrderBy({ field, direction, field2: 'position' });
    } else {
      setOrderBy({ field, direction, field2: 'title' });
    }
  };

  useEffect(() => {
    async function loadData(user, fromData, toDate, responsible) {
      try {
        setLoading(true);
        const result = await getUserWorkedOn(
          user,
          fromData,
          toDate,
          responsible
        );
        setRequests(result.data);
        setLoading(false);
      } catch (e) {
        enqueueSnackbar(handleError(e), {
          variant: 'error',
          autoHideDuration: 5000,
        });
      }
    }
    if (workedOnDialogOpen) {
      loadData(
        userId,
        selectedStartDate.toISOString().split('T')[0],
        selectedEndDate.toISOString().split('T')[0],
        includeResponsible
      );
    }
  }, [
    workedOnDialogOpen,
    userId,
    selectedStartDate,
    selectedEndDate,
    includeResponsible,
    enqueueSnackbar,
  ]);

  return (
    <Dialog
      open={workedOnDialogOpen}
      onClose={closeDialog}
      fullWidth
      maxWidth="lg"
      fullScreen={fullScreen}
    >
      <DialogTitle id="ratings-dialog">
        <Box display="flex" alignItems="center">
          <Box flexGrow={1}>Készített anyagok</Box>
          <Box>
            <IconButton onClick={closeDialog}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>
      <DialogContent>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                {headCells.map((item) => (
                  <TableCell align="center" key={`${item.id}-headCell`}>
                    {item.label}
                    <TableSortLabel
                      active={orderBy.field === item.id}
                      direction={orderBy.direction}
                      onClick={() => changeOrderBy(item.id)}
                    />
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <>
                  {[...Array(4).keys()].map((x) => (
                    <TableRow key={`${x}-skeleton`} hover>
                      {headCells.map((item) => (
                        <TableCell align="center" key={`${item.id}-${x}`}>
                          <Skeleton variant="text" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </>
              ) : (
                <>
                  {requests
                    .sort(
                      compareValues(
                        orderBy.field,
                        orderBy.direction,
                        orderBy.field2
                      )
                    )
                    .map((request) => (
                      <TableRow key={`${request.id}-${request.position}`} hover>
                        <TableCell align="center">
                          <Link to={`/admin/requests/${request.id}`}>
                            {request.title}
                          </Link>
                        </TableCell>
                        <TableCell align="center">{request.position}</TableCell>
                        <TableCell align="center">
                          {format(
                            new Date(request.start_datetime),
                            'yyyy.MM.dd. HH:mm'
                          )}
                        </TableCell>
                        <TableCell align="center">
                          {format(
                            new Date(request.end_datetime),
                            'yyyy.MM.dd. HH:mm'
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                </>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
    </Dialog>
  );
}

WorkedOnDialog.propTypes = {
  workedOnDialogOpen: PropTypes.bool.isRequired,
  setWorkedOnDialogOpen: PropTypes.func.isRequired,
  selectedStartDate: PropTypes.instanceOf(Date).isRequired,
  selectedEndDate: PropTypes.instanceOf(Date).isRequired,
  includeResponsible: PropTypes.bool.isRequired,
  userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};
