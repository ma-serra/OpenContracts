# Frontend Performance Refactor: Progressive Annotation Loading

## Implementation Checklist

### Phase 1: Backend Enhancement
- [x] Extend `pageAnnotations` to accept multiple pages ([see 3.1.1](#311-extend-pageannotations-to-accept-multiple-pages))
- [x] Add relationship filtering by page ([see 3.1.2](#312-add-relationship-filtering-by-page))
- [x] Test multi-page query performance with existing optimizer

### Phase 2: Frontend Query Updates
- [ ] Create `GET_DOCUMENT_INITIAL` query ([see 3.2.1](#321-create-new-progressive-queries))
- [ ] Create `GET_PAGE_DATA` query with `pageAnnotations` and `pageRelationships` ([see 3.2.1](#321-create-new-progressive-queries))
- [ ] Create `useProgressiveAnnotations` hook ([see 3.2.2](#322-create-viewport-aware-annotation-hook))

### Phase 3: Integrate with DocumentKnowledgeBase
- [ ] Replace monolithic query with initial lightweight query ([see 3.3.1](#331-replace-monolithic-query))
- [ ] Split `processAnnotationsData` into initial + incremental ([see 3.3.2](#332-update-processannotationsdata))
- [ ] Connect PDF viewport to progressive loading via a callback prop ([see 3.3.3](#333-connect-pdf-viewport-to-loading))
- [ ] Add feature flag switch between monolithic and progressive modes ([see 3.5.2](#352-feature-flags))

### Phase 4: Jump-to-Annotation Support
- [ ] Handle direct annotation navigation ([see 3.4.1](#341-handle-direct-annotation-navigation))
- [ ] Pre-load pages for selected annotations
- [ ] Test URL-based annotation selection

### Phase 5: Testing & Optimization
- [ ] Add performance metrics instrumentation ([see 3.5.1](#351-performance-metrics))
- [ ] Implement feature flags for safe rollout ([see 3.5.2](#352-feature-flags))
- [ ] Load test with large documents (1000+ annotations)
- [ ] Verify memory usage reduction
- [ ] Test edge cases ([see 4.2](#42-edge-cases))

---

## 1. Current State Analysis

### 1.1 The Monolithic Query Problem

The `GET_DOCUMENT_KNOWLEDGE_AND_ANNOTATIONS` query (`frontend/src/graphql/queries.ts:2252-2388`) loads:
- **ALL annotations** for the document (`allAnnotations` field - line 2319)
- **ALL structural annotations** (`allStructuralAnnotations` - line 2299)
- **ALL relationships** (`allRelationships` - line 2346)
- **ALL notes** (`allNotes` - line 2273)
- **Complete corpus label set** (line 2377)

This is consumed in `DocumentKnowledgeBase.tsx:833-1032` where the query fires on component mount, loading potentially 10,000+ annotations even when only viewing page 1 of a 100-page document.

### 1.2 Data Flow & State Updates

The `processAnnotationsData` function (`DocumentKnowledgeBase.tsx:491-624`) processes this massive payload by:
1. Converting annotations to internal format (lines 504-507)
2. Updating `pdfAnnotationsAtom` (lines 522-530)
3. Setting structural annotations separately (lines 536-541)
4. Processing relationships (lines 544-567)
5. Updating corpus state with labels (lines 570-614)
6. Syncing global navigation cache (lines 617-622)

### 1.3 Existing Infrastructure We Can Leverage

✅ **Backend Ready**:
- `annotation_summary` GraphQL field exists (`config/graphql/graphene_types.py:806-816`)
- `relationship_summary` GraphQL field exists (`config/graphql/graphene_types.py:989-1026`)
- `page_annotations` supports single and multiple pages plus structural/analysis filters (`config/graphql/graphene_types.py:865-887`)
- `page_relationships` supports page filtering and structural/analysis filters (`config/graphql/graphene_types.py:875-882, 943-987`)
- Materialized views for summaries (`docs/frontend/doc-data-query-optimizations.md:74-83`)
- Query optimizers with caching and permission checks (`docs/frontend/doc-data-query-optimizations.md:133-153`)

✅ **Frontend Viewport Detection Works**:
- PDF component already implements virtual windowing (`frontend/src/components/annotator/renderers/pdf/PDF.tsx:260-328`)
- Tracks visible pages with overscan buffer (lines 291-293)
- Calculates page ranges on scroll (lines 262-289)

---

## 2. Progressive Loading Architecture Design

### 2.1 Loading Sequence

```typescript
// Phase 1: Initial lightweight load
1. Load document metadata + annotation summary
2. Load corpus labels (one-time)
3. Render PDF with PAWLS tokens

// Phase 2: On-demand annotation loading
4. Detect visible pages (already working)
5. Load annotations for visible pages ± buffer
6. Update local state incrementally

// Phase 3: Jump-to-annotation
7. If annotation ID in URL/selection
8. Load that specific page's annotations
9. Scroll to annotation (existing logic)
```

### 2.2 New Query Structure

```graphql
# Replace monolithic query with:

# 1. Initial load query
query GetDocumentInitial($documentId: String!, $corpusId: ID!) {
  document(id: $documentId) {
    # Existing metadata fields
    id, title, fileType, creator, created
    pdfFile, pdfFileHash, pawlsParseFile

    # NEW: Summary from materialized view
    annotationSummary(corpusId: $corpusId) {
      annotationCount
      pageCount
      pagesWithAnnotations  # Array of page numbers
    }
    relationshipSummary(corpusId: $corpusId)  # lightweight relationship stats
  }
  corpus(id: $corpusId) {
    # Labels (cached after first load)
    labelSet { allAnnotationLabels { ... } }
  }
}

# 2. Page-based annotations and relationships
query GetPageData(
  $documentId: String!
  $corpusId: ID!
  $pages: [Int!]!
  $structural: Boolean
  $analysisId: ID
) {
  document(id: $documentId) {
    pageAnnotations(
      corpusId: $corpusId
      pages: $pages
      structural: $structural
      analysisId: $analysisId
    ) {
      # Same fields as current allAnnotations
    }
    pageRelationships(
      corpusId: $corpusId
      pages: $pages
      structural: $structural
      analysisId: $analysisId
    ) {
      # Relationships touching these pages
    }
  }
}
```

---

## 3. Implementation Plan

### Phase 1: Backend Enhancement (1-2 days)

#### 3.1.1 Extend `pageAnnotations` to accept multiple pages
**File**: `config/graphql/graphene_types.py`
```python
# Already implemented (multi-page + optional single page)
page_annotations = graphene.List(
    AnnotationType,
    corpus_id=graphene.ID(required=True),
    page=graphene.Int(),
    pages=graphene.List(graphene.Int),
    structural=graphene.Boolean(),
    analysis_id=graphene.ID(),
)

def resolve_page_annotations(self, info, corpus_id, page=None, pages=None, structural=None, analysis_id=None):
    """Implemented: supports both single and multi-page with filters."""
    ...
```

#### 3.1.2 Add relationship filtering by page
**File**: `config/graphql/graphene_types.py`
```python
# Already implemented
page_relationships = graphene.List(
    RelationshipType,
    corpus_id=graphene.ID(required=True),
    pages=graphene.List(graphene.Int, required=True),
    structural=graphene.Boolean(),
    analysis_id=graphene.ID(),
)
```

### Phase 2: Frontend Query Updates (1 day)

#### 3.2.1 Create new progressive queries
**File**: `frontend/src/graphql/queries.ts`
```typescript
export const GET_DOCUMENT_INITIAL = gql`...`;
export const GET_PAGE_DATA = gql`...`;   // annotations + relationships per pages
```

#### 3.2.2 Create viewport-aware annotation hook
**New File**: `frontend/src/hooks/useProgressiveAnnotations.ts`
```typescript
export function useProgressiveAnnotations({
  documentId,
  corpusId,
  visiblePages,  // From PDF viewport (zero-based indices -> convert to 1-based)
  structural,
  analysisId,
  enabled = true,
}) {
  const [loadedPages, setLoadedPages] = useState(new Set());
  const [isLoading, setIsLoading] = useState(false);

  // Load annotations for new visible pages
  useEffect(() => {
    if (!enabled) return;
    const pagesToLoad = visiblePages.filter(p => !loadedPages.has(p));
    if (pagesToLoad.length > 0) loadPageData(pagesToLoad);
  }, [visiblePages, enabled]);

  // ... loading logic
}
```

### Phase 3: Integrate with DocumentKnowledgeBase (2-3 days)

#### 3.3.1 Replace monolithic query
**File**: `frontend/src/components/knowledge_base/document/DocumentKnowledgeBase.tsx`

**Lines 833-1032**: Replace `GET_DOCUMENT_KNOWLEDGE_AND_ANNOTATIONS` with:
```typescript
// Initial lightweight query
const { data: initialData, loading: initialLoading } = useQuery(
  GET_DOCUMENT_INITIAL,
  { variables: { documentId, corpusId } }
);

// Track visible pages from PDF component (zero-based indices)
const [visiblePages, setVisiblePages] = useState<number[]>([]);

// Progressive annotation loading
const { annotations, relationships } = useProgressiveAnnotations({
  documentId,
  corpusId,
  visiblePages,
  enabled: !initialLoading && initialData?.document,
  structural: undefined,
  analysisId: undefined,
});
```

#### 3.3.2 Update processAnnotationsData
**Lines 491-624**: Split into two functions:
```typescript
// Process initial data (summary + labels)
const processInitialData = (data) => {
  // Set corpus labels (one-time)
  // Set document metadata
  // Store annotation summary for UI hints
};

// Process page annotations incrementally
const processPageAnnotations = (pageData, pageNumbers) => {
  // Merge new annotations with existing
  // Update only affected pages in atoms
  // Preserve annotations from other pages
};
```

#### 3.3.3 Connect PDF viewport to loading
**Enhance PDF component** to expose visible pages:
```typescript
// In PDF.tsx, expose visible page range
useEffect(() => {
  onVisiblePagesChange?.(range);
}, [range]);
```

### Phase 4: Jump-to-Annotation Support (1 day)

#### 3.4.1 Handle direct annotation navigation
**Lines 1692-1696**: When `initialAnnotationIds` provided:
```typescript
useEffect(() => {
  if (initialAnnotationIds?.length > 0) {
    // 1. Query which page(s) contain these annotations
    // 2. Load those specific pages first
    // 3. Then proceed with normal selection
    loadAnnotationPages(initialAnnotationIds);
  }
}, [initialAnnotationIds]);
```

### Phase 5: Testing & Optimization (2 days)

#### 3.5.1 Performance Metrics
- Add timing instrumentation
- Track query counts
- Monitor memory usage

#### 3.5.2 Feature Flags
```typescript
const USE_PROGRESSIVE_LOADING =
  process.env.REACT_APP_PROGRESSIVE_LOADING === 'true';

// Allow fallback to old query during rollout
const query = USE_PROGRESSIVE_LOADING
  ? GET_DOCUMENT_INITIAL
  : GET_DOCUMENT_KNOWLEDGE_AND_ANNOTATIONS;
```

#### 3.5.3 Testing Adjustments for Progressive Loading
- Add unit tests around the new queries in `frontend/src/graphql/queries.ts` to ensure variables and selections match backend schema (`annotationSummary`, `pageAnnotations`, `pageRelationships`).
- Add integration tests for `DocumentKnowledgeBase` to verify:
  - Initial render issues only `GET_DOCUMENT_INITIAL` and does not fetch all annotations.
  - As the PDF viewport changes, `GET_PAGE_DATA` is fired with the correct page ranges and merges results into atoms without clearing unrelated pages.
  - Jump-to-annotation path loads specific pages first and then scrolls to the element.
- Add tests for hook behavior in `useProgressiveAnnotations` covering:
  - Deduplicated page loads across scrolls.
  - Respect of `enabled`, `structural`, and `analysisId` parameters.
  - Cache reset when corpus/document/analysis changes.

---

## 4. Risk Mitigation

### 4.1 Backwards Compatibility
- Keep old query functional during migration
- Feature flag for gradual rollout
- Both queries share same atoms/state structure

### 4.2 Edge Cases
- **Multi-page annotations**: Load all pages when annotation spans multiple
- **Relationships**: May connect annotations on different pages - load both endpoints
- **Search results**: Pre-load pages containing search matches
- **Analysis switching**: Clear page cache when analysis changes
 - **Structural-only views**: Respect `structural` filter in both annotations and relationships
 - **Permission changes**: Refetch summaries when user context changes

### 4.3 Cache Invalidation
```typescript
// Clear loaded pages when:
- Corpus changes
- Analysis changes
- Document changes
- User permissions change
```

---

## Key Code Cites

- Monolithic query definition: `frontend/src/graphql/queries.ts:2252-2388`
- Query consumption: `frontend/src/components/knowledge_base/document/DocumentKnowledgeBase.tsx:833-1032`
- Data processing: `DocumentKnowledgeBase.tsx:491-624`
- Viewport detection: `frontend/src/components/annotator/renderers/pdf/PDF.tsx:260-328`
- Backend support: `config/graphql/graphene_types.py:806-821`
- Performance targets: `docs/backlog/planned_backend_performance_improvements.md:109-116`
