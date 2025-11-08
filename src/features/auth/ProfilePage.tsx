import { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Avatar,
  Divider,
  Card,
  CardContent,
  Alert,
} from "@mui/material";
import { Save, PhotoCamera, Lock } from "@mui/icons-material";
import { useAuthStore } from "@store/authStore";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import apiService from "@services/api";

const profileSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  email: z.string().email("E-mail inválido"),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
    newPassword: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
    confirmPassword: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

const ProfilePage = () => {
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      const response = await apiService.patch("/users/profile", data);
      return response.data;
    },
    onSuccess: (data) => {
      updateUser(data);
      setSuccessMessage("Perfil atualizado com sucesso!");
      setTimeout(() => setSuccessMessage(null), 3000);
    },
  });

  const updatePasswordMutation = useMutation({
    mutationFn: async (data: PasswordFormData) => {
      const response = await apiService.post("/auth/change-password", {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      return response.data;
    },
    onSuccess: () => {
      setSuccessMessage("Senha alterada com sucesso!");
      resetPassword();
      setTimeout(() => setSuccessMessage(null), 3000);
    },
  });

  const onSubmitProfile = (data: ProfileFormData) => {
    updateProfileMutation.mutate(data);
  };

  const onSubmitPassword = (data: PasswordFormData) => {
    updatePasswordMutation.mutate(data);
  };

  if (!user) return null;

  return (
    <Box>
      <Typography variant="h4" fontWeight={600} gutterBottom>
        Meu Perfil
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Gerencie suas informações pessoais e segurança
      </Typography>

      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {successMessage}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Profile Card */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: "center" }}>
              <Avatar
                src={user.avatar}
                sx={{
                  width: 120,
                  height: 120,
                  mx: "auto",
                  mb: 2,
                  bgcolor: "primary.main",
                  fontSize: 48,
                }}
              >
                {user.name.charAt(0).toUpperCase()}
              </Avatar>

              <Typography variant="h6" fontWeight={600} gutterBottom>
                {user.name}
              </Typography>

              <Typography variant="body2" color="text.secondary" gutterBottom>
                {user.email}
              </Typography>

              <Typography
                variant="caption"
                sx={{
                  px: 2,
                  py: 0.5,
                  backgroundColor: "primary.main",
                  color: "white",
                  borderRadius: 1,
                  display: "inline-block",
                  mt: 1,
                }}
              >
                {user.role}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Button variant="outlined" startIcon={<PhotoCamera />} fullWidth>
                Alterar Foto
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Forms */}
        <Grid item xs={12} md={8}>
          {/* Profile Information */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Informações Pessoais
            </Typography>

            <form onSubmit={handleSubmitProfile(onSubmitProfile)}>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <TextField
                    {...registerProfile("name")}
                    label="Nome Completo"
                    fullWidth
                    error={!!profileErrors.name}
                    helperText={profileErrors.name?.message}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    {...registerProfile("email")}
                    label="E-mail"
                    type="email"
                    fullWidth
                    error={!!profileErrors.email}
                    helperText={profileErrors.email?.message}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<Save />}
                    disabled={updateProfileMutation.isPending}
                  >
                    Salvar Alterações
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Paper>

          {/* Change Password */}
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
              <Lock color="action" />
              <Typography variant="h6" fontWeight={600}>
                Alterar Senha
              </Typography>
            </Box>

            <form onSubmit={handleSubmitPassword(onSubmitPassword)}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    {...registerPassword("currentPassword")}
                    label="Senha Atual"
                    type="password"
                    fullWidth
                    error={!!passwordErrors.currentPassword}
                    helperText={passwordErrors.currentPassword?.message}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    {...registerPassword("newPassword")}
                    label="Nova Senha"
                    type="password"
                    fullWidth
                    error={!!passwordErrors.newPassword}
                    helperText={passwordErrors.newPassword?.message}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    {...registerPassword("confirmPassword")}
                    label="Confirmar Nova Senha"
                    type="password"
                    fullWidth
                    error={!!passwordErrors.confirmPassword}
                    helperText={passwordErrors.confirmPassword?.message}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<Lock />}
                    disabled={updatePasswordMutation.isPending}
                  >
                    Alterar Senha
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProfilePage;
