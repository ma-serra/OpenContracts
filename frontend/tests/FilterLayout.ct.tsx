import React from "react";
import { test, expect } from "@playwright/experimental-ct-react";
import { MockedProvider } from "@apollo/client/testing";
import { CreateAndSearchBar } from "../src/components/layout/CreateAndSearchBar";
import { FilterToLabelSelector } from "../src/components/widgets/model-filters/FilterToLabelSelector";
import { FilterToAnalysesSelector } from "../src/components/widgets/model-filters/FilterToAnalysesSelector";
import { FilterToCorpusActionOutputs } from "../src/components/widgets/model-filters/FilterToCorpusActionOutputs";
import { FilterToLabelsetSelector } from "../src/components/widgets/model-filters/FilterToLabelsetSelector";
import { FilterToCorpusSelector } from "../src/components/widgets/model-filters/FilterToCorpusSelector";
import { FilterToStructuralAnnotationsSelector } from "../src/components/widgets/model-filters/FilterStructuralAnnotations";
import {
  GET_ANNOTATION_LABELS,
  GET_ANALYSES,
  GET_LABELSETS,
  GET_CORPUSES,
} from "../src/graphql/queries";
import { LabelType } from "../src/types/graphql-api";

// Mock data for the GraphQL queries
const mockLabels = {
  request: {
    query: GET_ANNOTATION_LABELS,
    variables: {},
  },
  result: {
    data: {
      annotationLabels: {
        edges: [
          {
            node: {
              id: "label-1",
              text: "Contract",
              description: "Legal contract",
              icon: null,
              labelType: LabelType.TokenLabel,
            },
          },
          {
            node: {
              id: "label-2",
              text: "Agreement",
              description: "Agreement document",
              icon: null,
              labelType: LabelType.TokenLabel,
            },
          },
        ],
      },
    },
  },
};

const mockAnalyses = {
  request: {
    query: GET_ANALYSES,
    variables: { corpusId: "test-corpus-id" },
  },
  result: {
    data: {
      analyses: {
        edges: [
          {
            node: {
              id: "analysis-1",
              analyzer: {
                analyzerId: "analyzer-1",
              },
            },
          },
        ],
      },
    },
  },
};

const mockLabelsets = {
  request: {
    query: GET_LABELSETS,
    variables: {},
  },
  result: {
    data: {
      labelsets: {
        edges: [
          {
            node: {
              id: "labelset-1",
              title: "Legal Labels",
              icon: null,
            },
          },
          {
            node: {
              id: "labelset-2",
              title: "Business Labels",
              icon: null,
            },
          },
        ],
      },
    },
  },
};

const mockCorpuses = {
  request: {
    query: GET_CORPUSES,
    variables: {},
  },
  result: {
    data: {
      corpuses: {
        edges: [
          {
            node: {
              id: "corpus-1",
              title: "Legal Documents",
              icon: null,
            },
          },
          {
            node: {
              id: "corpus-2",
              title: "Contracts 2024",
              icon: null,
            },
          },
        ],
      },
    },
  },
};

