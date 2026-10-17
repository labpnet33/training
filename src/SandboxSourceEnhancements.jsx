import { useEffect } from 'react';

const sandboxPaths = new Set(['/sandbox', '/sandbox/']);

export default function SandboxSourceEnhancements() {
  useEffect(() => {
    const appRoot = document.getElementById('root') || document.body;
    const syncRouteClass = () => {
      const isSandboxPath = sandboxPaths.has(window.location.pathname);
      const hasSandboxWorkbench = Boolean(appRoot.querySelector('.sb-workbench'));
      const shouldActivate = isSandboxPath && hasSandboxWorkbench;
      document.documentElement.classList.toggle('source-sandbox-active', shouldActivate);
    };

    const observer = new MutationObserver(syncRouteClass);
    observer.observe(appRoot, { childList: true, subtree: true });
    window.addEventListener('popstate', syncRouteClass);
    syncRouteClass();

    return () => {
      observer.disconnect();
      window.removeEventListener('popstate', syncRouteClass);
      document.documentElement.classList.remove('source-sandbox-active');
    };
  }, []);

  return null;
}
