import { useEffect } from 'react';
import PropTypes from 'prop-types';
// material-kit-react
import Badge from 'components/material-kit-react/Badge/Badge';
// MUI components
import IconButton from '@mui/material/IconButton';
import SendIcon from '@mui/icons-material/Send';
import EditIcon from '@mui/icons-material/Edit';
import ClearIcon from '@mui/icons-material/Clear';
import DeleteIcon from '@mui/icons-material/Delete';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Divider from '@mui/material/Divider';
import { TextField } from '@mui/material';
// New comment
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
// Date format
import { format, formatDistanceToNow } from 'date-fns';
import { hu } from 'date-fns/locale';
// Helpers
import stringToColor from 'helpers/stringToColor';
import { isSelf } from 'helpers/authenticationHelper';

import stylesModule from './Comment.module.scss';

export default function CommentMobile({
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
        <form onSubmit={hooksSubmit(onSubmit)}>
          <Stack direction="column" spacing={2}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Avatar
                src={avatarUrl}
                sx={{
                  bgcolor: stringToColor(userName),
                }}
              >
                {nameFirstLetter}
              </Avatar>
              <h4 className={stylesModule.commentAuthor}>{userName}</h4>
            </Stack>
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
            <Stack
              direction="row"
              justifyContent="flex-end"
              alignItems="center"
              className={stylesModule.buttonStack}
            >
              {!isNew && (
                <Tooltip title="Elvetés" arrow>
                  <span>
                    <IconButton
                      onClick={() => setEditingCommentId(-1)}
                      disabled={isSubmitting}
                    >
                      <ClearIcon />
                    </IconButton>
                  </span>
                </Tooltip>
              )}
              <Tooltip title={isNew ? 'Küldés' : 'Mentés'} arrow>
                <span>
                  <IconButton type="submit" disabled={isSubmitting}>
                    <SendIcon />
                  </IconButton>
                </span>
              </Tooltip>
            </Stack>
          </Stack>
        </form>
      ) : (
        <Stack direction="column" spacing={2}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Avatar
              src={avatarUrl}
              sx={{
                bgcolor: stringToColor(userName),
              }}
            >
              {nameFirstLetter}
            </Avatar>
            <Stack direction="column">
              <h4 className={stylesModule.commentAuthor}>{userName}</h4>
              <Stack direction="row" alignItems="center">
                {comment.author.id === requesterId && (
                  <Badge color="info">Felkérő</Badge>
                )}
              </Stack>
            </Stack>
          </Stack>
          <p className={stylesModule.commentText}>{comment.text}</p>
          <Tooltip
            title={format(new Date(comment.created), 'yyyy. MMMM d. H:mm:ss', {
              locale: hu,
            })}
            placement="bottom-start"
          >
            <p className={stylesModule.commentCreated}>
              {formatDistanceToNow(new Date(comment.created), {
                locale: hu,
                addSuffix: true,
              })}
            </p>
          </Tooltip>
          {isSelf(comment.author.id) && (
            <Stack
              direction="row"
              justifyContent="flex-end"
              alignItems="center"
              className={stylesModule.buttonStack}
            >
              <Tooltip title="Törlés" arrow>
                <span>
                  <IconButton
                    onClick={() => handleDelete(comment.id)}
                    disabled={loading}
                  >
                    <DeleteIcon />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title="Szerkesztés" arrow>
                <span>
                  <IconButton
                    onClick={() => setEditingCommentId(comment.id)}
                    disabled={loading}
                  >
                    <EditIcon />
                  </IconButton>
                </span>
              </Tooltip>
            </Stack>
          )}
        </Stack>
      )}
      {!isNew && (
        <Divider
          variant="fullWidth"
          className={stylesModule.commentDividerMobile}
        />
      )}
    </>
  );
}

CommentMobile.propTypes = {
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
