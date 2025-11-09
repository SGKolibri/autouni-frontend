import { useEffect, useRef } from "react";
import { RouterProvider } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuthStore } from "@store/authStore";
import router from "./router";
import apiService from "./services/api";
import { User } from "./types";
import theme from "./theme/theme";

// Configuração do React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

function App() {
  const setUser = useAuthStore((state) => state.setUser);
  const setTokens = useAuthStore((state) => state.setTokens);
  const setLoading = useAuthStore((state) => state.setLoading);
  const hasRestoredSession = useRef(false);

  // Verifica se há token armazenado e restaura a sessão (apenas uma vez)
  useEffect(() => {
    const restoreSession = async () => {
      // Evita executar múltiplas vezes
      if (hasRestoredSession.current) {
        return;
      }
      hasRestoredSession.current = true;

      const accessToken = localStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken");
      const storedUser = localStorage.getItem("user");

      if (accessToken && refreshToken) {
        // Primeiro, tenta restaurar do localStorage (mais rápido)
        if (storedUser) {
          try {
            const user = JSON.parse(storedUser);
            setUser(user);
            setTokens({ accessToken, refreshToken });
            setLoading(false);
            return;
          } catch (e) {
            throw new Error("Erro ao parsear usuário do localStorage");
          }
        }

        // Se não tem no localStorage, busca da API
        try {
          const response = await apiService.get<User>("/auth/me");
          setUser(response.data);
          setTokens({ accessToken, refreshToken });
          localStorage.setItem('user', JSON.stringify(response.data));
        } catch (error) {
          // Token inválido, limpa storage
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("user");
          setUser(null);
          setTokens(null);
        }
      } else {
        setUser(null);
      }
      
      // Importante: sempre define loading como false após verificar
      setLoading(false);
    };

    restoreSession();
  }, [setUser, setTokens, setLoading]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <RouterProvider router={router} />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
