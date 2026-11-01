// ============================================================
// TOEFL iBT Reading Practice Test - Mock Set
// Test content and answer key. Edit this file to change items.
//
// HOW THE FORMAT WORKS
//
// Complete the Words ("complete" sections)
//   Write the paragraph as plain text. For each word with missing
//   letters, type the visible start of the word, then put the MISSING
//   letters in curly braces:   rep{ort}   ->  "rep" + 3 letter boxes.
//   The letters inside the braces are the correct answer.
//   Question numbers run in order from "firstQ".
//
// Multiple-choice questions
//   answer is the letter of the correct option ("A" to "D").
//
// Sentence-insertion questions ( type: "insert" )
//   The passage must contain the markers [A] [B] [C] [D].
//   The options are generated automatically (Location A to D).
//
// Passages
//   [A]-[D] show as insertion markers.
//   **word** shows as a highlighted vocabulary word.
//   In emails and posts, **text** shows as bold.
//
// "scored: false" marks items that are recorded but not counted in
// the score. Test takers are never told which items are unscored.
// ============================================================

const TEST_DATA = {
  modules: [
    // =========================================================
    // MODULE 1  (35 questions, about 20 minutes)
    // =========================================================
    {
      id: 1,
      label: "Module 1",
      minutes: 20,
      sections: [
        // ---- Questions 1-10 (scored) ----
        {
          id: "m1-complete-1",
          type: "complete",
          scored: true,
          firstQ: 1,
          text: `Green roofs are rooftops covered with soil and plants, and they are becoming more common in crowded cities. Researchers rep{ort} that th{ese} living roofs red{uce} the temperature inside build{ings} during summer, abs{orb} rainwater, and pro{vide} a habitat for birds and insects. Although install{ation} can be expen{sive}, many cities now offer financial supp{ort} to owners who build them. Over time, the savings on energy bills may off{set} the initial cost. Urban planners therefore see green roofs as a practical tool for making cities healthier and more sustainable.`
        },

        // ---- Questions 11-20 (unscored) ----
        {
          id: "m1-complete-2",
          type: "complete",
          scored: false,
          firstQ: 11,
          text: `Memory is the ability to store and recall information, and psychologists have studied it for well over a century. Researchers distin{guish} bet{ween} short-term memory, which holds a sma{ll} amo{unt} of information for a few sec{onds}, and long-term memory, which can last for many years. Information moves into long-term memory more eas{ily} when peo{ple} conn{ect} it to knowl{edge} they already have. For example, students who rel{ate} a new term to a personal experience usually remember it longer than those who simply repeat it. Therefore, effective study strategies focus on understanding rather than repetition.`
        },

        // ---- Questions 21-22 (scored): email ----
        {
          id: "m1-email",
          type: "email",
          scored: true,
          heading: "Read an email.",
          subject: "Photography workshop",
          paragraphs: [
            `Sofia Reyes,`,
            `Thank you for your interest in the Hartwell Library photography workshop.`,
            `The workshop is almost full, and your name is currently being held on a provisional list. To keep your place, please reply to this email by Thursday to confirm that you still plan to attend. After that, any unconfirmed places will be offered to other applicants.`,
            `Cameras and tripods can be borrowed at no charge. Memory cards are not provided, so please bring your own. The $5 materials fee should be paid online before the workshop.`,
            `Best regards,`,
            `Daniel Kim`
          ],
          questions: [
            {
              n: 21,
              prompt: `What can be inferred about Sofia Reyes' place in the workshop?`,
              options: [
                `Her registration has been cancelled.`,
                `Her place may go to someone else if she does not reply.`,
                `She must pay the fee before her place is secured.`,
                `She has already confirmed that she will attend.`
              ],
              answer: "B"
            },
            {
              n: 22,
              prompt: `What must Sofia Reyes bring to the workshop?`,
              options: [`A camera`, `A tripod`, `A memory card`, `A cash payment`],
              answer: "C"
            }
          ]
        },

        // ---- Questions 23-25 (scored): social media post ----
        {
          id: "m1-post",
          type: "post",
          scored: true,
          heading: "Read a social media post.",
          author: "Priya Nair",
          paragraphs: [
            `I can't believe the semester is almost over! Between lab reports and exam preparation, I barely left campus this term. Last weekend, though, the hiking club finally got me out of the library and into Yosemite National Park.`,
            `**Day 1: Trails and Viewpoints:** We began on the Mist Trail, which is famous for its waterfalls. The stone steps were slippery and the spray soaked everyone, but nobody cared. In the afternoon, we took a shuttle bus up to Glacier Point, where the whole valley lay far below us and clouds drifted beneath the railing.`,
            `**Day 2: Stargazing:** After dark, a park ranger led us into an open meadow. We lay on blankets and looked up. There were so many stars that I gave up trying to count them, and I felt wonderfully small.`,
            `More photos soon. Stay tuned!`,
            `#Hiking #Yosemite #WeekendAway #Adventure`
          ],
          questions: [
            {
              n: 23,
              prompt: `What is suggested about Priya's semester?`,
              options: [
                `She has already finished her final exams.`,
                `She has taken several trips with the hiking club.`,
                `She is studying to become a park ranger.`,
                `She did not have much free time for travel before last weekend.`
              ],
              answer: "D"
            },
            {
              n: 24,
              prompt: `What can be inferred about Glacier Point?`,
              options: [
                `It can only be reached on foot.`,
                `It is at a high elevation.`,
                `It is next to a waterfall.`,
                `It is usually covered by clouds.`
              ],
              answer: "B"
            },
            {
              n: 25,
              prompt: `Which statement best characterizes Priya's experience during the stargazing event?`,
              options: [
                `She was amazed by the number of stars she could see.`,
                `She was disappointed that clouds blocked her view.`,
                `She spent most of the evening taking photographs.`,
                `She learned to identify constellations from the ranger.`
              ],
              answer: "A"
            }
          ]
        },

        // ---- Questions 26-30 (unscored): academic passage 1 ----
        {
          id: "m1-passage-1",
          type: "passage",
          scored: false,
          heading: "Read an academic passage.",
          title: "The Silk Road",
          paragraphs: [
            `The Silk Road was not a single road but a vast network of trade routes that connected China with the Mediterranean world for well over a thousand years. [A] Merchants rarely traveled the whole distance themselves. [B] Instead, goods passed from one trader to the next, changing hands many times along the way. [C] Silk was the most celebrated product, but caravans also carried spices, glassware, precious metals, and horses. [D] Travel along these routes was **perilous**, since caravans crossed deserts, high mountain passes, and territory controlled by bandits. To reduce the risks, merchants relied on oasis towns, where they could rest, find water, and exchange goods in busy markets. Some of these towns, such as Samarkand, grew into wealthy cultural centers.`,
            `The Silk Road carried more than goods. Ideas, religions, technologies, and even diseases moved along the same routes. Buddhism spread from India into Central and East Asia, and Chinese inventions such as papermaking gradually reached the West. The exchange was not always peaceful or equal, however. Political conflicts often closed key sections, and merchants paid heavy taxes to the local rulers whose lands they crossed. Overland trade declined after the fifteenth century, when ocean routes provided a cheaper and safer way to move cargo between Asia and Europe.`
          ],
          questions: [
            {
              n: 26,
              prompt: `The word "perilous" in the passage is closest in meaning to`,
              options: [`expensive`, `exhausting`, `dangerous`, `unfamiliar`],
              answer: "C"
            },
            {
              n: 27,
              prompt: `Why does the author mention oasis towns?`,
              options: [
                `To argue that the towns were more important than the trade routes`,
                `To describe how merchants coped with the difficulties of travel`,
                `To explain why silk became the most popular product`,
                `To suggest that bandits rarely attacked caravans near cities`
              ],
              answer: "B"
            },
            {
              n: 28,
              prompt: `Which of the following is mentioned in the passage as having spread from India into Central and East Asia?`,
              options: [`Glassware`, `Papermaking`, `Horses`, `Buddhism`],
              answer: "D"
            },
            {
              n: 29,
              prompt: `What problem faced by merchants on the Silk Road is mentioned in the passage?`,
              options: [
                `Local rulers charged them heavy taxes.`,
                `Their goods were too fragile to carry.`,
                `Roman officials forbade the sale of silk.`,
                `They could not find buyers for spices.`
              ],
              answer: "A"
            },
            {
              n: 30,
              type: "insert",
              sentence: `As a result, a single piece of silk might be sold several times before it reached its final buyer.`,
              answer: "C"
            }
          ]
        },

        // ---- Questions 31-35 (scored): academic passage 2 ----
        {
          id: "m1-passage-2",
          type: "passage",
          scored: true,
          heading: "Read an academic passage.",
          title: "Bioluminescence in the Deep Ocean",
          paragraphs: [
            `[A] In the deep ocean, where sunlight cannot reach, many animals produce their own light, a phenomenon known as bioluminescence. [B] The answer lies in a chemical reaction in which a molecule called luciferin combines with oxygen. [C] The reaction releases energy mostly as light instead of heat, so the glow is often described as "cold light." [D] Some animals make the necessary chemicals themselves, while others house glowing bacteria in specialized organs.`,
            `Animals use bioluminescence in several ways. Some, such as the anglerfish, dangle a glowing organ in front of their mouths to **lure** smaller fish within reach. Others use light defensively: certain squid release a cloud of glowing fluid, which confuses predators and allows the squid to escape. A third group uses light to communicate; for example, some species flash distinctive patterns to find mates in the dark. Although biologists have studied the phenomenon for decades, the deep ocean remains largely unexplored, so many luminous species are probably still unknown to science.`
          ],
          questions: [
            {
              n: 31,
              prompt: `Which of the following is NOT mentioned as a way that animals use bioluminescence?`,
              options: [
                `Attracting smaller prey`,
                `Confusing predators`,
                `Locating mates`,
                `Warming their surroundings`
              ],
              answer: "D"
            },
            {
              n: 32,
              prompt: `What does the author indicate about the light produced by bioluminescence?`,
              options: [
                `It is released mostly as light with little heat.`,
                `It is produced only by animals that host bacteria.`,
                `It becomes brighter as animals dive deeper.`,
                `It can be seen from the ocean's surface.`
              ],
              answer: "A"
            },
            {
              n: 33,
              prompt: `The word "lure" in the passage is closest in meaning to`,
              options: [`trap`, `attract`, `warn`, `feed`],
              answer: "B"
            },
            {
              n: 34,
              prompt: `How does the squid's use of bioluminescence differ from the anglerfish's?`,
              options: [
                `The squid uses light to find mates, while the anglerfish uses it to hunt.`,
                `The squid makes its own light chemicals, while the anglerfish depends on bacteria.`,
                `The squid uses light for protection, while the anglerfish uses it to obtain food.`,
                `The squid glows continuously, while the anglerfish glows only briefly.`
              ],
              answer: "C"
            },
            {
              n: 35,
              type: "insert",
              sentence: `How is this possible?`,
              answer: "B"
            }
          ]
        }
      ]
    },

    // =========================================================
    // MODULE 2  (15 questions, about 9 minutes)
    // =========================================================
    {
      id: 2,
      label: "Module 2",
      minutes: 9,
      sections: [
        // ---- Questions 1-10 (scored) ----
        {
          id: "m2-complete-1",
          type: "complete",
          scored: true,
          firstQ: 1,
          text: `Pottery is one of the oldest human crafts, and it involves shaping clay into objects that are then hardened by heat. Potters of{ten} use a rota{ting} wheel to sh{ape} the clay, alth{ough} some objects are still formed enti{rely} by hand. Before firing, the surface can be decor{ated} with patt{erns} carved or pain{ted} by the artist. Finally, the object is hea{ted} in a kiln at very high tempera{tures} so that it becomes strong and waterproof. Pottery from ancient China, Greece, and Mesoamerica helps archaeologists understand how past societies lived, traded, and expressed their beliefs.`
        },

        // ---- Questions 11-15 (scored): academic passage ----
        {
          id: "m2-passage-1",
          type: "passage",
          scored: true,
          heading: "Read an academic passage.",
          title: "Behavioral Economics and Everyday Choices",
          paragraphs: [
            `Traditional economic theory assumes that people make decisions rationally, carefully weighing costs and benefits to choose the option that serves them best. [A] Behavioral economics challenges this assumption by combining insights from psychology with economic analysis. The field gained wide attention through the work of the psychologists Daniel Kahneman and Amos Tversky, whose experiments in the 1970s showed that people's choices are often shaped by mental shortcuts rather than by careful logic. [B]`,
            `One well-known finding is loss aversion: people feel the pain of losing something more strongly than the pleasure of gaining something of equal value. As a result, shoppers may refuse to switch to a cheaper provider because they worry about losing what is familiar. Another finding concerns default options. Because people tend to accept whatever is already selected, a default can strongly **sway** decisions on issues ranging from organ donation to retirement saving.`,
            `Governments and companies increasingly use these insights to design "nudges," small changes in how choices are presented that guide people toward better outcomes without restricting their freedom. [C] For example, when employees are enrolled in a retirement plan automatically, participation rises sharply, because few people take the trouble to opt out. [D]`,
            `Critics argue that nudges can be manipulative when people are unaware of them. Supporters respond that every choice must be presented in some way, so designers cannot avoid influencing people; the real question is whether they do so openly and in the interest of those affected.`
          ],
          questions: [
            {
              n: 11,
              prompt: `Why does the author mention Daniel Kahneman and Amos Tversky?`,
              options: [
                `To show that psychology and economics have always been treated as one field`,
                `To credit the researchers whose work brought attention to behavioral economics`,
                `To argue that their experiments were more reliable than traditional economic theory`,
                `To explain why the 1970s was the only important period in economics`
              ],
              answer: "B"
            },
            {
              n: 12,
              prompt: `According to the passage, why might a shopper refuse to switch to a cheaper provider?`,
              options: [
                `The shopper worries more about losing what is familiar than about saving money.`,
                `The shopper does not know that cheaper providers exist.`,
                `The shopper believes cheaper providers offer worse service.`,
                `The shopper is required by contract to stay.`
              ],
              answer: "A"
            },
            {
              n: 13,
              prompt: `The word "sway" in the passage is closest in meaning to`,
              options: [`delay`, `confuse`, `influence`, `limit`],
              answer: "C"
            },
            {
              n: 14,
              prompt: `What is NOT mentioned in the passage as a finding of behavioral economics?`,
              options: [
                `People dislike losses more than they like equal gains.`,
                `People tend to accept default options.`,
                `People rely on mental shortcuts when making decisions.`,
                `People make better choices when they have more information.`
              ],
              answer: "D"
            },
            {
              n: 15,
              type: "insert",
              sentence: `Participation is usually much lower when employees must sign up on their own.`,
              answer: "D"
            }
          ]
        }
      ]
    }
  ]
};
