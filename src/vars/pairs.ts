export interface HypeNewPairs {
  [key: string]: {
    startTime: number;
    initialMC: number;
    pastBenchmark: number;
    launchMessageMain: number;
    launchMessageTest: number;
  };
}

export let hypeNewPairs: HypeNewPairs = {};
export let indexedTokens: string[] = [];
export let previouslyIndexedTokens: string[] = [];

export function setIndexedTokens(tokens: string[]) {
  previouslyIndexedTokens = indexedTokens;
  indexedTokens = tokens;
}

export function setHypeNewPairs(newHardSnipedTokens: HypeNewPairs) {
  hypeNewPairs = newHardSnipedTokens;
}
