import React from "react";
import { Segment } from "semantic-ui-react";
import styled from "styled-components";
import useWindowDimensions from "../hooks/WindowDimensionHook";

interface CardLayoutProps {
  children?: React.ReactChild | React.ReactChild[];
  Modals?: React.ReactChild | React.ReactChild[];
  BreadCrumbs?: React.ReactChild | null | undefined;
  SearchBar: React.ReactChild;
  style?: React.CSSProperties;
}

const StyledSegment = styled(Segment)`
  &.ui.segment {
    border: none;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    margin-bottom: 1rem;
    border-radius: 12px !important;
    background: #ffffff !important;
    transition: all 0.2s ease;

    &:hover {
      background: #ffffff !important;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);
    }

    /* Style for breadcrumb links */
    .breadcrumb {
      a {
        color: var(--text-primary, #1a2433);
        opacity: 0.85;
        transition: all 0.2s ease;

        &:hover {
          opacity: 1;
          transform: translateY(-1px);
        }
      }

      .active {
        color: var(--text-primary, #1a2433);
        font-weight: 500;
      }

      .divider {
        opacity: 0.5;
        margin: 0 0.5em;
      }
    }
  }
`;

const SearchBarWrapper = styled.div`
  width: 100%;
  margin-bottom: 1rem;
`;

const ScrollableSegment = styled(StyledSegment)`
  &.ui.segment {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    width: 100%;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: #888 #f1f1f1;
    border-radius: 12px !important;
    background: #ffffff !important;
    margin: 0;
    margin-top: 0;
    margin-left: 0;
    margin-right: 0;

    &:hover {
      background: #ffffff !important;
    }

    &::-webkit-scrollbar {
      width: 8px;
    }

    &::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 4px;
    }

    &::-webkit-scrollbar-thumb {
      background: #888;
      border-radius: 4px;
    }

    &::-webkit-scrollbar-thumb:hover {
      background: #555;
    }
  }
`;

export const CardLayout: React.FC<CardLayoutProps> = ({
  children,
  Modals,
  BreadCrumbs,
  SearchBar,
  style,
}) => {
  const { width } = useWindowDimensions();
  const use_mobile = width <= 400;
  const use_responsive = width <= 1000 && width > 400;

  return (
    <CardContainer
      width={width}
      className="CardLayoutContainer"
      style={{ ...style }}
    >
      {Modals}
      <SearchBarWrapper>{SearchBar}</SearchBarWrapper>
      {BreadCrumbs && (!use_mobile || width > 768) && (
        <StyledSegment attached secondary>
          {BreadCrumbs}
        </StyledSegment>
      )}
      <ScrollableSegment
        id="ScrollableSegment"
        style={{
          padding: use_mobile ? "0.75rem" : use_responsive ? "1rem" : "1rem",
          flex: 1,
          minHeight: 0,
          marginBottom: use_mobile ? "8px" : use_responsive ? "12px" : "20px",
        }}
        raised
        className="CardHolder"
      >
        {children}
      </ScrollableSegment>
    </CardContainer>
  );
};

type CardContainerArgs = {
  width: number;
};

const CardContainer = styled.div<CardContainerArgs>(({ width }) => {
  const baseStyling = `
    display: flex;
    width: 100%;
    flex: 1;
    flex-direction: column;
    justify-content: flex-start;
    align-items: stretch;
    overflow: hidden;
    background-color: #f0f2f5;
    min-height: 0;
    box-sizing: border-box;
  `;

  if (width <= 400) {
    return `
      ${baseStyling}
      padding: 8px;
      padding-bottom: 10px;
    `;
  } else if (width <= 1000) {
    return `
      ${baseStyling}
      padding: 12px;
      padding-bottom: 14px;
    `;
  } else {
    return `
      ${baseStyling}
      padding: 20px;
      padding-bottom: 22px;
    `;
  }
});

export default CardLayout;
