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
import { Floor } from '@/types';

interface FloorFormValues {
  name: string;
  number: number;
}

interface FloorDialogProps {
  open: boolean;
  buildingId: string;
  floor?: Floor | null;
  onClose: () => void;
}

const FloorDialog = ({ open, buildingId, floor, onClose }: FloorDialogProps) => {
  const queryClient = useQueryClient();
  const isEdit = !!floor;

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FloorFormValues>();

  useEffect(() => {
    if (open) {
      reset({
        name: floor?.name ?? '',
        number: floor?.number ?? 1,
      });
    }
  }, [open, floor, reset]);

  const mutation = useMutation({
    mutationFn: (data: FloorFormValues) =>
      isEdit
        ? apiService.updateFloor(floor!.id, { ...data, number: Number(data.number) })
        : apiService.createFloor({ ...data, number: Number(data.number), buildingId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buildings'] });
      queryClient.invalidateQueries({ queryKey: ['floors'] });
      onClose();
    },
  });

  const onSubmit = (data: FloorFormValues) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{isEdit ? 'Editar Andar' : 'Novo Andar'}</DialogTitle>
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
              label="Número do Andar"
              type="number"
              fullWidth
              error={!!errors.number}
              helperText={errors.number?.message}
              {...register('number', {
                required: 'Número é obrigatório',
                min: { value: 0, message: 'Mínimo 0' },
              })}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} disabled={mutation.isPending}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" disabled={mutation.isPending}>
            {mutation.isPending ? 'Salvando...' : isEdit ? 'Salvar' : 'Criar'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default FloorDialog;
