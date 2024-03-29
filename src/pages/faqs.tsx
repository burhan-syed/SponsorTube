import HomeNavBar from "@/components/home/HomeNavBar";
import Accordion from "@/components/ui/common/accordion/Accordion";
import type { AccordionItemType } from "@/components/ui/common/accordion/Accordion";
import { NextPage } from "next";
import Head from "next/head";
import { BsInputCursorText } from "react-icons/bs";
import { MdEditNote } from "react-icons/md";
import { cn } from "@/utils/cn";

const faqGeneralItems: AccordionItemType[] = [
  {
    value: "data",
    trigger: "How does SponsorTube get its data?",
    content: (
      <>
        <p>
          We use a combination of four sources: <br />
        </p>
        <ol className="text-base lg:text-lg">
          <li>
            <a
              href="https://sponsor.ajay.app/"
              target="_blank"
              rel="noreferrer"
            >
              Sponsorblock
            </a>{" "}
            helps us identify portions of each video that may include sponsor
            information.
          </li>
          <li>
            Various wrappers around YouTube APIs such as{" "}
            <a
              href="https://github.com/LuanRT/YouTube.js"
              target="_blank"
              rel="noreferrer"
            >
              YouTube.js
            </a>{" "}
            help us get data for general search, channel, video, and captions
            information.
          </li>
          <li>
            NLP models are used to parse and identify relevant information in
            video captions. Currently, we primarily prompt a fine tuned OpenAI GPT 3.5
            model.
          </li>
          <li>Manual data entry by SponsorTube users and administration.</li>
        </ol>
      </>
    ),
  },
  // {
  //   value: "contact",
  //   trigger: "How can I contact you?",
  //   content: (
  //     <p>
  //       You can find me on{" "}
  //       <a
  //         target="_blank"
  //         rel="noreferrer"
  //         href="https://twitter.com/syedBrhn"
  //         className="text-th-callToAction hover:underline"
  //       >
  //         X
  //       </a>{" "}
  //       or <a
  //         target="_blank"
  //         rel="noreferrer"
  //         href="https://github.com/burhan-syed"
  //         className="text-th-callToAction hover:underline"
  //       >
  //         GitHub
  //       </a>
  //       .
  //     </p>
  //   ),
  // },
  // {
  //   value: "beta",
  //   trigger: "Why is SponsorTube in beta?",
  //   content: (
  //     <p>{`SponsorTube is in testing and incomplete. Currently, SponsorTube approaches the topic of sponsors from the “ground up”. That is, you can search for videos or channels and get sponsor information about a specific video or channel. I aim to provide a “top down” experience as well to search for brands and products and find relevant videos and channels. `}</p>
  //   ),
  // },
  // {
  //   value: "opensource",
  //   trigger: "Is SponsorTube open source?",
  //   content: (
  //     <p>
  //       Not currently but I plan on open sourcing this project in some time. You
  //       can find my public repositories{" "}
  //       <a
  //         rel="noreferrer"
  //         target="_blank"
  //         href="https://github.com/burhan-syed"
  //         className="text-th-callToAction hover:underline"
  //       >
  //         here
  //       </a>
  //       .
  //     </p>
  //   ),
  // },
  {
    value: "channel_update",
    trigger: "Why isn't a channel or video updated with data?",
    content: (
      <p>
        There are a vast number of channels and videos on YouTube so not all
        channels and videos are automatically updated. In general only channels
        with frequent sponsored videos are prioritized in automatic scans.
        <br />
        To minimize cost only recent channel videos are automatically analyzed.
        If a channel does not have any recently sponsored videos no sponsor
        information will be logged. Older videos can be manually updated or a
        deep analysis requested to update channel information.
      </p>
    ),
  },
  {
    value: "channel_buttons",
    trigger: `How do I update a channel? What do the “Process Recent Videos” and “Sync Sponsors” buttons do in the “Process Channel” menu?`,
    content: (
      <p>
        {`To update a channel search for and navigate to a channel’s page. Then find the Process Channel and “Process Recent Videos” action. The most recent videos will be scanned and channel sponsors updated. This will also sync sponsors.`}
        <br />
        {`“Sync Sponsors” will update channel information with latest sponsor information from manual sponsor annotations.`}
        <br />
        {
          "These actions will queue the process and update after some time. This usually takes about 30 seconds but may exceed 5 minutes depending on load. Queue information can be found in the information tooltip found by the update button."
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
          "SponsorTube will analyze the video for any sponsored segments and automatically extract the brands, products, offers, codes, and urls in the spoken video transcript. "
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
      <>
        <p>
          We define these terms as the following:
          <br />
        </p>
        <ul className="text-base lg:text-lg">
          <li>{`A “segment” is a portion of the video dedicated to a sponsored ad read.`}</li>
          <li>{`A “transcript” is the spoken word taken from video captions during the segment.`}</li>
          <li>{`An “annotation” is an identification of a key information from the transcript such as the brands, products, offers, codes, or urls relevant to the sponsor.`}</li>
        </ul>
      </>
    ),
  },
  {
    value: "define_types",
    trigger: "What is a brand, product, offer, code or url?",
    content: (
      <>
        <p>
          These are the current annotation types on SponsorTube. We define these
          terms as the following: <br />
        </p>
        <ul className="text-base lg:text-lg">
          <li>{`A “brand” is the identifying company sponsoring the segment. A brand must be identified with every annotation submission.`}</li>
          <li>{`A “product” is the specific item or service being promoted during the segment.`}</li>
          <li>{`An “offer” is the incentive being provided to engage with the sponsor. This is generally a discount.`}</li>
          <li>{`A "code" is a coupon code or other keyword to be provided while engaging with the sponsor for some additional incentive. This code is generally unique to the video's author. `}</li>
          <li>{`A “url” is the call to action link for the audience to follow and engage with the sponsor. This may also be a reference to the link such as the link “down below” in the description.`}</li>
        </ul>
      </>
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
        {`. This means
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
        {` and vote with SponsorBlock accordingly. Note that votes cast on SponsorTube segments annotations are specific to SponsorTube and do not affect votes on SponsorBlock.`}
      </p>
    ),
  },
  {
    value: "fix_annotation",
    trigger: "How do I fix or add a transcript or annotation?",
    content: (
      <p>
        First, identify if there is an error with a misspelling in the
        transcript or inaccurate annotations. <br />
        {`If the transcript is invalid, press the “edit text” button `}
        {
          <span className="inline-flex items-center">
            {`(`}
            <BsInputCursorText />
            {`)`}
          </span>
        }
        {` and correct the transcript. For more information on what a transcript should look like find the “What should the transcript look like” FAQ below.`}
        <br />
        {`If the annotations are invalid press the “annotate” button `}
        {
          <span className="inline-flex items-center">
            {`(`}
            <MdEditNote />
            {`)`}
          </span>
        }
        {`. Note the transcript should be corrected prior to adding or fixing annotations. Use the dropdown to select the type of annotation and highlight the relevant text in the transcript. To remove a highlighted annotation simply press on it. To quickly remove all instances of the highlighted annotation press the relevant button at the bottom of the transcript. All submitted annotations must have at least one brand identified.`}
        <br />
        {`Annotating on touch devices is not currently fully supported.`}
      </p>
    ),
  },
  {
    value: "transcript_guidelines",
    trigger: "What should the transcript look like?",
    content: (
      <p>
        In general, a transcript should include all spoken words within the
        given segments time-frame. Automatic transcripts generally will not
        include accurate punctuation. This is fine as long as information can be
        identified accurately. <br />
        {`Most often inaccuracies in transcripts lie in misspelling of an uncommon brand or product. These should be corrected. An automatic transcript may contain whole words for symbols (ie. “percent” instead of “%”) or will inaccurately spell a URL by missing a forward slash (”/”) or period (”.”). These should be corrected. `}
        <br />
        {`If the segment does not contain spoken words and instead identifies an on screen sponsor the transcript should generally be corrected to represent what was shown on screen during this time.`}
      </p>
    ),
  },
  {
    value: "transcript_length",
    trigger:
      "Why is transcript segment so long / why do times not match with SponsorBlock?",
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
        generally do not align exactly with the SponsorBlock segments. To assure
        the entire ad read is included in the transcript the segment may be
        lengthened to match the caption time blocks.
      </p>
    ),
  },
  {
    value: "annotations_guide",
    trigger: "What and how should I annotate?",
    content: (
      <p>
        {`Annotate any relevant brands, products, offers, codes, or urls to the sponsor(s) of the segment. When annotating any repeat words will be automatically highlighted. If this conflicts with another annotation (for example a brand is identified in a url) the annotation should be replaced with the more specific identifier. Pressing on an annotation highlight will remove the specific annotation and pressing on the relevant annotation button towards the bottom of the transcript will remove all references to that annotation. `}
        <br />
        {`All segments must include at least one brand identified. At this time overlapping annotations are not supported. `}
        <br />
        {`Annotations will be summarized into a video sponsor with relations between the brand, product, offer, and url. At this time numerous different annotations of one identifier may not all be summarized. `}
      </p>
    ),
  },
  {
    value: "noform",
    trigger:
      "Why are transcripts and annotations used instead of a more traditional form?",
    content: (
      <p>{`Transcripts and annotations help us assure validity of the sponsor information being identified. This is especially important when applying automatic annotations with general language models as they can hallucinate. In the future we may provide a more traditional form for manual sponsor identification. `}</p>
    ),
  },
  {
    value: "voting",
    trigger: "What does voting on segments do?",
    content: (
      <p>
        We use votes to identify the most accurate annotations and transcripts
        for each video. <br />
        When submitting an altered annotation or transcript we first identify if
        any previous submissions are equivalent. If any are found we increment
        the vote count on the prior submission instead of creating a new one. In
        this way unanimous submissions are elevated. <br /> If a manual
        submission exceeds a certain number of votes it is used to summarize the
        video sponsor and displayed as the top submission. Otherwise the
        automatic annotations are used. Voting on SponsorTube does not cast a
        vote for SponsorBlock.{" "}
      </p>
    ),
  },
  {
    value: "sponsor_summary",
    trigger:
      "Why does the summarized video sponsor information not align exactly with the displayed segment annotations?",
    content: (
      <p>
        {
          "The identified sponsor information attempts to derive a relation between the sponsors, brands, other key annotations in a segment. If a segment contains more than one of these pieces of information it may not be included in the relation. This is a problem to be solved in the future."
        }
      </p>
    ),
  },
];

const Faqs: NextPage = () => {
  return (
    <>
      <Head>
        <title>{"FAQs | SponsorTube"}</title>
        <meta name="description" content="SponsorTube FAQs" />
      </Head>
      <div className="fixed top-0 z-50 w-full ">
        <HomeNavBar noinvert={true} />
      </div>
      <section
        className={cn(
          "mx-auto w-full px-[5vw] py-20 2xl:max-w-[192rem]",
          "prose max-w-full prose-headings:font-normal prose-h3:my-1 prose-p:text-base  prose-p:leading-relaxed prose-p:text-th-textSecondary prose-a:text-th-callToAction prose-a:no-underline hover:prose-a:underline prose-p:lg:text-lg"
        )}
      >
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
