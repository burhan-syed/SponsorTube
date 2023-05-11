import { useEffect, useRef, useState } from "react";
import Head from "next/head";
import type { NextPage } from "next";
import HomeNavBar from "@/components/home/HomeNavBar";
import Hero from "@/components/home/Hero";
import HeroBG from "@/components/home/HeroBG";
import HomeSectionsContainer from "@/components/home/HomeSectionsContainer";

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>SponsorTube | Indexing Sponsors Across YouTube</title>
        <meta name="description" content="" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="fixed top-0 z-50 w-full ">
        <HomeNavBar />
      </div>
      <div className="relative">
      <HeroBG />


        <section className="mx-auto w-full px-4 pt-16 sm:items-center md:px-[calc(5vw)] 2xl:max-w-[192rem]">
          <div className="relative flex md:mx-[5vw] ">
            <Hero />
          </div>
        </section>
      </div>

      <div className="mt-[10vw]">
        <HomeSectionsContainer>
          <section className="mx-auto w-full p-[5vw] sm:items-center md:px-[calc(5vw)] 2xl:max-w-[192rem]">
            <div className="md:px-[5vw]">
              <section className="flex w-full flex-col items-start gap-y-[5vw] md:flex-row md:justify-between md:gap-x-[5vw] md:gap-y-0">
                <h2 className="text-h2">
                  Lorem ipsum dolor sit amet consectetur adipisicing elit.{" "}
                </h2>
                <p className="text-p">
                  Lorem ipsum dolor sit amet consectetur adipisicing elit.{" "}
                </p>
              </section>
              <p>
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Animi
                nisi laboriosam corporis rerum assumenda. Perferendis eum
                similique voluptatibus necessitatibus sunt fugit nulla, iure
                ducimus vitae at reprehenderit, a fugiat impedit? Expedita optio
                consequatur cupiditate. Perferendis assumenda atque possimus hic
                porro odio ratione libero fugit, doloremque eveniet explicabo,
                eaque quae ea doloribus asperiores suscipit non ipsam, accusamus
                eius at enim minima? Doloribus voluptates eos temporibus vero
                officiis omnis vel iusto provident, fugiat sed explicabo!
                Commodi iusto modi placeat, adipisci repellat aliquam voluptas
                dolorem odio omnis aspernatur laboriosam nulla suscipit nihil
                quaerat? Perspiciatis consequuntur itaque obcaecati, veniam
                expedita et facilis vel numquam quos minus dolorem? Voluptate,
                est labore excepturi minus nihil cupiditate quis deserunt, eius
                rem molestiae iste ipsa aperiam tempora! Facere! Reiciendis ad
                tenetur modi adipisci quia voluptatibus obcaecati aperiam nulla
                voluptas blanditiis. A dolor reprehenderit accusantium? Quia,
                atque illo repellendus, inventore soluta, ut reiciendis unde
                quidem animi sapiente error officia? Aperiam eius et soluta
                fugiat ut incidunt molestias. Error pariatur mollitia ducimus
                sunt cupiditate dolore corporis, tenetur esse obcaecati unde
                veniam quidem repellendus minima quo aliquid, explicabo
                veritatis quod et? Dolor repudiandae obcaecati sit labore,
                voluptatibus totam impedit optio repellat dolores illo ad
                deleniti alias quod nulla corporis magnam a quae eum? Repellat
                ea perferendis distinctio dolores voluptatem, qui suscipit! Non
                voluptatum eligendi dolorem a cum commodi sit deserunt
                recusandae repellat? Quibusdam et repellat ipsam illum nam
                voluptatibus cumque veritatis voluptate qui voluptatem nesciunt
                mollitia quas, accusantium reprehenderit, nobis fugiat. Laborum
                nostrum repellat quas vero. Quos velit, ex ea officiis assumenda
                vero, inventore voluptate voluptatum libero nesciunt tempore
                explicabo amet culpa dolor eligendi exercitationem, quo
                cupiditate similique nulla reprehenderit voluptas. Eius,
                architecto veniam sit aperiam quas ipsum corporis quis ullam
                quos saepe asperiores veritatis eveniet similique blanditiis,
                laboriosam expedita eos recusandae cupiditate! Minus fugit
                blanditiis magni doloribus quas fugiat molestiae. Neque, sint
                sit aperiam ut obcaecati ipsam voluptates exercitationem fugit
                dignissimos, eum incidunt soluta quae recusandae repellendus
                odit, suscipit minima ab tempore distinctio? Repellat magnam
                recusandae voluptatum aut sunt perspiciatis. Est quisquam
                cupiditate itaque similique qui, autem ut nulla, repellat illo
                doloribus ullam amet minus vitae, odit quaerat sit? Eos
                temporibus sequi quasi quo a suscipit, eveniet aspernatur
                provident odit. Cupiditate quam nihil expedita nemo
                reprehenderit maiores error vero placeat temporibus neque sit
                adipisci tenetur totam perspiciatis laborum necessitatibus
                quibusdam, impedit autem quod ab magni dignissimos labore harum?
                Architecto, eum. Iste tempora quidem, nisi adipisci doloribus
                pariatur quia voluptas? Id vel incidunt non, distinctio tenetur
                quas reiciendis odit saepe corrupti omnis temporibus atque
                architecto fugiat iste, ullam cum maiores dolorum! Numquam nulla
                perferendis ad enim delectus? Debitis, odit! Itaque expedita
                ipsa quisquam a. Eius at voluptatibus dolore quod corporis
                pariatur alias cum quasi. Temporibus voluptates mollitia optio
                enim inventore aperiam? Placeat eligendi impedit maxime a,
                tenetur vero molestias inventore, officiis quam totam eos
                voluptatem temporibus quis perspiciatis soluta cupiditate ad
                aperiam adipisci nisi, laudantium nostrum id debitis tempora
                quidem. Veritatis! Ab saepe animi distinctio, accusamus tempore
                culpa modi et similique provident, quia iste corrupti eligendi
                quis sit vero omnis recusandae hic rerum alias quidem placeat
                corporis illo ratione accusantium. Possimus. Aut alias quo
                beatae aspernatur quia rem repellat eaque provident quae
                voluptates impedit, suscipit vero itaque omnis et earum totam
                sint vel dolorum adipisci rerum quis aliquid maxime eligendi!
                Tempora. Mollitia, ex et. Ducimus laborum explicabo
                exercitationem, quis voluptatum iusto eum similique officia
                aspernatur optio odit possimus non iure, officiis ratione. Rem
                magnam modi tempore deserunt dolorem asperiores molestias unde!
                Totam qui id amet nulla, nobis perspiciatis reprehenderit quasi
                voluptatum accusantium quas? Tempora nobis necessitatibus
                quaerat quasi explicabo iste, laborum, aspernatur, iusto
                asperiores quam illo nihil? Aliquid veniam accusamus fugit!
              </p>
            </div>
          </section>
        </HomeSectionsContainer>
      </div>
    </>
  );
};

export default Home;
