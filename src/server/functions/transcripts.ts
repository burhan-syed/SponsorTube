export const getTranscriptsInTime = ({
  transcripts,
  times,
}: {
  transcripts: {
    start: number;
    dur: number;
    text: string | null;
  }[];
  times: { startTimeMS: number; endTimeMS: number };
}) => {
  const { startTimeMS, endTimeMS } = times;
  let transcriptStart = 0;
  let transcriptEnd = 0;
  const transcript = transcripts.map((line, i) => {
    if (
      //capture all possible transcripts in the time period
      ((transcripts?.[i - 1]?.start ?? 0) +
        (transcripts?.[i - 1]?.dur ?? 0) >=
        startTimeMS ||
        line.start + line.dur >= startTimeMS ||
        line.start >= startTimeMS) &&
      line.start <= endTimeMS
    ) {
      if (transcriptStart === 0) {
        transcriptStart =
          (transcripts?.[i - 1]?.start ?? 0) +
            (transcripts?.[i - 1]?.dur ?? 0) >=
          startTimeMS
            ? transcripts?.[i - 1]?.start ?? 0 
            : line.start;
      }
      transcriptEnd = (line.start + line.dur);// / 1000;
      return line.text;
    }
    return "";
  });
  const transcriptsInTime = transcript.filter((l) => l && l?.length > 0)
  return {
    transcript: transcriptsInTime.join(" "),
    runs: transcriptsInTime,
    transcriptStart,
    transcriptEnd,
  };
};
