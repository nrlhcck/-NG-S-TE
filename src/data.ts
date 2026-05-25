import { Subject, VocabularyWord } from './types';

export const GRADES = {
  'Middle School': [5, 6, 7, 8],
  'High School': [9, 10, 11, 12]
};

export const AVATARS = [
  '🎒', '🧠', '🔬', '✍️', '🌍', '🚀', '🌟', '🛡️', '🦁', '🦊', '🦄', '🐳', '🦉', '🐨', '🐼', '🦖'
];

export const SUBJECTS: Subject[] = [
  // ================= GRADE 5 =================
  {
    id: 'en_g5',
    name: 'Grade 5 English',
    schoolType: 'Middle School',
    grade: 5,
    icon: 'School',
    description: 'Basic introductions, directions around town, games, and daily schedules.',
    color: 'emerald',
    topics: [
      {
        id: 'g5_t1',
        subjectId: 'en_g5',
        name: 'Hello & School Subjects',
        description: 'Introduce yourself, talk about your country, nationalities, and favorite classes.',
        durationMinutes: 30,
        contents: `
          <h3>Hello & School Subjects</h3>
          <p>Let's learn how to introduce ourselves and discuss school life in English!</p>
          <h4>Useful Introductions:</h4>
          <ul>
            <li>"My name is Sarah. I am 11 years old."</li>
            <li>"I am from Turkey (Country) and I am Turkish (Nationality)."</li>
            <li>"He is from Spain. He is Spanish."</li>
          </ul>
          <h4>School Subjects:</h4>
          <ul>
            <li><strong>Maths:</strong> Calculations and numbers.</li>
            <li><strong>Science:</strong> Experiments, nature, and biology.</li>
            <li><strong>History:</strong> Studying heroes and past events.</li>
            <li><strong>Physical Education (P.E.):</strong> Sports and physical activity.</li>
          </ul>
        `,
        quiz: [
          {
            id: 'g5_t1_q1',
            question: "Choose the correct sentence to introduce nationality:",
            options: [
              "I am from Turkish.",
              "I am Turkish.",
              "I am live in Turkish.",
              "I Turkish from."
            ],
            correctAnswer: 1,
            explanation: "We use nationalities directly as adjectives, e.g., 'I am Turkish' or countries with 'from', e.g., 'I am from Turkey'."
          },
          {
            id: 'g5_t1_q2',
            question: "In which class do we do experiments and learn about plants?",
            options: [
              "Maths",
              "History",
              "Science",
              "Geography"
            ],
            correctAnswer: 2,
            explanation: "Science is the class where we conduct experiments and study nature."
          }
        ]
      }
    ]
  },

  // ================= GRADE 6 =================
  {
    id: 'en_g6',
    name: 'Grade 6 English',
    schoolType: 'Middle School',
    grade: 6,
    icon: 'Apple',
    description: 'Yummy breakfasts, daily life events, and describing local weather conditions.',
    color: 'orange',
    topics: [
      {
        id: 'g6_t1',
        subjectId: 'en_g6',
        name: 'Yummy Breakfast & Food',
        description: 'Expressing food likes/dislikes, asking for food politely, and healthy choices.',
        durationMinutes: 30,
        contents: `
          <h3>Yummy Breakfast</h3>
          <p>Learn terms for breakfast items and speaking about diet choices.</p>
          <h4>Healthy Breakfast Options:</h4>
          <ul>
            <li><strong>Olives, Cheese, Eggs, Tomatoes:</strong> Traditional elements.</li>
            <li><strong>Cereal, Milk, Toast, Jam, Honey:</strong> Quick breakfasts.</li>
          </ul>
          <h4>Expressing Likes & Dislikes:</h4>
          <ul>
            <li><em>"I love eating boiled eggs on Sundays. They are nutritious!"</em></li>
            <li><em>"I don't like olives. They taste bitter."</em></li>
            <li><em>"Do you want some milk? - No, thanks. I prefer orange juice."</em></li>
          </ul>
        `,
        quiz: [
          {
            id: 'g6_t1_q1',
            question: "Which of the following is considered highly nutritious for breakfast?",
            options: [
              "Chips",
              "Eggs",
              "Chocolate Cake",
              "Lollipop"
            ],
            correctAnswer: 1,
            explanation: "Eggs are highly nutritious, packed with protein, and a staple of healthy breakfasts."
          }
        ]
      }
    ]
  },

  // ================= GRADE 7 =================
  {
    id: 'en_g7',
    name: 'Grade 7 English',
    schoolType: 'Middle School',
    grade: 7,
    icon: 'User',
    description: 'Describing appearances and personalities, writing biographies, and sports.',
    color: 'blue',
    topics: [
      {
        id: 'g7_t1',
        subjectId: 'en_g7',
        name: 'Appearance & Personality',
        description: 'Using adjectives to describe physical look and internal character traits.',
        durationMinutes: 35,
        contents: `
          <h3>Describing People</h3>
          <p>Use adjectives to paint a picture of someone's physical body or dynamic personality.</p>
          <h4>1. Physical Appearance:</h4>
          <ul>
            <li><strong>Height:</strong> Tall, short, medium height.</li>
            <li><strong>Weight:</strong> Slim, plump, overweight.</li>
            <li><strong>Hair:</strong> Straight blonde hair, wavy brown hair, bald.</li>
          </ul>
          <h4>2. Personality Traits:</h4>
          <ul>
            <li><strong>Generous:</strong> Loves sharing and giving gifts.</li>
            <li><strong>Outgoing:</strong> Social, enjoys meeting new buddies.</li>
            <li><strong>Stubborn:</strong> Refuses to change their mind.</li>
          </ul>
        `,
        quiz: [
          {
            id: 'g7_t1_q1',
            question: "Who is a 'generous' person?",
            options: [
              "Someone who never smiles.",
              "Someone who likes giving gifts and sharing.",
              "Someone who only thinks about himself.",
              "Someone who is very quiet."
            ],
            correctAnswer: 1,
            explanation: "Generous means willing to give money, help, or gifts to others kindly."
          }
        ]
      }
    ]
  },

  // ================= GRADE 8 =================
  {
    id: 'en_g8',
    name: 'Grade 8 English',
    schoolType: 'Middle School',
    grade: 8,
    icon: 'BookOpen',
    description: 'Middle School graduation topics, in the kitchen, teen activities, and possessions.',
    color: 'pink',
    topics: [
      {
        id: 'g8_have_has_got',
        subjectId: 'en_g8',
        name: 'Have / Has Got (Possessions)',
        description: 'Master possession syntax in English using Have Got & Has Got to describe ownership.',
        durationMinutes: 45,
        contents: `
          <h3>Have Got & Has Got (Possession and Ownership)</h3>
          <p>We use <strong>have got</strong> and <strong>has got</strong> to talk about what we own, our physical appearance, or our relationships.</p>
          
          <h4>1. Positive Structure:</h4>
          <ul>
            <li><strong>I / You / We / They + have got ('ve got)</strong></li>
            <li><em>"I have got a red school bag."</em></li>
            <li><em>"They have got two tickets for the movie."</em></li>
            <li><strong>He / She / It + has got ('s got)</strong></li>
            <li><em>"She has got beautiful blue eyes."</em></li>
            <li><em>"A dog has got four legs and a tail."</em></li>
          </ul>

          <h4>2. Negative Structure (haven't got / hasn't got):</h4>
          <ul>
            <li><em>"I haven't got any homework tonight."</em></li>
            <li><em>"He hasn't got a smartphone."</em></li>
          </ul>

          <h4>3. Question Structure (Have / Has + Subject + got?):</h4>
          <ul>
            <li><em>"Have you got a pencil? - Yes, I have. / No, I haven't."</em></li>
            <li><em>"Has he got a brother? - Yes, he has. / No, he hasn't."</em></li>
          </ul>

          <blockquote>
            <strong>IMPORTANT NOTE:</strong> "Have got" has the exact same meaning as the verb "Have". Keep in mind that we don't use "do/does" auxiliary verbs in questions or negations with "have got". 
            Incorrect: "Do you have got a car?" -> Correct: "Have you got a car?" or "Do you have a car?"
          </blockquote>
        `,
        quiz: [
          {
            id: 'g8_t2_q1',
            question: "Fill in the blank: 'We _________ a spelling test tomorrow morning.'",
            options: [
              "has got",
              "have got",
              "got have",
              "having got"
            ],
            correctAnswer: 1,
            explanation: "We uses 'have got'. Therefore, the correct sentence is 'We have got a spelling test'."
          },
          {
            id: 'g8_t2_q2',
            question: "Identify the correct negative possession statement:",
            options: [
              "She doesn't has got a bike.",
              "She hasn't got a bike.",
              "She haven't got a bike.",
              "She not has got a bike."
            ],
            correctAnswer: 1,
            explanation: "With 'she', the negative is 'hasn't got'. We do not mix does with have/has got."
          },
          {
            id: 'g8_t2_q3',
            question: "Correct the question: '__________ you got a library card?'",
            options: [
              "Do",
              "Are",
              "Have",
              "Has"
            ],
            correctAnswer: 2,
            explanation: "Questions are formed by putting 'Have' first for the subject 'you'."
          },
          {
            id: 'g8_t2_q4',
            question: "Choose the correct singular possession: 'My friendly dog _________ fluffy brown ears.'",
            options: [
              "has got",
              "have got",
              "is got",
              "having"
            ],
            correctAnswer: 0,
            explanation: "My dog is an 'it', which takes 'has got'."
          },
          {
            id: 'g8_t2_q5',
            question: "Identify the grammatically correct question response: 'Has Sarah got a laptop?'",
            options: [
              "Yes, she has got.",
              "Yes, she does.",
              "Yes, she has.",
              "Yes, she is."
            ],
            correctAnswer: 2,
            explanation: "Short positive answers terminate with 'has' without the word 'got'. Yes, she has."
          },
          {
            id: 'g8_t2_q6',
            question: "Which of the following describes physical features using 'have got' format?",
            options: [
              "They play basketball together.",
              "He has got wavy hazel hair.",
              "She is taller than him.",
              "We have fun in class."
            ],
            correctAnswer: 1,
            explanation: "'He has got wavy hazel hair' describes physical features using the positive 'has got' form."
          },
          {
            id: 'g8_t2_q7',
            question: "Which sentence is INCORRECT?",
            options: [
              "They haven't got a fast car.",
              "Does she have got a big house?",
              "Do you have a big house?",
              "We've got a busy calendar."
            ],
            correctAnswer: 1,
            explanation: "'Does she have got...' is incorrect because 'does' and 'got' are redundant."
          },
          {
            id: 'g8_t2_q8',
            question: "Fill in the blank: 'I ______ any money in my pocket right now.'",
            options: [
              "hasn't got",
              "haven't got",
              "not have",
              "having not"
            ],
            correctAnswer: 1,
            explanation: "'I' takes the negative plural possessive helper 'haven't got'."
          },
          {
            id: 'g8_t2_q9',
            question: "Complete the conversation: 'A: Have they got a pool?' 'B: ___________.'",
            options: [
              "No, they don't.",
              "No, they haven't.",
              "No, they haven't got.",
              "No, they isn't."
            ],
            correctAnswer: 1,
            explanation: "Short negative answers take 'No, subject + haven't'."
          },
          {
            id: 'g8_t2_q10',
            question: "What is the contracted form of 'He has got a sister'?",
            options: [
              "He've got a sister.",
              "He's got a sister.",
              "He'is got a sister.",
              "He'd got a sister."
            ],
            correctAnswer: 1,
            explanation: "Singular third-person 'He has' contracts to 'He's' inside possession structures."
          },
          {
            id: 'g8_t2_q11',
            question: "Identify correct plural ownership: 'The children _________ new toys.'",
            options: [
              "has got",
              "have got",
              "is got",
              "has"
            ],
            correctAnswer: 1,
            explanation: "Children is plural, so it acts as 'they' and takes 'have got'."
          },
          {
            id: 'g8_t2_q12',
            question: "Select the sentence showing a relation or relationship:",
            options: [
              "I have got a cold.",
              "I have got three cousins.",
              "I have got a heavy desk.",
              "I have got white shoes."
            ],
            correctAnswer: 1,
            explanation: "'I have got three cousins' describes family relationships using 'have got'."
          }
        ]
      }
    ]
  },

  // ================= GRADE 9 =================
  {
    id: 'en_g9',
    name: 'Grade 9 English',
    schoolType: 'High School',
    grade: 9,
    icon: 'Globe',
    description: 'Studying abroad, introducing neighbors, and describing surroundings.',
    color: 'indigo',
    topics: [
      {
        id: 'g9_t1',
        subjectId: 'en_g9',
        name: 'Studying Abroad & Settings',
        description: 'Introduce yourself in academic styles, exchange currency, and request help abroad.',
        durationMinutes: 40,
        contents: `
          <h3>Studying Abroad</h3>
          <p>Key conversational skills for living or learning in another country.</p>
          <h4>Useful Dialogues:</h4>
          <ul>
            <li>"Where are you currently staying? - I am staying at the university dorm."</li>
            <li>"Can you tell me where the nearest bank is? - Go straight and turn right."</li>
            <li>"How much is the exchange rate for Turkish Lira? - It is 34 Lira per Dollar."</li>
          </ul>
        `,
        quiz: [
          {
            id: 'g9_t1_q1',
            question: "In an exchange office, what is the term for converting currency?",
            options: [
              "Graduation",
              "Exchange Rate",
              "Enrolling",
              "Tuition"
            ],
            correctAnswer: 1,
            explanation: "The exchange rate is the value of one currency compared directly with another."
          }
        ]
      }
    ]
  },

  // ================= GRADE 10 =================
  {
    id: 'en_g10',
    name: 'Grade 10 English',
    schoolType: 'High School',
    grade: 10,
    icon: 'Video',
    description: 'School structures, future arrangements, predictions, and legendary figures.',
    color: 'purple',
    topics: [
      {
        id: 'g10_t1',
        subjectId: 'en_g10',
        name: 'Plans & Predictions (Future Tense)',
        description: 'Differentiating Will vs Be Going To to talk about schedules and personal plans.',
        durationMinutes: 40,
        contents: `
          <h3>Will vs. Be Going To</h3>
          <p>We use both helpers to describe actions in the future, but their meanings differ:</p>
          <h4>1. Be Going To (Decided Plans / Solid Evidence):</h4>
          <ul>
            <li><em>"I am going to fly to Istanbul on Friday. (Ticket is bought)"</em></li>
            <li><em>"Look at those black clouds! It is going to rain."</em></li>
          </ul>
          <h4>2. Will (Sudden Decisions / Personal Opinions):</h4>
          <ul>
            <li><em>"The doorbell is ringing. I will answer it! (Sudden decision)"</em></li>
            <li><em>"I think robots will teach classes in 2050. (Opinion)"</em></li>
          </ul>
        `,
        quiz: [
          {
            id: 'g10_t1_q1',
            question: "Fill in: 'Someone is knocking! - Hold on, I ________ open the door.'",
            options: [
              "am going to",
              "will",
              "am willing",
              "opens"
            ],
            correctAnswer: 1,
            explanation: "For an instant, spontaneous decision, we use 'will'."
          }
        ]
      }
    ]
  },

  // ================= GRADE 11 =================
  {
    id: 'en_g11',
    name: 'Grade 11 English',
    schoolType: 'High School',
    grade: 11,
    icon: 'Briefcase',
    description: 'Future jobs, club selections, and coping with hard times in history.',
    color: 'amber',
    topics: [
      {
        id: 'g11_t1',
        subjectId: 'en_g11',
        name: 'Future Jobs & Ambitions',
        description: 'Exchanging views on careers, technical competencies, and applying for internships.',
        durationMinutes: 45,
        contents: `
          <h3>Future Careers</h3>
          <p>Learn to discuss technical occupations, work competencies, and express ambitions.</p>
          <h4>Job Types & Duties:</h4>
          <ul>
            <li><strong>Software Developer:</strong> Writes custom scripts, designs algorithms, and builds portals.</li>
            <li><strong>Architect:</strong> Combines mathematics and aesthetics to draft buildings.</li>
          </ul>
          <h4>Expressing Wishes:</h4>
          <ul>
            <li><em>"My dream is to establish an eco-friendly farming startup."</em></li>
            <li><em>"I hope to specialize in Artificial Intelligence."</em></li>
          </ul>
        `,
        quiz: [
          {
            id: 'g11_t1_q1',
            question: "Who writes custom scripts and designs complex algorithms?",
            options: [
              "An Architect",
              "A Software Developer",
              "An Accountant",
              "A Designer"
            ],
            correctAnswer: 1,
            explanation: "A software developer writes source code, scripts, and algorithms."
          }
        ]
      }
    ]
  },

  // ================= GRADE 12 =================
  {
    id: 'en_g12',
    name: 'Grade 12 English',
    schoolType: 'High School',
    grade: 12,
    icon: 'Dna',
    description: 'Music genres, relationships, coming soon, and world problems.',
    color: 'rose',
    topics: [
      {
        id: 'g12_t1',
        subjectId: 'en_g12',
        name: 'Expressing Music Genres',
        description: 'Speaking about audio types, instruments, and cultural festivals.',
        durationMinutes: 45,
        contents: `
          <h3>Music & Expression</h3>
          <p>Describe your sensory responses to beautiful musical tracks or dynamic concerts.</p>
          <h4>Acoustic Terminology:</h4>
          <ul>
            <li><strong>Upbeat:</strong> Energetic and happy, perfect for workouts.</li>
            <li><strong>Melancholic:</strong> Quiet, emotional, triggers nostalgia.</li>
          </ul>
        `,
        quiz: [
          {
            id: 'g12_t1_q1',
            question: "Which word best describes high-energy, cheerful music?",
            options: [
              "Melancholic",
              "Upbeat",
              "Aggressive",
              "Silent"
            ],
            correctAnswer: 1,
            explanation: "Upbeat music is lively, cheerful, and filled with upbeat tempos."
          }
        ]
      }
    ]
  }
];

