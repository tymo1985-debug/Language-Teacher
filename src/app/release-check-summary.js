export function summarizeReleaseChecks(checks=[]){
  const blocking=checks.filter(check=>!check.ok&&!check.optional);
  const optionalUnavailable=checks.filter(check=>!check.ok&&check.optional);
  return {
    passed:blocking.length===0,
    blockingCount:blocking.length,
    optionalUnavailableCount:optionalUnavailable.length
  };
}
