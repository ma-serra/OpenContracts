/**
 * Atom-based state management for UI settings, annotation selection,
 * and display settings using Jotai.
 *
 * Note: Annotation display settings (showStructural, showBoundingBoxes, etc.)
 * have been moved to Apollo reactive vars in cache.ts for URL synchronization.
 */

import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { useCallback, useEffect, useRef } from "react";
import { useReactiveVar } from "@apollo/client";
import { useNavigate, useLocation } from "react-router-dom";
import { RelationGroup } from "../types/annotations";
import { LabelDisplayBehavior } from "../../../types/graphql-api";
import {
  activeSpanLabelAtom,
  spanLabelsToViewAtom,
  activeRelationLabelAtom,
  useFreeFormAnnotationsAtom,
  relationModalVisibleAtom,
} from "./AnnotationControlAtoms";
import { useCorpusState } from "./CorpusAtom";
import { useSelectedDocument } from "./DocumentAtom";
import {
  showStructuralAnnotations,
  showSelectedAnnotationOnly,
  showAnnotationBoundingBoxes,
  showAnnotationLabels,
  selectedAnnotationIds,
} from "../../../graphql/cache";

/**
 * Types for query loading states and errors.
 */
export type QueryLoadingStates = {
  analyses: boolean;
  annotations: boolean;
  relationships: boolean;
  datacells: boolean;
};

export type QueryErrors = {
  analyses?: Error;
  annotations?: Error;
  relationships?: Error;
  datacells?: Error;
};

/**
 * UI Settings Atoms
 */
export const zoomLevelAtom = atom<number>(1);
export const isSidebarVisibleAtom = atom<boolean>(true);
export const topbarVisibleAtom = atom<boolean>(false);
export const sidebarWidthAtom = atom<number>(300);
export const progressAtom = atom<number>(0);
export const modalOpenAtom = atom<boolean>(false);
export const readOnlyAtom = atom<boolean>(false);
export const loadingMessageAtom = atom<string>("");
export const shiftDownAtom = atom<boolean>(false);
export const isCreatingAnnotationAtom = atom<boolean>(false);

/**
 * Query State Atoms
 */
export const queryLoadingStatesAtom = atom<QueryLoadingStates>({
  analyses: false,
  annotations: false,
  relationships: false,
  datacells: false,
});
export const queryErrorsAtom = atom<QueryErrors>({});

/**
 * Annotation Selection Atoms
 */
export const selectedAnnotationsAtom = atom<string[]>([]);
export const selectedRelationsAtom = atom<RelationGroup[]>([]);
export const hoveredAnnotationIdAtom = atom<string | null>(null);

/**
 * Annotation Display Atoms
 *
 * DEPRECATED: These atoms are deprecated in favor of Apollo reactive vars in cache.ts
 * for proper URL synchronization. Kept as exports for backward compatibility.
 * DO NOT USE - Use useAnnotationDisplay() hook instead.
 */
export const showAnnotationBoundingBoxesAtom = atom<boolean>(true); // DEPRECATED - use reactive var
export const showAnnotationLabelsAtom = atom<any>("ON_HOVER"); // DEPRECATED - use reactive var
export const showStructuralAnnotationsAtom = atom<boolean>(false); // DEPRECATED - use reactive var
export const showSelectedAnnotationOnlyAtom = atom<boolean>(false); // DEPRECATED - use reactive var
export const hideLabelsAtom = atom<boolean>(false); // Still used locally

/**
 * Relationship Display Atoms
 */
export const showStructuralRelationshipsAtom = atom<boolean>(false);

/**
 * Atom for onSidebarToggle callback.
 */
export const onSidebarToggleAtom = atom<(() => void) | undefined>(undefined);

/**
 * Atom to track if we've scrolled to a specific annotation
 */
export const hasScrolledToAnnotationAtom = atom<string | null>(null);

/**
 * ChatTray persistence atom
 */
export interface ChatTrayPersist {
  isOpen: boolean;
  conversationId: string | null;
  scrollOffset: number;
  isNewChat: boolean;
}
export const chatTrayStateAtom = atom<ChatTrayPersist>({
  isOpen: false,
  conversationId: null,
  scrollOffset: 0,
  isNewChat: false,
});

/**
 * Chat panel width persistence atom
 */
export type ChatPanelWidthMode = "quarter" | "half" | "full" | "custom";

export interface ChatPanelWidthState {
  mode: ChatPanelWidthMode;
  customWidth?: number; // percentage 0-100
  lastMode: ChatPanelWidthMode; // for auto-minimize restore
  autoMinimize: boolean;
}