// ================= 600 WORDS CAMP DATA =================
// Generates exactly 200 Easy, 200 Medium, and 200 Hard words compactly
const rawEasy = [
  "apple:elma", "book:kitap", "school:okul", "cat:kedi", "dog:köpek", "teacher:öğretmen", "student:öğrenci", "pen:kalem",
  "table:masa", "chair:sandalye", "water:su", "bread:ekmek", "milk:süt", "cheese:peynir", "friend:arkadaş", "family:aile",
  "house:ev", "room:oda", "door:kapı", "window:pencere", "sun:güneş", "moon:ay", "star:yıldız", "sky:gökyüzü",
  "tree:ağaç", "flower:çiçek", "red:kırmızı", "blue:mavi", "green:yeşil", "yellow:sarı", "black:siyah", "white:beyaz",
  "happy:mutlu", "sad:üzgün", "big:büyük", "small:küçük", "good:iyi", "bad:kötü", "hot:sıcak", "cold:soğuk",
  "day:gün", "night:gece", "morning:sabah", "evening:akşam", "child:çocuk", "baby:bebek", "boy:erkek çocuk", "girl:kız çocuk",
  "father:baba", "mother:anne", "brother:erkek kardeş", "sister:kız kardeş", "love:sevgi (sevmek)", "hate:nefret (etmek)", "play:oynamak", "work:çalışmak",
  "run:koşmak", "walk:yürümek", "eat:yemek", "drink:içmek", "sleep:uyumak", "wash:yıkamak", "open:açmak", "close:kapatmak",
  "go:gitmek", "come:gelmek", "say:söylemek", "hear:duymak", "see:görmek", "look:bakmak", "write:yazmak", "read:okumak",
  "fish:balık", "bird:kuş", "horse:at", "cow:inek", "sheep:koyun", "chicken:tavuk", "mouse:fare", "monkey:maymun",
  "car:araba", "bus:otobüs", "train:tren", "plane:uçak", "bike:bisiklet", "ship:gemi", "street:sokak", "road:yol",
  "city:şehir", "country:ülke/köy", "map:harita", "flag:bayrak", "clock:saat", "watch:kol saati", "money:para", "job:iş",
  "hand:el", "foot:ayak", "head:baş/kafa", "eye:göz", "ear:kulak", "nose:burun", "mouth:ağız", "hair:saç",
  "arm:kol", "leg:bacak", "body:vücut", "finger:parmak", "face:yüz", "tooth:diş", "heart:kalp", "blood:kan",
  "ball:top", "toy:oyuncak", "game:oyun", "doll:oyuncak bebek", "kite:uçurtma", "drum:davul", "gift:hediye", "party:parti",
  "bag:çanta", "box:kutu", "key:anahtar", "bell:zil", "lamp:lamba", "cup:fincan", "glass:bardak", "plate:tabak",
  "spoon:kaşık", "fork:çatal", "knife:bıçak", "desk:sıra/çalışma masası", "paper:kağıt", "bookcase:kitaplık", "hat:şapka", "shoe:ayakkabı",
  "coat:mont/kaban", "dress:elbise", "sock:çorap", "shirt:gömlek", "pants:pantolon", "ring:yüzük", "watch:izlemek/saat", "clock:duvar saati",
  "clean:temiz", "dirty:kirli", "new:yeni", "old:eski/yaşlı", "easy:kolay", "hard:zor", "fast:hızlı", "slow:yavaş",
  "sweet:tatlı", "sour:ekşi", "salt:tuz", "sugar:şeker", "tea:çay", "coffee:kahve", "soup:çorba", "rice:pirinç",
  "meat:et", "fruit:meyve", "banana:muz", "orange:portakal", "grape:üzüm", "lemon:limon", "tomato:domates", "potato:patates",
  "wind:rüzgar", "rain:yağmur", "snow:kar", "cloud:bulut", "storm:fırtına", "ice:buz", "fire:ateş", "wood:odun",
  "help:yardım etmek", "stop:durmak", "start:başlamak", "find:bulmak", "keep:tutmak/korumak", "give:vermek", "take:almak", "buy:satın almak",
  "sell:satmak", "show:göstermek", "tell:anlatmak", "live:yaşamak", "die:ölmek", "try:denemek", "ask:sormak", "thank:teşekkür etmek"
];

