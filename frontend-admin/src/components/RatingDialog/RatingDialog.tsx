import { forwardRef, useEffect, useState } from 'react';

import { yupResolver } from '@hookform/resolvers/yup';
import { Button } from 'primereact/button';
import { ConfirmPopup, confirmPopup } from 'primereact/confirmpopup';
import { Dialog, DialogProps } from 'primereact/dialog';
import { InputTextarea } from 'primereact/inputtextarea';
import { Message } from 'primereact/message';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Rating } from 'primereact/rating';
import { Tag } from 'primereact/tag';
import { Controller, useForm } from 'react-hook-form';
import * as yup from 'yup';

import useMobile from 'hooks/useMobile';

interface RatingDialogProps extends DialogProps {
  ratingAuthorName?: string;
  ratingId?: number;
  videoId: number;
  videoTitle: string;
}

interface IRating {
  rating: number;
  review: string;
}

const validationSchema = yup
  .object({
    rating: yup.number().min(1).max(5).integer().required(),
  })
  .required();

const RatingDialog = forwardRef<React.Ref<HTMLDivElement>, RatingDialogProps>(
  (
    {
      onHide,
      ratingAuthorName,
      ratingId: ratingIdParam,
      videoId,
      videoTitle,
      visible,
      ...props
    },
    ref
  ) => {
    const isMobile = useMobile();
    const [loading, setLoading] = useState<boolean>(false);
    const [ratingId, setRatingId] = useState<number>(0);

    const {
      control,
      formState: { isDirty },
      handleSubmit,
      reset,
    } = useForm<IRating>({
      resolver: yupResolver(validationSchema),
      shouldFocusError: false,
    });

    useEffect(() => {
      if (visible) {
        setLoading(true);
        setRatingId(ratingIdParam || 0);
        const defaultValues: IRating = {
          rating: 0,
          review: '',
        };
        reset({ ...defaultValues });

        // TODO: Replace with real API call (check for existing rating or load)
        console.log('API load start');
        const timer = setTimeout(() => {
          setLoading(false);
          if (Math.floor(Math.random() * 3) || ratingId) {
            if (!ratingId) {
              setRatingId(456);
            }
            defaultValues.rating = 3;
            defaultValues.review = 'Tetszett';
          }
          console.log('API load finished');
          reset({ ...defaultValues });
        }, 500);

        return () => {
          // TODO: Cancel API call on close
          clearTimeout(timer);
        };
      }
    }, [ratingIdParam, videoId, visible]);

    const onSubmit = (data: IRating) => {
      setLoading(true);
      console.log(data.rating + ' - ' + data.review);
      if (ratingId) {
        console.log('Updating rating... ' + ratingId);
      } else {
        console.log('Creating rating...');
      }
      setTimeout(() => {
        setLoading(false);
        if (!ratingId) {
          setRatingId(123);
        }
        reset({ ...data });
      }, 500);
    };

    const handleDelete = () => {
      setLoading(true);
      console.log('Deleting rating...');

      // TODO: Use real API call then close dialog
      setTimeout(() => {
        onHide();
      }, 1000);
    };

    const onDelete = (
      event: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ) => {
      confirmPopup({
        accept: handleDelete,
        acceptClassName: 'p-button-danger',
        icon: 'pi pi-exclamation-triangle',
        message: 'Biztosan törölni akarod az értékelést?',
        target: event.currentTarget,
      });
    };

    const renderFooter = () => {
      return (
        <div>
          <ConfirmPopup />
          {ratingId > 0 && (
            <Button
              className="p-button-text p-button-danger"
              disabled={loading}
              icon="pi pi-trash"
              label="Törlés"
              onClick={onDelete}
            />
          )}
          <Button
            className="p-button-text"
            disabled={loading}
            icon="pi pi-times"
            label="Mégsem"
            onClick={onHide}
          />
          <Button
            autoFocus
            icon="pi pi-check"
            label="Mentés"
            loading={loading}
            onClick={handleSubmit(onSubmit)}
          />
        </div>
      );
    };

    const renderHeader = () => {
      return (
        <div className="align-items-center flex justify-content-start">
          <span style={{ whiteSpace: ratingAuthorName ? 'pre' : 'normal' }}>
            Értékelés{' '}
          </span>
          {ratingAuthorName && (
            <span style={{ color: 'var(--primary-color)' }}>
              - {ratingAuthorName}
            </span>
          )}
          {loading && (
            <ProgressSpinner
              style={{
                height: '1.25rem',
                marginLeft: '1rem',
                width: '1.25rem',
              }}
            />
          )}
        </div>
      );
    };

    return (
      <Dialog
        closeOnEscape={!isDirty}
        footer={renderFooter}
        header={renderHeader}
        onHide={onHide}
        style={{ width: isMobile ? '95vw' : '50vw' }}
        visible={visible}
        {...props}
        {...ref}
      >
        <form className="formgrid grid p-fluid">
          <div className="field col-12">
            <label
              className="align-items-center flex font-medium text-900 text-sm"
              htmlFor="rating"
            >
              Hogy tetszett a(z) <Tag className="mx-1">{videoTitle}</Tag> videó?
            </label>
            <Controller
              control={control}
              name="rating"
              render={({ field, fieldState }) => (
                <div className="align-items-center flex justify-content-start">
                  <Rating
                    cancel={false}
                    disabled={loading}
                    id={field.name}
                    {...field}
                  />
                  {fieldState.error && (
                    <small
                      className="block p-error pl-2"
                      id={field.name + '-help'}
                    >
                      Üres értékelés nem adható!
                    </small>
                  )}
                </div>
              )}
            />
          </div>
          <div className="field col-12">
            <label className="font-medium text-900 text-sm" htmlFor="rating">
              Szöveges értékelés
            </label>
            <Controller
              control={control}
              name="review"
              render={({ field }) => (
                <InputTextarea
                  autoResize
                  disabled={loading}
                  id={field.name}
                  rows={5}
                  {...field}
                />
              )}
            />
          </div>
          {isDirty && (
            <div className="col-12">
              <Message
                className="justify-content-start"
                severity="warn"
                text={
                  ratingId
                    ? 'A módosításaid még nincsenek elmentve!'
                    : 'Az értékelésed még nincs elmentve!'
                }
              />
            </div>
          )}
        </form>
      </Dialog>
    );
  }
);
RatingDialog.displayName = 'RatingDialog';

export default RatingDialog;
