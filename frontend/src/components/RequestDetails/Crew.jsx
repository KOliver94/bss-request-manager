import { useState } from 'react';
import PropTypes from 'prop-types';
// MUI components
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';
import MUITextField from '@mui/material/TextField';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import Fab from '@mui/material/Fab';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Avatar from '@mui/material/Avatar';
import makeStyles from '@mui/styles/makeStyles';
import { createFilterOptions } from '@mui/material/Autocomplete';
// Form components
import { Formik, Form, Field, getIn } from 'formik';
import { Autocomplete } from 'formik-mui';
import * as Yup from 'yup';
// Notistack
import { useSnackbar } from 'notistack';
// Helpers
import stringToColor from 'helpers/stringToColor';
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
      .required('A pozíció megadása kötelező!')
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
                            variant="standard"
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
                      renderOption={(props, option) => {
                        return (
                          // eslint-disable-next-line react/jsx-props-no-spreading
                          <li {...props}>
                            <Avatar
                              sx={{
                                bgcolor: stringToColor(
                                  `${option.last_name} ${option.first_name}`
                                ),
                              }}
                              src={option.profile.avatar_url}
                              className={classes.smallAvatar}
                            >
                              {option.first_name[0]}
                            </Avatar>
                            {`${option.last_name} ${option.first_name}`}
                          </li>
                        );
                      }}
                      isOptionEqualToValue={(option, value) =>
                        option.id === value.id
                      }
                      autoHighlight
                      clearOnEscape
                      fullWidth
                      renderInput={(params) => (
                        <MUITextField
                          {...params}
                          name="member_id"
                          label="Stábtag"
                          margin="normal"
                          variant="standard"
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

                        const { inputValue } = params;
                        // Suggest the creation of a new value
                        const isExisting = options.some(
                          (option) => inputValue === option.position
                        );
                        if (inputValue !== '' && !isExisting) {
                          filtered.push({
                            position: params.inputValue,
                            category: 'Egyéb',
                            label: `Egyéb: "${params.inputValue}"`,
                          });
                        }

                        return filtered;
                      }}
                      getOptionLabel={(option) => option.position}
                      renderOption={(props, option) => {
                        // Add "xxx" option created dynamically
                        if (option.label) {
                          // eslint-disable-next-line react/jsx-props-no-spreading
                          return <li {...props}>{option.label}</li>;
                        }
                        // Regular option
                        // eslint-disable-next-line react/jsx-props-no-spreading
                        return <li {...props}>{option.position}</li>;
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
                          {...params}
                          name="position_obj"
                          label="Pozíció"
                          margin="normal"
                          variant="standard"
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
                    color="inherit"
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
