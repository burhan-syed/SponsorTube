import Filter from 'bad-words'

export const filterTranscriptBadWords = (text:string) => {
  const filter = new Filter();
  const cleaned = filter.clean(text);

  //don't accept Transcripts with >= 5% bad word detection
  if(cleaned.split("*")?.length > Math.round(text.length*.05)){
    return false; 
  }
  return cleaned; 
}

export const checkAnnotationBadWords = (text:string) => {
  const filter = new Filter();
  if(text.includes("*") || filter.isProfane(text)){
    return true; 
  }
  return false; 
}