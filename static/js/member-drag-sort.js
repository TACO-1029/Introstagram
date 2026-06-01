const memberOrderStorageKey = "introstagram-member-order";
const teamCard = document.querySelector(".team-card");

let draggedMemberRow = null;
let dragStartX = 0;
let dragStartY = 0;
let didDragMemberRow = false;
let suppressMemberRowClick = false;

function getMemberRows() {
  return Array.from(teamCard?.querySelectorAll(".member-row") || []);
}

function saveMemberOrder() {
  const memberOrder = getMemberRows()
    .map((row) => row.dataset.memberId)
    .filter(Boolean);

  localStorage.setItem(memberOrderStorageKey, JSON.stringify(memberOrder));
}

function restoreMemberOrder() {
  if (!teamCard) return;

  let savedOrder = [];

  try {
    savedOrder = JSON.parse(localStorage.getItem(memberOrderStorageKey)) || [];
  } catch {
    savedOrder = [];
  }

  if (!savedOrder.length) return;

  const rowsById = new Map(getMemberRows().map((row) => [row.dataset.memberId, row]));
  const fragment = document.createDocumentFragment();

  savedOrder.forEach((memberId) => {
    const row = rowsById.get(memberId);

    if (row) {
      fragment.append(row);
      rowsById.delete(memberId);
    }
  });

  rowsById.forEach((row) => fragment.append(row));
  teamCard.append(fragment);
}

function getRowAfterPointer(y) {
  const sortableRows = getMemberRows().filter((row) => row !== draggedMemberRow);

  return sortableRows.reduce(
    (closest, row) => {
      const box = row.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;

      if (offset < 0 && offset > closest.offset) {
        return { offset, row };
      }

      return closest;
    },
    { offset: Number.NEGATIVE_INFINITY, row: null },
  ).row;
}

function handleDragStart(event) {
  draggedMemberRow = event.currentTarget;
  dragStartX = event.clientX;
  dragStartY = event.clientY;
  didDragMemberRow = false;
  draggedMemberRow.classList.add("dragging");
  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.setData("text/plain", draggedMemberRow.dataset.memberId || "");
}

function handleDragOver(event) {
  if (!draggedMemberRow) return;

  event.preventDefault();

  if (
    Math.abs(event.clientX - dragStartX) > 3 ||
    Math.abs(event.clientY - dragStartY) > 3
  ) {
    didDragMemberRow = true;
  }

  const afterRow = getRowAfterPointer(event.clientY);

  if (afterRow) {
    teamCard.insertBefore(draggedMemberRow, afterRow);
    return;
  }

  teamCard.append(draggedMemberRow);
}

function handleDragEnd() {
  draggedMemberRow?.classList.remove("dragging");

  if (didDragMemberRow) {
    saveMemberOrder();
    suppressMemberRowClick = true;
  }

  window.setTimeout(() => {
    didDragMemberRow = false;
    draggedMemberRow = null;
    suppressMemberRowClick = false;
  }, 180);
}

function bindMemberDragSort() {
  if (!teamCard) return;

  restoreMemberOrder();

  getMemberRows().forEach((row) => {
    row.addEventListener("dragstart", handleDragStart);
    row.addEventListener("dragend", handleDragEnd);
    row.addEventListener("click", (event) => {
      if (didDragMemberRow || suppressMemberRowClick) {
        event.preventDefault();
      }
    });
  });

  teamCard.addEventListener("dragover", handleDragOver);
}

bindMemberDragSort();
