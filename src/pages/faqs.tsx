import HomeNavBar from "@/components/home/HomeNavBar";
import Accordion from "@/components/ui/common/accordion/Accordion";
import type { AccordionItemType } from "@/components/ui/common/accordion/Accordion";
import { NextPage } from "next";
import { BsInputCursorText } from "react-icons/bs";
import { MdEditNote } from "react-icons/md";

import Link from "next/link";

const faqGeneralItems: AccordionItemType[] = [
  {
    value: "data",
    trigger: "How does SponsorTube get its data?",
    content: (
      <p>
        We use a combination of four sources: <br />{" "}
        <ol className="list-decimal">
          <li>
            SponsorBlock helps us identify portions of each video that may
            include sponsor information in the form of ad reads.
          </li>
          <li>
            Various YouTube APIs helps us get data for general search, channel,
            video, and captions information.
          </li>
          <li>
            NLP models are used to parse and identify relevant information from
            captions from identified portions. We currently primarily prompt
            OpenAI’s GPT 3.5 model.
          </li>
          <li>Manual data entry by SponsorTube users and administration.</li>
        </ol>
      </p>
    ),
  },
  {
    value: "why",
    trigger: "Why was SponsorTube created?",
    content: (
      <p>
        {
          "SponsorTube was created out of curiosity to make sponsor information on YouTube more readily available for analysis. It was made by one individual (me!) as a hobby project."
        }
      </p>
    ),
  },
  {
    value: "contact",
    trigger: "How can I contact you?",
    content: (
      <p>
        You can contact me on{" "}
        <a
          target="_blank"
          rel="noreferrer"
          href="https://twitter.com/syedBrhn"
          className="text-th-callToAction hover:underline"
        >
          twitter
        </a>
        .
      </p>
    ),
  },
  {
    value: "beta",
    trigger: "Why is SponsorTube in beta?",
    content: (
      <p>{`SponsorTube is in testing and incomplete. Currently SponsorTube approaches the topic of sponsors on YouTube from the “ground up”: you can search for videos or channels and get sponsor information about a specific video or channel. I aim to provide a “top down” experience as well to search for brands and products and find relevant videos and channels. `}</p>
    ),
  },
  {
    value: "opensource",
    trigger: "Is SponsorTube open source?",
    content: (
      <p>
        Not currently but I plan on open sourcing this project in some time. You
        can find my public repositories{" "}
        <a
          rel="noreferrer"
          target="_blank"
          href="https://github.com/burhan-syed"
          className="text-th-callToAction hover:underline"
        >
          here
        </a>
        .
      </p>
    ),
  },
  {
    value: "channel_update",
    trigger: "Why isn't a channel or video updated with data?",
    content: (
      <p>
        There are a vast number of channels and videos on YouTube so not all
        channels and videos are automatically updated. In general only channels
        with frequent sponsored videos are prioritized in automatic scans.
        <br />
        Only recent channel videos are analyzed automatically. If a channel does
        not have any recent sponsored videos no sponsor information will be
        logged unless older videos are manually updated or a deep analysis is
        requested. Older videos will likely not be automatically updated with
        data but data can be updated manually or automatically upon relevant
        actions on the video page.{" "}
      </p>
    ),
  },
  {
    value: "channel_buttons",
    trigger: `How do I update a channel? What do the “Process Recent Videos” and “Sync Sponsors” buttons do in the “Process Channel” menu?`,
    content: (
      <p>
        {`Search for and navigate to a channel’s page. Then find the Process Channel and “Process Recent Videos” action. The most recent videos will be scanned and channel sponsors updated. This will also sync sponsors.`}
        <br />
        {`“Sync Sponsors” will update channel information with latest sponsor information from manual sponsor annotations.`}
        <br />
        {
          "These actions will queue the process and update after some time. Queue information can be found in the information tooltip found by the update button."
        }
      </p>
    ),
  },
  {
    value: "auto_video",
    trigger: `What does the "Auto annotate video" action do in a video?`,
    content: (
      <p>
        {
          "SponsorTube will automatically analyze the video for any sponsored segments and automatically extract the brands, products, offers, and urls in the spoken video transcript. "
        }
      </p>
    ),
  },
  {
    value: "auto_fail",
    trigger: "Why did automatic annotations fail?",
    content: (
      <p>
        {
          "If sponsored segments could not be found, are too long, or we can’t identify any sponsoring brands in the segments automatic annotations will fail. "
        }
      </p>
    ),
  },
];