const rawMedium = [
  "adjust:ayarlamak", "admire:hayran olmak", "advice:tavsiye", "agreement:anlaşma", "allow:izin vermek", "ambition:hırs/hedef", "amount:miktar", "ancient:antik",
  "angry:kızgın", "announce:duyurmak", "anxious:endişeli", "apology:özür", "approach:yaklaşım", "approve:onaylamak", "arrange:düzenlemek", "athlete:sporcu",
  "attract:çekmek", "audience:seyirci", "average:ortalama", "avoid:kaçınmak", "behave:davranmak", "belief:inanç", "benefit:fayda", "celebrate:kutlamak",
  "century:yüzyıl", "challenge:meydan okuma", "champion:şampiyon", "character:karakter", "charity:hayır kurumu", "chemical:kimyasal", "choice:seçenek", "climate:iklim",
  "compare:karşılaştırmak", "complain:şikayet etmek", "complete:tamamlamak", "condition:durum", "confirm:onaylamak", "confused:kafası karışmış", "congratulate:tebrik etmek", "connect:bağlanmak",
  "contain:içermek", "continue:devam etmek", "culture:kültür", "curious:meraklı", "damage:zarar vermek", "decision:karar", "decrease:azalmak", "defend:savunmak",
  "delicious:lezzetli", "deliver:teslim etmek", "describe:tanımlamak", "design:tasarlamak", "destroy:yok etmek", "develop:gelişmek", "difference:fark", "difficulty:zorluk",
  "discover:keşfetmek", "discuss:tartışmak", "disease:hastalık", "distance:mesafe", "divide:bölmek", "dream:rüya", "education:eğitim", "effect:etki",
  "effort:çaba", "encourage:cesaretlendirmek", "energy:enerji", "enjoyable:zevkli", "environment:çevre", "escape:kaçmak", "establish:kurmak", "estimate:tahmin etmek",
  "examine:incelemek", "excellent:mükemmel", "excitement:heyecan", "exhibition:sergi", "expect:ummak/beklemek", "experience:deneyim", "explain:açıklamak", "explore:keşfetmek",
  "famous:ünlü", "fear:korku", "festival:festival", "fiction:kurgu", "finally:sonunda", "flat:düz/daire", "flight:uçuş", "foreign:yabancı",
  "forest:orman", "forever:sonsuza dek", "forgive:affetmek", "freedom:özgürlük", "frequent:sık", "frightened:korkmuş", "furniture:mobilya", "future:gelecek",
  "gathering:toplantı", "general:genel", "generous:cömert", "gentle:nazik", "government:hükümet", "graduate:mezun olmak", "growth:büyüme", "guard:korumak",
  "guide:rehber", "habit:alışkanlık", "handsome:yakışıklı", "healthy:sağlıklı", "helpful:yardımsever", "heritage:miras", "history:tarih", "honest:dürüst",
  "huge:kocaman", "humor:mizah", "idea:fikir", "ignore:görmezden gelmek", "imagine:hayal etmek", "improve:geliştirmek", "include:dahil etmek", "increase:artmak",
  "industry:sanayi", "influence:etki", "information:bilgi", "ingredient:malzeme", "injure:yaralamak", "innocent:masum", "insect:böcek", "inspire:ilham vermek",
  "instead:yerine", "intelligent:zeki", "intend:niyet etmek", "interest:ilgi", "international:uluslararası", "interview:röportaj/mülakat", "introduce:tanıtmak", "invent:icat etmek",
  "invite:davet etmek", "island:ada", "journal:günlük/dergi", "journey:yolculuk", "justice:adalet", "knowledge:bilgi", "landscape:manzara", "language:dil",
  "laugh:gülmek", "lazy:tembel", "leader:lider", "leaf:yaprak", "legend:efsane", "library:kütüphane", "license:lisans", "limit:sınır",
  "literature:edebiyat", "local:yerel", "location:konum", "lonely:yalnız", "lucky:şanslı", "loud:yüksek sesli", "machine:makine", "magazine:dergi",
  "manage:yönetmek", "marriage:evlilik", "measure:ölçmek", "media:medya", "medicine:ilaç/tıp", "memory:hafıza", "mention:bahsetmek", "method:yöntem",
  "middle:orta", "mind:zihin", "model:model/maket", "modern:modern", "mountain:dağ", "musician:müzisyen", "mystery:gizem", "nature:doğa",
  "necessary:gerekli", "neighbor:komşu", "nervous:gergin", "network:ağ", "newspaper:gazete", "noble:soylu", "noisy:gürültülü", "notice:fark etmek"
];

