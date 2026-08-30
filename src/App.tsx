import React, { useState, useEffect } from 'react';
import { DEMO_APP_STATE } from './lib/seedData';
import {
  AppState,
  StartupProfile,
  StartupStage,
  ActionStatus,
  ExperimentStatus,
  ToolRecommendation,
  NextAction,
  CustomerFeedback,
  Experiment,
  RealityCheck,
  User
} from './types';

// Layout Components
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { SearchModal } from './components/SearchModal';
import { NotificationModal } from './components/NotificationModal';
import { AuthModal } from './components/AuthModal';
import { auth, signOut as firebaseSignOut } from './lib/firebase';

// Pages
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { DashboardPage } from './pages/DashboardPage';
import { HealthPage } from './pages/HealthPage';
import { ActionsPage } from './pages/ActionsPage';
import { RoadmapPage } from './pages/RoadmapPage';
import { MissionsPage } from './pages/MissionsPage';
import { ExperimentsPage } from './pages/ExperimentsPage';
import { StackPage } from './pages/StackPage';
import { RealityCheckPage } from './pages/RealityCheckPage';
import { CustomersPage } from './pages/CustomersPage';
import { MetricsPage } from './pages/MetricsPage';
import { InsightsPage } from './pages/InsightsPage';
import { SettingsPage } from './pages/SettingsPage';
import { ResourcesPage } from './pages/ResourcesPage';
import { VaultPage } from './pages/VaultPage';
import { FounderProfilePage } from './pages/FounderProfilePage';
import { NotepadPage } from './pages/NotepadPage';
import { CopilotPage } from './pages/CopilotPage';
import { SaveResourceModal } from './components/SaveResourceModal';
import { UserSavedResource } from './types';

