const DEFAULT_WORKING_DIR = "default-composable";

export function resolveWorkingDir(currentPrefix: string, workingDir: string): string {
  return workingDir || currentPrefix || DEFAULT_WORKING_DIR;
}
