import { useEffect } from 'react';

import { yupResolver } from '@hookform/resolvers/yup';
import ClearIcon from '@mui/icons-material/Clear';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SendIcon from '@mui/icons-material/Send';
import { TextField } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import { format, formatDistanceToNow } from 'date-fns';
import { hu } from 'date-fns/locale';
import PropTypes from 'prop-types';
import { useForm, Controller } from 'react-hook-form';
import * as Yup from 'yup';

import Badge from 'components/material-kit-react/Badge/Badge';
import { isSelf } from 'helpers/authenticationHelper';
import stringToColor from 'helpers/stringToColor';

import stylesModule from './Comment.module.scss';

export default function CommentDesktop({
  comment: commentProp,
  handleDelete,
  handleSubmit,
  isEditing = false,
  isNew = false,
  loading,
  requesterId = 0,
  setEditingCommentId,
}) {
  const comment = commentProp || { text: '' };
  const userName = isNew
    ? localStorage.getItem('name')
    : comment.author.full_name;
  const name = isNew ? localStorage.getItem('name') : comment.author.full_name;
  const nameFirstLetter = name.split(' ')[1] && name.split(' ')[1][0];
  const avatarUrl = isNew
    ? localStorage.getItem('avatar')
    : comment.author.avatar_url;
  const validationSchema = Yup.object({
    text: Yup.string().trim().required('Üres hozzászólás nem küldhető be!'),
  });

  const {
    control,
    handleSubmit: hooksSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    defaultValues: comment,
    resolver: yupResolver(validationSchema),
  });

  const onSubmit = async (data) => {
    await handleSubmit(data, isNew);
    reset();
  };

  useEffect(() => {
    reset(commentProp);
  }, [reset, commentProp]);

  return (
    <>
      {isEditing || isNew ? (
        <form
          onSubmit={hooksSubmit(onSubmit)}
          className={isNew ? stylesModule.newComment : ''}
        >
          <Grid container spacing={2}>
            <Grid>
              <Avatar
                src={avatarUrl}
                sx={{
                  bgcolor: stringToColor(userName),
                }}
              >
                {nameFirstLetter}
              </Avatar>
            </Grid>
            <Grid size="grow">
              <h4 className={stylesModule.commentAuthor}>{userName}</h4>
              <Controller
                name="text"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={isNew ? 'Új hozzászólás' : 'Szerkesztés'}
                    margin="normal"
                    fullWidth
                    multiline
                    rows={5}
                    error={!!errors.text}
                    helperText={errors.text?.message}
                  />
                )}
              />
            </Grid>
            <Grid sx={{ alignSelf: 'flex-end' }}>
              {!isNew && (
                <Grid>
                  <Tooltip title="Elvetés" placement="left" arrow>
                    <span>
                      <IconButton
                        onClick={() => setEditingCommentId(-1)}
                        disabled={isSubmitting}
                      >
                        <ClearIcon />
                      </IconButton>
                    </span>
                  </Tooltip>
                </Grid>
              )}
              <Grid>
                <Tooltip
                  title={isNew ? 'Küldés' : 'Mentés'}
                  placement="left"
                  arrow
                >
                  <span>
                    <IconButton type="submit" disabled={isSubmitting}>
                      <SendIcon />
                    </IconButton>
                  </span>
                </Tooltip>
              </Grid>
            </Grid>
          </Grid>
        </form>
      ) : (
        <Grid container spacing={2}>
          <Grid>
            <Avatar
              src={avatarUrl}
              sx={{
                bgcolor: stringToColor(userName),
              }}
            >
              {nameFirstLetter}
            </Avatar>
          </Grid>
          <Grid size="grow">
            <Stack direction="row" alignItems="center" spacing={1}>
              <h4 className={stylesModule.commentAuthor}>{userName}</h4>
              {comment.author.id === requesterId && (
                <Badge color="info">Felkérő</Badge>
              )}
            </Stack>

            <p className={stylesModule.commentText}>{comment.text}</p>
            <Tooltip
              title={format(
                new Date(comment.created),
                'yyyy. MMMM d. H:mm:ss',
                {
                  locale: hu,
                },
              )}
              placement="bottom-start"
            >
              <p className={stylesModule.commentCreated}>
                {formatDistanceToNow(new Date(comment.created), {
                  locale: hu,
                  addSuffix: true,
                })}
              </p>
            </Tooltip>
          </Grid>

          {isSelf(comment.author.id) && (
            <Grid sx={{ alignSelf: 'flex-end' }}>
              <Grid>
                <Tooltip title="Törlés" placement="left" arrow>
                  <span>
                    <IconButton
                      onClick={() => handleDelete(comment.id)}
                      disabled={loading}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </span>
                </Tooltip>
              </Grid>
              <Grid>
                <Tooltip title="Szerkesztés" placement="left" arrow>
                  <span>
                    <IconButton
                      onClick={() => setEditingCommentId(comment.id)}
                      disabled={loading}
                    >
                      <EditIcon />
                    </IconButton>
                  </span>
                </Tooltip>
              </Grid>
            </Grid>
          )}
        </Grid>
      )}
      {!isNew && (
        <Divider variant="fullWidth" className={stylesModule.commentDivider} />
      )}
    </>
  );
}

CommentDesktop.propTypes = {
  comment: PropTypes.oneOfType([
    PropTypes.instanceOf(Comment),
    PropTypes.shape({
      text: PropTypes.string,
    }),
  ]),
  handleDelete: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  isEditing: PropTypes.bool,
  isNew: PropTypes.bool,
  loading: PropTypes.bool.isRequired,
  requesterId: PropTypes.number,
  setEditingCommentId: PropTypes.func.isRequired,
};
