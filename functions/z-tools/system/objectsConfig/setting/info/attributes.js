import { dataServices as objectDataServices } from "../../../../marslab-library-cloud-function/services/database";

export default function attributes({
  id = null,
  title = null,
  subtitle = null,
  description = null,
  images = [null],
  headerImages = [null],
  share = {
    title: null,
    message: null,
    fbPost: null,
  },

  created = { at: null, by: null },
  deleted = { at: null, by: null },
  updated = { at: null, by: null },
}) {
  const packaging = {
    title,
    subtitle,
    description,
    images,
    headerImages,
    share,
    created,
    deleted,
    updated,
    id,
  };

  const shared = {
    ...packaging,
  };

  const confidential = {
    ...shared,
  };

  const receivableState = {
    title,
    subtitle,
    description,
    images,
    headerImages,
    share
  };

  const manualUpdatableState = {
    confidential: {
      title,
      subtitle,
      description,
      images,
      headerImages,
      share
    },
  };

  return {
    packaging,
    shared,
    confidential,
    receivableState,
    manualUpdatableState,
  };
}
