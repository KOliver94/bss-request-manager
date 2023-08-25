import { Button } from 'primereact/button';
import { Divider } from 'primereact/divider';
import { InputMask } from 'primereact/inputmask';
import { InputText } from 'primereact/inputtext';
import { ToggleButton } from 'primereact/togglebutton';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';

import AutoCompleteStaff, {
  StaffUser,
} from 'components/AutoCompleteStaff/AutoCompleteStaff';
import FormField from 'components/FormField/FormField';

export interface IVideoCreator {
  additional_data: {
    archiving: {
      hq_archive: boolean;
    };
    coding: {
      website: boolean;
    };
    editing_done: boolean;
    length: number;
    publishing: {
      website: string;
    };
  };
  editor: StaffUser | null;
  id: number;
  title: string;
}

const VideoCreator = () => {
  const defaultValues = {
    additional_data: {
      archiving: {
        hq_archive: false,
      },
      coding: {
        website: false,
      },
      editing_done: false,
      length: 0,
      publishing: {
        website: '',
      },
    },
    editor: null,
    id: 0,
    title: '',
  };

  const { control, handleSubmit } = useForm<IVideoCreator>({
    defaultValues,
    mode: 'onChange',
  });

  const onSubmit: SubmitHandler<IVideoCreator> = (data) => {
    console.log(data);
  };

  return (
    <div className="p-3 sm:p-5 surface-ground">
      <div className="font-medium mb-3 text-900 text-xl">Videó létrehozása</div>
      <form className="border-round p-3 p-fluid shadow-2 sm:p-4 surface-card">
        <div className="formgrid grid p-fluid">
          <FormField
            className="col-12 mb-0"
            control={control}
            label="Videó címe"
            name="title"
          >
            <InputText
              autoFocus
              placeholder="Ahogy a weboldalra felkerül"
              type="text"
            />
          </FormField>
          <Divider align="center" type="dashed">
            <b>Opcionális mezők</b>
          </Divider>
          <FormField
            className="col-12 mb-4 md:col-6"
            control={control}
            label="Vágó"
            name="editor"
          >
            <AutoCompleteStaff />
          </FormField>
          <FormField
            className="col-12 mb-4 md:col-6"
            control={control}
            icon="pi-clock"
            label="Videó hossza"
            name="additional_data.length"
          >
            <InputMask mask="99:99:99" placeholder="hh:mm:ss" type="text" />
          </FormField>
          <FormField
            className="col-12 mb-0"
            control={control}
            icon="pi-globe"
            label="Videó elérési útja"
            name="additional_data.publishing.website"
          >
            <InputText
              placeholder="A videó linkje (honlap, YouTube, Google Drive, stb.)"
              type="text"
            />
          </FormField>
          <Divider />
          <Controller
            control={control}
            name="additional_data.editing_done"
            render={({ field }) => (
              <div className="col-12 mb-3 md:col-4 md:mb-0">
                <ToggleButton
                  checked={field.value || false}
                  className="w-full"
                  id={field.name}
                  offIcon="bi bi-scissors"
                  offLabel="Vágandó"
                  onChange={field.onChange}
                  onIcon="bi bi-scissors"
                  onLabel="Megvágva"
                />
              </div>
            )}
          />
          <Controller
            control={control}
            name="additional_data.coding.website"
            render={({ field }) => (
              <div className="col-12 mb-3 md:col-4 md:mb-0">
                <ToggleButton
                  checked={field.value || false}
                  className="w-full"
                  id={field.name}
                  offIcon="bi bi-file-earmark-play"
                  offLabel="Kódolásra vár"
                  onChange={field.onChange}
                  onIcon="bi bi-file-earmark-play"
                  onLabel="Kikódolva"
                />
              </div>
            )}
          />
          <Controller
            control={control}
            name="additional_data.archiving.hq_archive"
            render={({ field }) => (
              <div className="col-12 md:col-4">
                <ToggleButton
                  checked={field.value || false}
                  className="w-full"
                  id={field.name}
                  offIcon="bi bi-archive"
                  offLabel="Archiválandó"
                  onChange={field.onChange}
                  onIcon="bi bi-archive"
                  onLabel="Archiválva"
                />
              </div>
            )}
          />
          <Divider />
          <Button
            className="w-auto"
            icon="pi pi-save"
            label="Mentés"
            onClick={handleSubmit(onSubmit)}
          />
        </div>
      </form>
    </div>
  );
};

export { VideoCreator as Component };
