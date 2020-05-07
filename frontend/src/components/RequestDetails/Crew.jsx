import React, { useState } from 'react';
import PropTypes from 'prop-types';
// Material UI components
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/Add';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import CheckIcon from '@material-ui/icons/Check';
import ClearIcon from '@material-ui/icons/Clear';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Divider from '@material-ui/core/Divider';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import MenuItem from '@material-ui/core/MenuItem';
import { makeStyles } from '@material-ui/core/styles';
// Notistack
import { useSnackbar } from 'notistack';
// API calls
import {
  createCrewAdmin,
  updateCrewAdmin,
  deleteCrewAdmin,
} from 'api/requestAdminApi';

const useStyles = makeStyles(() => ({
  title: {
    padding: '10px 15px',
  },
  paper: {
    padding: '15px',
    margin: '16px',
    width: 'auto',
  },
  inputField: {
    marginTop: '24px',
  },
}));

export default function Crew({
  requestId,
  requestData,
  /* setRequestData, */
  staffMembers,
  isAdmin,
}) {
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [editingCrewId, setEditingCrewId] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [crewMemberDetails, setCrewMemberDetails] = useState({});

  const showError = () => {
    enqueueSnackbar('Nem várt hiba történt. Kérlek próbáld újra később.', {
      variant: 'error',
      autoHideDuration: 5000,
    });
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setCrewMemberDetails((prevcrewMemberDetails) => ({
      ...prevcrewMemberDetails,
      [name]: value,
    }));
  };

  const handleSubmit = async (newCrewMember = false) => {
    setLoading(true);
    try {
      if (editingCrewId > 0 && !newCrewMember) {
        await updateCrewAdmin(requestId, editingCrewId, crewMemberDetails);
      } else {
        await createCrewAdmin(requestId, crewMemberDetails);
      }
      setCrewMemberDetails({});
      // TODO: Add to data instead of reloading
      window.location.reload();
    } catch (e) {
      showError();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (crewId) => {
    setLoading(true);
    try {
      await deleteCrewAdmin(requestId, crewId);

      // TODO: Add to data instead of reloading
      window.location.reload();
    } catch (e) {
      showError();
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (crewId) => {
    setEditingCrewId(crewId);
    setCrewMemberDetails({});
  };

  const handleCancel = () => {
    setEditingCrewId(0);
    setCrewMemberDetails({});
  };

  const handleDialogOpen = () => {
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setCrewMemberDetails({});
  };

  if (isAdmin) {
    return (
      <div>
        <div>
          <Grid
            container
            spacing={1}
            direction="row"
            justify="space-between"
            alignItems="center"
          >
            <Grid item>
              <Typography variant="h6" className={classes.title}>
                Stábtagok
              </Typography>
            </Grid>
            <Grid item>
              <IconButton onClick={handleDialogOpen} disabled={loading}>
                <AddIcon />
              </IconButton>
            </Grid>
          </Grid>
        </div>
        <Divider variant="middle" />
        {requestData.crew.length > 0 && (
          <TableContainer component={Paper} className={classes.paper}>
            <Table>
              <TableBody>
                {requestData.crew.map((crewMember) => (
                  <TableRow key={crewMember.id} hover>
                    <TableCell>
                      {`${crewMember.member.last_name} ${crewMember.member.first_name}`}
                    </TableCell>
                    {editingCrewId === crewMember.id ? (
                      <TableCell>
                        <TextField
                          id="position"
                          name="position"
                          label="Pozíció"
                          defaultValue={crewMember.position}
                          onChange={handleChange}
                        />
                      </TableCell>
                    ) : (
                      <TableCell>{crewMember.position}</TableCell>
                    )}

                    <TableCell align="right">
                      {editingCrewId === crewMember.id ? (
                        <>
                          <IconButton
                            onClick={() => handleSubmit()}
                            disabled={loading}
                          >
                            <CheckIcon />
                          </IconButton>
                          <IconButton onClick={handleCancel} disabled={loading}>
                            <ClearIcon />
                          </IconButton>
                        </>
                      ) : (
                        <>
                          <IconButton
                            onClick={() => handleEdit(crewMember.id)}
                            disabled={loading}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            onClick={() => handleDelete(crewMember.id)}
                            disabled={loading}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        <Dialog open={dialogOpen} onClose={handleDialogClose}>
          <DialogTitle id="add-crew-dialog">Új stábtag hozzáadása</DialogTitle>
          <DialogContent>
            <TextField
              id="member_id"
              name="member_id"
              select
              fullWidth
              label="Stábtag"
              required
              onChange={handleChange}
            >
              {staffMembers.map((item) => (
                <MenuItem value={item.id} key={item.id}>
                  {`${item.last_name} ${item.first_name}`}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              className={classes.inputField}
              id="position"
              name="position"
              label="Pozíció"
              onChange={handleChange}
              fullWidth
              required
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDialogClose} color="primary">
              Mégsem
            </Button>
            <Button onClick={() => handleSubmit(true)} color="primary">
              Hozzáadás
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
  return null;
}

Crew.propTypes = {
  requestId: PropTypes.string.isRequired,
  requestData: PropTypes.object.isRequired,
  /* setRequestData: PropTypes.func.isRequired, */
  staffMembers: PropTypes.array.isRequired,
  isAdmin: PropTypes.bool.isRequired,
};