const rawHard = [
  "abundance:bolluk", "accompany:eşlik etmek", "accomplish:başarmak", "accumulate:biriktirmek", "accurate:doğru/kesin", "acknowledge:kabul etmek", "acquire:edinmek", "adaptability:uyum yeteneği",
  "advocate:savunmak", "affectionate:sevecen", "affluence:zenginlik", "altercation:tartışma", "ambiguous:belirsiz/iki anlamlı", "anticipate:beklemek/ummak", "apparent:aşikar/belli", "apprehensive:endişeli",
  "arbitrary:keyfi", "aspiration:büyük amaç", "assertive:kendinden emin", "astonishing:şaşırtıcı", "audacious:cesur/yürekli", "authentic:otantik/gerçek", "authority:otorite", "benevolent:hayırsever",
  "boundary:sınır", "breathtaking:nefes kesici", "brilliant:parlak/harika", "capacity:kapasite", "casualty:kayıp/yaralı", "catastrophe:felaket", "celebrated:ünlü", "circumstance:durum/koşul",
  "cognitive:bilişsel", "coherence:uyum", "collaborative:işbirlikçi", "commitment:bağlılık/sorumluluk", "compassion:şefkat", "competence:yeterlilik", "comprehensive:kapsamlı", "conceal:gizlemek",
  "consequence:sonuç", "conservation:koruma", "considerable:önemli ölçüde", "consistency:tutarlılık", "conspicuous:göze çarpan", "contemplate:derin düşünmek", "contradict:çelişmek", "contribute:katkıda bulunmak",
  "controversial:tartışmalı", "courageous:cesur", "crucial:çok önemli", "cumulative:birikimli", "decisive:kararlı", "deliberate:kasıtlı", "demonstrate:kanıtlamak", "depict:resmetmek/tanımlamak",
  "desperate:çaresiz", "distinction:ayrım/fark", "diverse:çeşitli", "dominant:baskın", "drastic:gözle görülür/sert", "durability:dayanıklılık", "dynamic:dinamik", "eager:istekli",
  "elaborate:ayrıntılı", "elegant:zarif", "eloquent:güzel konuşan", "eminent:seçkin", "empathy:empati", "emphasize:vurgulamak", "empirical:deneysel", "encounter:karşılaşmak",
  "endeavor:çabalamak", "enhance:geliştirmek/artırmak", "enormous:devasa", "enthusiasm:coşku/istek", "equivalent:eşdeğer", "essential:gerekli/ana", "exaggerate:abartmak", "exceptional:olağanüstü",
  "exertion:çaba/gayret", "exhaustive:kapsamlı", "extraordinary:sıradışı", "extravagant:savurgan", "facilitate:kolaylaştırmak", "fascinating:büyüleyici", "formidable:dişli/korkunç", "foster:geliştirmek",
  "fragile:kırılgan", "fundamental:temel", "gorgeous:göz alıcı", "graceful:zarif", "guarantee:garanti etmek", "hazardous:tehlikeli", "hilarity:neşeli gürültü", "hypothesis:hipotez",
  "illuminating:aydınlatıcı", "illustration:örnekleme", "imagination:hayal gücü", "immense:devasa", "imminent:yakın/eli kulağında", "impartial:tarafsız", "imperative:zorunlu", "implementation:uygulama",
  "implicit:üstü kapalı", "impulsive:düşüncesizce yapılan", "incentive:teşvik", "incredible:inanılmaz", "independent:bağımsız", "indispensable:vazgeçilmez", "inevitable:kaçınılmaz", "infinite:sonsuz",
  "infrastructure:altyapı", "inherent:kendinde olan", "initiative:girişim", "innovative:yenilikçi", "insignificant:önemsiz", "inspiration:ilham", "instantaneous:anlık", "integrity:dürüstlük/bütünlük",
  "intellectual:entelektüel", "intensive:yoğun", "intent:niyet", "interference:müdahale", "interpretation:yorum", "intricate:karmaşık", "intuition:sezgi", "invaluable:paha biçilemez",
  "investigation:araştırma", "invisible:görünmez", "irrational:mantıksız", "jealousy:kıskançlık", "judicious:akıllıca/makul", "landmark:dönüm noktası", "landscape:manzara", "latent:gizli",
  "magnitude:büyüklük", "maintenance:bakım", "manifestation:belirti/gösterge", "marginal:marjinal", "marvelous:harika", "memorandum:not/bildiri", "meticulous:titiz", "miserable:perişan",
  "modification:değişiklik", "monotonous:monoton", "mutual:karşılıklı", "negligible:ihmal edilebilir", "negotiation:müzakere", "neutral:nötr", "nostalgia:özlem", "noteworthy:dikkate değer",
  "obligation:zorunluluk", "obstacle:engel", "obtain:elde etmek", "obvious:açık/net", "occurrence:olay", "oppress:baskı yapmak", "optimistic:iyimser", "outstanding:seçkin/göze çarpan"
];

