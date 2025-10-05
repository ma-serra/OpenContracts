import React, { useEffect } from "react";
import {
  MockedProvider,
  MockLink,
  type MockedResponse,
} from "@apollo/client/testing";
import { InMemoryCache, ApolloLink } from "@apollo/client";
import { relayStylePagination } from "@apollo/client/utilities";
import { Provider as JotaiProvider } from "jotai";
import { useSetAtom } from "jotai";
import { MemoryRouter, useLocation, useNavigate } from "react-router-dom";
import { FloatingDocumentControls } from "../src/components/knowledge_base/document/FloatingDocumentControls";
import { PermissionTypes } from "../src/components/types";
import {
  showAnnotationBoundingBoxesAtom,
  showStructuralAnnotationsAtom,
  showSelectedAnnotationOnlyAtom,
} from "../src/components/annotator/context/UISettingsAtom";
import { corpusStateAtom } from "../src/components/annotator/context/CorpusAtom";
import {
  selectedDocumentAtom,
  rawPermissionsAtom,
} from "../src/components/annotator/context/DocumentAtom";
import {
  authStatusVar,
  authToken,
  userObj,
  openedDocument,
  openedCorpus,
  selectedAnalysesIds,
  selectedExtractIds,
  selectedAnnotationIds,
  showSelectedAnnotationOnly,
  showAnnotationBoundingBoxes,
  showStructuralAnnotations,
  showAnnotationLabels,
} from "../src/graphql/cache";

// Create a minimal test cache configuration
const createTestCache = () =>
  new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          annotations: relayStylePagination(),
          userFeedback: relayStylePagination(),
          pageAnnotations: { keyArgs: false, merge: true },
          documents: relayStylePagination(),
          corpuses: relayStylePagination(),
          userexports: relayStylePagination(),
          labelsets: relayStylePagination(),
          annotationLabels: relayStylePagination(),
          relationshipLabels: relayStylePagination(),
          extracts: relayStylePagination(),
          columns: relayStylePagination(),
        },
      },
      DocumentType: {
        keyFields: ["id"],
      },
      CorpusType: {
        keyFields: ["id"],
      },
      AnnotationType: {
        keyFields: ["id"],
      },
      AnalysisType: {
        keyFields: ["id"],
      },
    },
  });

// Create a wildcard link that handles all GraphQL operations gracefully
const createWildcardLink = (mocks: ReadonlyArray<MockedResponse>) => {
  const defaultMockLink = new MockLink(mocks);
  return new ApolloLink((operation, forward) => {
    // Try the mock link first
    const result = defaultMockLink.request(operation, forward);
    if (result) {
      return result;
    }

    // If no mock found, return empty data to prevent errors
    return ApolloLink.empty();
  });
};

interface FloatingDocumentControlsTestWrapperProps {
  visible?: boolean;
  onAnalysesClick?: () => void;
  onExtractsClick?: () => void;
  analysesOpen?: boolean;
  extractsOpen?: boolean;
  panelOffset?: number;
  readOnly?: boolean;
  // Test configuration props
  showBoundingBoxes?: boolean;
  showStructural?: boolean;
  showSelectedOnly?: boolean;
  corpusPermissions?: string[]; // Accept string permissions from tests
}

// Helper function to convert string permissions to PermissionTypes
const convertPermissions = (permissions: string[]): PermissionTypes[] => {
  return permissions
    .map((perm) => {
      switch (perm) {
        case "CAN_READ":
          return PermissionTypes.CAN_READ;
        case "CAN_UPDATE":
          return PermissionTypes.CAN_UPDATE;
        case "CAN_CREATE":
          return PermissionTypes.CAN_CREATE;
        case "CAN_REMOVE":
          return PermissionTypes.CAN_REMOVE;
        case "CAN_PUBLISH":
          return PermissionTypes.CAN_PUBLISH;
        default:
          return null;
      }
    })
    .filter((p): p is PermissionTypes => p !== null);
};