export const chatPanelWidthAtom = atom<ChatPanelWidthState>({
  mode: "half",
  customWidth: undefined,
  lastMode: "half",
  autoMinimize: true,
});

/**
 * Hook to initialize UI settings atoms with initial values.
 * @param params Initial values for the UI settings.
 */
export function useInitializeUISettingsAtoms(params: {
  sidebarVisible?: boolean;
  onSidebarToggle?: () => void;
  initialWidth?: number;
}) {
  const { sidebarVisible = true, onSidebarToggle, initialWidth = 300 } = params;

  const setIsSidebarVisible = useSetAtom(isSidebarVisibleAtom);
  const setSidebarWidth = useSetAtom(sidebarWidthAtom);
  const setOnSidebarToggle = useSetAtom(onSidebarToggleAtom);

  useEffect(() => {
    setIsSidebarVisible(sidebarVisible);
    setSidebarWidth(initialWidth);
    setOnSidebarToggle(() => onSidebarToggle);
  }, [
    sidebarVisible,
    onSidebarToggle,
    initialWidth,
    setIsSidebarVisible,
    setSidebarWidth,
    setOnSidebarToggle,
  ]);
}

/**
 * Custom hooks for zoom controls.
 */
export function useZoomLevel() {
  const [zoomLevel, setZoomLevel] = useAtom(zoomLevelAtom);

  const zoomIn = useCallback(() => {
    setZoomLevel((level) => Math.min(level + 0.1, 3));
  }, [setZoomLevel]);

  const zoomOut = useCallback(() => {
    setZoomLevel((level) => Math.max(level - 0.1, 0.3));
  }, [setZoomLevel]);

  const resetZoom = useCallback(() => {
    setZoomLevel(1);
  }, [setZoomLevel]);

  return {
    zoomLevel,
    setZoomLevel,
    zoomIn,
    zoomOut,
    resetZoom,
  };
}

/**
 * Custom hooks for sidebar controls.
 */
export function useSidebar() {
  const [isSidebarVisible, setIsSidebarVisible] = useAtom(isSidebarVisibleAtom);
  const [sidebarWidth, setSidebarWidth] = useAtom(sidebarWidthAtom);
  const onSidebarToggle = useAtomValue(onSidebarToggleAtom);

  const toggleSidebar = useCallback(() => {
    if (onSidebarToggle) {
      onSidebarToggle();
    } else {
      setIsSidebarVisible((visible) => !visible);
    }
  }, [onSidebarToggle, setIsSidebarVisible]);

  const setSidebarVisible = useCallback(
    (visible: boolean) => {
      if (onSidebarToggle) {
        if (visible !== isSidebarVisible) {
          onSidebarToggle();
        }
      } else {
        setIsSidebarVisible(visible);
      }
    },
    [onSidebarToggle, isSidebarVisible, setIsSidebarVisible]
  );

  return {
    isSidebarVisible,
    setSidebarVisible,
    sidebarWidth,
    setSidebarWidth,
    toggleSidebar,
  };
}

/**
 * Custom hooks for progress state.
 */
export function useProgress() {
  const [progress, setProgress] = useAtom(progressAtom);
  return { progress, setProgress };
}

/**
 * Custom hooks for query loading states.
 */
export function useQueryLoadingStates() {
  const [queryLoadingStates, setQueryLoadingStates] = useAtom(
    queryLoadingStatesAtom
  );
  return { queryLoadingStates, setQueryLoadingStates };
}

/**
 * Custom hooks for query errors.
 */
export function useQueryErrors() {
  const [queryErrors, setQueryErrors] = useAtom(queryErrorsAtom);
  return { queryErrors, setQueryErrors };
}

/**
 * Custom hook for managing annotation label controls
 * @returns Object containing annotation control states and their setters
 */
