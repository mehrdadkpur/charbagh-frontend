const CURRENT_BRANCH_KEY = "currentBranchId";

export function getCurrentBranchId(): string | null {
  if (typeof window === "undefined") return null;

  return localStorage.getItem(CURRENT_BRANCH_KEY);
}

export function setCurrentBranchId(branchId: string): void {
  if (!branchId.trim()) {
    throw new Error("BranchId cannot be empty.");
  }

  localStorage.setItem(CURRENT_BRANCH_KEY, branchId);
  window.dispatchEvent(new Event("currentBranchChanged"));
}

export function clearCurrentBranchId(): void {
  localStorage.removeItem(CURRENT_BRANCH_KEY);
  window.dispatchEvent(new Event("currentBranchChanged"));
}