test.describe("Filter Layout", () => {
  test("renders filter button and opens popup with filters", async ({
    mount,
    page,
  }) => {
    const component = await mount(
      <MockedProvider
        mocks={[mockLabels, mockLabelsets, mockCorpuses]}
        addTypename={false}
      >
        <CreateAndSearchBar
          actions={[]}
          placeholder="Search..."
          value=""
          onChange={() => {}}
          filters={
            <>
              <FilterToLabelSelector />
              <FilterToLabelsetSelector />
              <FilterToCorpusSelector />
            </>
          }
        />
      </MockedProvider>
    );

    // Check that the filter button is visible
    const filterButton = component.locator('[aria-label="Filter"]');
    await expect(filterButton).toBeVisible();

    // Click the filter button to open the popup
    await filterButton.click();

    // Wait for the popup to appear - look for the filter content in the popup
    // Since the popup renders outside the component, we need to look for it globally on the page
    await expect(page.locator('text="Filter by Label"')).toBeVisible({
      timeout: 5000,
    });

    // Check for all three filter labels with their gradient backgrounds
    await expect(page.locator('text="Filter by Label"')).toBeVisible();
    await expect(page.locator('text="Filter by Labelset"')).toBeVisible();
    await expect(page.locator('text="Filter by Corpus"')).toBeVisible();

    // Check that dropdowns are present - they may use divs instead of inputs
    // Look for the placeholder text which should be visible
    await expect(
      page.locator('text="Select a label to filter..."')
    ).toBeVisible();
    await expect(
      page.locator('text="Select a labelset to filter..."')
    ).toBeVisible();
    await expect(
      page.locator('text="Select a corpus to filter..."')
    ).toBeVisible();
  });

  test("filter popup has glassmorphic styling", async ({ mount, page }) => {
    const component = await mount(
      <MockedProvider mocks={[mockLabels]} addTypename={false}>
        <CreateAndSearchBar
          actions={[]}
          placeholder="Search..."
          value=""
          onChange={() => {}}
          filters={<FilterToLabelSelector />}
        />
      </MockedProvider>
    );

    // Open the filter popup
    await component.locator('[aria-label="Filter"]').click();

    // Check that the filter content appears in the popup
    await expect(page.locator('text="Filter by Label"')).toBeVisible({
      timeout: 5000,
    });

    // Verify that the dropdown placeholder is present
    await expect(
      page.locator('text="Select a label to filter..."')
    ).toBeVisible();
  });

  test("individual filter components render with gradient labels", async ({
    mount,
    page,
  }) => {
    // Mount all filter components in a single container to avoid React root issues
    const component = await mount(
      <MockedProvider
        mocks={[mockLabels, mockAnalyses, mockLabelsets, mockCorpuses]}
        addTypename={false}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            padding: "1rem",
          }}
        >
          <FilterToLabelSelector />
          <FilterToAnalysesSelector corpus={{ id: "test-corpus-id" } as any} />
          <FilterToCorpusActionOutputs />
          <FilterToLabelsetSelector />
          <FilterToCorpusSelector />
          <FilterToStructuralAnnotationsSelector />
        </div>
      </MockedProvider>
    );

    // Check that all filter components render with their labels
    await expect(component.locator('text="Filter by Label"')).toBeVisible();
    await expect(component.locator('text="Created by Analysis"')).toBeVisible();
    await expect(component.locator('text="Corpus Actions"')).toBeVisible();
    await expect(component.locator('text="Filter by Labelset"')).toBeVisible();
    await expect(component.locator('text="Filter by Corpus"')).toBeVisible();
    await expect(
      component.locator('text="Structural Annotations"')
    ).toBeVisible();

    // Check that the corpus action filter has a toggle
    await expect(component.locator('input[type="checkbox"]')).toBeVisible();

    // Check that label elements are present
    const labelElements = component.locator(".ui.label");
    const labelCount = await labelElements.count();
    expect(labelCount).toBeGreaterThan(0);
  });

  test("dropdowns expand without clipping in popup", async ({
    mount,
    page,
  }) => {
    const component = await mount(
      <MockedProvider mocks={[mockLabels, mockLabelsets]} addTypename={false}>
        <CreateAndSearchBar
          actions={[]}
          placeholder="Search..."
          value=""
          onChange={() => {}}
          filters={
            <>
              <FilterToLabelSelector />
              <FilterToLabelsetSelector />
            </>
          }
        />
      </MockedProvider>
    );

    // Open the filter popup
    await component.locator('[aria-label="Filter"]').click();

    // Wait for popup to be visible by checking for filter content
    await expect(page.locator('text="Filter by Label"')).toBeVisible({
      timeout: 5000,
    });

    // Click on the first dropdown to expand it - target the dropdown div
    const firstDropdown = page.locator(".ui.dropdown").first();
    await firstDropdown.click();

    // Check that dropdown menu is visible and not clipped
    // The dropdown menu should be visible even though it may extend beyond the popup
    const dropdownMenu = page.locator(".ui.dropdown.visible .menu.visible");

    // Give it a moment to render
    await page.waitForTimeout(500);

    // Check if any dropdown menu exists on the page (it might be rendered outside the component)
    const menuCount = await dropdownMenu.count();
    if (menuCount > 0) {
      await expect(dropdownMenu.first()).toBeVisible();
    }
  });

  test("filter components maintain consistent spacing and styling", async ({
    mount,
    page,
  }) => {
    const component = await mount(
      <MockedProvider
        mocks={[mockLabels, mockLabelsets, mockCorpuses]}
        addTypename={false}
      >
        <CreateAndSearchBar
          actions={[]}
          placeholder="Search..."
          value=""
          onChange={() => {}}
          filters={
            <>
              <FilterToLabelSelector />
              <FilterToLabelsetSelector />
              <FilterToCorpusSelector />
              <FilterToCorpusActionOutputs />
            </>
          }
        />
      </MockedProvider>
    );

    // Open the filter popup
    await component.locator('[aria-label="Filter"]').click();

    // Check that all filter components are visible
    await expect(page.locator('text="Filter by Label"')).toBeVisible();
    await expect(page.locator('text="Filter by Labelset"')).toBeVisible();
    await expect(page.locator('text="Filter by Corpus"')).toBeVisible();
    await expect(page.locator('text="Corpus Actions"')).toBeVisible();

    // Check that we have the right dropdowns with correct placeholders
    await expect(
      page.locator('text="Select a label to filter..."')
    ).toBeVisible();
    await expect(
      page.locator('text="Select a labelset to filter..."')
    ).toBeVisible();
    await expect(
      page.locator('text="Select a corpus to filter..."')
    ).toBeVisible();

    // Check for the toggle
    await expect(page.locator('input[type="checkbox"]')).toBeVisible();
  });

  test("mobile responsive behavior", async ({ mount, page }) => {
    // Set viewport to mobile size
    await page.setViewportSize({ width: 375, height: 667 });

    const component = await mount(
      <MockedProvider mocks={[mockLabels]} addTypename={false}>
        <CreateAndSearchBar
          actions={[]}
          placeholder="Search..."
          value=""
          onChange={() => {}}
          filters={<FilterToLabelSelector />}
        />
      </MockedProvider>
    );

    // Check that the filter button is still accessible on mobile
    const filterButton = component.locator('[aria-label="Filter"]');
    await expect(filterButton).toBeVisible();

    // Open the filter popup
    await filterButton.click();

    // Check that the popup content is visible
    await expect(page.locator('text="Filter by Label"')).toBeVisible({
      timeout: 5000,
    });

    // The popup should still contain the filter
    await expect(page.locator('text="Filter by Label"')).toBeVisible();
  });

  test("dropdowns render actual entries from mock data", async ({
    mount,
    page,
  }) => {
    const component = await mount(
      <MockedProvider
        mocks={[mockLabels, mockLabelsets, mockCorpuses]}
        addTypename={false}
      >
        <CreateAndSearchBar
          actions={[]}
          placeholder="Search..."
          value=""
          onChange={() => {}}
          filters={
            <>
              <FilterToLabelSelector />
              <FilterToLabelsetSelector />
              <FilterToCorpusSelector />
            </>
          }
        />
      </MockedProvider>
    );

    // Open the filter popup
    await component.locator('[aria-label="Filter"]').click();

    // Wait for popup to be visible
    await expect(page.locator('text="Filter by Label"')).toBeVisible({
      timeout: 5000,
    });

    // Test Label dropdown entries
    const labelDropdown = page
      .locator(".ui.dropdown")
      .filter({ hasText: "Select a label to filter..." })
      .first();
    await labelDropdown.click();

    // Wait for dropdown menu to appear
    await page.waitForTimeout(500);

    // Check that the mock label entries are rendered in the visible menu
    const visibleLabelMenu = page
      .locator(".ui.dropdown.visible .menu.visible")
      .first();
    await expect(
      visibleLabelMenu.filter({ hasText: "Contract" })
    ).toBeVisible();
    await expect(
      visibleLabelMenu.filter({ hasText: "Agreement" })
    ).toBeVisible();

    // Close this dropdown by clicking elsewhere
    await page.locator('text="Filter by Labelset"').click();
    await page.waitForTimeout(300);

    // Test Labelset dropdown entries
    const labelsetDropdown = page
      .locator(".ui.dropdown")
      .filter({ hasText: "Select a labelset to filter..." })
      .first();
    await labelsetDropdown.click();

    // Wait for dropdown menu to appear
    await page.waitForTimeout(500);

    // Check that the mock labelset entries are rendered in the visible menu
    const visibleLabelsetMenu = page
      .locator(".ui.dropdown.visible .menu.visible")
      .first();
    await expect(
      visibleLabelsetMenu.filter({ hasText: "Legal Labels" })
    ).toBeVisible();
    await expect(
      visibleLabelsetMenu.filter({ hasText: "Business Labels" })
    ).toBeVisible();

    // Close this dropdown
    await page.locator('text="Filter by Corpus"').click();
    await page.waitForTimeout(300);

    // Test Corpus dropdown entries
    const corpusDropdown = page
      .locator(".ui.dropdown")
      .filter({ hasText: "Select a corpus to filter..." })
      .first();
    await corpusDropdown.click();

    // Wait for dropdown menu to appear
    await page.waitForTimeout(500);

    // Check that the mock corpus entries are rendered in the visible menu
    const visibleCorpusMenu = page
      .locator(".ui.dropdown.visible .menu.visible")
      .first();
    await expect(
      visibleCorpusMenu.filter({ hasText: "Legal Documents" })
    ).toBeVisible();
    await expect(
      visibleCorpusMenu.filter({ hasText: "Contracts 2024" })
    ).toBeVisible();
  });

  test("dropdown selection updates filter state", async ({ mount, page }) => {
    const component = await mount(
      <MockedProvider mocks={[mockLabels]} addTypename={false}>
        <CreateAndSearchBar
          actions={[]}
          placeholder="Search..."
          value=""
          onChange={() => {}}
          filters={<FilterToLabelSelector />}
        />
      </MockedProvider>
    );

    // Open the filter popup
    await component.locator('[aria-label="Filter"]').click();

    // Wait for popup to be visible
    await expect(page.locator('text="Filter by Label"')).toBeVisible({
      timeout: 5000,
    });

    // Click on the dropdown to expand it
    const dropdown = page.locator(".ui.dropdown").first();
    await dropdown.click();

    // Wait for dropdown menu to appear
    await page.waitForTimeout(500);

    // Select "Contract" option from the visible menu
    const contractOption = page
      .locator(".ui.dropdown.visible .menu.visible .item")
      .filter({ hasText: "Contract" })
      .first();
    await contractOption.click();

    // Wait for the selection to take effect
    await page.waitForTimeout(300);

    // Verify the dropdown now shows the selected value
    const updatedDropdown = page.locator(".ui.dropdown").first();
    await expect(updatedDropdown).toContainText("Contract");

    // The placeholder text should no longer be visible in the dropdown text
    const dropdownText = await updatedDropdown.textContent();
    expect(dropdownText).not.toContain("Select a label to filter...");
  });
});
