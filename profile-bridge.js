import { supabase } from '/supabase-config.js';

let currentUser = null;
let scheduled = false;
const REMOVED_MENU_ITEMS = new Set(['Exams', 'Leaderboard', 'Plans', 'My team', 'Log out', 'Logout', 'Sign out']);

const displayName = (user) => {
  const metadata = user?.user_metadata || {};
  return metadata.full_name?.trim() || metadata.name?.trim() || user?.email?.split('@')[0] || 'Learner';
};

function updateUserLabels(user) {
  const name = displayName(user);
  document.querySelectorAll('button, span, p').forEach((element) => {
    if (/^(?:CONFIG|MyPnetLab) PRO Learner$/.test(element.textContent.trim())) element.textContent = name;
  });

  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
  document.querySelectorAll('span').forEach((element) => {
    if (element.textContent.trim() === 'C' && element.className.includes('rounded-lg')) {
      element.textContent = initials || 'L';
    }
  });
}

function wireMenuActions() {
  document.querySelectorAll('button').forEach((button) => {
    const label = button.textContent.trim();
    if (REMOVED_MENU_ITEMS.has(label)) {
      button.remove();
      return;
    }
    if (label === 'Profile' && !button.dataset.supabaseProfileBound) {
      button.dataset.supabaseProfileBound = 'true';
      button.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        window.location.assign('/account');
      }, true);
    }

    if (/^(sign out|logout)$/i.test(label) && !button.dataset.supabaseLogoutBound) {
      button.dataset.supabaseLogoutBound = 'true';
      button.addEventListener('click', async (event) => {
        event.preventDefault();
        event.stopPropagation();
        button.disabled = true;
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.error('Sign out failed:', error);
          button.disabled = false;
          return;
        }
        window.location.assign('/login');
      }, true);
    }
  });
}

function refreshMenu() {
  if (scheduled) return;
  scheduled = true;
  queueMicrotask(() => {
    scheduled = false;
    if (currentUser) updateUserLabels(currentUser);
    wireMenuActions();
  });
}

async function syncProfile() {
  const { data, error } = await supabase.auth.getUser();
  if (!error && data.user) {
    currentUser = data.user;
    updateUserLabels(currentUser);
  }
  wireMenuActions();
}

syncProfile();
const observer = new MutationObserver(refreshMenu);
observer.observe(document.documentElement, { childList: true, subtree: true });
supabase.auth.onAuthStateChange((_event, session) => {
  currentUser = session?.user || null;
  refreshMenu();
});