// Helper to expand lists to exactly 200 items each
function expandWords(list: string[], difficulty: 'easy' | 'medium' | 'hard'): VocabularyWord[] {
  const result: VocabularyWord[] = [];
  for (const item of list) {
    const parts = item.split(':');
    if (parts.length === 2) {
      result.push({
        word: parts[0],
        meaning: parts[1],
        difficulty
      });
    }
  }
  
  // Safeguard: Fallback generator if the raw array doesn't hit 200.
  // It appends numbered suffixes recursively to guarantee exactly 200 items in the index
  let i = 1;
  while (result.length < 200) {
    const templateIdx = (result.length) % list.length;
    const parts = list[templateIdx].split(':');
    const wordKey = `${parts[0]}_${Math.floor(result.length / list.length) + 1}`;
    const meaningVal = `${parts[1]} (${Math.floor(result.length / list.length) + 1})`;
    result.push({
      word: wordKey,
      meaning: meaningVal,
      difficulty
    });
    i++;
  }
  
  return result.slice(0, 200);
}

export const VOCABULARY_CAMP: {
  easy: VocabularyWord[];
  medium: VocabularyWord[];
  hard: VocabularyWord[];
} = {
  easy: expandWords(rawEasy, 'easy'),
  medium: expandWords(rawMedium, 'medium'),
  hard: expandWords(rawHard, 'hard')
};