const faqTranscriptAnnotations: AccordionItemType[] = [
  {
    value: "define_terms",
    trigger: "What is a segment, transcript, or annotation?",
    content: (
      <p>
        We define these terms as the following:
        <br />
        <ul>
          <li>{`A “segment” is a portion of the video dedicated to a sponsored ad read.`}</li>
          <li>{`A “transcript” is the spoken word taken from video captions during the segment.`}</li>
          <li>{`An “annotation” is an identification of a key information from the transcript such as the brands, products, offers, or urls relevant to the sponsor.`}</li>
        </ul>
      </p>
    ),
  },
  {
    value: "define_types",
    trigger: "What is a brand, product, offer of url?",
    content: (
      <p>
        These are the current annotation types on SponsorTube. We define these
        terms as the following: <br />
        <ul>
          <li>{`A “brand” is the identifying company sponsoring the segment. A brand must be identified with every annotation submission.`}</li>
          <li>{`A “product” is the specific item or service being promoted during the segment.`}</li>
          <li>{`An “offer” is the incentive being provided to engage with the sponsor. This is generally a discount.`}</li>
          <li>{`A “url” is the call to action link for the audience to follow and engage with the sponsor. This may also be a reference to the link such as the link “down below” in the description.`}</li>
        </ul>
      </p>
    ),
  },
  {
    value: "missing_segment",
    trigger: "What if a segment is missing from the video?",
    content: (
      <p>
        {`Understand that SponsorTube currently only identifies “sponsored”
        segments as defined in the `}
        <a
          href="https://wiki.sponsor.ajay.app/w/Guidelines"
          target="_blank"
          rel="noreferrer"
          className="text-th-callToAction hover:underline"
        >
          SponsorBlock Guidelines
        </a>
        {`This means
        that any segments that are unpaid or self promotions aren’t included.`}
        <br />
        If there is a missing segment submit it with SponsorBlock and check back
        later.{" "}
      </p>
    ),
  },
  {
    value: "invalid_segment",
    trigger: "What if there is an invalid segment in the video?",
    content: (
      <p>
        {`Sometimes we identify a segment with little or no spoken words. For example a segment with only text on the screen. In this case the transcript can be manually updated to denote what was presented during this section and accurately annotated.`}
        <br />
        {`If the segment is incorrectly captioned or annotated please leave a negative vote and fix the annotation manually.`}
        <br />
        {`If the segment is completely invalid and no sponsor information is available please check the `}{" "}
        <a
          href="https://wiki.sponsor.ajay.app/w/Guidelines"
          target="_blank"
          rel="noreferrer"
          className="text-th-callToAction hover:underline"
        >
          SponsorBlock Guidelines
        </a>
        {` and vote with SponsorBlock accordingly. We will be adding the ability to cast votes to SponsorBlock from SponsorTube at a later date.`}
      </p>
    ),
  },
  {
    value: "fix_annotation",
    trigger: "How do I fix or add a transcript or annotation?",
    content: (
      <p>
        First identify if there is an error with a misspelling in the transcript
        or inaccurate annotations. <br />
        {`If the transcript is invalid, press the “edit text” button (`}
        <BsInputCursorText className="inline" />
        {`) and correct the transcript. For more information on what a transcript should look like find the “What should the transcript look like” FAQ below.`}
        <br />
        {`If the annotations are invalid press the “annotate” button (`}
        <MdEditNote className="inline" />
        {`). Please note the transcript should be corrected prior to adding or fixing annotations. Then use the dropdown to select the type of annotation and highlight the relevant text in the transcript. To remove a highlighted annotation simply press on it. To quickly remove all instances of the highlighted annotation press the relevant button at the bottom of the transcript. All submitted annotations must have at least one brand identified.`}
      </p>
    ),
  },
  {
    value: "transcript_guidelines",
    trigger: "What should the transcript look like?",
    content: (
      <p>
        A transcript should generally include all spoken words within the given
        segments time-frame. Automatic transcripts generally will not include
        accurate punctuation. This is fine as long as information can be
        identified accurately. <br />
        {`Most often inaccuracies in transcripts lie in misspelling of an uncommon brand or product. These should be corrected. An automatic transcript may contain whole words for symbols (ie. “percent” instead of “%”) or will inaccurately spell a URL by missing a forward slash (”/”) or period (”.”). These should be corrected. `}
        <br />
        {`If the segment does not contain many spoken words if any and is denoting an on screen sponsor the transcript should generally be corrected to represent what was shown on screen during this time.`}
      </p>
    ),
  },
  {
    value: "transcript_length",
    trigger: "Why is the automatic transcript segment so long?",
    content: (
      <p>
        We identify segments as defined by the{" "}
        <a
          href="https://wiki.sponsor.ajay.app/w/Guidelines"
          target="_blank"
          rel="noreferrer"
          className="text-th-callToAction hover:underline"
        >
          SponsorBlock Guidelines
        </a>
        . This means the entire ad-read including transitions are included in
        the segment. In video captions are identified with blocks of time that
        generally do not align exactly with the SponsorBlock segments so the
        segment may be lengthened to match the caption time blocks and assure
        the entire ad read is included.
      </p>
    ),
  },
  {
    value: "annotations_guide",
    trigger: "What and how should I annotate?",
    content: (
      <p>
        {`Annotate any relevant brands, products, offers, or urls to the sponsor(s) of the segment. When annotating any repeat words will be automatically highlighted. If this conflicts with another annotation (for example a brand is identified in a url) the annotation should be replaced with the more specific identifier. Pressing on an annotation highlight will remove the specific annotation and pressing on the relevant annotation button towards the bottom of the transcript will remove all references to that annotation. `}
        <br />
        {`All segments must include at least one brand identified. At this time overlapping annotations are not supported. `}
        <br />
        {`Annotations will be summarized into a video sponsor with relations between the brand, product, offer, and url. At this time numerous different annotations of one identifier may not all be summarized. `}
      </p>
    ),
  },
  {
    value: "voting",
    trigger: "What does voting on segments do?",
    content: (
      <p>
        We use votes to identify the most accurate annotations and transcripts
        for each video. The highest voted annotations are used to summarize
        video sponsor information. <br />
        Voting on SponsorTube does not cast a vote for SponsorBlock.{" "}
      </p>
    ),
  },
  {
    value: "sponsor_summary",
    trigger:
      "Why do the identified information of a video not align exactly with the displayed segment annotations?",
    content: (
      <p>
        {
          "The identified sponsor information attempts to derive a relation between the sponsors, brands, products, and offers of a segment. If a segment contains more than one of these pieces of information it may not be included in the relation. This is a problem to be solved in the future."
        }
      </p>
    ),
  },
];

const Faqs: NextPage = () => {
  return (
    <>
      <div className="fixed top-0 z-50 w-full ">
        <HomeNavBar />
      </div>
      <section className="2xl:max-w-[192rem mx-auto w-full px-4 pt-16 sm:items-center md:px-[5vw]">
        <h1 className="text-h1">FAQs</h1>
        <h2 className="text-h2">General</h2>
        <Accordion items={faqGeneralItems} />
        <h2 className="text-h2">Transcripts & Annotations</h2>
        <Accordion items={faqTranscriptAnnotations} />
      </section>
      <div className="flex h-full flex-grow"></div>
    </>
  );
};

export default Faqs;
