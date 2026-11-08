import { useQuery } from "@tanstack/react-query";
import { configRepository } from "@/infrastructure/config/configRepositoryInstance";

export function useConfig() {
  return useQuery({
    queryKey: ["config"],
    queryFn: () => configRepository.getConfig(),
    staleTime: Infinity,
  });
}

/**
 * Hook to get the logout URL (pattern pickpro).
 *
 * Flow: OAuth2 Proxy `/oauth2/sign_out` clears the composables cookie, then
 * redirects to the Logto end-session endpoint (`id_token_hint={id_token}` is
 * substituted by OAuth2 Proxy) so the SSO session dies too, finally landing
 * back on `/oauth2/start` for a clean re-login.
 */
export function useLogout() {
  const { data: config } = useConfig();

  const logout = () => {
    if (!config?.oauth2ProxyUrl || !config.logtoUrl || !config.logtoAppId) return;

    const logtoEndSession =
      `${config.logtoUrl}/oidc/session/end?` +
      `client_id=${config.logtoAppId}&` +
      `id_token_hint={id_token}&` +
      `post_logout_redirect_uri=${encodeURIComponent(config.oauth2ProxyUrl + "/oauth2/start")}`;

    globalThis.location.href =
      `${config.oauth2ProxyUrl}/oauth2/sign_out?rd=` +
      encodeURIComponent(logtoEndSession);
  };

  return { logout, canLogout: !!config?.oauth2ProxyUrl };
}