export function App() {
  const [currentRoute, setCurrentRoute] = useState<string>('landing');
  const [appState, setAppState] = useState<AppState>(DEMO_APP_STATE);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals & Drawers
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [notificationModalOpen, setNotificationModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');
  const [saveResourceModalOpen, setSaveResourceModalOpen] = useState(false);
  const [saveResourceInitialUrl, setSaveResourceInitialUrl] = useState('');
  const [saveResourceInitialData, setSaveResourceInitialData] = useState<Partial<UserSavedResource> | undefined>(undefined);
  const [copilotInitialPrompt, setCopilotInitialPrompt] = useState<string>('');

  // Helper: Get token
  const getAuthToken = () => localStorage.getItem('founderzero_token');

  // Load state and authenticate user on initial load
  useEffect(() => {
    async function loadUserSession() {
      const token = getAuthToken();
      if (token) {
        let sessionLoaded = false;
        try {
          const res = await fetch('/api/auth/me', {
            headers: {
              Authorization: `Bearer ${token}`,
              'x-user-id': token
            }
          });
          if (res.ok) {
            const data = await res.json();
            if (data.authenticated && data.user) {
              setCurrentUser(data.user);
              if (data.state && data.state.profile) {
                setAppState(data.state);
                localStorage.setItem(`founderzero_state_${token}`, JSON.stringify(data.state));
              }
              const hasOnboarded = Boolean(
                data.user.hasCompletedOnboarding ||
                data.state?.profile?.hasCompletedOnboarding ||
                data.state?.hasCompletedOnboarding
              );
              if (!hasOnboarded && !data.user.isDemo) {
                setCurrentRoute('onboarding');
              } else {
                setCurrentRoute('dashboard');
              }
              sessionLoaded = true;
            }
          }
        } catch (err) {
          console.warn('Backend session verification offline, checking local storage');
        }

        // Fallback to local storage state if server was offline/unreachable
        if (!sessionLoaded) {
          const localSaved = localStorage.getItem(`founderzero_state_${token}`);
          if (localSaved) {
            try {
              const parsed = JSON.parse(localSaved);
              if (parsed && parsed.user && parsed.profile) {
                setCurrentUser(parsed.user);
                setAppState(parsed);
                const hasOnboarded = Boolean(
                  parsed.user.hasCompletedOnboarding ||
                  parsed.profile?.hasCompletedOnboarding ||
                  parsed.hasCompletedOnboarding
                );
                if (!hasOnboarded && !parsed.user.isDemo) {
                  setCurrentRoute('onboarding');
                } else {
                  setCurrentRoute('dashboard');
                }
                sessionLoaded = true;
              }
            } catch {
              // Ignore parse error
            }
          }
        }
      }
      setLoading(false);
    }
    loadUserSession();
  }, []);

  // Save state to backend API whenever updated & persist locally
  const syncState = async (newState: AppState) => {
    setAppState(newState);
    const token = getAuthToken();
    if (token) {
      localStorage.setItem(`founderzero_state_${token}`, JSON.stringify(newState));
    }
    try {
      await fetch('/api/state', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || 'demo-user-1'}`,
          'x-user-id': token || 'demo-user-1'
        },
        body: JSON.stringify(newState)
      });
    } catch (err) {
      console.warn('Failed to sync state to server');
    }
  };

  // Auth Success handler
  const handleAuthSuccess = (user: User, token: string, state: AppState) => {
    setCurrentUser(user);
    if (state && state.profile) {
      setAppState(state);
      localStorage.setItem(`founderzero_state_${token}`, JSON.stringify(state));
    }
    setAuthModalOpen(false);

    const hasOnboarded = Boolean(
      user.hasCompletedOnboarding ||
      state?.profile?.hasCompletedOnboarding ||
      state?.hasCompletedOnboarding
    );

    if (!hasOnboarded && !user.isDemo) {
      setCurrentRoute('onboarding');
    } else {
      setCurrentRoute('dashboard');
    }
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (e) {
      // Ignore
    }
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      // Ignore
    }
    localStorage.removeItem('founderzero_token');
    setCurrentUser(null);
    setCurrentRoute('landing');
  };

  // Enter Demo Mode
  const handleEnterDemo = () => {
    localStorage.removeItem('founderzero_token');
    setCurrentUser({
      id: 'demo-user-1',
      email: 'demo@founderzero.app',
      name: 'Alex Rivera',
      startupName: 'PulseBoard',
      isDemo: true
    });
    setAppState(DEMO_APP_STATE);
    setAuthModalOpen(false);
    setCurrentRoute('dashboard');
  };

  // Update profile handler
  const handleUpdateProfile = (profilePartial: Partial<StartupProfile>) => {
    const updatedProfile = { ...appState.profile, ...profilePartial };
    const newState = { ...appState, profile: updatedProfile };
    syncState(newState);
  };

  // Onboarding complete handler
  const handleOnboardingComplete = async (profileData: Partial<StartupProfile>) => {
    const token = getAuthToken();
    try {
      const res = await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || 'demo-user-1'}`,
          'x-user-id': token || 'demo-user-1'
        },
        body: JSON.stringify(profileData)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.state) {
          setAppState(data.state);
        }
        if (data.user) {
          setCurrentUser(data.user);
        }
        setCurrentRoute('dashboard');
        return;
      }
    } catch (err) {
      console.warn('Onboarding completion API error, applying local tailored state', err);
    }

    // Fallback if offline
    const newProfile: StartupProfile = {
      ...appState.profile,
      ...profileData,
      hasCompletedOnboarding: true,
      founderScore: 76
    };
    const newState: AppState = {
      ...appState,
      profile: newProfile,
      hasCompletedOnboarding: true
    };
    syncState(newState);
    if (currentUser) {
      setCurrentUser({ ...currentUser, hasCompletedOnboarding: true });
    }
    setCurrentRoute('dashboard');
  };

  // Action status update handler
  const handleUpdateActionStatus = (actionId: string, status: ActionStatus) => {
    const updatedActions = appState.nextActions.map(a =>
      a.id === actionId ? { ...a, status } : a
    );
    // Recalculate score if completed
    let newScore = appState.profile.founderScore;
    if (status === 'completed') {
      newScore = Math.min(100, newScore + 5);
    }
    const newState = {
      ...appState,
      profile: { ...appState.profile, founderScore: newScore },
      nextActions: updatedActions
    };
    syncState(newState);
  };

  // Start mission handler
  const handleStartMission = (action: NextAction) => {
    setCurrentRoute('missions');
  };

  // Milestone toggle handler
  const handleToggleMilestone = (stageId: string, milestoneId: string) => {
    const updatedRoadmap = appState.roadmapStages.map(stage => {
      if (stage.id !== stageId) return stage;
      const updatedMilestones = stage.milestones.map(m =>
        m.id === milestoneId ? { ...m, completed: !m.completed } : m
      );
      return { ...stage, milestones: updatedMilestones };
    });
    syncState({ ...appState, roadmapStages: updatedRoadmap });
  };

  // Mission step toggle handler
  const handleToggleMissionStep = (missionId: string, stepId: string) => {
    const updatedMissions = appState.missions.map(m => {
      if (m.id !== missionId) return m;
      const updatedSteps = m.steps.map(s =>
        s.id === stepId ? { ...s, completed: !s.completed } : s
      );
      return { ...m, steps: updatedSteps };
    });
    syncState({ ...appState, missions: updatedMissions });
  };

  // Complete mission handler
  const handleCompleteMission = (missionId: string) => {
    const updatedMissions = appState.missions.map(m =>
      m.id === missionId ? { ...m, completed: true, steps: m.steps.map(s => ({ ...s, completed: true })) } : m
    );
    const newScore = Math.min(100, appState.profile.founderScore + 10);
    syncState({
      ...appState,
      profile: { ...appState.profile, founderScore: newScore },
      missions: updatedMissions
    });
  };

  // Create experiment handler
  const handleCreateExperiment = (exp: Partial<Experiment>) => {
    const newExp: Experiment = {
      id: `exp-${Date.now()}`,
      title: exp.title || 'Growth Experiment',
      hypothesis: exp.hypothesis || '',
      problem: exp.problem || '',
      metric: exp.metric || 'Users',
      currentValue: exp.currentValue || '0',
      targetValue: exp.targetValue || '10',
      method: exp.method || '',
      audience: exp.audience || '',
      duration: exp.duration || '7 Days',
      budget: exp.budget || '₹0',
      status: 'Running',
      createdAt: new Date().toISOString().split('T')[0]
    };
    syncState({
      ...appState,
      experiments: [newExp, ...appState.experiments]
    });
  };

  // Update experiment status handler
  const handleUpdateExperimentStatus = (expId: string, status: ExperimentStatus, learnings?: string) => {
    const updatedExps = appState.experiments.map(e =>
      e.id === expId ? { ...e, status, learnings } : e
    );
    syncState({
      ...appState,
      experiments: updatedExps
    });
  };

  // Add customer feedback handler
  const handleAddCustomerFeedback = (feedback: Partial<CustomerFeedback>) => {
    const newFb: CustomerFeedback = {
      id: `fb-${Date.now()}`,
      customerName: feedback.customerName || 'Anonymous',
      type: feedback.type || 'Feedback',
      content: feedback.content || '',
      tags: feedback.tags || [],
      keyPainPoint: feedback.keyPainPoint || 'General',
      createdAt: new Date().toISOString().split('T')[0]
    };
    syncState({
      ...appState,
      customerFeedback: [newFb, ...appState.customerFeedback]
    });
  };

  // Update metrics handler
  const handleUpdateMetrics = (metrics: { currentUsers: number; monthlyRevenue: number; monthlyBudget: number }) => {
    const updatedProfile = {
      ...appState.profile,
      currentUsers: metrics.currentUsers,
      monthlyRevenue: metrics.monthlyRevenue,
      monthlyBudget: metrics.monthlyBudget
    };
    syncState({ ...appState, profile: updatedProfile });
  };

  // Replace tool calculator handler
  const handleReplaceToolCalculator = (paidToolName: string, estimatedCost: number) => {
    const updatedSavings = appState.profile.monthlySavings + estimatedCost;
    syncState({
      ...appState,
      profile: { ...appState.profile, monthlySavings: updatedSavings }
    });
  };

  // Ask AI query handler
  const handleAskQuery = async (query: string): Promise<string> => {
    try {
      const token = getAuthToken();
      const res = await fetch('/api/ai/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || 'demo-user-1'}`,
          'x-user-id': token || 'demo-user-1'
        },
        body: JSON.stringify({ query, profile: appState.profile })
      });
      if (res.ok) {
        const data = await res.json();
        return data.answer || 'Query processed successfully.';
      }
    } catch (err) {
      console.warn('AI query API error');
    }
    return `Based on your ${appState.profile.stage} stage with ${appState.profile.currentUsers} users and ₹${appState.profile.monthlyRevenue} MRR, focus on completing your primary Next Best Action: "${appState.nextActions[0]?.title || 'Interview active users'}".`;
  };

  // Analyze decision reality check handler
  const handleAnalyzeDecision = async (decisionClaim: string): Promise<RealityCheck> => {
    try {
      const token = getAuthToken();
      const res = await fetch('/api/ai/reality-check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || 'demo-user-1'}`,
          'x-user-id': token || 'demo-user-1'
        },
        body: JSON.stringify({ decisionClaim, profile: appState.profile })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.realityCheck) {
          syncState({
            ...appState,
            realityChecks: [data.realityCheck, ...appState.realityChecks]
          });
          return data.realityCheck;
        }
      }
    } catch (err) {
      console.warn('Reality check API error');
    }

    const fallbackCheck: RealityCheck = {
      id: `rc-${Date.now()}`,
      decisionClaim,
      actualEvidence: `You have ${appState.profile.currentUsers} registered users and ₹${appState.profile.monthlyRevenue} MRR.`,
      missingEvidence: `No formal data proving this outlay produces positive ROI before product-market fit.`,
      counterargument: `At ${appState.profile.stage} stage, capital must be preserved for organic distribution and direct customer feedback.`,
      risk: `Depleting startup runway on unvalidated channels.`,
      betterAlternative: `Run 2 zero-budget community experiments before allocating capital.`,
      recommendedDecision: `Snooze this spend until 30-day retention exceeds 50%.`,
      confidence: 'High',
      evidenceStrength: 'Strong',
      estimatedCost: '₹0',
      potentialDownside: 'Runway reduction',
      createdAt: new Date().toISOString().split('T')[0]
    };

    syncState({
      ...appState,
      realityChecks: [fallbackCheck, ...appState.realityChecks]
    });
    return fallbackCheck;
  };

  // Reset demo state
  const handleResetDemo = async () => {
    setAppState(DEMO_APP_STATE);
    try {
      const res = await fetch('/api/demo/reset', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data.state) {
          setAppState(data.state);
        }
      }
    } catch (err) {
      console.warn('Failed to reset server state');
    }
  };

  // Update Stage handler
  const handleUpdateStage = (stage: StartupStage) => {
    handleUpdateProfile({ stage });
  };

  // Founder Vault Handlers
  const handleSaveVaultResource = async (
    resourceData: Partial<UserSavedResource>
  ): Promise<{ isDuplicate?: boolean; existingId?: string; saved?: UserSavedResource }> => {
    const token = getAuthToken();
    try {
      const res = await fetch('/api/vault/resources', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || 'demo-user-1'}`,
          'x-user-id': token || 'demo-user-1'
        },
        body: JSON.stringify(resourceData)
      });
      const data = await res.json();
      if (data.success) {
        const currentSaved = appState.savedResources || [];
        const existingIdx = currentSaved.findIndex(r => r.id === data.saved.id);
        let updatedList: UserSavedResource[];
        if (existingIdx >= 0) {
          updatedList = [...currentSaved];
          updatedList[existingIdx] = data.saved;
        } else {
          updatedList = [data.saved, ...currentSaved];
        }
        setAppState(prev => ({ ...prev, savedResources: updatedList }));
        return { isDuplicate: data.isDuplicate, existingId: data.existingId, saved: data.saved };
      }
    } catch (e) {
      console.error('Save resource error:', e);
    }

    // Client fallback
    const newSaved: UserSavedResource = {
      id: 'sv-' + Date.now(),
      userId: currentUser?.id || 'demo-user-1',
      startupId: appState.profile.id,
      url: resourceData.url || '',
      title: resourceData.title || 'Saved Resource',
      description: resourceData.description || '',
      resourceType: resourceData.resourceType || 'website',
      category: resourceData.category || 'Unsorted',
      tags: resourceData.tags || [],
      notes: resourceData.notes || '',
      priority: resourceData.priority || 'medium',
      status: resourceData.status || 'unread',
      collections: resourceData.collections || [],
      readingTimeMinutes: resourceData.readingTimeMinutes || 5,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const updated = [newSaved, ...(appState.savedResources || [])];
    syncState({ ...appState, savedResources: updated });
    return { isDuplicate: false, saved: newSaved };
  };

  const handleUpdateVaultResource = async (resourceId: string, updates: Partial<UserSavedResource>) => {
    const token = getAuthToken();
    try {
      await fetch(`/api/vault/resources/${resourceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || 'demo-user-1'}`,
          'x-user-id': token || 'demo-user-1'
        },
        body: JSON.stringify(updates)
      });
    } catch (e) {
      console.error('Update resource error:', e);
    }

    const currentSaved = appState.savedResources || [];
    const updatedList = currentSaved.map(r => (r.id === resourceId ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r));
    setAppState(prev => ({ ...prev, savedResources: updatedList }));
  };

  const handleDeleteVaultResource = async (resourceId: string) => {
    const token = getAuthToken();
    try {
      await fetch(`/api/vault/resources/${resourceId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token || 'demo-user-1'}`,
          'x-user-id': token || 'demo-user-1'
        }
      });
    } catch (e) {
      console.error('Delete resource error:', e);
    }

    const currentSaved = appState.savedResources || [];
    const updatedList = currentSaved.filter(r => r.id !== resourceId);
    setAppState(prev => ({ ...prev, savedResources: updatedList }));
  };

  const handleCreateVaultCollection = async (name: string, description?: string, icon?: string, color?: string) => {
    const token = getAuthToken();
    try {
      const res = await fetch('/api/vault/collections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || 'demo-user-1'}`,
          'x-user-id': token || 'demo-user-1'
        },
        body: JSON.stringify({ name, description, icon, color })
      });
      const data = await res.json();
      if (data.success && data.collections) {
        setAppState(prev => ({ ...prev, vaultCollections: data.collections }));
        return;
      }
    } catch (e) {
      console.error('Create collection error:', e);
    }

    const newCol = {
      id: 'col-' + Date.now(),
      name,
      description: description || '',
      icon: icon || 'FolderHeart',
      color: color || '#0052FF',
      createdAt: new Date().toISOString()
    };
    const updatedCols = [...(appState.vaultCollections || []), newCol];
    syncState({ ...appState, vaultCollections: updatedCols });
  };

  const handleDeleteVaultCollection = async (collectionId: string) => {
    const token = getAuthToken();
    try {
      const res = await fetch(`/api/vault/collections/${collectionId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token || 'demo-user-1'}`,
          'x-user-id': token || 'demo-user-1'
        }
      });
      const data = await res.json();
      if (data.success && data.collections) {
        setAppState(prev => ({ ...prev, vaultCollections: data.collections }));
        return;
      }
    } catch (e) {
      console.error('Delete collection error:', e);
    }

    const updatedCols = (appState.vaultCollections || []).filter(c => c.id !== collectionId);
    syncState({ ...appState, vaultCollections: updatedCols });
  };

  // Render Page Route Router
  const renderCurrentRoute = () => {
    switch (currentRoute) {
      case 'landing':
        return (
          <LandingPage
            onStartOnboarding={() => {
              setAuthModalMode('signup');
              setAuthModalOpen(true);
            }}
            onEnterDemo={handleEnterDemo}
            onLoginClick={() => {
              setAuthModalMode('signin');
              setAuthModalOpen(true);
            }}
          />
        );

      case 'auth':
        return (
          <AuthPage
            initialMode={authModalMode}
            onAuthSuccess={handleAuthSuccess}
            onEnterDemo={handleEnterDemo}
            onBackToLanding={() => setCurrentRoute('landing')}
          />
        );

      case 'onboarding':
        return (
          <OnboardingPage
            onComplete={handleOnboardingComplete}
            initialProfile={appState.profile}
          />
        );

      case 'dashboard':
        return (
          <DashboardPage
            state={appState}
            navigate={setCurrentRoute}
            onStartMission={handleStartMission}
            onAskQuery={handleAskQuery}
            onAskCopilot={(prompt) => {
              setCopilotInitialPrompt(prompt);
              setCurrentRoute('copilot');
            }}
          />
        );

      case 'copilot':
        return (
          <CopilotPage
            state={appState}
            navigate={setCurrentRoute}
            onUpdateState={(updater) => {
              const newState = updater(appState);
              syncState(newState);
            }}
            initialPrompt={copilotInitialPrompt}
          />
        );

      case 'notepad':
        return (
          <NotepadPage
            state={appState}
            updateState={(updater) => {
              const newState = updater(appState);
              syncState(newState);
            }}
            navigate={setCurrentRoute}
          />
        );

      case 'profile':
        return (
          <FounderProfilePage
            state={appState}
            currentUser={currentUser}
            onUpdateProfile={handleUpdateProfile}
            navigate={setCurrentRoute}
          />
        );

      case 'vault':
        return (
          <VaultPage
            state={appState}
            onSaveResource={handleSaveVaultResource}
            onUpdateResource={handleUpdateVaultResource}
            onDeleteResource={handleDeleteVaultResource}
            onCreateCollection={handleCreateVaultCollection}
            onDeleteCollection={handleDeleteVaultCollection}
            onNavigateToSection={setCurrentRoute}
          />
        );

      case 'health':
        return (
          <HealthPage
            state={appState}
            navigate={setCurrentRoute}
          />
        );

      case 'actions':
        return (
          <ActionsPage
            state={appState}
            onUpdateActionStatus={handleUpdateActionStatus}
            onStartMission={handleStartMission}
          />
        );

      case 'roadmap':
        return (
          <RoadmapPage
            state={appState}
            onToggleMilestone={handleToggleMilestone}
          />
        );

      case 'missions':
        return (
          <MissionsPage
            state={appState}
            onToggleMissionStep={handleToggleMissionStep}
            onCompleteMission={handleCompleteMission}
          />
        );

      case 'resources':
        return (
          <ResourcesPage
            state={appState}
            onUpdateState={syncState}
            onNavigate={setCurrentRoute}
          />
        );

      case 'experiments':
        return (
          <ExperimentsPage
            state={appState}
            onCreateExperiment={handleCreateExperiment}
            onUpdateExperimentStatus={handleUpdateExperimentStatus}
          />
        );

      case 'stack':
        return (
          <StackPage
            state={appState}
            onUpdateToolStatus={(id, status) => {}}
            onReplaceToolCalculator={handleReplaceToolCalculator}
          />
        );

      case 'reality-check':
        return (
          <RealityCheckPage
            state={appState}
            onAnalyzeDecision={handleAnalyzeDecision}
          />
        );

      case 'customers':
        return (
          <CustomersPage
            state={appState}
            onAddFeedback={handleAddCustomerFeedback}
          />
        );

      case 'metrics':
        return (
          <MetricsPage
            state={appState}
            onUpdateMetrics={handleUpdateMetrics}
          />
        );

      case 'insights':
        return (
          <InsightsPage
            state={appState}
            navigate={setCurrentRoute}
          />
        );

      case 'settings':
        return (
          <SettingsPage
            state={appState}
            currentUser={currentUser}
            onUpdateProfile={handleUpdateProfile}
            onResetDemo={handleResetDemo}
            onLogout={handleLogout}
            onOpenAuth={() => {
              setAuthModalMode('signup');
              setAuthModalOpen(true);
            }}
            onUserUpdated={(updated) => setCurrentUser(updated)}
            navigate={setCurrentRoute}
          />
        );

      default:
        return (
          <DashboardPage
            state={appState}
            navigate={setCurrentRoute}
            onStartMission={handleStartMission}
            onAskQuery={handleAskQuery}
          />
        );
    }
  };

  // If on landing page or auth page, don't show internal app shell (Sidebar & Header)
  if (currentRoute === 'landing' || currentRoute === 'auth' || currentRoute === 'onboarding') {
    return (
      <>
        {renderCurrentRoute()}
        <AuthModal
          isOpen={authModalOpen}
          initialMode={authModalMode}
          onClose={() => setAuthModalOpen(false)}
          onAuthSuccess={handleAuthSuccess}
          onEnterDemo={handleEnterDemo}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-gray-900 flex flex-col md:flex-row antialiased selection:bg-[#0052FF] selection:text-white">
      {/* Sidebar Navigation */}
      <Sidebar
        currentRoute={currentRoute}
        navigate={setCurrentRoute}
        mobileMenuOpen={mobileMenuOpen}
        onCloseMobileMenu={() => setMobileMenuOpen(false)}
        state={appState}
        profile={appState.profile}
        currentUser={currentUser}
        onOpenSearch={() => setSearchModalOpen(true)}
        onResetDemo={handleResetDemo}
        onLogout={handleLogout}
        onOpenAuth={() => {
          setAuthModalMode('signup');
          setAuthModalOpen(true);
        }}
        isDemo={currentUser?.isDemo || (!currentUser && !getAuthToken())}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          currentRoute={currentRoute}
          state={appState}
          currentUser={currentUser}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onOpenNotifications={() => setNotificationModalOpen(true)}
          onUpdateStage={handleUpdateStage}
          onResetDemo={handleResetDemo}
          onLogout={handleLogout}
          onOpenAuth={() => {
            setAuthModalMode('signup');
            setAuthModalOpen(true);
          }}
          onNavigate={setCurrentRoute}
          onOpenSaveResource={() => {
            setSaveResourceInitialData(undefined);
            setSaveResourceInitialUrl('');
            setSaveResourceModalOpen(true);
          }}
        />

        <main className="flex-1 pb-16">
          {renderCurrentRoute()}
        </main>
      </div>

      {/* Global Modals */}
      <SaveResourceModal
        isOpen={saveResourceModalOpen}
        onClose={() => setSaveResourceModalOpen(false)}
        state={appState}
        onSaveResource={handleSaveVaultResource}
        onSave={handleSaveVaultResource}
        collections={appState.vaultCollections || []}
        onCreateCollection={handleCreateVaultCollection}
        initialUrl={saveResourceInitialUrl}
        initialData={saveResourceInitialData}
      />
      <SearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        state={appState}
        navigate={setCurrentRoute}
      />

      <NotificationModal
        isOpen={notificationModalOpen}
        onClose={() => setNotificationModalOpen(false)}
        state={appState}
        onMarkAllRead={() => {
          const updated = appState.notifications.map(n => ({ ...n, read: true }));
          syncState({ ...appState, notifications: updated });
        }}
      />

      <AuthModal
        isOpen={authModalOpen}
        initialMode={authModalMode}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        onEnterDemo={handleEnterDemo}
      />
    </div>
  );
}

export default App;