export function useAnnotationControls() {
  const {
    humanSpanLabels: humanSpanLabelChoices,
    relationLabels,
    humanTokenLabels,
  } = useCorpusState();
  const { selectedDocument } = useSelectedDocument();

  const [activeSpanLabel, setActiveSpanLabel] = useAtom(activeSpanLabelAtom);
  const [spanLabelsToView, setSpanLabelsToView] = useAtom(spanLabelsToViewAtom);
  const [activeRelationLabel, setActiveRelationLabel] = useAtom(
    activeRelationLabelAtom
  );
  const [useFreeFormAnnotations, setUseFreeFormAnnotations] = useAtom(
    useFreeFormAnnotationsAtom
  );
  const [relationModalVisible, setRelationModalVisible] = useAtom(
    relationModalVisibleAtom
  );

  const initialized = useRef(false);

  // Initialize default values only once
  useEffect(() => {
    if (!initialized.current && selectedDocument) {
      const isTextFile =
        selectedDocument.fileType?.startsWith("text/") ?? false;
      const isPdfFile = selectedDocument.fileType === "application/pdf";

      if (isTextFile && humanSpanLabelChoices.length > 0 && !activeSpanLabel) {
        setActiveSpanLabel(humanSpanLabelChoices[0]);
        initialized.current = true;
      } else if (isPdfFile && humanTokenLabels.length > 0 && !activeSpanLabel) {
        setActiveSpanLabel(humanTokenLabels[0]);
        initialized.current = true;
      }

      if (relationLabels.length > 0 && !activeRelationLabel) {
        setActiveRelationLabel(relationLabels[0]);
        initialized.current = true;
      }
    }
  }, [
    humanSpanLabelChoices,
    humanTokenLabels,
    relationLabels,
    activeSpanLabel,
    activeRelationLabel,
    setActiveSpanLabel,
    setActiveRelationLabel,
    selectedDocument,
  ]);

  const toggleUseFreeFormAnnotations = useCallback(() => {
    setUseFreeFormAnnotations((prev) => !prev);
  }, [setUseFreeFormAnnotations]);

  return {
    activeSpanLabel,
    setActiveSpanLabel,
    spanLabelsToView,
    setSpanLabelsToView,
    activeRelationLabel,
    setActiveRelationLabel,
    useFreeFormAnnotations,
    toggleUseFreeFormAnnotations,
    relationModalVisible,
    setRelationModalVisible,
  };
}

/**
 * Custom hook for managing annotation display settings
 * Now uses Apollo reactive vars from cache.ts for URL synchronization
 * FOLLOWS THE ONE OLACE TO RULE THEM ALL: Components update URL,
 * CentralRouteManager sets reactive vars
 * @returns Object containing annotation display states and their setters
 */
export function useAnnotationDisplay() {
  const navigate = useNavigate();
  const location = useLocation();

  // Use Apollo reactive vars for URL-synchronized state
  const showBoundingBoxes = useReactiveVar(showAnnotationBoundingBoxes);
  const showLabels = useReactiveVar(showAnnotationLabels);
  const showStructural = useReactiveVar(showStructuralAnnotations);
  const showSelectedOnly = useReactiveVar(showSelectedAnnotationOnly);

  // Local Jotai state for non-URL-synchronized settings
  const [showStructuralRelationships, setShowStructuralRelationships] = useAtom(
    showStructuralRelationshipsAtom
  );
  const [hideLabels, setHideLabels] = useAtom(hideLabelsAtom);

  // Setters that update BOTH reactive vars (for immediate effect) AND URL (for persistence)
  // In real app: CentralRouteManager Phase 2 also syncs URL → reactive vars
  // In component tests: Direct reactive var update ensures immediate UI updates
  const setShowBoundingBoxes = useCallback(
    (value: boolean) => {
      // Update reactive var immediately
      showAnnotationBoundingBoxes(value);

      // Also update URL to maintain URL as source of truth
      const searchParams = new URLSearchParams(location.search);
      if (value) {
        searchParams.set("boundingBoxes", "true");
      } else {
        searchParams.delete("boundingBoxes");
      }
      navigate({ search: searchParams.toString() }, { replace: true });
    },
    [navigate, location.search]
  );

  const setShowLabels = useCallback(
    (value: LabelDisplayBehavior) => {
      // Update reactive var immediately
      showAnnotationLabels(value);

      // Also update URL to maintain URL as source of truth
      const searchParams = new URLSearchParams(location.search);
      if (value !== "ON_HOVER") {
        searchParams.set("labels", value);
      } else {
        searchParams.delete("labels");
      }
      navigate({ search: searchParams.toString() }, { replace: true });
    },
    [navigate, location.search]
  );

  const setShowStructural = useCallback(
    (value: boolean) => {
      // Update reactive var immediately
      showStructuralAnnotations(value);

      // Also update URL to maintain URL as source of truth
      const searchParams = new URLSearchParams(location.search);
      if (value) {
        searchParams.set("structural", "true");
      } else {
        searchParams.delete("structural");
      }
      navigate({ search: searchParams.toString() }, { replace: true });
    },
    [navigate, location.search]
  );

  const setShowSelectedOnly = useCallback(
    (value: boolean) => {
      // Update reactive var immediately
      showSelectedAnnotationOnly(value);

      // Also update URL to maintain URL as source of truth
      const searchParams = new URLSearchParams(location.search);
      if (value) {
        searchParams.set("selectedOnly", "true");
      } else {
        searchParams.delete("selectedOnly");
      }
      navigate({ search: searchParams.toString() }, { replace: true });
    },
    [navigate, location.search]
  );

  return {
    showBoundingBoxes,
    setShowBoundingBoxes,
    showLabels,
    setShowLabels,
    showStructural,
    setShowStructural,
    showSelectedOnly,
    setShowSelectedOnly,
    hideLabels,
    setHideLabels,
    showStructuralRelationships,
    setShowStructuralRelationships,
  };
}

