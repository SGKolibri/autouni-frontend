import { useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  MenuItem,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiService from '@services/api';
import { Room, RoomType } from '@/types';

interface RoomFormValues {
  name: string;
  type: RoomType;
  capacity: string;
}

const ROOM_TYPE_LABELS: Record<RoomType, string> = {
  [RoomType.CLASSROOM]: 'Sala de Aula',
  [RoomType.LAB]: 'Laboratório',
  [RoomType.OFFICE]: 'Escritório',
  [RoomType.AUDITORIUM]: 'Auditório',
  [RoomType.LIBRARY]: 'Biblioteca',
  [RoomType.OTHER]: 'Outro',
};

interface RoomDialogProps {
  open: boolean;
  floorId: string;
  room?: Room | null;
  onClose: () => void;
}

const RoomDialog = ({ open, floorId, room, onClose }: RoomDialogProps) => {
  const queryClient = useQueryClient();
  const isEdit = !!room;

  const { register, handleSubmit, reset, formState: { errors } } = useForm<RoomFormValues>();

  useEffect(() => {
    if (open) {
      reset({
        name: room?.name ?? '',
        type: room?.type ?? RoomType.CLASSROOM,
        capacity: room?.capacity?.toString() ?? '',
      });
    }
  }, [open, room, reset]);

  const mutation = useMutation({
    mutationFn: (data: RoomFormValues) => {
      const payload = {
        name: data.name,
        type: data.type,
        ...(data.capacity ? { capacity: Number(data.capacity) } : {}),
        ...(!isEdit ? { floorId } : {}),
      };
      return isEdit
        ? apiService.updateRoom(room!.id, payload)
        : apiService.createRoom(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['floors'] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      onClose();
    },
  });

  const onSubmit = (data: RoomFormValues) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{isEdit ? 'Editar Sala' : 'Nova Sala'}</DialogTitle>
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
              select
              label="Tipo"
              fullWidth
              defaultValue={room?.type ?? RoomType.CLASSROOM}
              error={!!errors.type}
              helperText={errors.type?.message}
              {...register('type', { required: 'Tipo é obrigatório' })}
            >
              {Object.values(RoomType).map((t) => (
                <MenuItem key={t} value={t}>
                  {ROOM_TYPE_LABELS[t]}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Capacidade (pessoas)"
              type="number"
              fullWidth
              {...register('capacity', {
                min: { value: 1, message: 'Mínimo 1' },
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

export default RoomDialog;
