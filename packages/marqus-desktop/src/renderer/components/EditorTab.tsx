import {
  faFile,
  faTimes,
  faThumbtack,
} from "@fortawesome/free-solid-svg-icons";
import { partial } from "lodash";
import React, {
  PropsWithChildren,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import styled from "styled-components";
import { Section } from "../../shared/ui/app";
import { m0, mr2, p2, px2, THEME } from "../css";
import { MouseDrag, useMouseDrag } from "../io/mouse";
import { getClosestAttribute } from "../utils/dom";
import { wasInsideFocusable } from "./shared/Focusable";
import { Icon } from "./shared/Icon";

export const EDITOR_SPACER_ATTRIBUTE = "data-editor-spacer";
export const EDITOR_TAB_ATTRIBUTE = "data-editor-tab";

export interface EditorTabProps {
  noteId: string;
  notePath: string;
  noteName: string;
  active?: boolean;
  isPinned?: boolean;
  isPreview?: boolean;
  onClick: (noteId: string) => void;
  onDoubleClick: (noteId: string) => void;
  onClose: (noteId: string) => void;
  onUnpin: (noteId: string) => void;
  onDrag: (noteId: string, drag: TabDrag) => void;
}

export type TabDrag =
  | { type: "absolute"; side: "left" | "right" }
  | { type: "relative"; noteId: string };

export function EditorTab(props: EditorTabProps): JSX.Element {
  const { noteId, noteName, notePath, active, isPinned } = props;

  const wrapper = useRef(null! as HTMLAnchorElement);
  useEffect(() => {
    if (active) {
      $(wrapper.current.parentElement!).scrollTo(wrapper.current, 0, {
        axis: "x",
      });
    }
  }, [active]);

  let action;
  if (isPinned) {
    const onUnpinClick = (ev: React.MouseEvent<HTMLElement>) => {
      // Need to stop prop otherwise it'll trigger onClick of tab.
      ev.stopPropagation();
      props.onUnpin(noteId);
    };

    action = (
      <StyledPinnedIcon
        icon={faThumbtack}
        title={`Unpin ${noteName}`}
        onClick={onUnpinClick}
      />
    );
  } else {
    const onDeleteClick = (ev: React.MouseEvent<HTMLElement>) => {
      // Need to stop prop otherwise it'll trigger onClick of tab.
      ev.stopPropagation();
      props.onClose(noteId);
    };

    action = (
      <StyledDeleteIcon
        icon={faTimes}
        onClick={onDeleteClick}
        className="delete"
        title={`Close ${noteName}`}
      />
    );
  }

  const [cursorEl, setCursorEl] = useState<JSX.Element | undefined>();
  const cursorElRef = useRef<HTMLDivElement | null>(null);
  const onDrag = useCallback(
    (drag: MouseDrag | null) => {
      if (!drag || drag.state === "dragCancelled") {
        setCursorEl(undefined);
        return;
      }

      const { clientX: mouseX, clientY: mouseY } = drag.event;
      if (drag.state === "dragging") {
        const el = cursorElRef.current;

        if (el) {
          const [offsetX, offsetY] = drag.initialOffset;

          el.style.left = `${mouseX - offsetX}px`;
          // Keep in sync with margin-top of StyledTab
          el.style.top = `${mouseY - offsetY - 8}px`;
        }
      } else if (drag.state === "dragStarted") {
        setCursorEl(
          <CursorFollower ref={cursorElRef}>
            <StyledTab active={active}>
              <FlexRow>
                <StyledNoteIcon icon={faFile} size="lg" />
                <StyledText isPreview={props.isPreview}>{noteName}</StyledText>
              </FlexRow>
            </StyledTab>
          </CursorFollower>,
        );
      } else if (drag.state === "dragEnded") {
        const endedOn = getEditorTabAttribute(drag.event.target as HTMLElement);
        if (endedOn != null) {
          props.onDrag(noteId, {
            type: "relative",
            noteId: endedOn,
          });
        } else if (wasInsideFocusable(drag.event, Section.EditorToolbar)) {
          const side = getEditorSpacerAttribute(
            drag.event.target as HTMLElement,
          );

          if (side) {
            props.onDrag(noteId, { type: "absolute", side });
          }
        }

        setCursorEl(undefined);
      }
    },
    [noteId, props, active, noteName],
  );

  useMouseDrag(wrapper, onDrag, { cursor: "grabbing" });

  return (
    <>
      <StyledWrapper
        {...{ [EDITOR_TAB_ATTRIBUTE]: noteId }}
        onClick={() => props.onClick(noteId)}
        onDoubleClick={() => props.onDoubleClick(noteId)}
      >
        <StyledTab ref={wrapper} title={notePath} active={active}>
          <FlexRow>
            <StyledNoteIcon icon={faFile} size="lg" />
            <StyledText isPreview={props.isPreview}>{noteName}</StyledText>
          </FlexRow>
          {action}
        </StyledTab>
      </StyledWrapper>
      {createPortal(cursorEl, document.body)}
    </>
  );
}

const CursorFollower = styled.div`
  position: absolute;
  pointer-events: none;
`;

const StyledWrapper = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
`;

const StyledNoteIcon = styled(Icon)`
  margin-right: 1rem;
  color: ${THEME.editor.toolbar.tabFont};
`;

const FlexRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  min-width: 0;
  user-select: none;
`;

const StyledTab = styled.a<{ active?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  width: 12rem;
  ${px2}
  ${mr2}
  margin-top: 0.8rem; // Add 3px for scrollbar
  margin-bottom: 0.5rem;

  border-radius: 0.4rem;
  height: 2.9rem;

  background-color: ${p =>
    p.active
      ? THEME.editor.toolbar.activeTabBackground
      : THEME.editor.toolbar.background};

  &:hover {
    background-color: ${THEME.editor.toolbar.hoveredTabBackground};

    .delete {
      display: block;
    }
  }
`;

const StyledText = styled.span<{ isPreview?: boolean }>`
  font-size: 1.2rem;
  font-weight: 500;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  min-width: 0;

  font-style: ${p => (p.isPreview ? "italic" : "normal")};
`;

const StyledDeleteIcon = styled(Icon)`
  border-radius: 0.4rem;
  ${p2}
  ${m0}
  color: ${THEME.editor.toolbar.deleteColor};

  &:hover {
    cursor: pointer;
    color: ${THEME.editor.toolbar.deleteHoverColor};
    background-color: ${THEME.editor.toolbar.deleteHoverBackground};
  }
`;

const StyledPinnedIcon = styled(Icon)`
  border-radius: 0.4rem;
  ${p2}
  ${m0}
  color: ${THEME.editor.toolbar.deleteColor};

  &:hover {
    cursor: pointer;
    color: ${THEME.editor.toolbar.unpinHoverColor};
    background-color: ${THEME.editor.toolbar.deleteHoverBackground};
  }
`;

export interface EditorSpacerProps {
  className?: string;
  side: SpacerSide;
}

export type SpacerSide = "left" | "right";

export function EditorSpacer(
  props: PropsWithChildren<EditorSpacerProps>,
): JSX.Element {
  const { className, side } = props;

  return (
    <StyledSpacer
      className={className}
      {...{ [EDITOR_SPACER_ATTRIBUTE]: side }}
    >
      {props.children}
    </StyledSpacer>
  );
}

const StyledSpacer = styled.div`
  display: inline-flex;
  height: 100%;
  flex-shrink: 0;
`;

export const getEditorTabAttribute = partial(
  getClosestAttribute,
  EDITOR_TAB_ATTRIBUTE,
);

export const getEditorSpacerAttribute = partial(
  getClosestAttribute,
  EDITOR_SPACER_ATTRIBUTE,
) as (el: HTMLElement) => SpacerSide | null;
