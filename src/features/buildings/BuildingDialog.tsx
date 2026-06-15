import { useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiService from '@services/api';
import { Building } from '@/types';

interface BuildingFormValues {
  name: string;
  description: string;
  location: string;
}

interface BuildingDialogProps {
  open: boolean;
  building?: Building | null;
  onClose: () => void;
}

const BuildingDialog = ({ open, building, onClose }: BuildingDialogProps) => {
  const queryClient = useQueryClient();
  const isEdit = !!building;

  const { register, handleSubmit, reset, formState: { errors } } = useForm<BuildingFormValues>();

  useEffect(() => {
    if (open) {
      reset({
        name: building?.name ?? '',
        description: building?.description ?? '',
        location: building?.location ?? '',
      });
    }
  }, [open, building, reset]);

  const mutation = useMutation({
    mutationFn: (data: BuildingFormValues) =>
      isEdit
        ? apiService.updateBuilding(building!.id, data)
        : apiService.createBuilding(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buildings'] });
      onClose();
    },
  });

  const onSubmit = (data: BuildingFormValues) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? 'Editar Prédio' : 'Novo Prédio'}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 0.5 }}>
            <TextField
              label="Nome"
              fullWidth
              error={!!errors.name}
              helperText={errors.name?.message}
              {...register('name', { required: 'Nome é obrigatório' })}
            />
            <TextField
              label="Localização"
              fullWidth
              error={!!errors.location}
              helperText={errors.location?.message}
              {...register('location', { required: 'Localização é obrigatória' })}
            />
            <TextField
              label="Descrição"
              fullWidth
              multiline
              rows={3}
              {...register('description')}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} disabled={mutation.isPending}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? 'Salvando...' : isEdit ? 'Salvar' : 'Criar'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default BuildingDialog;
