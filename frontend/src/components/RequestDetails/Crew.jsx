import { useState } from 'react';
import PropTypes from 'prop-types';
// Material UI components
import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/Add';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import CheckIcon from '@material-ui/icons/Check';
import ClearIcon from '@material-ui/icons/Clear';
import MUITextField from '@material-ui/core/TextField';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableRow from '@material-ui/core/TableRow';
import Fab from '@material-ui/core/Fab';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
// Form components
import { Formik, Form, Field } from 'formik';
import { TextField } from 'formik-material-ui';
import { Autocomplete } from 'formik-material-ui-lab';
import * as Yup from 'yup';
// Notistack
import { useSnackbar } from 'notistack';
// API calls
import {
  createCrewAdmin,
  updateCrewAdmin,
  deleteCrewAdmin,
} from 'api/requestAdminApi';
import compareValues from 'api/objectComperator';

const useStyles = makeStyles(() => ({
  table: {
    marginBottom: '25px',
    width: 'auto',
  },
  inputField: {
    marginTop: '24px',
  },
  fab: {
    top: 'auto',
    right: '10px',
    bottom: '10px',
    left: 'auto',
    position: 'absolute',
  },
}));

export default function Crew({
  requestId,
  requestData,
  setRequestData,
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

  const handleSubmit = async (val) => {
    const values = val;
    try {
      values.member_id = values.member_id.id;
      const result = await createCrewAdmin(requestId, values);
      setRequestData({
        ...requestData,
        crew: [...requestData.crew, result.data],
      });
      setDialogOpen(false);
    } catch (e) {
      showError();
    }
  };

  const handleEditSubmit = async () => {
    setLoading(true);
    try {
      if (
        editingCrewId > 0 &&
        crewMemberDetails.position &&
        crewMemberDetails.position.length <= 20
      ) {
        const result = await updateCrewAdmin(
          requestId,
          editingCrewId,
          crewMemberDetails
        );
        setRequestData({
          ...requestData,
          crew: requestData.crew.map((crew) => {
            if (crew.id === editingCrewId) {
              return result.data;
            }
            return crew;
          }),
        });
        setEditingCrewId(0);
        setCrewMemberDetails({});
      }
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
      setRequestData({
        ...requestData,
        crew: requestData.crew.filter((crew) => crew.id !== crewId),
      });
    } catch (e) {
      showError();
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (crewId) => {
    setEditingCrewId(crewId);
    setCrewMemberDetails(requestData.crew.find((x) => x.id === crewId));
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

  const validationSchema = Yup.object({
    member_id: Yup.object()
      .required('A stábtag kiválasztása kötelező!')
      .nullable(),
    position: Yup.string()
      .min(1, 'A pozíció túl rövid!')
      .max(20, 'A pozíció túl hosszú!')
      .required('A pozíció megadása kötelező'),
  });

  if (isAdmin) {
    return (
      <div>
        {requestData.crew.length > 0 && (
          <TableContainer className={classes.table}>
            <Table>
              <TableBody>
                {requestData.crew
                  .sort(compareValues('position'))
                  .map((crewMember) => (
                    <TableRow key={crewMember.id} hover>
                      <TableCell>
                        {`${crewMember.member.last_name} ${crewMember.member.first_name}`}
                      </TableCell>
                      {editingCrewId === crewMember.id ? (
                        <TableCell>
                          <MUITextField
                            id="position"
                            name="position"
                            label="Pozíció"
                            defaultValue={crewMember.position}
                            onChange={handleChange}
                            required
                            error={
                              !crewMemberDetails.position ||
                              crewMemberDetails.position.length > 20
                            }
                            helperText={
                              (!crewMemberDetails.position &&
                                'Pozíció megadása kötelező!') ||
                              (crewMemberDetails.position.length > 20 &&
                                'A pozíció túl hosszú')
                            }
                          />
                        </TableCell>
                      ) : (
                        <TableCell>{crewMember.position}</TableCell>
                      )}

                      <TableCell align="right">
                        {editingCrewId === crewMember.id ? (
                          <>
                            <IconButton
                              onClick={() => handleEditSubmit()}
                              disabled={loading}
                            >
                              <CheckIcon />
                            </IconButton>
                            <IconButton
                              onClick={handleCancel}
                              disabled={loading}
                            >
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
        <Fab color="primary" onClick={handleDialogOpen} className={classes.fab}>
          <AddIcon />
        </Fab>
        <Dialog
          open={dialogOpen}
          onClose={handleDialogClose}
          fullWidth
          maxWidth="xs"
        >
          <Formik
            initialValues={{
              position: '',
            }}
            onSubmit={(values) => handleSubmit(values)}
            validationSchema={validationSchema}
          >
            {({ submitForm, isSubmitting, errors, touched }) => (
              <>
                <DialogTitle>Új stábtag hozzáadása</DialogTitle>
                <DialogContent>
                  <Form>
                    <Field
                      name="member_id"
                      component={Autocomplete}
                      options={staffMembers}
                      getOptionLabel={(option) =>
                        `${option.last_name} ${option.first_name}`
                      }
                      getOptionSelected={(option, value) =>
                        option.id === value.id
                      }
                      autoHighlight
                      clearOnEscape
                      fullWidth
                      renderInput={(params) => (
                        <MUITextField
                          // eslint-disable-next-line react/jsx-props-no-spreading
                          {...params}
                          label="Stábtag"
                          margin="normal"
                          error={touched.member_id && errors.member_id}
                          helperText={touched.member_id && errors.member_id}
                        />
                      )}
                    />
                    <Field
                      name="position"
                      label="Pozíció"
                      margin="normal"
                      component={TextField}
                      fullWidth
                      error={touched.position && errors.position}
                      helperText={touched.position && errors.position}
                    />
                  </Form>
                </DialogContent>
                <DialogActions>
                  <Button
                    onClick={handleDialogClose}
                    color="primary"
                    disabled={isSubmitting}
                  >
                    Mégsem
                  </Button>
                  <Button
                    onClick={submitForm}
                    color="primary"
                    disabled={isSubmitting}
                  >
                    Hozzáadás
                  </Button>
                </DialogActions>
              </>
            )}
          </Formik>
        </Dialog>
      </div>
    );
  }
  return null;
}

Crew.propTypes = {
  requestId: PropTypes.string.isRequired,
  requestData: PropTypes.object.isRequired,
  setRequestData: PropTypes.func.isRequired,
  staffMembers: PropTypes.array.isRequired,
  isAdmin: PropTypes.bool.isRequired,
};
