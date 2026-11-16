import { NotebookState, StudyItem, SourceDocument } from '../types';

export const initialDocuments: SourceDocument[] = [
  {
    id: 'doc-soc-101',
    title: 'Sociology 101: Socialization & Stratification Notes',
    courseTopic: 'Sociology 101',
    fileName: 'Sociology_101_Notes_Socialization_178929.md',
    uploadedAt: '2026-10-14T09:00:00.000Z',
    totalExtracted: 21,
    approvedCount: 8,
    rawContent: `# Sociology 101 - Lecture Notes
Module: Socialization & Institutional Stratification

1. Socialization Foundations
The self is social. Mead argued that we learn to see ourselves from other people's perspectives. Feedback and interaction help shape identity.
People are not passive. We may accept, question, reinterpret, or resist the messages we receive from socializing agents.
Charles Horton Cooley introduced the looking-glass self: we imagine how we appear to others, imagine their judgment, and develop a self-concept from that reflection.
Primary socialization occurs in childhood within the family, forming foundational emotional ties.
Secondary socialization continues through schools, peers, and workplaces throughout life.
The generalized other represents the common behavioral expectations and norms of society at large.

2. Social Stratification & Institutional Systems
Social stratification is a structured ranking of entire groups that perpetuates unequal economic rewards and power in a society.
Inequality is structured into institutions; individual agency operates within systemic constraints.
Open stratification systems allow social mobility based on achieved status, whereas closed systems enforce ascribed status.
Bourdieu defined cultural capital as non-financial social assets—such as education, style of speech, and mannerisms—that promote social mobility.
Income refers to the flow of cash or earnings over a period, whereas wealth is the cumulative total of assets owned minus debts.
Intersectionality examines how interlocking systems of oppression and privilege (such as race, gender, and class) operate together.`
  },
  {
    id: 'doc-aws-mod1',
    title: 'AWS Cloud Practitioner - Module 1: Cloud Concepts',
    courseTopic: 'AWS Cloud Practitioner',
    fileName: 'AWS_Module_1_Cloud_Concepts.txt',
    uploadedAt: '2026-10-15T10:30:00.000Z',
    totalExtracted: 12,
    approvedCount: 0,
    rawContent: `AWS Module 1: Introduction to Amazon Web Services
In computing, a client can be a web browser or desktop application that a person interacts with to make requests to computer servers.
A server can be services such as Amazon Elastic Compute Cloud (Amazon EC2), a type of virtual server.
Cloud computing is the on-demand delivery of IT resources over the internet with pay-as-you-go pricing.
The AWS Shared Responsibility Model divides security obligations: AWS is responsible for security OF the cloud, while the customer is responsible for security IN the cloud.`
  }
];

