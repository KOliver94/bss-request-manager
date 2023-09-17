import { MouseEventHandler, useEffect, useState } from 'react';

import { Avatar } from 'primereact/avatar';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { Tooltip } from 'primereact/tooltip';
import { classNames } from 'primereact/utils';
import TimeAgo from 'timeago-react';

import RatingDialog from 'components/RatingDialog/RatingDialog';
import { dateTimeToLocaleString } from 'helpers/DateToLocaleStringCoverters';
import { UI_AVATAR_URL } from 'localConstants';

interface RatingData {
  author: {
    id: number;
    full_name: string;
    avatar_url?: string;
  };
  created: Date;
  id: number;
  rating: number;
  review: string;
}

type RatingProps = {
  authorName: string;
  avatarUrl?: string;
  creationDate: Date;
  onEdit: MouseEventHandler<HTMLButtonElement>;
  rating: number;
  review: string;
};

type RatingSummaryProps = {
  portion: number;
  rating: number;
};

type RatingsProps = {
  videoId: number;
  videoTitle: string;
};

const Rating = ({
  authorName,
  avatarUrl,
  creationDate,
  onEdit,
  rating,
  review,
}: RatingProps) => {
  const showEditButton = () => {
    return true;
  };

  return (
    <div className="col-12 lg:col-6">
      <div className="p-2">
        <div className="border-1 border-round p-3 surface-border">
          <div className="align-items-center flex mb-3">
            <Tooltip className="text-xs" target=".created-date-text" />
            <Avatar
              className="flex-shrink-0 h-2rem mr-2 w-2rem"
              icon="pi pi-user"
              image={avatarUrl || UI_AVATAR_URL + authorName}
              shape="circle"
            />
            <span className="font-medium mr-3 text-900">{authorName}</span>
            <span
              className="created-date-text font-medium text-500 text-sm"
              data-pr-position="bottom"
              data-pr-tooltip={dateTimeToLocaleString(creationDate)}
            >
              <TimeAgo datetime={creationDate} locale="hu_HU" />
            </span>
            <span className="ml-auto">
              {[...Array(5).keys()].map((item) => (
                <i
                  className={classNames('pi pi-star-fill', {
                    'mr-1': item < 4,
                    'text-300': rating <= item,
                    'text-yellow-500': rating > item,
                  })}
                  key={item}
                ></i>
              ))}
            </span>
          </div>
          <p className="comment-text line-height-3 m-0 p-0 text-600">
            {review}
          </p>
          {showEditButton() && (
            <div className="flex flex-wrap justify-content-end">
              <Button
                className="p-1"
                icon="pi pi-pencil"
                label="Szerkesztés"
                onClick={onEdit}
                size="small"
                text
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const RatingSummary = ({ portion, rating }: RatingSummaryProps) => {
  return (
    <li className="align-items-center flex mb-2">
      <span className="font-medium mr-2 text-900 w-1rem">{rating}</span>
      <div
        style={{ height: '7px' }}
        className="border-round flex-auto overflow-hidden surface-300"
      >
        {portion > 0 && (
          <div className={`bg-yellow-500 border-round h-full w-${portion}`} />
        )}
      </div>
    </li>
  );
};

const Ratings = ({ videoId, videoTitle }: RatingsProps) => {
  const [data, setData] = useState<RatingData[]>([]);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [ordering, setOrdering] = useState<
    'highest' | 'lowest' | 'oldest' | 'newest'
  >('newest');
  const [ratingDialogAuthorName, setRatingDialogAuthorName] =
    useState<string>('');
  const [ratingDialogId, setRatingDialogId] = useState<number>(0);
  const [ratingDialogVisible, setRatingDialogVisible] =
    useState<boolean>(false);

  const orderingOptions = [
    { name: 'Legújabb', value: 'newest' },
    { name: 'Legrégebbi', value: 'oldest' },
    { name: 'Legjobb', value: 'highest' },
    { name: 'Legrosszabb', value: 'lowest' },
  ];

  const onRatingDialogHide = () => {
    setRatingDialogVisible(false);
    setRatingDialogAuthorName('');
    setRatingDialogId(0);
  };

  const onRatingEdit = (authorName: string, ratingId: number) => {
    setRatingDialogVisible(true);
    setRatingDialogAuthorName(authorName);
    setRatingDialogId(ratingId);
  };

  useEffect(() => {
    setAverageRating(
      data
        ? data.reduce((total, next) => total + next.rating, 0) / data.length
        : 0,
    );
  }, [data]);

  const numberOfRating = (rating: number) => {
    return data
      ? data.reduce(
          (total, next) => (next.rating == rating ? ++total : total),
          0,
        )
      : 0;
  };

  function compare(a: RatingData, b: RatingData) {
    if (ordering === 'highest') {
      if (a.rating - b.rating !== 0) {
        return b.rating - a.rating;
      }
    } else if (ordering === 'lowest') {
      if (a.rating - b.rating !== 0) {
        return a.rating - b.rating;
      }
    } else if (ordering === 'oldest') {
      return a.created.getTime() - b.created.getTime();
    }
    return b.created.getTime() - a.created.getTime();
  }

  return (
    <>
      <RatingDialog
        onHide={onRatingDialogHide}
        ratingAuthorName={ratingDialogAuthorName}
        ratingId={ratingDialogId}
        videoId={videoId}
        videoTitle={videoTitle}
        visible={ratingDialogVisible}
      />
      <div className="flex flex-column md:flex-row">
        <div className="md:w-6 w-full">
          <ul className="list-none m-0 p-0">
            {[...Array(5).keys()].reverse().map((item) => (
              <RatingSummary
                key={item}
                portion={
                  data
                    ? Math.round((numberOfRating(item + 1) / data?.length) * 12)
                    : 0
                }
                rating={item + 1}
              />
            ))}
          </ul>
        </div>
        <div className="align-items-center flex flex-column justify-content-center md:mt-0 md:w-6 mt-4 w-full">
          <span className="font-medium mb-3 text-900 text-5xl">
            {averageRating.toFixed(2)}
          </span>
          <span className="mb-2">
            {[...Array(5).keys()].map((item) => (
              <i
                className={classNames('pi pi-star-fill text-2xl', {
                  'mr-1': item < 4,
                  'text-300': Math.round(averageRating) <= item,
                  'text-yellow-500': Math.round(averageRating) > item,
                })}
                key={item}
              ></i>
            ))}
          </span>
          <a
            tabIndex={0}
            className="cursor-pointer font-medium hover:text-blue-600 text-blue-500 transition-colors transition-duration-300"
          >
            {`${data?.length || 0} Értékelés`}
          </a>
        </div>
      </div>
      <div className="border-top-1 mt-5 py-5 surface-border">
        <div className="align-items-center flex justify-content-between mb-5">
          <Button
            label="Értékelés írása"
            onClick={() => setRatingDialogVisible(true)}
          />
          <Dropdown
            onChange={(e) => setOrdering(e.value)}
            options={orderingOptions}
            optionLabel="name"
            value={ordering}
          />
        </div>
        <div className="grid -ml-3 -mr-3 -mt-3">
          {data
            ?.sort(compare)
            .map((rating) => (
              <Rating
                authorName={rating.author.full_name}
                avatarUrl={rating.author.avatar_url}
                creationDate={rating.created}
                key={rating.id}
                onEdit={() => onRatingEdit(rating.author.full_name, rating.id)}
                rating={rating.rating}
                review={rating.review}
              />
            ))}
        </div>
      </div>
    </>
  );
};

export default Ratings;
