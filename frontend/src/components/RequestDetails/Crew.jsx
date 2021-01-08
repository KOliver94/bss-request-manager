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
import Tooltip from '@material-ui/core/Tooltip';
import Avatar from '@material-ui/core/Avatar';
import { makeStyles } from '@material-ui/core/styles';
import { createFilterOptions } from '@material-ui/lab/Autocomplete';
// Form components
import { Formik, Form, Field, getIn } from 'formik';
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
import compareValues from 'helpers/objectComperator';
import handleError from 'helpers/errorHandler';
import { crewPositionTypes } from 'helpers/enumConstants';

const useStyles = makeStyles((theme) => ({
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
  smallAvatar: {
    width: theme.spacing(4),
    height: theme.spacing(4),
    marginRight: 5,
  },
}));

const filter = createFilterOptions();

export default function Crew({
  requestId,
  requestData,
  setRequestData,
  staffMembers,
  isPrivileged,
}) {
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [editingCrewId, setEditingCrewId] = useState(-1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [crewMemberDetails, setCrewMemberDetails] = useState({});

  const showError = (e) => {
    enqueueSnackbar(handleError(e), {
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
      values.member_id = values.member ? values.member.id : null;
      values.position = values.position_obj.position;
      const result = await createCrewAdmin(requestId, values);
      setRequestData({
        ...requestData,
        crew: [...requestData.crew, result.data],
      });
      setDialogOpen(false);
    } catch (e) {
      showError(e);
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
        setEditingCrewId(-1);
        setCrewMemberDetails({});
      }
    } catch (e) {
      showError(e);
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
      showError(e);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (crewId) => {
    setEditingCrewId(crewId);
    setCrewMemberDetails(requestData.crew.find((x) => x.id === crewId));
  };

  const handleCancel = () => {
    setEditingCrewId(-1);
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
    member: Yup.object()
      .required('A stábtag kiválasztása kötelező!')
      .nullable(),
    position_obj: Yup.object()
      .shape({
        position: Yup.string()
          .min(1, 'A pozíció túl rövid!')
          .max(20, 'A pozíció túl hosszú!')
          .trim(),
      })
      .required('A pozíció megadása kötelező')
      .nullable(),
  });

  if (isPrivileged) {
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
                            <Tooltip title="Mentés" arrow>
                              <span>
                                <IconButton
                                  onClick={() => handleEditSubmit()}
                                  disabled={loading}
                                >
                                  <CheckIcon />
                                </IconButton>
                              </span>
                            </Tooltip>
                            <Tooltip title="Elvetés" arrow>
                              <span>
                                <IconButton
                                  onClick={handleCancel}
                                  disabled={loading}
                                >
                                  <ClearIcon />
                                </IconButton>
                              </span>
                            </Tooltip>
                          </>
                        ) : (
                          <>
                            <Tooltip title="Szerkesztés" arrow>
                              <span>
                                <IconButton
                                  onClick={() => handleEdit(crewMember.id)}
                                  disabled={loading}
                                >
                                  <EditIcon />
                                </IconButton>
                              </span>
                            </Tooltip>
                            <Tooltip title="Törlés" arrow>
                              <span>
                                <IconButton
                                  onClick={() => handleDelete(crewMember.id)}
                                  disabled={loading}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </span>
                            </Tooltip>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        <Tooltip title="Új stábtag hozzáadása" arrow>
          <Fab
            color="primary"
            onClick={handleDialogOpen}
            className={classes.fab}
          >
            <AddIcon />
          </Fab>
        </Tooltip>
        <Dialog
          open={dialogOpen}
          onClose={handleDialogClose}
          fullWidth
          maxWidth="xs"
        >
          <Formik
            initialValues={{
              member: null,
              position_obj: null,
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
                      name="member"
                      component={Autocomplete}
                      options={staffMembers}
                      getOptionLabel={(option) =>
                        `${option.last_name} ${option.first_name}`
                      }
                      renderOption={(option) => {
                        return (
                          <>
                            <Avatar
                              alt={`${option.first_name} ${option.last_name}`}
                              src={option.profile.avatar_url}
                              className={classes.smallAvatar}
                            />
                            {`${option.last_name} ${option.first_name}`}
                          </>
                        );
                      }}
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
                          name="member_id"
                          label="Stábtag"
                          margin="normal"
                          error={touched.member && !!errors.member}
                          helperText={touched.member && errors.member}
                        />
                      )}
                    />
                    <Field
                      name="position_obj"
                      component={Autocomplete}
                      options={crewPositionTypes}
                      filterOptions={(options, params) => {
                        const filtered = filter(options, params);

                        // Suggest the creation of a new value
                        if (params.inputValue !== '') {
                          filtered.push({
                            position: params.inputValue,
                            category: 'Egyéb',
                            label: `Egyéb: "${params.inputValue}"`,
                          });
                        }

                        return filtered;
                      }}
                      getOptionLabel={(option) => option.position}
                      renderOption={(option) => {
                        // Add "xxx" option created dynamically
                        if (option.label) {
                          return option.label;
                        }
                        // Regular option
                        return option.position;
                      }}
                      groupBy={(option) => option.category}
                      fullWidth
                      selectOnFocus
                      clearOnBlur
                      handleHomeEndKeys
                      freeSolo
                      autoComplete
                      autoHighlight
                      renderInput={(params) => (
                        <MUITextField
                          // eslint-disable-next-line react/jsx-props-no-spreading
                          {...params}
                          name="position_obj"
                          label="Pozíció"
                          margin="normal"
                          error={touched.position_obj && !!errors.position_obj}
                          helperText={
                            touched.position_obj &&
                            (getIn(errors, 'position_obj.position') ||
                              getIn(errors, 'position_obj'))
                          }
                        />
                      )}
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
  isPrivileged: PropTypes.bool.isRequired,
};