export const initialItems: StudyItem[] = [
  // ---------------- APPROVED ITEMS (In Library - 8 items) ----------------
  {
    id: 'soc-app-1',
    documentId: 'doc-soc-101',
    documentTitle: 'Sociology 101: Socialization & Stratification Notes',
    sourceCitation: 'Socialization notes | Sociology_101_Notes_Socialization_178929',
    tag: 'Socialization',
    category: 'KEY TERM',
    title: 'The Looking-Glass Self',
    sourceFact: "Charles Horton Cooley introduced the looking-glass self: we imagine how we appear to others, imagine their judgment, and develop a self-concept from that reflection.",
    studyInterpretation: "Our self-image is formed through perceived social reactions and judgments.",
    status: 'approved',
    userEdited: false,
    originalInterpretation: "Our self-image is formed through perceived social reactions and judgments.",
    createdAt: '2026-10-14T09:10:00.000Z',
    reviewedAt: '2026-10-14T09:30:00.000Z',
    flashcard: {
      front: "What is Cooley's 'looking-glass self'?",
      back: "The concept that self-identity develops through imagining how others perceive and judge our behavior, internalizing that reflected assessment.",
      leitnerBox: 2,
      reviewCount: 3,
      correctCount: 3
    },
    quizQuestion: {
      question: "According to Cooley's looking-glass self, how does self-concept develop?",
      options: [
        "From internal genetic predispositions independent of others",
        "Through imagining how others perceive us and internalizing their judgments",
        "Exclusively during adulthood in professional environments",
        "By ignoring external societal cues and social feedback"
      ],
      correctOptionIndex: 1,
      explanation: "Source Fact: Cooley introduced the looking-glass self where we imagine how we appear to others and develop self-concept from that reflection."
    }
  },
  {
    id: 'soc-app-2',
    documentId: 'doc-soc-101',
    documentTitle: 'Sociology 101: Socialization & Stratification Notes',
    sourceCitation: 'Socialization notes | Sociology_101_Notes_Socialization_178929',
    tag: 'Socialization',
    category: 'PROCESS',
    title: 'Primary Socialization',
    sourceFact: "Primary socialization occurs in childhood within the family, forming foundational emotional ties.",
    studyInterpretation: "Early familial interaction establishes basic behavioral foundations and emotional bonding.",
    status: 'approved',
    userEdited: false,
    originalInterpretation: "Early familial interaction establishes basic behavioral foundations and emotional bonding.",
    createdAt: '2026-10-14T09:10:00.000Z',
    reviewedAt: '2026-10-14T09:32:00.000Z',
    flashcard: {
      front: "Where does primary socialization occur and what does it form?",
      back: "Occurs during childhood within the family, forming early emotional ties and fundamental self-identity.",
      leitnerBox: 3,
      reviewCount: 4,
      correctCount: 4
    },
    quizQuestion: {
      question: "Where does primary socialization primarily take place?",
      options: [
        "In university lecture halls and formal corporate training",
        "During early childhood within the family unit",
        "Exclusively through mass media and social networks",
        "During secondary retirement communities"
      ],
      correctOptionIndex: 1,
      explanation: "Source Fact: Primary socialization occurs in childhood within the family, forming foundational emotional ties."
    }
  },
  {
    id: 'soc-app-3',
    documentId: 'doc-soc-101',
    documentTitle: 'Sociology 101: Socialization & Stratification Notes',
    sourceCitation: 'Socialization notes | Sociology_101_Notes_Socialization_178929',
    tag: 'Socialization',
    category: 'PROCESS',
    title: 'Secondary Socialization',
    sourceFact: "Secondary socialization continues through schools, peers, and workplaces throughout life.",
    studyInterpretation: "Social role acquisition is an ongoing, lifelong learning process across institutional spheres.",
    status: 'approved',
    userEdited: false,
    originalInterpretation: "Social role acquisition is an ongoing, lifelong learning process across institutional spheres.",
    createdAt: '2026-10-14T09:10:00.000Z',
    reviewedAt: '2026-10-14T09:34:00.000Z',
    flashcard: {
      front: "What characterizes secondary socialization?",
      back: "Ongoing socialization outside the family in schools, peer groups, and workplaces across adulthood.",
      leitnerBox: 2,
      reviewCount: 2,
      correctCount: 2
    },
    quizQuestion: {
      question: "Which institutional settings are cited as continuing secondary socialization?",
      options: [
        "Schools, peers, and workplaces",
        "Only neonatal clinics",
        "Strictly solitary study environments",
        "Only genetic inheritance pathways"
      ],
      correctOptionIndex: 0,
      explanation: "Source Fact: Secondary socialization continues through schools, peers, and workplaces throughout life."
    }
  },
  {
    id: 'soc-app-4',
    documentId: 'doc-soc-101',
    documentTitle: 'Sociology 101: Socialization & Stratification Notes',
    sourceCitation: 'Socialization notes | Sociology_101_Notes_Socialization_178929',
    tag: 'Socialization',
    category: 'CONCEPT',
    title: 'The Generalized Other',
    sourceFact: "The generalized other represents the common behavioral expectations and norms of society at large.",
    studyInterpretation: "Internalized societal standards guide individuals in self-monitoring and social cooperation.",
    status: 'approved',
    userEdited: false,
    originalInterpretation: "Internalized societal standards guide individuals in self-monitoring and social cooperation.",
    createdAt: '2026-10-14T09:10:00.000Z',
    reviewedAt: '2026-10-14T09:36:00.000Z',
    flashcard: {
      front: "Define Mead's concept of 'the generalized other'.",
      back: "The internalized expectations, values, and standards of the wider community/society at large.",
      leitnerBox: 2,
      reviewCount: 3,
      correctCount: 2
    },
    quizQuestion: {
      question: "What does the 'generalized other' represent in Mead's framework?",
      options: [
        "A specific caregiver who feeds the child",
        "The common behavioral expectations and norms of society at large",
        "An imaginary childhood friend",
        "A biological instinct present at birth"
      ],
      correctOptionIndex: 1,
      explanation: "Source Fact: The generalized other represents the common behavioral expectations and norms of society at large."
    }
  },
  {
    id: 'soc-app-5',
    documentId: 'doc-soc-101',
    documentTitle: 'Sociology 101: Socialization & Stratification Notes',
    sourceCitation: 'Stratification notes | Sociology_101_Notes_Socialization_178929',
    tag: 'Stratification',
    category: 'KEY TERM',
    title: 'Social Stratification Definition',
    sourceFact: "Social stratification is a structured ranking of entire groups that perpetuates unequal economic rewards and power in a society.",
    studyInterpretation: "Institutional hierarchies systematize unequal resource distribution across demographic groups.",
    status: 'approved',
    userEdited: false,
    originalInterpretation: "Institutional hierarchies systematize unequal resource distribution across demographic groups.",
    createdAt: '2026-10-14T09:10:00.000Z',
    reviewedAt: '2026-10-14T09:38:00.000Z',
    flashcard: {
      front: "What is social stratification?",
      back: "A structured, institutional ranking of entire groups that perpetuates unequal economic rewards and power.",
      leitnerBox: 3,
      reviewCount: 3,
      correctCount: 3
    },
    quizQuestion: {
      question: "According to the notes, what does social stratification perpetuate?",
      options: [
        "Equal distribution of all societal goods",
        "Unequal economic rewards and power in a society",
        "Complete randomness in career outcomes",
        "Instant elimination of social classes"
      ],
      correctOptionIndex: 1,
      explanation: "Source Fact: Social stratification is a structured ranking of entire groups that perpetuates unequal economic rewards and power in a society."
    }
  },
  {
    id: 'soc-app-6',
    documentId: 'doc-soc-101',
    documentTitle: 'Sociology 101: Socialization & Stratification Notes',
    sourceCitation: 'Stratification notes | Sociology_101_Notes_Socialization_178929',
    tag: 'Stratification',
    category: 'SYSTEM',
    title: 'Open vs Closed Stratification Systems',
    sourceFact: "Open stratification systems allow social mobility based on achieved status, whereas closed systems enforce ascribed status.",
    studyInterpretation: "Mobility opportunities depend on whether social status is earned through action or predetermined by birth.",
    status: 'approved',
    userEdited: false,
    originalInterpretation: "Mobility opportunities depend on whether social status is earned through action or predetermined by birth.",
    createdAt: '2026-10-14T09:10:00.000Z',
    reviewedAt: '2026-10-14T09:40:00.000Z',
    flashcard: {
      front: "How do open and closed stratification systems differ?",
      back: "Open systems allow mobility via achieved status; closed systems restrict mobility via ascribed status.",
      leitnerBox: 1,
      reviewCount: 1,
      correctCount: 1
    },
    quizQuestion: {
      question: "In closed stratification systems, what type of status governs a person's position?",
      options: [
        "Achieved status earned through test scores",
        "Ascribed status assigned at birth with little mobility",
        "Voluntary membership decided annually",
        "Random lottery selection"
      ],
      correctOptionIndex: 1,
      explanation: "Source Fact: Open systems allow mobility based on achieved status, whereas closed systems enforce ascribed status."
    }
  },
  {
    id: 'soc-app-7',
    documentId: 'doc-soc-101',
    documentTitle: 'Sociology 101: Socialization & Stratification Notes',
    sourceCitation: 'Stratification notes | Sociology_101_Notes_Socialization_178929',
    tag: 'Stratification',
    category: 'KEY TERM',
    title: 'Income vs Wealth',
    sourceFact: "Income refers to the flow of cash or earnings over a period, whereas wealth is the cumulative total of assets owned minus debts.",
    studyInterpretation: "Income measures periodic incoming cash flow, while wealth represents net cumulative assets.",
    status: 'approved',
    userEdited: false,
    originalInterpretation: "Income measures periodic incoming cash flow, while wealth represents net cumulative assets.",
    createdAt: '2026-10-14T09:10:00.000Z',
    reviewedAt: '2026-10-14T09:42:00.000Z',
    flashcard: {
      front: "Distinguish income from wealth.",
      back: "Income = periodic earnings/cash flow. Wealth = total assets owned minus debts (net accumulated capital).",
      leitnerBox: 2,
      reviewCount: 2,
      correctCount: 2
    },
    quizQuestion: {
      question: "How is wealth defined in contrast to income?",
      options: [
        "Weekly paycheck received from employment",
        "The cumulative total of assets owned minus debts",
        "The annual taxes paid to the municipality",
        "Disposable income spent on groceries"
      ],
      correctOptionIndex: 1,
      explanation: "Source Fact: Income refers to the flow of cash or earnings over a period, whereas wealth is the cumulative total of assets owned minus debts."
    }
  },
  {
    id: 'soc-app-8',
    documentId: 'doc-soc-101',
    documentTitle: 'Sociology 101: Socialization & Stratification Notes',
    sourceCitation: 'Stratification notes | Sociology_101_Notes_Socialization_178929',
    tag: 'Stratification',
    category: 'CONCEPT',
    title: 'Intersectionality',
    sourceFact: "Intersectionality examines how interlocking systems of oppression and privilege (such as race, gender, and class) operate together.",
    studyInterpretation: "Social categories compound mutually rather than operating as isolated variables.",
    status: 'approved',
    userEdited: false,
    originalInterpretation: "Social categories compound mutually rather than operating as isolated variables.",
    createdAt: '2026-10-14T09:10:00.000Z',
    reviewedAt: '2026-10-14T09:44:00.000Z',
    flashcard: {
      front: "What does the framework of intersectionality examine?",
      back: "How overlapping social identities (race, gender, class) produce interconnected systems of discrimination or privilege.",
      leitnerBox: 2,
      reviewCount: 2,
      correctCount: 2
    },
    quizQuestion: {
      question: "What does intersectionality analyze?",
      options: [
        "Isolated single variables in economic isolation",
        "Interlocking systems of oppression and privilege like race, gender, and class",
        "Road intersection traffic patterns in urban centers",
        "Independent genetic lineages"
      ],
      correctOptionIndex: 1,
      explanation: "Source Fact: Intersectionality examines how interlocking systems of oppression and privilege operate together."
    }
  },

  // ---------------- PENDING ITEMS (In Review Queue - 13 items) ----------------
  // Exactly matching Screenshot 5 and 3!
  {
    id: 'soc-pen-1',
    documentId: 'doc-soc-101',
    documentTitle: 'Sociology 101: Socialization & Stratification Notes',
    sourceCitation: 'Socialization notes | Sociology_101_Notes_Socialization_178929',
    tag: 'Socialization',
    category: 'LECTURE CLAIM',
    title: 'The self is social',
    sourceFact: "The self is social. Mead argued that we learn to see ourselves from other people's perspectives. Feedback and interaction help shape identity.",
    studyInterpretation: "Identity develops through perspective-taking, interaction, and feedback.",
    status: 'pending',
    userEdited: false,
    originalInterpretation: "Identity develops through perspective-taking, interaction, and feedback.",
    createdAt: '2026-10-14T09:12:00.000Z',
    flashcard: {
      front: "Why did Mead assert that 'the self is social'?",
      back: "Because identity develops through perspective-taking, ongoing interaction, and interpreting feedback from others.",
      leitnerBox: 1,
      reviewCount: 0,
      correctCount: 0
    },
    quizQuestion: {
      question: "According to George Herbert Mead, how do we develop our sense of self?",
      options: [
        "Through biological instinct that unfolds without social contact",
        "By learning to see ourselves from other people's perspectives through interaction",
        "Strictly after reading formal legal constitutions",
        "Exclusively in dreams during childhood sleep"
      ],
      correctOptionIndex: 1,
      explanation: "Source Fact: Mead argued that we learn to see ourselves from other people's perspectives. Feedback and interaction help shape identity."
    }
  },
  {
    id: 'soc-pen-2',
    documentId: 'doc-soc-101',
    documentTitle: 'Sociology 101: Socialization & Stratification Notes',
    sourceCitation: 'Socialization notes | Sociology_101_Notes_Socialization_178929',
    tag: 'Socialization',
    category: 'LECTURE CLAIM',
    title: 'People interpret social messages',
    sourceFact: "People are not passive. We may accept, question, reinterpret, or resist the messages we receive from socializing agents.",
    studyInterpretation: "Socialization influences people without fully determining how they respond.",
    status: 'pending',
    userEdited: false,
    originalInterpretation: "Socialization influences people without fully determining how they respond.",
    createdAt: '2026-10-14T09:12:00.000Z',
    flashcard: {
      front: "Are human beings passive recipients in the socialization process?",
      back: "No. People actively interpret, question, reinterpret, or resist socializing messages.",
      leitnerBox: 1,
      reviewCount: 0,
      correctCount: 0
    },
    quizQuestion: {
      question: "What does the lecture claim regarding human agency during socialization?",
      options: [
        "Humans are completely passive automatons who absorb every norm without question",
        "People may accept, question, reinterpret, or resist messages from socializing agents",
        "Only adults have the ability to receive social messages",
        "Socialization completely dictates every behavioral choice without exception"
      ],
      correctOptionIndex: 1,
      explanation: "Source Fact: People are not passive. We may accept, question, reinterpret, or resist the messages we receive from socializing agents."
    }
  },
  {
    id: 'soc-pen-3',
    documentId: 'doc-soc-101',
    documentTitle: 'Sociology 101: Socialization & Stratification Notes',
    sourceCitation: 'Stratification notes | Sociology_101_Notes_Socialization_178929',
    tag: 'Stratification',
    category: 'LECTURE CLAIM',
    title: 'Institutional inequality constrains agency',
    sourceFact: "Inequality is structured into institutions; individual agency operates within systemic constraints.",
    studyInterpretation: "Personal choices are shaped and bounded by established institutional hierarchies.",
    status: 'pending',
    userEdited: false,
    originalInterpretation: "Personal choices are shaped and bounded by established institutional hierarchies.",
    createdAt: '2026-10-14T09:12:00.000Z',
    flashcard: {
      front: "How does institutional inequality relate to individual agency?",
      back: "Individual agency is not completely absent, but operates within structural institutional constraints.",
      leitnerBox: 1,
      reviewCount: 0,
      correctCount: 0
    },
    quizQuestion: {
      question: "According to sociological analysis, where is inequality primarily structured?",
      options: [
        "Solely in momentary individual misunderstandings",
        "Into institutions, creating systemic constraints for individual agency",
        "Purely in genetic codes",
        "Randomly without any institutional pattern"
      ],
      correctOptionIndex: 1,
      explanation: "Source Fact: Inequality is structured into institutions; individual agency operates within systemic constraints."
    }
  },
  {
    id: 'soc-pen-4',
    documentId: 'doc-soc-101',
    documentTitle: 'Sociology 101: Socialization & Stratification Notes',
    sourceCitation: 'Stratification notes | Sociology_101_Notes_Socialization_178929',
    tag: 'Stratification',
    category: 'CONCEPT',
    title: 'Cultural Capital and Habitus',
    sourceFact: "Bourdieu defined cultural capital as non-financial social assets—such as education, style of speech, and mannerisms—that promote social mobility.",
    studyInterpretation: "Social advantage is reproduced through non-monetary competencies, cultural tastes, and demeanor.",
    status: 'pending',
    userEdited: false,
    originalInterpretation: "Social advantage is reproduced through non-monetary competencies, cultural tastes, and demeanor.",
    createdAt: '2026-10-14T09:12:00.000Z',
    flashcard: {
      front: "What is Bourdieu's concept of 'cultural capital'?",
      back: "Non-financial social assets (education, speech style, mannerisms) that facilitate social mobility and reinforce status.",
      leitnerBox: 1,
      reviewCount: 0,
      correctCount: 0
    },
    quizQuestion: {
      question: "Which of the following is an example of cultural capital as defined by Bourdieu?",
      options: [
        "A physical stack of gold bars in a vault",
        "Style of speech, formal educational credentials, and social mannerisms",
        "Direct corporate stock certificates",
        "A bank checking account balance"
      ],
      correctOptionIndex: 1,
      explanation: "Source Fact: Bourdieu defined cultural capital as non-financial social assets—such as education, style of speech, and mannerisms."
    }
  },
  {
    id: 'soc-pen-5',
    documentId: 'doc-soc-101',
    documentTitle: 'Sociology 101: Socialization & Stratification Notes',
    sourceCitation: 'Stratification notes | Sociology_101_Notes_Socialization_178929',
    tag: 'Stratification',
    category: 'QUESTION',
    title: 'Individual Agency vs Collective Resistance',
    sourceFact: "Can individual agency meaningfully alter deeply entrenched institutional inequality without organized collective action?",
    studyInterpretation: "A core sociological inquiry into whether systemic reform requires mass collective organization versus individual efforts.",
    status: 'pending',
    userEdited: false,
    originalInterpretation: "A core sociological inquiry into whether systemic reform requires mass collective organization versus individual efforts.",
    createdAt: '2026-10-14T09:12:00.000Z',
    flashcard: {
      front: "What tension exists between individual agency and institutional inequality?",
      back: "Whether individual decisions can dismantle systemic structural barriers without organized collective mobilization.",
      leitnerBox: 1,
      reviewCount: 0,
      correctCount: 0
    },
    quizQuestion: {
      question: "What core dilemma is highlighted in the study of structural reform?",
      options: [
        "Whether individual agency alone can alter entrenched systemic inequality without collective action",
        "Whether people should abandon all forms of learning",
        "Whether machines have socialized identities",
        "Whether income taxes should be completely abolished"
      ],
      correctOptionIndex: 0,
      explanation: "Source Fact: Can individual agency meaningfully alter deeply entrenched institutional inequality without organized collective action?"
    }
  },
  {
    id: 'soc-pen-6',
    documentId: 'doc-soc-101',
    documentTitle: 'Sociology 101: Socialization & Stratification Notes',
    sourceCitation: 'Socialization notes | Sociology_101_Notes_Socialization_178929',
    tag: 'Socialization',
    category: 'SYSTEM',
    title: 'Agents of Socialization Matrix',
    sourceFact: "Agents of socialization include family, peer groups, mass media, educational institutions, and workplaces, each transmitting distinct norms.",
    studyInterpretation: "Multiple social institutions work concurrently to inculcate societal values and role behaviors.",
    status: 'pending',
    userEdited: false,
    originalInterpretation: "Multiple social institutions work concurrently to inculcate societal values and role behaviors.",
    createdAt: '2026-10-14T09:12:00.000Z',
    flashcard: {
      front: "Name the primary agents of socialization cited in the notes.",
      back: "Family, peer groups, mass media, education, and workplace.",
      leitnerBox: 1,
      reviewCount: 0,
      correctCount: 0
    },
    quizQuestion: {
      question: "Which collection correctly identifies agents of socialization?",
      options: [
        "Family, peers, mass media, schools, and workplaces",
        "Solely meteorological conditions",
        "Hardware components and cloud computing servers",
        "Botanical plant categories"
      ],
      correctOptionIndex: 0,
      explanation: "Source Fact: Agents of socialization include family, peer groups, mass media, educational institutions, and workplaces."
    }
  },
  {
    id: 'soc-pen-7',
    documentId: 'doc-soc-101',
    documentTitle: 'Sociology 101: Socialization & Stratification Notes',
    sourceCitation: 'Stratification notes | Sociology_101_Notes_Socialization_178929',
    tag: 'Stratification',
    category: 'HOW-TO',
    title: 'How to Distinguish Achieved vs Ascribed Status',
    sourceFact: "To classify a status: determine if the position is acquired through personal effort and merit (achieved) or assigned arbitrarily at birth without choice (ascribed).",
    studyInterpretation: "Evaluate status by checking voluntary acquisition versus involuntary hereditary assignment.",
    status: 'pending',
    userEdited: false,
    originalInterpretation: "Evaluate status by checking voluntary acquisition versus involuntary hereditary assignment.",
    createdAt: '2026-10-14T09:12:00.000Z',
    flashcard: {
      front: "How do you distinguish achieved status from ascribed status?",
      back: "Achieved = earned via merit, choices, or actions. Ascribed = assigned at birth by societal categorization with no choice.",
      leitnerBox: 1,
      reviewCount: 0,
      correctCount: 0
    },
    quizQuestion: {
      question: "What criterion distinguishes achieved status from ascribed status?",
      options: [
        "Whether it is acquired through effort/merit vs assigned at birth without choice",
        "The dollar price tag of the certificate",
        "Whether the status was granted before the year 1900",
        "The physical weight of the document"
      ],
      correctOptionIndex: 0,
      explanation: "Source Fact: Determine if the position is acquired through personal effort and merit (achieved) or assigned arbitrarily at birth (ascribed)."
    }
  },
  {
    id: 'soc-pen-8',
    documentId: 'doc-soc-101',
    documentTitle: 'Sociology 101: Socialization & Stratification Notes',
    sourceCitation: 'Socialization notes | Sociology_101_Notes_Socialization_178929',
    tag: 'Socialization',
    category: 'PROCESS',
    title: 'Resocialization in Total Institutions',
    sourceFact: "Resocialization involves radically breaking from prior behavior and learning radically new norms, often occurring in total institutions like military academies or prisons.",
    studyInterpretation: "Total institutions strip previous civilian identity to systematically build a new behavioral framework.",
    status: 'pending',
    userEdited: false,
    originalInterpretation: "Total institutions strip previous civilian identity to systematically build a new behavioral framework.",
    createdAt: '2026-10-14T09:12:00.000Z',
    flashcard: {
      front: "What is resocialization and where does it typically occur?",
      back: "A radical overhaul of previous norms and habits, typically in total institutions like military boot camps or correctional facilities.",
      leitnerBox: 1,
      reviewCount: 0,
      correctCount: 0
    },
    quizQuestion: {
      question: "What characterizes the process of resocialization?",
      options: [
        "Gentle informal conversation between neighbors",
        "A radical break from prior behaviors to learn fundamentally new norms",
        "Purchasing new consumer apparel",
        "Taking an optional elective seminar"
      ],
      correctOptionIndex: 1,
      explanation: "Source Fact: Resocialization involves radically breaking from prior behavior and learning radically new norms, often occurring in total institutions."
    }
  },
  {
    id: 'soc-pen-9',
    documentId: 'doc-soc-101',
    documentTitle: 'Sociology 101: Socialization & Stratification Notes',
    sourceCitation: 'Stratification notes | Sociology_101_Notes_Socialization_178929',
    tag: 'Stratification',
    category: 'LECTURE CLAIM',
    title: 'Intergenerational Mobility Rates',
    sourceFact: "Intergenerational mobility measures changes in social position between generations; empirical data indicates family wealth remains a potent predictor of adult economic standing.",
    studyInterpretation: "Parental socioeconomic capital heavily anchors offspring economic outcomes across generations.",
    status: 'pending',
    userEdited: false,
    originalInterpretation: "Parental socioeconomic capital heavily anchors offspring economic outcomes across generations.",
    createdAt: '2026-10-14T09:12:00.000Z',
    flashcard: {
      front: "What does intergenerational mobility assess?",
      back: "The degree of movement in social and economic class from one generation (parents) to the next (children).",
      leitnerBox: 1,
      reviewCount: 0,
      correctCount: 0
    },
    quizQuestion: {
      question: "What does intergenerational mobility measure?",
      options: [
        "Daily commuting distance between home and office",
        "Changes in social status and economic standing between generations",
        "The speed of internet connections across decades",
        "Physical height differences between ancestors"
      ],
      correctOptionIndex: 1,
      explanation: "Source Fact: Intergenerational mobility measures changes in social position between generations."
    }
  },
  {
    id: 'soc-pen-10',
    documentId: 'doc-soc-101',
    documentTitle: 'Sociology 101: Socialization & Stratification Notes',
    sourceCitation: 'Socialization notes | Sociology_101_Notes_Socialization_178929',
    tag: 'Socialization',
    category: 'CONCEPT',
    title: 'The I and the Me',
    sourceFact: "Mead separated the self into two parts: the 'I' (the spontaneous, creative, unsocialized response) and the 'Me' (the socialized self formed by internalized societal attitudes).",
    studyInterpretation: "The self balances spontaneous individual impulses ('I') against learned societal expectations ('Me').",
    status: 'pending',
    userEdited: false,
    originalInterpretation: "The self balances spontaneous individual impulses ('I') against learned societal expectations ('Me').",
    createdAt: '2026-10-14T09:12:00.000Z',
    flashcard: {
      front: "In Mead's theory, contrast the 'I' and the 'Me'.",
      back: "The 'I' is the spontaneous, unpredictable, active actor; the 'Me' is the socialized self that internalizes society's expectations.",
      leitnerBox: 1,
      reviewCount: 0,
      correctCount: 0
    },
    quizQuestion: {
      question: "Which component represents the spontaneous, unsocialized aspect of the self according to Mead?",
      options: [
        "The 'Me'",
        "The 'I'",
        "The Superego",
        "The Corporate Identity"
      ],
      correctOptionIndex: 1,
      explanation: "Source Fact: Mead separated the self into two parts: the 'I' (the spontaneous, creative response) and the 'Me' (the socialized self)."
    }
  },
  {
    id: 'soc-pen-11',
    documentId: 'doc-soc-101',
    documentTitle: 'Sociology 101: Socialization & Stratification Notes',
    sourceCitation: 'Stratification notes | Sociology_101_Notes_Socialization_178929',
    tag: 'Stratification',
    category: 'PROCESS',
    title: 'Cumulative Advantage Process',
    sourceFact: "The Matthew Effect in stratification demonstrates that initial advantages compound over time, making it progressively easier for affluent groups to accrue additional capital.",
    studyInterpretation: "Early structural benefits accelerate exponentially, widening the gap between advantage and disadvantage.",
    status: 'pending',
    userEdited: false,
    originalInterpretation: "Early structural benefits accelerate exponentially, widening the gap between advantage and disadvantage.",
    createdAt: '2026-10-14T09:12:00.000Z',
    flashcard: {
      front: "What does the 'Matthew Effect' describe in stratification?",
      back: "Cumulative advantage: small initial advantages compound over time to create vast gaps in resources and prestige.",
      leitnerBox: 1,
      reviewCount: 0,
      correctCount: 0
    },
    quizQuestion: {
      question: "How does the Matthew Effect explain inequality?",
      options: [
        "Wealth is randomly redistributed every 10 years",
        "Initial advantages compound over time, making subsequent capital accrual easier",
        "All competitors start with identical resources at every life stage",
        "Effort has no relation to outcomes under any circumstance"
      ],
      correctOptionIndex: 1,
      explanation: "Source Fact: Initial advantages compound over time, making it progressively easier for affluent groups to accrue additional capital."
    }
  },
  {
    id: 'soc-pen-12',
    documentId: 'doc-soc-101',
    documentTitle: 'Sociology 101: Socialization & Stratification Notes',
    sourceCitation: 'Socialization notes | Sociology_101_Notes_Socialization_178929',
    tag: 'Socialization',
    category: 'HOW-TO',
    title: 'How to Trace the Formation of the Looking-Glass Self',
    sourceFact: "Cooley's process unfolds in three discrete steps: first, imagining how one appears to another; second, imagining that person's evaluation; third, experiencing emotional self-feeling.",
    studyInterpretation: "Three step sequence: visual anticipation -> perceived assessment -> emotional self-validation or embarrassment.",
    status: 'pending',
    userEdited: false,
    originalInterpretation: "Three step sequence: visual anticipation -> perceived assessment -> emotional self-validation or embarrassment.",
    createdAt: '2026-10-14T09:12:00.000Z',
    flashcard: {
      front: "List the 3 steps of Cooley's looking-glass self.",
      back: "1. Imagine our appearance to another. 2. Imagine their judgment of that appearance. 3. Develop self-feeling (pride or mortification).",
      leitnerBox: 1,
      reviewCount: 0,
      correctCount: 0
    },
    quizQuestion: {
      question: "What is the second step in Cooley's looking-glass self sequence?",
      options: [
        "Imagining how one appears to another",
        "Imagining that person's evaluation/judgment of that appearance",
        "Conducting a formal laboratory experiment",
        "Drafting a contract with the socializing agent"
      ],
      correctOptionIndex: 1,
      explanation: "Source Fact: First, imagining how one appears; second, imagining that person's evaluation; third, experiencing emotional self-feeling."
    }
  },
  {
    id: 'soc-pen-13',
    documentId: 'doc-soc-101',
    documentTitle: 'Sociology 101: Socialization & Stratification Notes',
    sourceCitation: 'Stratification notes | Sociology_101_Notes_Socialization_178929',
    tag: 'Stratification',
    category: 'QUESTION',
    title: 'Is Meritocracy Measurable or Ideological?',
    sourceFact: "Sociologists debate whether pure meritocracy exists in modern market economies or functions primarily as a legitimizing ideology that justifies inequality.",
    studyInterpretation: "Examines whether meritocracy is an empirical reality or a social myth legitimizing class disparities.",
    status: 'pending',
    userEdited: false,
    originalInterpretation: "Examines whether meritocracy is an empirical reality or a social myth legitimizing class disparities.",
    createdAt: '2026-10-14T09:12:00.000Z',
    flashcard: {
      front: "What is the sociological critique of meritocracy?",
      back: "That while framed as a fair system where talent and effort dictate success, it often serves as a legitimizing ideology for structural inequality.",
      leitnerBox: 1,
      reviewCount: 0,
      correctCount: 0
    },
    quizQuestion: {
      question: "What function do sociologists often assign to meritocracy rhetoric?",
      options: [
        "Guaranteed elimination of all social stratification within five years",
        "Functioning as a legitimizing ideology that justifies unequal structural outcomes",
        "Directly providing free medical care to every citizen",
        "An algorithm for computing corporate dividends"
      ],
      correctOptionIndex: 1,
      explanation: "Source Fact: Sociologists debate whether pure meritocracy exists or functions primarily as a legitimizing ideology that justifies inequality."
    }
  }
];

export const initialSessions: NotebookState['sessions'] = [
  {
    id: 'session-1',
    date: '2026-10-14T11:00:00.000Z',
    durationMinutes: 20,
    itemsReviewed: 8,
    quizScore: 5,
    quizTotal: 5,
    notes: 'Mastered Socialization foundations and initial stratification definitions.'
  }
];

export const initialNotebookState: NotebookState = {
  notebookName: 'Sociology 101 Study Notebook',
  activeTopic: 'Socialization & Stratification',
  studyGoal: 'exam_review',
  isLocked: false,
  passcode: '1234',
  items: initialItems,
  documents: initialDocuments,
  sessions: initialSessions,
  lastBackupDate: undefined
};