// Inner component that sets up the atom states and watches URL for changes
const TestSetup: React.FC<{
  showBoundingBoxes: boolean;
  showStructural: boolean;
  showSelectedOnly: boolean;
  corpusPermissions: PermissionTypes[];
  children: React.ReactNode;
}> = ({
  showBoundingBoxes,
  showStructural,
  showSelectedOnly,
  corpusPermissions,
  children,
}) => {
  const location = useLocation();
  const baseNavigate = useNavigate();
  const setShowBoundingBoxes = useSetAtom(showAnnotationBoundingBoxesAtom);
  const setShowStructural = useSetAtom(showStructuralAnnotationsAtom);
  const setShowSelectedOnly = useSetAtom(showSelectedAnnotationOnlyAtom);
  const setCorpusState = useSetAtom(corpusStateAtom);
  const setSelectedDocument = useSetAtom(selectedDocumentAtom);
  const setRawPermissions = useSetAtom(rawPermissionsAtom);

  /**
   * DISABLED: URL watching interferes with direct reactive var updates
   *
   * Now that setters in useAnnotationDisplay() update reactive vars directly,
   * we don't need the test wrapper to sync URL → reactive vars.
   * CentralRouteManager does this in the real app, but in tests the direct
   * updates are sufficient and more reliable.
   */
  // useEffect(() => {
  //   console.log('[TEST WRAPPER] URL changed:', location.search);
  //   const searchParams = new URLSearchParams(location.search);

  //   // Always sync ALL params (not just when present)
  //   const structuralParam = searchParams.get('structural');
  //   const newStructural = structuralParam === 'true';
  //   console.log('[TEST WRAPPER] Syncing structural:', newStructural);
  //   showStructuralAnnotations(newStructural);

  //   const selectedOnlyParam = searchParams.get('selectedOnly');
  //   const newSelectedOnly = selectedOnlyParam === 'true';
  //   console.log('[TEST WRAPPER] Syncing selectedOnly:', newSelectedOnly);
  //   showSelectedAnnotationOnly(newSelectedOnly);

  //   const boundingBoxesParam = searchParams.get('boundingBoxes');
  //   const newBoundingBoxes = boundingBoxesParam === 'true';
  //   console.log('[TEST WRAPPER] Syncing boundingBoxes:', newBoundingBoxes);
  //   showAnnotationBoundingBoxes(newBoundingBoxes);
  // }, [location.search]);

  useEffect(() => {
    // Initialize Apollo reactive vars that the routing system would normally set
    authStatusVar("AUTHENTICATED");

    // Set up document in reactive var
    openedDocument({
      id: "test-document-id",
      slug: "test-document",
      title: "Test Document",
      creator: { id: "test-user", slug: "testuser", username: "testuser" },
    } as any);

    // Set up corpus in reactive var
    openedCorpus({
      id: "test-corpus-id",
      slug: "test-corpus",
      title: "Test Corpus",
      creator: { id: "test-user", slug: "testuser", username: "testuser" },
    } as any);

    // Initialize selection arrays to empty
    selectedAnalysesIds([]);
    selectedExtractIds([]);
    selectedAnnotationIds([]);
  }, []); // Only run once on mount

  // Initialize Jotai atoms once on mount (for compatibility)
  // URL watching (above) handles reactive var updates dynamically
  useEffect(() => {
    setShowBoundingBoxes(showBoundingBoxes);
    setShowStructural(showStructural);
    setShowSelectedOnly(showSelectedOnly);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    // Set corpus state with permissions - this is what the component uses for selectedCorpus check
    const corpus = {
      id: "test-corpus-id",
      title: "Test Corpus",
      description: "Test corpus description",
      myPermissions: corpusPermissions,
      allowComments: true,
      labelSet: null,
      icon: null,
      // Add any other required fields for CorpusType
    };

    setCorpusState({
      selectedCorpus: corpus as any,
      myPermissions: corpusPermissions,
      spanLabels: [],
      humanSpanLabels: [],
      relationLabels: [],
      docTypeLabels: [],
      humanTokenLabels: [],
      allowComments: true,
      isLoading: false,
    });

    // Set document state with permissions (FloatingDocumentControls now uses document permissions)
    setSelectedDocument({
      id: "test-document-id",
      title: "Test Document",
      myPermissions: corpusPermissions,
      pdfFile: null,
      backendLock: false,
      isPublic: false,
      // Add any other required fields for DocumentType
    } as any);

    // Also set raw permissions which get processed into the permissions atom
    // Convert PermissionTypes to raw strings
    const rawPerms = corpusPermissions
      .map((perm) => {
        switch (perm) {
          case PermissionTypes.CAN_READ:
            return "READ";
          case PermissionTypes.CAN_UPDATE:
            return "UPDATE";
          case PermissionTypes.CAN_CREATE:
            return "CREATE";
          case PermissionTypes.CAN_REMOVE:
            return "DELETE";
          case PermissionTypes.CAN_PUBLISH:
            return "PUBLISH";
          default:
            return "";
        }
      })
      .filter((p) => p);

    setRawPermissions(rawPerms);
  }, [
    corpusPermissions,
    setCorpusState,
    setSelectedDocument,
    setRawPermissions,
  ]);

  return <>{children}</>;
};

export const FloatingDocumentControlsTestWrapper: React.FC<
  FloatingDocumentControlsTestWrapperProps
> = ({
  visible = true,
  onAnalysesClick,
  onExtractsClick,
  analysesOpen = false,
  extractsOpen = false,
  panelOffset = 0,
  readOnly = false,
  showBoundingBoxes = false,
  showStructural = false,
  showSelectedOnly = false,
  corpusPermissions = ["CAN_READ", "CAN_UPDATE"],
}) => {
  // Convert string permissions to PermissionTypes
  const permissionTypes = convertPermissions(corpusPermissions);

  // Create a wildcard link that handles all operations
  const link = createWildcardLink([]);

  // Set up authentication for tests - BEFORE any components mount
  authToken("test-auth-token");
  userObj({
    id: "test-user",
    email: "test@example.com",
    username: "testuser",
  });

  // Initialize Apollo reactive vars for UI settings BEFORE component mounts
  // This prevents the component from using stale values from previous tests
  showAnnotationBoundingBoxes(showBoundingBoxes);
  showStructuralAnnotations(showStructural);
  showSelectedAnnotationOnly(showSelectedOnly);

  return (
    <MemoryRouter initialEntries={["/test"]}>
      <JotaiProvider>
        <MockedProvider
          link={link}
          cache={createTestCache()}
          addTypename
          defaultOptions={{
            watchQuery: { errorPolicy: "all" },
            query: { errorPolicy: "all" },
            mutate: { errorPolicy: "all" },
          }}
        >
          <TestSetup
            showBoundingBoxes={showBoundingBoxes}
            showStructural={showStructural}
            showSelectedOnly={showSelectedOnly}
            corpusPermissions={permissionTypes}
          >
            <div
              style={{
                width: "100vw",
                height: "100vh",
                position: "relative",
                background: "#f5f5f5",
              }}
            >
              <FloatingDocumentControls
                visible={visible}
                onAnalysesClick={onAnalysesClick}
                onExtractsClick={onExtractsClick}
                analysesOpen={analysesOpen}
                extractsOpen={extractsOpen}
                panelOffset={panelOffset}
                readOnly={readOnly}
              />
            </div>
          </TestSetup>
        </MockedProvider>
      </JotaiProvider>
    </MemoryRouter>
  );
};
