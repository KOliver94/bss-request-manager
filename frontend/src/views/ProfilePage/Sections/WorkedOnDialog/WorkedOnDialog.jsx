import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
// MUI components
import Box from '@mui/material/Box';
import CloseIcon from '@mui/icons-material/Close';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
// Notistack
import { useSnackbar } from 'notistack';
// Date format
import { format } from 'date-fns';
// API calls
import { getUserWorkedOn } from 'src/api/userApi';
import compareValues from 'src/helpers/objectComperator';
import handleError from 'src/helpers/errorHandler';

export default function WorkedOnDialog({
  workedOnDialogOpen,
  setWorkedOnDialogOpen,
  userId,
  selectedDateRange,
  includeResponsible,
}) {
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
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
          responsible,
        );
        setRequests(result.data);
        setLoading(false);
      } catch (e) {
        enqueueSnackbar(handleError(e), {
          variant: 'error',
        });
      }
    }
    if (workedOnDialogOpen) {
      loadData(
        userId,
        format(selectedDateRange[0], 'yyyy-MM-dd'),
        format(selectedDateRange[1], 'yyyy-MM-dd'),
        includeResponsible,
      );
    }
  }, [
    workedOnDialogOpen,
    userId,
    selectedDateRange,
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
                        orderBy.field2,
                      ),
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
                            'yyyy.MM.dd. HH:mm',
                          )}
                        </TableCell>
                        <TableCell align="center">
                          {format(
                            new Date(request.end_datetime),
                            'yyyy.MM.dd. HH:mm',
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
  selectedDateRange: PropTypes.arrayOf(Date).isRequired,
  includeResponsible: PropTypes.bool.isRequired,
  userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};