/**
 * Custom hook for managing annotation selection and hover states
 * Now uses Apollo reactive var for annotation IDs (URL-synchronized)
 * FOLLOWS THE ONE OLACE TO RULE THEM ALL: Components update URL,
 * CentralRouteManager sets reactive vars
 * @returns Object containing selection and hover states and their setters
 */
export function useAnnotationSelection() {
  const navigate = useNavigate();
  const location = useLocation();

  // Use Apollo reactive var for URL-synchronized annotation selection
  const selectedAnnotations = useReactiveVar(selectedAnnotationIds);

  // Local Jotai state for non-URL-synchronized selection
  const [selectedRelations, setSelectedRelations] = useAtom(
    selectedRelationsAtom
  );
  const [hoveredAnnotationId, setHoveredAnnotationId] = useAtom(
    hoveredAnnotationIdAtom
  );

  // Setter that updates URL - CentralRouteManager Phase 2 handles reactive var
  const setSelectedAnnotations = useCallback(
    (ids: string[]) => {
      const searchParams = new URLSearchParams(location.search);
      if (ids.length > 0) {
        searchParams.set("ann", ids.join(","));
      } else {
        searchParams.delete("ann");
      }
      navigate({ search: searchParams.toString() }, { replace: true });
    },
    [navigate, location.search]
  );

  return {
    selectedAnnotations,
    setSelectedAnnotations,
    selectedRelations,
    setSelectedRelations,
    hoveredAnnotationId,
    setHoveredAnnotationId,
  };
}

/**
 * Custom hook for managing modal, readonly, loading message, and keyboard states
 * @returns Object containing additional UI states and their setters
 */
export function useAdditionalUIStates() {
  const [modalOpen, setModalOpen] = useAtom(modalOpenAtom);
  const [readOnly, setReadOnly] = useAtom(readOnlyAtom);
  const [loadingMessage, setLoadingMessage] = useAtom(loadingMessageAtom);
  const [shiftDown, setShiftDown] = useAtom(shiftDownAtom);
  const [topbarVisible, setTopbarVisible] = useAtom(topbarVisibleAtom);

  return {
    modalOpen,
    setModalOpen,
    readOnly,
    setReadOnly,
    loadingMessage,
    setLoadingMessage,
    shiftDown,
    setShiftDown,
    topbarVisible,
    setTopbarVisible,
  };
}

/**
 * Hook for managing chat panel width
 */
export function useChatPanelWidth() {
  const [chatPanelWidth, setChatPanelWidth] = useAtom(chatPanelWidthAtom);

  const setMode = useCallback(
    (mode: ChatPanelWidthMode) => {
      setChatPanelWidth((prev) => ({
        ...prev,
        mode,
        lastMode: mode !== "quarter" ? mode : prev.lastMode,
      }));
    },
    [setChatPanelWidth]
  );

  const setCustomWidth = useCallback(
    (width: number) => {
      setChatPanelWidth((prev) => ({
        ...prev,
        mode: "custom",
        customWidth: width,
        lastMode: "custom",
      }));
    },
    [setChatPanelWidth]
  );

  const toggleAutoMinimize = useCallback(() => {
    setChatPanelWidth((prev) => ({
      ...prev,
      autoMinimize: !prev.autoMinimize,
    }));
  }, [setChatPanelWidth]);

  const minimize = useCallback(() => {
    setChatPanelWidth((prev) => ({
      ...prev,
      mode: "quarter",
    }));
  }, [setChatPanelWidth]);

  const restore = useCallback(() => {
    setChatPanelWidth((prev) => ({
      ...prev,
      mode: prev.lastMode,
    }));
  }, [setChatPanelWidth]);

  return {
    ...chatPanelWidth,
    setMode,
    setCustomWidth,
    toggleAutoMinimize,
    minimize,
    restore,
  };
}
